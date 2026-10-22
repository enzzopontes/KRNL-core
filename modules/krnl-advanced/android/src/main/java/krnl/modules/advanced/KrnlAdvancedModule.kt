package krnl.modules.advanced

import android.content.Context
import androidx.work.*
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
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
  }
}

class KrnlMaintenanceWorker(appContext: Context, workerParams: WorkerParameters) :
  Worker(appContext, workerParams) {
  override fun doWork(): Result {
    return Result.success()
  }
}
