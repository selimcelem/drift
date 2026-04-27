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
        // Edge-to-edge: lets WindowInsets propagate to the WebView so
        // env(safe-area-inset-bottom) resolves to a non-zero value when the
        // gesture-pill area is present. Without this, safe-area CSS padding
        // collapses to 0 on Android and bottom UI (SHOP, DRIFT AGAIN, etc.)
        // sits underneath the gesture bar on devices with gesture nav.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        PlayGamesSdk.initialize(this);
    }
}
