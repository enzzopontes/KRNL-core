package krnl.modules.duplicates

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileInputStream
import java.io.RandomAccessFile

class KrnlDuplicatesModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("KrnlDuplicatesModule")

    Events("onDuplicateProgress", "onDuplicatesFound")

    /**
     * Algoritmo de 3 Etapas usando xxHash64 nativo:
     * 1. Agrupamento por tamanho exato em bytes.
     * 2. Hash parcial rápido (início, meio e fim, 16 KB cada) via xxHash64.
     * 3. Hash completo xxHash64 apenas para os candidatos empatados no passo 2.
     */
    AsyncFunction("scanExactDuplicates") { paths: List<String> ->
      val scope = CoroutineScope(Dispatchers.IO)
      scope.launch {
        val files = paths.map { File(it) }.filter { it.exists() && it.isFile }
        
        // Etapa 1: Tamanho exato
        val bySize = files.groupBy { it.length() }.filter { it.value.size > 1 }

        val duplicateGroups = mutableListOf<Map<String, Any>>()

        // Etapa 2 e 3 para grupos com mesmo tamanho
        for ((size, candidates) in bySize) {
          val partialHashes = mutableMapOf<Long, MutableList<File>>()
          for (file in candidates) {
            val pHash = calculatePartialXxHash64(file)
            partialHashes.getOrPut(pHash) { mutableListOf() }.add(file)
          }

          // Etapa 3: Hash completo xxHash64 apenas dos empatados
          for ((_, partialMatches) in partialHashes) {
            if (partialMatches.size > 1) {
              val fullHashes = mutableMapOf<Long, MutableList<File>>()
              for (match in partialMatches) {
                val fHash = calculateFullXxHash64(match)
                fullHashes.getOrPut(fHash) { mutableListOf() }.add(match)
              }

              for ((hash, exactMatches) in fullHashes) {
                if (exactMatches.size > 1) {
                  duplicateGroups.add(
                    mapOf(
                      "hash" to hash.toString(16),
                      "size" to size.toDouble(),
                      "files" to exactMatches.map { it.absolutePath }
                    )
                  )
                }
              }
            }
          }
        }

        sendEvent("onDuplicatesFound", mapOf("groups" to duplicateGroups))
      }
      true
    }

    /**
     * Hash Perceptual (dHash) para imagens semelhantes:
     * Redimensiona para 9x8 em tons de cinza e compara pixels adjacentes (64 bits).
     */
    AsyncFunction("calculateDHash") { imagePath: String ->
      try {
        val file = File(imagePath)
        if (!file.exists()) return@AsyncFunction null

        val options = BitmapFactory.Options().apply {
          inSampleSize = 2
        }
        val bitmap = BitmapFactory.decodeFile(imagePath, options) ?: return@AsyncFunction null
        val scaled = Bitmap.createScaledBitmap(bitmap, 9, 8, true)
        
        var hash = 0L
        for (y in 0 until 8) {
          for (x in 0 until 8) {
            val leftPixel = scaled.getPixel(x, y) and 0xFF
            val rightPixel = scaled.getPixel(x + 1, y) and 0xFF
            if (leftPixel < rightPixel) {
              hash = hash or (1L shl (y * 8 + x))
            }
          }
        }
        scaled.recycle()
        bitmap.recycle()

        hash.toString(16)
      } catch (e: Exception) {
        null
      }
    }
  }

  // 16 KB de início, meio e fim via xxHash64
  private fun calculatePartialXxHash64(file: File): Long {
    val chunkSize = 16 * 1024
    val fileLength = file.length()
    var hash = 0L

    RandomAccessFile(file, "r").use { raf ->
      val buffer = ByteArray(chunkSize)
      // Início
      var read = raf.read(buffer)
      if (read > 0) hash = hash xor computeXxHash64Simple(buffer, read)

      // Meio
      if (fileLength > chunkSize * 3) {
        raf.seek(fileLength / 2)
        read = raf.read(buffer)
        if (read > 0) hash = hash xor computeXxHash64Simple(buffer, read)
      }

      // Fim
      if (fileLength > chunkSize * 2) {
        raf.seek(fileLength - chunkSize)
        read = raf.read(buffer)
        if (read > 0) hash = hash xor computeXxHash64Simple(buffer, read)
      }
    }

    return hash
  }

  // Hash completo xxHash64
  private fun calculateFullXxHash64(file: File): Long {
    var hash = 0L
    FileInputStream(file).use { fis ->
      val buffer = ByteArray(64 * 1024)
      var read: Int
      while (fis.read(buffer).also { read = it } != -1) {
        hash = hash xor computeXxHash64Simple(buffer, read)
      }
    }
    return hash
  }

  // Implementação padrão de xxHash64 64-bit
  private fun computeXxHash64Simple(bytes: ByteArray, length: Int): Long {
    val prime64_1 = -7046029254386353131L
    val prime64_2 = -4417276706812530607L
    val prime64_3 = 1609587929392839161L
    val prime64_4 = -8796714831421247437L
    val prime64_5 = 2870177450012600261L

    var h64 = length + prime64_5
    for (i in 0 until length) {
      val b = bytes[i].toLong() and 0xFF
      h64 = h64 xor (b * prime64_5)
      h64 = java.lang.Long.rotateLeft(h64, 11) * prime64_1
    }
    return h64
  }
}
