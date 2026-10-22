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
import java.security.MessageDigest

class KrnlDuplicatesModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("KrnlDuplicatesModule")

    Events("onDuplicateProgress", "onDuplicatesFound")

    /**
     * Algoritmo de 3 Etapas:
     * 1. Agrupamento por tamanho exato em bytes.
     * 2. Hash parcial rápido (início, meio e fim, 16 KB cada) via xxHash / MD5 otimizado.
     * 3. Hash completo SHA-256 apenas para os candidatos empatados no passo 2.
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
          val partialHashes = mutableMapOf<String, MutableList<File>>()
          for (file in candidates) {
            val pHash = calculatePartialHash(file)
            partialHashes.getOrPut(pHash) { mutableListOf() }.add(file)
          }

          // Etapa 3: Hash completo apenas dos empatados
          for ((_, partialMatches) in partialHashes) {
            if (partialMatches.size > 1) {
              val fullHashes = mutableMapOf<String, MutableList<File>>()
              for (match in partialMatches) {
                val fHash = calculateFullHash(match)
                fullHashes.getOrPut(fHash) { mutableListOf() }.add(match)
              }

              for ((hash, exactMatches) in fullHashes) {
                if (exactMatches.size > 1) {
                  duplicateGroups.add(
                    mapOf(
                      "hash" to hash,
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

  // 16 KB de início, meio e fim
  private fun calculatePartialHash(file: File): String {
    val chunkSize = 16 * 1024
    val fileLength = file.length()
    val md = MessageDigest.getInstance("MD5")

    RandomAccessFile(file, "r").use { raf ->
      val buffer = ByteArray(chunkSize)
      // Início
      var read = raf.read(buffer)
      if (read > 0) md.update(buffer, 0, read)

      // Meio
      if (fileLength > chunkSize * 3) {
        raf.seek(fileLength / 2)
        read = raf.read(buffer)
        if (read > 0) md.update(buffer, 0, read)
      }

      // Fim
      if (fileLength > chunkSize * 2) {
        raf.seek(fileLength - chunkSize)
        read = raf.read(buffer)
        if (read > 0) md.update(buffer, 0, read)
      }
    }

    return md.digest().joinToString("") { "%02x".format(it) }
  }

  private fun calculateFullHash(file: File): String {
    val md = MessageDigest.getInstance("SHA-256")
    FileInputStream(file).use { fis ->
      val buffer = ByteArray(64 * 1024)
      var read: Int
      while (fis.read(buffer).also { read = it } != -1) {
        md.update(buffer, 0, read)
      }
    }
    return md.digest().joinToString("") { "%02x".format(it) }
  }
}
