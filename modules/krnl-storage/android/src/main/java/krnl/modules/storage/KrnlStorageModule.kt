package krnl.modules.storage

import android.content.Context
import android.os.Build
import android.os.Environment
import android.os.StatFs
import android.provider.MediaStore
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileInputStream
import java.security.MessageDigest

class KrnlStorageModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("React context is unavailable")

  override fun definition() = ModuleDefinition {
    Name("KrnlStorageModule")

    Events("onScanProgress", "onScanComplete")

    AsyncFunction("getStorageStats") {
      val path = Environment.getDataDirectory()
      val stat = StatFs(path.path)
      val blockSize = stat.blockSizeLong
      val totalBlocks = stat.blockCountLong
      val availableBlocks = stat.availableBlocksLong

      val totalBytes = totalBlocks * blockSize
      val freeBytes = availableBlocks * blockSize
      val usedBytes = totalBytes - freeBytes

      mapOf(
        "totalBytes" to totalBytes.toDouble(),
        "freeBytes" to freeBytes.toDouble(),
        "usedBytes" to usedBytes.toDouble(),
        "usedPercent" to ((usedBytes.toDouble() / totalBytes.toDouble()) * 100)
      )
    }

    AsyncFunction("scanJunkFiles") { dryRun: Boolean ->
      val scope = CoroutineScope(Dispatchers.IO)
      scope.launch {
        var totalJunkBytes = 0L
        val junkFilesList = mutableListOf<Map<String, Any>>()

        // Cache & temp folders
        val cacheDirs = listOfNotNull(
          context.cacheDir,
          context.externalCacheDir,
          File(Environment.getExternalStorageDirectory(), "Android/media"),
          File(Environment.getExternalStorageDirectory(), "Download/.trash"),
          File(Environment.getExternalStorageDirectory(), ".thumbnails")
        )

        val junkExtensions = listOf(".tmp", ".log", ".temp", ".apk_temp", "thumbnails", ".bak", ".dmp")

        for (baseDir in cacheDirs) {
          if (!baseDir.exists()) continue
          try {
            baseDir.walkTopDown().maxDepth(5).forEach { file ->
              if (file.isFile) {
                val isJunk = junkExtensions.any { ext -> file.name.lowercase().endsWith(ext) } ||
                             file.parent?.contains("cache", ignoreCase = true) == true ||
                             file.parent?.contains("thumbnails", ignoreCase = true) == true

                if (isJunk) {
                  totalJunkBytes += file.length()
                  junkFilesList.add(
                    mapOf(
                      "path" to file.absolutePath,
                      "name" to file.name,
                      "size" to file.length().toDouble(),
                      "category" to "CACHE_TEMP"
                    )
                  )
                }
              }
            }
          } catch (e: Exception) {}
        }

        sendEvent("onScanComplete", mapOf(
          "dryRun" to dryRun,
          "totalBytes" to totalJunkBytes.toDouble(),
          "count" to junkFilesList.size,
          "items" to junkFilesList.take(100)
        ))
      }
      true
    }

    AsyncFunction("moveToQuarantine") { sourcePath: String ->
      val src = File(sourcePath)
      if (!src.exists()) {
        return@AsyncFunction mapOf("success" to false, "error" to "File not found")
      }

      val quarantineDir = File(context.filesDir, ".krnl_quarantine")
      if (!quarantineDir.exists()) {
        quarantineDir.mkdirs()
      }

      val dest = File(quarantineDir, "${System.currentTimeMillis()}_${src.name}")
      val moved = src.renameTo(dest)
      if (moved) {
        mapOf("success" to true, "quarantinePath" to dest.absolutePath)
      } else {
        // Fallback: copy and delete
        try {
          src.copyTo(dest, overwrite = true)
          src.delete()
          mapOf("success" to true, "quarantinePath" to dest.absolutePath)
        } catch (e: Exception) {
          mapOf("success" to false, "error" to e.localizedMessage)
        }
      }
    }

    AsyncFunction("restoreFromQuarantine") { quarantinePath: String, originalPath: String ->
      val src = File(quarantinePath)
      if (!src.exists()) {
        return@AsyncFunction mapOf("success" to false, "error" to "File not in quarantine")
      }

      val dest = File(originalPath)
      dest.parentFile?.mkdirs()
      val restored = src.renameTo(dest)
      if (restored) {
        mapOf("success" to true)
      } else {
        try {
          src.copyTo(dest, overwrite = true)
          src.delete()
          mapOf("success" to true)
        } catch (e: Exception) {
          mapOf("success" to false, "error" to e.localizedMessage)
        }
      }
    }

    AsyncFunction("listFiles") { path: String? ->
      val targetDir = if (path.isNullOrEmpty()) {
        Environment.getExternalStorageDirectory()
      } else {
        File(path)
      }

      if (!targetDir.exists() || !targetDir.isDirectory) {
        return@AsyncFunction emptyList<Map<String, Any>>()
      }

      val items = targetDir.listFiles() ?: return@AsyncFunction emptyList<Map<String, Any>>()
      items.map { file ->
        mapOf(
          "name" to file.name,
          "path" to file.absolutePath,
          "size" to if (file.isDirectory) 0.0 else file.length().toDouble(),
          "isDirectory" to file.isDirectory,
          "lastModified" to file.lastModified().toDouble(),
          "extension" to (if (file.isDirectory) "" else file.extension)
        )
      }.sortedWith(compareBy({ !(it["isDirectory"] as Boolean) }, { (it["name"] as String).lowercase() }))
    }

    AsyncFunction("getCategorySizes") {
      var photosBytes = 0.0
      var videosBytes = 0.0
      var audioBytes = 0.0
      var docsBytes = 0.0
      var downloadsBytes = 0.0
      var apksBytes = 0.0
      var othersBytes = 0.0

      // 1. Query Android MediaStore for Photos, Videos, Audio
      try {
        val cr = context.contentResolver
        
        // Photos
        cr.query(
          MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
          arrayOf(MediaStore.MediaColumns.SIZE),
          null, null, null
        )?.use { cursor ->
          val sizeCol = cursor.getColumnIndex(MediaStore.MediaColumns.SIZE)
          while (cursor.moveToNext()) {
            if (sizeCol != -1) photosBytes += cursor.getLong(sizeCol).toDouble()
          }
        }

        // Videos
        cr.query(
          MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
          arrayOf(MediaStore.MediaColumns.SIZE),
          null, null, null
        )?.use { cursor ->
          val sizeCol = cursor.getColumnIndex(MediaStore.MediaColumns.SIZE)
          while (cursor.moveToNext()) {
            if (sizeCol != -1) videosBytes += cursor.getLong(sizeCol).toDouble()
          }
        }

        // Audio
        cr.query(
          MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
          arrayOf(MediaStore.MediaColumns.SIZE),
          null, null, null
        )?.use { cursor ->
          val sizeCol = cursor.getColumnIndex(MediaStore.MediaColumns.SIZE)
          while (cursor.moveToNext()) {
            if (sizeCol != -1) audioBytes += cursor.getLong(sizeCol).toDouble()
          }
        }
      } catch (e: Exception) {}

      // 2. Directory scan for Downloads, Docs, APKs, Others
      val externalRoot = Environment.getExternalStorageDirectory()
      val docExtensions = setOf("pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt")

      if (externalRoot != null && externalRoot.exists()) {
        try {
          externalRoot.walkTopDown().maxDepth(4).forEach { file ->
            if (file.isFile) {
              val len = file.length().toDouble()
              val ext = file.extension.lowercase()
              val path = file.absolutePath

              when {
                path.contains("/Download", ignoreCase = true) -> downloadsBytes += len
                ext == "apk" -> apksBytes += len
                ext in docExtensions -> docsBytes += len
                !path.contains("/DCIM/", ignoreCase = true) && !path.contains("/Pictures/", ignoreCase = true) && !path.contains("/Movies/", ignoreCase = true) -> {
                  othersBytes += len
                }
              }
            }
          }
        } catch (e: Exception) {}
      }

      mapOf(
        "photos" to photosBytes,
        "videos" to videosBytes,
        "downloads" to downloadsBytes,
        "audio" to audioBytes,
        "docs" to docsBytes,
        "apks" to apksBytes,
        "others" to othersBytes
      )
    }

    AsyncFunction("getLargeFiles") { minSizeBytes: Double? ->
      val threshold = (minSizeBytes ?: (25.0 * 1024 * 1024)).toLong() // Default 25 MB
      val results = mutableListOf<Map<String, Any>>()
      val seenPaths = mutableSetOf<String>()

      // 1. MediaStore query for large video and image files
      try {
        val cr = context.contentResolver
        val projection = arrayOf(
          MediaStore.MediaColumns.DATA,
          MediaStore.MediaColumns.DISPLAY_NAME,
          MediaStore.MediaColumns.SIZE,
          MediaStore.MediaColumns.DATE_MODIFIED
        )
        val selection = "${MediaStore.MediaColumns.SIZE} >= ?"
        val selectionArgs = arrayOf(threshold.toString())

        // Large Videos
        cr.query(
          MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
          projection,
          selection,
          selectionArgs,
          "${MediaStore.MediaColumns.SIZE} DESC"
        )?.use { cursor ->
          val dataCol = cursor.getColumnIndex(MediaStore.MediaColumns.DATA)
          val nameCol = cursor.getColumnIndex(MediaStore.MediaColumns.DISPLAY_NAME)
          val sizeCol = cursor.getColumnIndex(MediaStore.MediaColumns.SIZE)
          val dateCol = cursor.getColumnIndex(MediaStore.MediaColumns.DATE_MODIFIED)

          while (cursor.moveToNext()) {
            val path = if (dataCol != -1) cursor.getString(dataCol) else null
            if (path != null && seenPaths.add(path)) {
              results.add(
                mapOf(
                  "name" to (if (nameCol != -1) cursor.getString(nameCol) else File(path).name),
                  "path" to path,
                  "size" to (if (sizeCol != -1) cursor.getLong(sizeCol).toDouble() else File(path).length().toDouble()),
                  "lastModified" to (if (dateCol != -1) cursor.getLong(dateCol).toDouble() * 1000 else File(path).lastModified().toDouble()),
                  "category" to "VIDEOS"
                )
              )
            }
          }
        }

        // Large Images
        cr.query(
          MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
          projection,
          selection,
          selectionArgs,
          "${MediaStore.MediaColumns.SIZE} DESC"
        )?.use { cursor ->
          val dataCol = cursor.getColumnIndex(MediaStore.MediaColumns.DATA)
          val nameCol = cursor.getColumnIndex(MediaStore.MediaColumns.DISPLAY_NAME)
          val sizeCol = cursor.getColumnIndex(MediaStore.MediaColumns.SIZE)
          val dateCol = cursor.getColumnIndex(MediaStore.MediaColumns.DATE_MODIFIED)

          while (cursor.moveToNext()) {
            val path = if (dataCol != -1) cursor.getString(dataCol) else null
            if (path != null && seenPaths.add(path)) {
              results.add(
                mapOf(
                  "name" to (if (nameCol != -1) cursor.getString(nameCol) else File(path).name),
                  "path" to path,
                  "size" to (if (sizeCol != -1) cursor.getLong(sizeCol).toDouble() else File(path).length().toDouble()),
                  "lastModified" to (if (dateCol != -1) cursor.getLong(dateCol).toDouble() * 1000 else File(path).lastModified().toDouble()),
                  "category" to "PHOTOS"
                )
              )
            }
          }
        }
      } catch (e: Exception) {}

      // 2. Direct file scan for large files in Downloads / Documents
      val externalRoot = Environment.getExternalStorageDirectory()
      if (externalRoot != null && externalRoot.exists()) {
        try {
          externalRoot.walkTopDown().maxDepth(4).forEach { file ->
            if (file.isFile && file.length() >= threshold && seenPaths.add(file.absolutePath)) {
              val ext = file.extension.lowercase()
              val cat = when {
                ext in setOf("mp4", "mkv", "mov", "avi") -> "VIDEOS"
                ext in setOf("jpg", "jpeg", "png", "heic") -> "PHOTOS"
                ext == "apk" -> "APKS"
                ext in setOf("zip", "rar", "7z", "tar", "gz") -> "DOWNLOADS"
                ext in setOf("pdf", "doc", "docx", "xlsx") -> "DOCS"
                else -> "OTHER"
              }

              results.add(
                mapOf(
                  "name" to file.name,
                  "path" to file.absolutePath,
                  "size" to file.length().toDouble(),
                  "lastModified" to file.lastModified().toDouble(),
                  "category" to cat
                )
              )
            }
          }
        } catch (e: Exception) {}
      }

      results.sortedByDescending { (it["size"] as Double) }
    }

    AsyncFunction("getScreenshotsAndRecordings") {
      val results = mutableListOf<Map<String, Any>>()
      val seenPaths = mutableSetOf<String>()

      // 1. Query MediaStore for items in Screenshots folders
      try {
        val cr = context.contentResolver
        val projection = arrayOf(
          MediaStore.MediaColumns.DATA,
          MediaStore.MediaColumns.DISPLAY_NAME,
          MediaStore.MediaColumns.SIZE,
          MediaStore.MediaColumns.DATE_MODIFIED
        )
        val selection = "${MediaStore.MediaColumns.DATA} LIKE ?"
        val selectionArgs = arrayOf("%Screenshots%")

        cr.query(
          MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
          projection,
          selection,
          selectionArgs,
          "${MediaStore.MediaColumns.DATE_MODIFIED} DESC"
        )?.use { cursor ->
          val dataCol = cursor.getColumnIndex(MediaStore.MediaColumns.DATA)
          val nameCol = cursor.getColumnIndex(MediaStore.MediaColumns.DISPLAY_NAME)
          val sizeCol = cursor.getColumnIndex(MediaStore.MediaColumns.SIZE)
          val dateCol = cursor.getColumnIndex(MediaStore.MediaColumns.DATE_MODIFIED)

          while (cursor.moveToNext()) {
            val path = if (dataCol != -1) cursor.getString(dataCol) else null
            if (path != null && seenPaths.add(path)) {
              results.add(
                mapOf(
                  "name" to (if (nameCol != -1) cursor.getString(nameCol) else File(path).name),
                  "path" to path,
                  "size" to (if (sizeCol != -1) cursor.getLong(sizeCol).toDouble() else File(path).length().toDouble()),
                  "lastModified" to (if (dateCol != -1) cursor.getLong(dateCol).toDouble() * 1000 else File(path).lastModified().toDouble()),
                  "isDirectory" to false,
                  "type" to "SCREENSHOT"
                )
              )
            }
          }
        }
      } catch (e: Exception) {}

      // 2. Direct folder traversal fallback
      val externalRoot = Environment.getExternalStorageDirectory()
      val targetDirs = listOfNotNull(
        if (externalRoot != null) File(externalRoot, "Pictures/Screenshots") else null,
        if (externalRoot != null) File(externalRoot, "DCIM/Screenshots") else null,
        if (externalRoot != null) File(externalRoot, "DCIM/ScreenRecorder") else null,
        if (externalRoot != null) File(externalRoot, "Movies/ScreenRecorder") else null
      )

      for (dir in targetDirs) {
        if (!dir.exists() || !dir.isDirectory) continue
        try {
          dir.walkTopDown().maxDepth(3).forEach { file ->
            if (file.isFile && seenPaths.add(file.absolutePath)) {
              results.add(
                mapOf(
                  "name" to file.name,
                  "path" to file.absolutePath,
                  "size" to file.length().toDouble(),
                  "lastModified" to file.lastModified().toDouble(),
                  "isDirectory" to false,
                  "type" to if (file.parent?.contains("ScreenRecorder", ignoreCase = true) == true || file.extension.lowercase() in setOf("mp4", "mkv", "mov")) "RECORDING" else "SCREENSHOT"
                )
              )
            }
          }
        } catch (_: Exception) {}
      }

      results.sortedByDescending { (it["lastModified"] as Double) }
    }
  }
}
