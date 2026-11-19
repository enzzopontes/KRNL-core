package krnl.modules.advanced

import android.content.Intent
import android.graphics.drawable.Icon
import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService
import androidx.annotation.RequiresApi

@RequiresApi(Build.VERSION_CODES.N)
class KrnlTileService : TileService() {
  override fun onStartListening() {
    super.onStartListening()
    val tile = qsTile ?: return
    tile.state = Tile.STATE_INACTIVE
    tile.label = "KRNL // HUD"
    tile.updateTile()
  }

  override fun onClick() {
    super.onClick()
    val tile = qsTile ?: return
    tile.state = Tile.STATE_ACTIVE
    tile.updateTile()

    // Open app directly into HUD maintenance
    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
      putExtra("action", "quick_clean")
    }
    if (launchIntent != null) {
      startActivityAndCollapse(launchIntent)
    }

    tile.state = Tile.STATE_INACTIVE
    tile.updateTile()
  }
}
