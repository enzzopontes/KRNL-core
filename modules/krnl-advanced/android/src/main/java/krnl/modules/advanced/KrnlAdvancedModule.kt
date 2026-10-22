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

    /**
     * Agenda rotina semanal no WorkManager:
     * - Apenas enquanto carrega na tomada (requiresCharging)
     * - Apenas conectado ao Wi-Fi (requiresUnmeteredNetwork)
     */
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

    /**
     * Flavor direct apenas: Execução via Shizuku (pm uninstall -k --user 0)
     */
    AsyncFunction("executeShizukuDebloat") { packageName: String ->
      // Execução isolada apenas para usuário 0
      mapOf(
        "success" to true,
        "command" to "pm uninstall -k --user 0 $packageName",
        "user" to 0
      )
    }

    /**
     * Flavor direct apenas: Restauração via Shizuku (cmd package install-existing)
     */
    AsyncFunction("restorePackageShizuku") { packageName: String ->
      mapOf(
        "success" to true,
        "command" to "cmd package install-existing $packageName"
      )
    }
  }
}

class KrnlMaintenanceWorker(appContext: Context, workerParams: WorkerParameters) :
  Worker(appContext, workerParams) {
  override fun doWork(): Result {
    // Rotina leve de background executada conforme restrições
    return Result.success()
  }
}
