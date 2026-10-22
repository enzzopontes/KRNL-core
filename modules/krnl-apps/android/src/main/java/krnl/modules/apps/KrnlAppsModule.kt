package krnl.modules.apps

import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.File

class KrnlAppsModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("React context is unavailable")

  override fun definition() = ModuleDefinition {
    Name("KrnlAppsModule")

    Events("onAppsLoaded")

    AsyncFunction("getInstalledApps") {
      val pm = context.packageManager
      val packages = pm.getInstalledApplications(PackageManager.GET_META_DATA)
      val appList = mutableListOf<Map<String, Any>>()

      for (app in packages) {
        val isSystem = (app.flags and ApplicationInfo.FLAG_SYSTEM) != 0
        val label = pm.getApplicationLabel(app).toString()
        val sourceApk = File(app.sourceDir)
        val sizeBytes = if (sourceApk.exists()) sourceApk.length() else 0L

        appList.add(
          mapOf(
            "packageName" to app.packageName,
            "label" to label,
            "isSystem" to isSystem,
            "sizeBytes" to sizeBytes.toDouble(),
            "targetSdkVersion" to app.targetSdkVersion
          )
        )
      }

      appList
    }

    AsyncFunction("openAppDetails") { packageName: String ->
      val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
        data = Uri.fromParts("package", packageName, null)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      context.startActivity(intent)
      true
    }

    AsyncFunction("requestUninstall") { packageName: String ->
      val intent = Intent(Intent.ACTION_DELETE).apply {
        data = Uri.fromParts("package", packageName, null)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      context.startActivity(intent)
      true
    }
  }
}
