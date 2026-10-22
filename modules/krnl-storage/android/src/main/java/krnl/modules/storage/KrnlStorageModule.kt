package krnl.modules.storage

import android.content.Context
import android.os.Build
import android.os.Environment
import android.os.StatFs
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
          File(Environment.getExternalStorageDirectory(), "Android/media")
        )

        val junkExtensions = listOf(".tmp", ".log", ".temp", ".apk_temp", "thumbnails")

        for (baseDir in cacheDirs) {
          if (!baseDir.exists()) continue
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

      mapOf(
        "success" to moved,
        "originalPath" to src.absolutePath,
        "quarantinePath" to dest.absolutePath,
        "size" to dest.length().toDouble()
      )
    }
  }
}
