package com.selimcelem.drift

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.android.gms.games.PlayGames
import com.google.android.gms.games.SnapshotsClient
import com.google.android.gms.games.snapshot.SnapshotMetadataChange

@CapacitorPlugin(name = "PgsSavedGames")
class PgsSavedGamesPlugin : Plugin() {

    @PluginMethod
    fun signIn(call: PluginCall) {
        val act = activity ?: run { call.reject("no activity"); return }
        try {
            PlayGames.getGamesSignInClient(act).signIn()
                .addOnSuccessListener { result ->
                    val res = JSObject()
                    res.put("authenticated", result.isAuthenticated)
                    call.resolve(res)
                }
                .addOnFailureListener { e ->
                    call.reject("signIn failed: ${e.message}", e)
                }
        } catch (e: Exception) {
            call.reject("signIn exception: ${e.message}", e)
        }
    }

    @PluginMethod
    fun isAuthenticated(call: PluginCall) {
        val act = activity ?: run { call.reject("no activity"); return }
        try {
            PlayGames.getGamesSignInClient(act).isAuthenticated()
                .addOnSuccessListener { result ->
                    val res = JSObject()
                    res.put("authenticated", result.isAuthenticated)
                    call.resolve(res)
                }
                .addOnFailureListener { e ->
                    call.reject("isAuthenticated failed: ${e.message}", e)
                }
        } catch (e: Exception) {
            call.reject("isAuthenticated exception: ${e.message}", e)
        }
    }

    @PluginMethod
    fun writeSnapshot(call: PluginCall) {
        val act = activity ?: run { call.reject("no activity"); return }
        val name = call.getString("name") ?: return call.reject("name required")
        val data = call.getString("data") ?: return call.reject("data required")
        val description = call.getString("description") ?: "Drift save"
        val client = PlayGames.getSnapshotsClient(act)
        client.open(name, true, SnapshotsClient.RESOLUTION_POLICY_MOST_RECENTLY_MODIFIED)
            .addOnFailureListener { e -> call.reject("open failed: ${e.message}", e) }
            .addOnSuccessListener { result ->
                val snapshot = result.data
                if (snapshot == null) {
                    call.reject("snapshot null (conflict unresolved)")
                    return@addOnSuccessListener
                }
                try {
                    snapshot.snapshotContents.writeBytes(data.toByteArray(Charsets.UTF_8))
                    val meta = SnapshotMetadataChange.Builder()
                        .setDescription(description)
                        .build()
                    client.commitAndClose(snapshot, meta)
                        .addOnSuccessListener {
                            val res = JSObject()
                            res.put("success", true)
                            call.resolve(res)
                        }
                        .addOnFailureListener { e -> call.reject("commit failed: ${e.message}", e) }
                } catch (ex: Exception) {
                    call.reject("write exception: ${ex.message}", ex)
                }
            }
    }

    @PluginMethod
    fun readSnapshot(call: PluginCall) {
        val act = activity ?: run { call.reject("no activity"); return }
        val name = call.getString("name") ?: return call.reject("name required")
        val client = PlayGames.getSnapshotsClient(act)
        client.open(name, true, SnapshotsClient.RESOLUTION_POLICY_MOST_RECENTLY_MODIFIED)
            .addOnFailureListener { e -> call.reject("open failed: ${e.message}", e) }
            .addOnSuccessListener { result ->
                val snapshot = result.data
                val res = JSObject()
                if (snapshot == null) {
                    res.put("exists", false)
                    call.resolve(res)
                    return@addOnSuccessListener
                }
                try {
                    val bytes = snapshot.snapshotContents.readFully()
                    if (bytes == null || bytes.isEmpty()) {
                        res.put("exists", false)
                    } else {
                        res.put("exists", true)
                        res.put("data", String(bytes, Charsets.UTF_8))
                    }
                    client.discardAndClose(snapshot)
                        .addOnSuccessListener { call.resolve(res) }
                        .addOnFailureListener { e -> call.reject("discard failed: ${e.message}", e) }
                } catch (ex: Exception) {
                    call.reject("read exception: ${ex.message}", ex)
                }
            }
    }

    @PluginMethod
    fun signOut(call: PluginCall) {
        // Play Games v2 has no programmatic sign-out. Users revoke access from
        // Google account settings. Resolve with a note so JS can surface UI.
        val res = JSObject()
        res.put("success", false)
        res.put("note", "PGS v2 has no programmatic sign-out")
        call.resolve(res)
    }
}
