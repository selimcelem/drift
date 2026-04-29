package com.selimcelem.drift;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.games.PlayGamesSdk;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PgsSavedGamesPlugin.class);
        super.onCreate(savedInstanceState);
        // Fully immersive mode per the official Android guidance
        // (https://developer.android.com/develop/ui/views/layout/immersive).
        // Like Dawncaster / most full-screen mobile games: status + gesture
        // bars hidden during play, swipe-from-edge briefly reveals them as
        // a transient overlay, then they auto-hide.
        //
        // setDecorFitsSystemWindows(false) lets the WebView fill the whole
        // window. setSystemBarsBehavior(BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE)
        // makes the bars come back as a transient (auto-hiding) overlay on
        // edge-swipe instead of permanently exiting fullscreen. The actual
        // hide() call is reinforced by the SystemBars plugin's startup
        // setHidden(true) (configured in capacitor.config.json) which fires
        // on the main thread *after* onCreate; doing it here as well covers
        // the gap between onCreate and the plugin's main-thread post.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat controller =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.setSystemBarsBehavior(
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        controller.hide(WindowInsetsCompat.Type.systemBars());
        PlayGamesSdk.initialize(this);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        // Re-hide the system bars after returning from background, dialogs,
        // permission prompts, the recents view, etc. Without this they stay
        // shown after the focus event since BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        // only auto-hides bars revealed by an edge swipe.
        if (hasFocus) {
            WindowInsetsControllerCompat controller =
                WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
            controller.hide(WindowInsetsCompat.Type.systemBars());
        }
    }
}
