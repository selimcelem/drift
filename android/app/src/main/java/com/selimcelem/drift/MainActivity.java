package com.selimcelem.drift;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.games.PlayGamesSdk;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PgsSavedGamesPlugin.class);
        super.onCreate(savedInstanceState);
        // Edge-to-edge per the official Android guidance
        // (https://developer.android.com/develop/ui/views/layout/edge-to-edge).
        // Inset handling itself is delegated to the Capacitor SystemBars plugin
        // (auto-registered by @capacitor/core 8.x). On modern WebView (≥140) +
        // viewport-fit=cover the plugin runs in passthrough mode and the WebView
        // fills the full window with env(safe-area-inset-*) resolving to the
        // status/gesture-bar regions. On older WebViews it pads the WebView
        // host so children stay clear of the system bars.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        PlayGamesSdk.initialize(this);
    }
}
