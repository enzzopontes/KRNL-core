package krnl.modules.advanced

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.os.Environment
import android.os.StatFs
import androidx.core.app.NotificationCompat
import androidx.work.*
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.util.concurrent.TimeUnit

class KrnlAdvancedModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("React context is unavailable")

  override fun definition() = ModuleDefinition {
    Name("KrnlAdvancedModule")

    AsyncFunction("scheduleWeeklyMaintenance") {
      val constraints = Constraints.Builder()
        .setRequiresCharging(true)
        .setRequiredNetworkType(NetworkType.UNMETERED)
        .build()

      val periodicWorkRequest = PeriodicWorkRequestBuilder<KrnlMaintenanceWorker>(
        7, TimeUnit.DAYS
      )
        .setConstraints(constraints)
        .build()

      WorkManager.getInstance(context).enqueueUniquePeriodicWork(
        "KrnlWeeklyClean",
        ExistingPeriodicWorkPolicy.KEEP,
        periodicWorkRequest
      )

      true
    }

    AsyncFunction("checkStorageAlert") {
      val path = Environment.getDataDirectory()
      val stat = StatFs(path.path)
      val totalBytes = stat.blockCountLong * stat.blockSizeLong
      val freeBytes = stat.availableBlocksLong * stat.blockSizeLong
      val usedPercent = if (totalBytes > 0) ((totalBytes - freeBytes).toDouble() / totalBytes.toDouble()) * 100 else 0.0

      if (usedPercent >= 85.0) {
        showLowStorageNotification(context, usedPercent)
        true
      } else {
        false
      }
    }
  }

  companion object {
    fun showLowStorageNotification(context: Context, usedPercent: Double) {
      val channelId = "krnl_storage_alerts"
      val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val channel = NotificationChannel(
          channelId,
          "KRNL Alertas de Armazenamento",
          NotificationManager.IMPORTANCE_DEFAULT
        ).apply {
          description = "Alertas de espaço crítico em disco"
        }
        notificationManager.createNotificationChannel(channel)
      }

      val notification = NotificationCompat.Builder(context, channelId)
        .setSmallIcon(android.R.drawable.stat_sys_warning)
        .setContentTitle("KRNL Core // Espaço Crítico")
        .setContentText("Armazenamento em ${"%.1f".format(usedPercent)}%. Recomendada manutenção preventiva.")
        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
        .setAutoCancel(true)
        .build()

      notificationManager.notify(1001, notification)
    }
  }
}

class KrnlMaintenanceWorker(appContext: Context, workerParams: WorkerParameters) :
  Worker(appContext, workerParams) {
  override fun doWork(): Result {
    try {
      // 1. Limpar arquivos da quarentena mais antigos que 30 dias
      val quarantineDir = File(applicationContext.filesDir, ".krnl_quarantine")
      if (quarantineDir.exists() && quarantineDir.isDirectory) {
        val expireTime = System.currentTimeMillis() - (30L * 24 * 60 * 60 * 1000)
        quarantineDir.listFiles()?.forEach { file ->
          if (file.lastModified() < expireTime) {
            file.delete()
          }
        }
      }

      // 2. Limpar cache temporário de downloads e logs
      val cacheDir = applicationContext.cacheDir
      cacheDir?.walkTopDown()?.maxDepth(3)?.forEach { file ->
        if (file.isFile && (file.name.endsWith(".tmp") || file.name.endsWith(".log"))) {
          if (System.currentTimeMillis() - file.lastModified() > (7L * 24 * 60 * 60 * 1000)) {
            file.delete()
          }
        }
      }

      // 3. Checar se armazenamento está acima de 85%
      val path = Environment.getDataDirectory()
      val stat = StatFs(path.path)
      val totalBytes = stat.blockCountLong * stat.blockSizeLong
      val freeBytes = stat.availableBlocksLong * stat.blockSizeLong
      val usedPercent = if (totalBytes > 0) ((totalBytes - freeBytes).toDouble() / totalBytes.toDouble()) * 100 else 0.0

      if (usedPercent >= 85.0) {
        KrnlAdvancedModule.showLowStorageNotification(applicationContext, usedPercent)
      }

      return Result.success()
    } catch (e: Exception) {
      return Result.failure()
    }
  }
}
