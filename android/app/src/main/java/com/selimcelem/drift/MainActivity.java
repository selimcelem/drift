package com.selimcelem.drift;

import android.os.Bundle;
import android.view.View;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
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

        // Override the Capacitor SystemBars plugin's parent-padding listener
        // (registered during super.onCreate). The plugin pads the WebView's
        // parent by getInsets(systemBars | displayCutout).bottom, which on
        // pre-passthrough devices (WebView <140 OR before onDOMReady resolves
        // hasViewportCover) leaves the WebView ~30 logical px short of the
        // physical screen even when bars are hidden.
        //
        // Replace it with a cutout-only padding listener: ignore systemBars
        // insets (we hid them and want the WebView under their region), but
        // keep the displayCutout insets so the score / streak / timer stack
        // doesn't sit under a camera punch-hole or notch. Bottom is always
        // 0 — we want the canvas flush with the screen edge in immersive
        // mode, and there's no cutout you can land in at the bottom of a
        // portrait phone anyway.
        View webViewParent = (View) bridge.getWebView().getParent();
        ViewCompat.setOnApplyWindowInsetsListener(webViewParent, (v, insets) -> {
            Insets cutoutInsets = insets.getInsets(WindowInsetsCompat.Type.displayCutout());
            v.setPadding(cutoutInsets.left, cutoutInsets.top, cutoutInsets.right, 0);
            return WindowInsetsCompat.CONSUMED;
        });
        webViewParent.requestApplyInsets();

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
