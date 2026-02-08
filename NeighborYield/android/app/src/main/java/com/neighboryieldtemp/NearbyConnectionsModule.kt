package com.neighboryieldtemp

import android.Manifest
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.nearby.Nearby
import com.google.android.gms.nearby.connection.*

class NearbyConnectionsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val SERVICE_ID = "com.neighboryieldtemp.nearby"
    private val STRATEGY = Strategy.P2P_CLUSTER
    
    private val connectionsClient: ConnectionsClient = Nearby.getConnectionsClient(reactContext)
    private val connectedEndpoints = mutableSetOf<String>()
    
    override fun getName(): String {
        return "NearbyConnections"
    }

    // Connection Lifecycle Callbacks
    private val connectionLifecycleCallback = object : ConnectionLifecycleCallback() {
        override fun onConnectionInitiated(endpointId: String, connectionInfo: ConnectionInfo) {
            // Auto-accept all connections
            connectionsClient.acceptConnection(endpointId, payloadCallback)
            
            // Emit event to JavaScript
            val params = Arguments.createMap().apply {
                putString("endpointId", endpointId)
                putString("endpointName", connectionInfo.endpointName)
            }
            sendEvent("onConnectionInitiated", params)
        }

        override fun onConnectionResult(endpointId: String, result: ConnectionResolution) {
            when (result.status.statusCode) {
                ConnectionsStatusCodes.STATUS_OK -> {
                    // Connection established successfully
                    connectedEndpoints.add(endpointId)
                    
                    val params = Arguments.createMap().apply {
                        putString("endpointId", endpointId)
                        putBoolean("success", true)
                    }
                    sendEvent("onConnectionResult", params)
                    sendEvent("onEndpointFound", params)
                }
                ConnectionsStatusCodes.STATUS_CONNECTION_REJECTED -> {
                    val params = Arguments.createMap().apply {
                        putString("endpointId", endpointId)
                        putBoolean("success", false)
                        putString("error", "Connection rejected")
                    }
                    sendEvent("onConnectionResult", params)
                }
                else -> {
                    val params = Arguments.createMap().apply {
                        putString("endpointId", endpointId)
                        putBoolean("success", false)
                        putString("error", "Connection failed")
                    }
                    sendEvent("onConnectionResult", params)
                }
            }
        }

        override fun onDisconnected(endpointId: String) {
            connectedEndpoints.remove(endpointId)
            
            val params = Arguments.createMap().apply {
                putString("endpointId", endpointId)
            }
            sendEvent("onEndpointLost", params)
        }
    }

    // Endpoint Discovery Callbacks
    private val endpointDiscoveryCallback = object : EndpointDiscoveryCallback() {
        override fun onEndpointFound(endpointId: String, info: DiscoveredEndpointInfo) {
            // Request connection to discovered endpoint
            connectionsClient.requestConnection(
                getDeviceName(),
                endpointId,
                connectionLifecycleCallback
            )
        }

        override fun onEndpointLost(endpointId: String) {
            val params = Arguments.createMap().apply {
                putString("endpointId", endpointId)
            }
            sendEvent("onEndpointLost", params)
        }
    }

    // Payload Callbacks
    private val payloadCallback = object : PayloadCallback() {
        override fun onPayloadReceived(endpointId: String, payload: Payload) {
            if (payload.type == Payload.Type.BYTES) {
                val bytes = payload.asBytes()
                if (bytes != null) {
                    val payloadString = String(bytes, Charsets.UTF_8)
                    
                    val params = Arguments.createMap().apply {
                        putString("endpointId", endpointId)
                        putString("payload", payloadString)
                    }
                    sendEvent("onPayloadReceived", params)
                }
            }
        }

        override fun onPayloadTransferUpdate(endpointId: String, update: PayloadTransferUpdate) {
            // Optional: Handle transfer progress updates
            if (update.status == PayloadTransferUpdate.Status.SUCCESS) {
                // Payload transfer completed successfully
            }
        }
    }

    @ReactMethod
    fun startAdvertising(displayName: String, promise: Promise) {
        try {
            if (!checkPermissions()) {
                promise.reject("PERMISSION_DENIED", "Required permissions not granted")
                return
            }

            val advertisingOptions = AdvertisingOptions.Builder()
                .setStrategy(STRATEGY)
                .build()

            connectionsClient.startAdvertising(
                displayName,
                SERVICE_ID,
                connectionLifecycleCallback,
                advertisingOptions
            )
                .addOnSuccessListener {
                    promise.resolve(null)
                }
                .addOnFailureListener { exception ->
                    promise.reject("ADVERTISING_FAILED", exception.message, exception)
                }
        } catch (e: Exception) {
            promise.reject("ADVERTISING_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun startDiscovery(promise: Promise) {
        try {
            if (!checkPermissions()) {
                promise.reject("PERMISSION_DENIED", "Required permissions not granted")
                return
            }

            val discoveryOptions = DiscoveryOptions.Builder()
                .setStrategy(STRATEGY)
                .build()

            connectionsClient.startDiscovery(
                SERVICE_ID,
                endpointDiscoveryCallback,
                discoveryOptions
            )
                .addOnSuccessListener {
                    promise.resolve(null)
                }
                .addOnFailureListener { exception ->
                    promise.reject("DISCOVERY_FAILED", exception.message, exception)
                }
        } catch (e: Exception) {
            promise.reject("DISCOVERY_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stopAll(promise: Promise) {
        try {
            connectionsClient.stopAdvertising()
            connectionsClient.stopDiscovery()
            connectionsClient.stopAllEndpoints()
            connectedEndpoints.clear()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("STOP_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun sendPayload(endpointId: String, payloadString: String, promise: Promise) {
        try {
            if (!connectedEndpoints.contains(endpointId)) {
                promise.reject("NOT_CONNECTED", "Endpoint not connected: $endpointId")
                return
            }

            val bytes = payloadString.toByteArray(Charsets.UTF_8)
            val payload = Payload.fromBytes(bytes)

            connectionsClient.sendPayload(endpointId, payload)
                .addOnSuccessListener {
                    promise.resolve(null)
                }
                .addOnFailureListener { exception ->
                    promise.reject("SEND_FAILED", exception.message, exception)
                }
        } catch (e: Exception) {
            promise.reject("SEND_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun broadcastPayload(payloadString: String, promise: Promise) {
        try {
            if (connectedEndpoints.isEmpty()) {
                promise.reject("NO_CONNECTIONS", "No connected endpoints")
                return
            }

            val bytes = payloadString.toByteArray(Charsets.UTF_8)
            val payload = Payload.fromBytes(bytes)

            connectionsClient.sendPayload(connectedEndpoints.toList(), payload)
                .addOnSuccessListener {
                    promise.resolve(null)
                }
                .addOnFailureListener { exception ->
                    promise.reject("BROADCAST_FAILED", exception.message, exception)
                }
        } catch (e: Exception) {
            promise.reject("BROADCAST_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getConnectedEndpoints(promise: Promise) {
        try {
            val array = Arguments.createArray()
            connectedEndpoints.forEach { array.pushString(it) }
            promise.resolve(array)
        } catch (e: Exception) {
            promise.reject("GET_ENDPOINTS_ERROR", e.message, e)
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    private fun getDeviceName(): String {
        return android.os.Build.MODEL ?: "Unknown Device"
    }

    private fun checkPermissions(): Boolean {
        val context = reactApplicationContext
        
        // Check for required permissions based on Android version
        val permissions = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
            // Android 12+
            arrayOf(
                Manifest.permission.BLUETOOTH_ADVERTISE,
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.ACCESS_FINE_LOCATION
            )
        } else {
            // Android 11 and below
            arrayOf(
                Manifest.permission.BLUETOOTH,
                Manifest.permission.BLUETOOTH_ADMIN,
                Manifest.permission.ACCESS_FINE_LOCATION
            )
        }

        return permissions.all { permission ->
            ActivityCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED
        }
    }
}
