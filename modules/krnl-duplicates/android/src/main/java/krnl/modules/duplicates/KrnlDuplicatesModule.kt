package krnl.modules.duplicates

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileInputStream
import java.io.RandomAccessFile

class KrnlDuplicatesModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("React context is unavailable")

  override fun definition() = ModuleDefinition {
    Name("KrnlDuplicatesModule")

    Events("onDuplicateProgress", "onDuplicatesFound")

    /**
     * Algoritmo de 3 Etapas usando xxHash64 nativo:
     * 1. Agrupamento por tamanho exato em bytes.
     * 2. Hash parcial rápido (início, meio e fim, 16 KB cada) via xxHash64.
     * 3. Hash completo xxHash64 apenas para os candidatos empatados no passo 2.
     */
    AsyncFunction("scanExactDuplicates") { paths: List<String>? ->
      val targetPaths = if (paths.isNullOrEmpty()) discoverMediaFiles() else paths
      val files = targetPaths.map { File(it) }.filter { it.exists() && it.isFile }
      
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

      val result = mapOf("groups" to duplicateGroups)
      sendEvent("onDuplicatesFound", result)
      result
    }

    /**
     * Hash Perceptual (dHash) para imagens semelhantes:
     * Redimensiona para 9x8 em tons de cinza e compara pixels adjacentes (64 bits).
     */
    AsyncFunction("calculateDHash") { imagePath: String ->
      computeDHash(imagePath)?.let { java.lang.Long.toHexString(it) }
    }

    /**
     * Calcula o score de nitidez via variância do operador Laplaciano em escala de cinza.
     * Valores menores que o limiar indicam fotos borradas ou tremidas.
     */
    AsyncFunction("calculateBlurScore") { imagePath: String ->
      computeBlurScore(imagePath)
    }

    /**
     * Escaneia fotos borradas com base em limiar de nitidez Laplaciana.
     */
    AsyncFunction("scanBlurryPhotos") { threshold: Double?, paths: List<String>? ->
      val t = threshold ?: 100.0
      val targetPaths = if (paths.isNullOrEmpty()) discoverMediaFiles() else paths
      scanBlurryPhotosInternal(targetPaths, t)
    }

    /**
     * Agrupa fotos semelhantes comparando distância de Hamming entre dHashes.
     */
    AsyncFunction("scanSimilarPhotos") { paths: List<String>?, maxHammingDistance: Int? ->
      val targetPaths = if (paths.isNullOrEmpty()) discoverMediaFiles() else paths
      val maxDist = maxHammingDistance ?: 10
      scanSimilarPhotosInternal(targetPaths, maxDist)
    }
  }

  private fun computeBlurScore(imagePath: String): Double {
    return try {
      val file = File(imagePath)
      if (!file.exists() || !file.isFile) return 0.0

      val boundsOptions = BitmapFactory.Options().apply { inJustDecodeBounds = true }
      BitmapFactory.decodeFile(imagePath, boundsOptions)
      val origW = boundsOptions.outWidth
      val origH = boundsOptions.outHeight
      if (origW <= 0 || origH <= 0) return 0.0

      var sampleSize = 1
      while (origW / sampleSize > 800 || origH / sampleSize > 800) {
        sampleSize *= 2
      }

      val decodeOptions = BitmapFactory.Options().apply {
        inSampleSize = sampleSize
        inPreferredConfig = Bitmap.Config.ARGB_8888
      }
      val bitmap = BitmapFactory.decodeFile(imagePath, decodeOptions) ?: return 0.0
      val width = bitmap.width
      val height = bitmap.height
      if (width < 3 || height < 3) {
        bitmap.recycle()
        return 0.0
      }

      val pixels = IntArray(width * height)
      bitmap.getPixels(pixels, 0, width, 0, 0, width, height)
      bitmap.recycle()

      val gray = IntArray(width * height)
      for (i in pixels.indices) {
        val p = pixels[i]
        val r = (p shr 16) and 0xFF
        val g = (p shr 8) and 0xFF
        val b = p and 0xFF
        gray[i] = (299 * r + 587 * g + 114 * b) / 1000
      }

      var sum = 0.0
      var sumSq = 0.0
      var count = 0

      for (y in 1 until height - 1) {
        val rowAbove = (y - 1) * width
        val rowCurr = y * width
        val rowBelow = (y + 1) * width

        for (x in 1 until width - 1) {
          val lap = -4 * gray[rowCurr + x] +
            gray[rowAbove + x] +
            gray[rowBelow + x] +
            gray[rowCurr + x - 1] +
            gray[rowCurr + x + 1]

          val lapD = lap.toDouble()
          sum += lapD
          sumSq += lapD * lapD
          count++
        }
      }

      if (count == 0) return 0.0
      val mean = sum / count
      val variance = (sumSq / count) - (mean * mean)
      if (variance < 0.0) 0.0 else variance
    } catch (e: Exception) {
      0.0
    }
  }

  private fun scanBlurryPhotosInternal(paths: List<String>, threshold: Double): List<Map<String, Any>> {
    val results = mutableListOf<Map<String, Any>>()
    for (path in paths) {
      val file = File(path)
      if (!file.exists() || !file.isFile) continue
      val score = computeBlurScore(path)
      if (score < threshold) {
        results.add(
          mapOf(
            "path" to file.absolutePath,
            "size" to file.length().toDouble(),
            "blurScore" to score
          )
        )
      }
    }
    return results
  }

  private fun computeDHash(imagePath: String): Long? {
    return try {
      val file = File(imagePath)
      if (!file.exists() || !file.isFile) return null

      val options = BitmapFactory.Options().apply {
        inSampleSize = 2
      }
      val bitmap = BitmapFactory.decodeFile(imagePath, options) ?: return null
      val scaled = Bitmap.createScaledBitmap(bitmap, 9, 8, true)

      var hash = 0L
      for (y in 0 until 8) {
        for (x in 0 until 8) {
          val leftP = scaled.getPixel(x, y)
          val rightP = scaled.getPixel(x + 1, y)
          val leftGray = (Color.red(leftP) * 299 + Color.green(leftP) * 587 + Color.blue(leftP) * 114) / 1000
          val rightGray = (Color.red(rightP) * 299 + Color.green(rightP) * 587 + Color.blue(rightP) * 114) / 1000
          if (leftGray < rightGray) {
            hash = hash or (1L shl (y * 8 + x))
          }
        }
      }
      scaled.recycle()
      bitmap.recycle()
      hash
    } catch (e: Exception) {
      null
    }
  }

  private data class PhotoHash(val file: File, val hash: Long)

  private fun scanSimilarPhotosInternal(paths: List<String>, maxDistance: Int): List<Map<String, Any>> {
    val photoHashes = mutableListOf<PhotoHash>()
    for (path in paths) {
      val file = File(path)
      if (!file.exists() || !file.isFile) continue
      val hash = computeDHash(path) ?: continue
      photoHashes.add(PhotoHash(file, hash))
    }

    val n = photoHashes.size
    if (n < 2) return emptyList()

    val parent = IntArray(n) { it }
    fun find(i: Int): Int {
      var root = i
      while (root != parent[root]) {
        root = parent[root]
      }
      var curr = i
      while (curr != root) {
        val next = parent[curr]
        parent[curr] = root
        curr = next
      }
      return root
    }

    fun union(i: Int, j: Int) {
      val rootI = find(i)
      val rootJ = find(j)
      if (rootI != rootJ) {
        parent[rootI] = rootJ
      }
    }

    for (i in 0 until n) {
      for (j in i + 1 until n) {
        val dist = java.lang.Long.bitCount(photoHashes[i].hash xor photoHashes[j].hash)
        if (dist <= maxDistance) {
          union(i, j)
        }
      }
    }

    val clusters = mutableMapOf<Int, MutableList<PhotoHash>>()
    for (i in 0 until n) {
      val root = find(i)
      clusters.getOrPut(root) { mutableListOf() }.add(photoHashes[i])
    }

    val groups = mutableListOf<Map<String, Any>>()
    for ((_, members) in clusters) {
      if (members.size > 1) {
        val primary = members.maxByOrNull { it.file.length() } ?: members[0]
        val totalBytes = members.sumOf { it.file.length() }
        groups.add(
          mapOf(
            "primaryPath" to primary.file.absolutePath,
            "similarPaths" to members.map { it.file.absolutePath },
            "totalSizeBytes" to totalBytes.toDouble(),
            "count" to members.size
          )
        )
      }
    }

    return groups
  }

  private fun discoverMediaFiles(): List<String> {
    val results = mutableListOf<String>()

    // 1. Android MediaStore Query (Works on Android 10, 11, 12, 13, 14, 15 without MANAGE_EXTERNAL_STORAGE)
    try {
      val cr = context.contentResolver
      val projection = arrayOf(MediaStore.MediaColumns.DATA, MediaStore.MediaColumns.SIZE)
      
      // Query Images
      cr.query(
        MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
        projection,
        null,
        null,
        "${MediaStore.Images.Media.DATE_MODIFIED} DESC"
      )?.use { cursor ->
        val dataCol = cursor.getColumnIndex(MediaStore.MediaColumns.DATA)
        while (cursor.moveToNext()) {
          if (dataCol != -1) {
            val path = cursor.getString(dataCol)
            if (path != null && File(path).exists()) {
              results.add(path)
            }
          }
        }
      }

      // Query Videos
      cr.query(
        MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
        projection,
        null,
        null,
        "${MediaStore.Video.Media.DATE_MODIFIED} DESC"
      )?.use { cursor ->
        val dataCol = cursor.getColumnIndex(MediaStore.MediaColumns.DATA)
        while (cursor.moveToNext()) {
          if (dataCol != -1) {
            val path = cursor.getString(dataCol)
            if (path != null && File(path).exists()) {
              results.add(path)
            }
          }
        }
      }
    } catch (e: Exception) {
      // Fallback below
    }

    // 2. Direct File System Traversal (DCIM, Pictures, Downloads)
    val searchDirs = listOfNotNull(
      Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DCIM),
      Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES),
      Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
      File("/storage/emulated/0/DCIM"),
      File("/storage/emulated/0/Pictures"),
      File("/storage/emulated/0/Download")
    ).filter { it.exists() && it.isDirectory }.distinctBy { it.canonicalPath }

    val validExtensions = setOf("jpg", "jpeg", "png", "webp", "heic", "mp4", "mkv", "mov")

    for (dir in searchDirs) {
      try {
        dir.walkTopDown()
          .maxDepth(5)
          .filter { it.isFile && it.extension.lowercase() in validExtensions }
          .forEach { results.add(it.absolutePath) }
      } catch (e: Exception) {}
    }

    return results.distinct()
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
