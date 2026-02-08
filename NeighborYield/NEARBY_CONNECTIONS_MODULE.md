# Nearby Connections Native Module

## Overview

The Nearby Connections Native Module provides Android Nearby Connections API functionality for peer-to-peer mesh networking in NeighborYield. This module enables Bluetooth-based device discovery, connection management, and payload transmission for offline communication.

## Architecture

### Native Layer (Kotlin)
- **NearbyConnectionsModule.kt**: Main native module wrapping Google Play Services Nearby Connections API
- **NearbyConnectionsPackage.kt**: React Native package registration
- **Registered in**: MainApplication.kt

### JavaScript Layer
- **NearbyConnections.ts**: TypeScript interface and API wrapper
- **NearbyConnections.test.ts**: Unit tests for the module

## Features

### Core Functionality
1. **Device Advertising**: Broadcast device presence for peer discovery
2. **Device Discovery**: Scan for nearby advertising devices
3. **Connection Management**: Automatic connection establishment and lifecycle handling
4. **Payload Transmission**: Send messages to specific peers or broadcast to all
5. **Event Emission**: Real-time notifications for connections, disconnections, and received payloads

### Supported Events
- `onPayloadReceived`: Fired when a payload is received from a peer
- `onEndpointFound`: Fired when a new peer is discovered and connected
- `onEndpointLost`: Fired when a peer disconnects
- `onConnectionInitiated`: Fired when a connection request is received
- `onConnectionResult`: Fired when a connection succeeds or fails

## API Reference

### Methods

#### `startAdvertising(displayName: string): Promise<void>`
Start advertising this device for peer discovery.

**Parameters:**
- `displayName`: The name to advertise as (typically device model name)

**Example:**
```typescript
await NearbyConnectionsAPI.startAdvertising('My Device');
```

#### `startDiscovery(): Promise<void>`
Start discovering nearby devices.

**Example:**
```typescript
await NearbyConnectionsAPI.startDiscovery();
```

#### `stopAll(): Promise<void>`
Stop all advertising, discovery, and connections.

**Example:**
```typescript
await NearbyConnectionsAPI.stopAll();
```

#### `sendPayload(endpointId: string, payload: string): Promise<void>`
Send a payload to a specific endpoint.

**Parameters:**
- `endpointId`: The endpoint ID to send to
- `payload`: The payload string (must be < 512 bytes when serialized)

**Example:**
```typescript
await NearbyConnectionsAPI.sendPayload('endpoint123', JSON.stringify({ type: 'message', data: 'Hello' }));
```

#### `broadcastPayload(payload: string): Promise<void>`
Broadcast a payload to all connected endpoints.

**Parameters:**
- `payload`: The payload string (must be < 512 bytes when serialized)

**Example:**
```typescript
await NearbyConnectionsAPI.broadcastPayload(JSON.stringify({ type: 'broadcast', data: 'Hello everyone' }));
```

#### `getConnectedEndpoints(): Promise<string[]>`
Get list of currently connected endpoint IDs.

**Returns:** Array of endpoint ID strings

**Example:**
```typescript
const endpoints = await NearbyConnectionsAPI.getConnectedEndpoints();
console.log('Connected to:', endpoints);
```

### Event Subscriptions

#### `onPayloadReceived(handler: (event: PayloadReceivedEvent) => void): EmitterSubscription | null`
Subscribe to payload received events.

**Event Structure:**
```typescript
{
  endpointId: string;
  payload: string;
}
```

**Example:**
```typescript
const subscription = NearbyConnectionsAPI.onPayloadReceived((event) => {
  console.log('Received from', event.endpointId, ':', event.payload);
  const message = JSON.parse(event.payload);
  // Handle message
});

// Later: subscription?.remove();
```

#### `onEndpointFound(handler: (event: EndpointFoundEvent) => void): EmitterSubscription | null`
Subscribe to endpoint found events.

**Event Structure:**
```typescript
{
  endpointId: string;
  endpointName?: string;
  success?: boolean;
}
```

**Example:**
```typescript
const subscription = NearbyConnectionsAPI.onEndpointFound((event) => {
  console.log('Connected to peer:', event.endpointId);
});
```

#### `onEndpointLost(handler: (event: EndpointLostEvent) => void): EmitterSubscription | null`
Subscribe to endpoint lost events.

**Event Structure:**
```typescript
{
  endpointId: string;
}
```

**Example:**
```typescript
const subscription = NearbyConnectionsAPI.onEndpointLost((event) => {
  console.log('Lost connection to:', event.endpointId);
});
```

## Permissions

### Required Permissions (AndroidManifest.xml)

The following permissions are automatically added to the manifest:

**Android 11 and below:**
- `BLUETOOTH`
- `BLUETOOTH_ADMIN`
- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`

**Android 12+ (API 31+):**
- `BLUETOOTH_ADVERTISE`
- `BLUETOOTH_CONNECT`
- `BLUETOOTH_SCAN`
- `ACCESS_FINE_LOCATION`

**Android 13+ (API 33+):**
- `NEARBY_WIFI_DEVICES`

### Runtime Permission Requests

You must request runtime permissions before using the module:

```typescript
import { PermissionsAndroid, Platform } from 'react-native';

async function requestNearbyPermissions() {
  if (Platform.OS !== 'android') return false;

  const permissions = Platform.Version >= 31 ? [
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  ] : [
    PermissionsAndroid.PERMISSIONS.BLUETOOTH,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  ];

  const granted = await PermissionsAndroid.requestMultiple(permissions);
  
  return Object.values(granted).every(
    status => status === PermissionsAndroid.RESULTS.GRANTED
  );
}
```

## Usage Example

### Complete Integration Example

```typescript
import { useEffect, useState } from 'react';
import NearbyConnectionsAPI from './modules/NearbyConnections';

function MeshNetworking() {
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);

  useEffect(() => {
    // Check if module is available
    if (!NearbyConnectionsAPI.isAvailable()) {
      console.warn('Nearby Connections not available on this device');
      return;
    }

    // Set up event listeners
    const payloadSub = NearbyConnectionsAPI.onPayloadReceived((event) => {
      console.log('Received payload:', event.payload);
      const message = JSON.parse(event.payload);
      // Handle received message
    });

    const foundSub = NearbyConnectionsAPI.onEndpointFound((event) => {
      console.log('Peer connected:', event.endpointId);
      updateConnectedPeers();
    });

    const lostSub = NearbyConnectionsAPI.onEndpointLost((event) => {
      console.log('Peer disconnected:', event.endpointId);
      updateConnectedPeers();
    });

    // Start advertising and discovery
    startMeshNetworking();

    // Cleanup
    return () => {
      payloadSub?.remove();
      foundSub?.remove();
      lostSub?.remove();
      NearbyConnectionsAPI.stopAll();
    };
  }, []);

  async function startMeshNetworking() {
    try {
      await NearbyConnectionsAPI.startAdvertising('My Device');
      await NearbyConnectionsAPI.startDiscovery();
      console.log('Mesh networking started');
    } catch (error) {
      console.error('Failed to start mesh networking:', error);
    }
  }

  async function updateConnectedPeers() {
    const peers = await NearbyConnectionsAPI.getConnectedEndpoints();
    setConnectedPeers(peers);
  }

  async function sendMessage(message: any) {
    try {
      const payload = JSON.stringify(message);
      await NearbyConnectionsAPI.broadcastPayload(payload);
      console.log('Message sent to all peers');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  return (
    <View>
      <Text>Connected Peers: {connectedPeers.length}</Text>
      {/* UI components */}
    </View>
  );
}
```

## Message Size Limits

**Important:** Nearby Connections has a 512-byte limit for payload transmission. Messages exceeding this limit must be:
1. Compressed using a compression algorithm
2. Split into chunks with metadata
3. Reassembled on the receiving end

See the `knit-backend-integration` spec for message size management implementation details.

## Error Handling

The module provides detailed error messages for common failure scenarios:

- `PERMISSION_DENIED`: Required permissions not granted
- `ADVERTISING_FAILED`: Failed to start advertising
- `DISCOVERY_FAILED`: Failed to start discovery
- `NOT_CONNECTED`: Attempted to send to disconnected endpoint
- `NO_CONNECTIONS`: Attempted to broadcast with no connected peers
- `SEND_FAILED`: Payload transmission failed
- `BROADCAST_FAILED`: Broadcast transmission failed

## Testing

### Unit Tests
Run the unit tests:
```bash
npm test -- NearbyConnections.test.ts
```

### Integration Testing
Integration testing requires physical Android devices:
1. Install the app on 2+ Android devices
2. Grant all required permissions
3. Start advertising and discovery on all devices
4. Verify peer discovery and connection
5. Test payload transmission between devices

## Troubleshooting

### Module Not Available
- Ensure you're running on Android (iOS not supported)
- Check that Google Play Services is installed
- Verify the module is registered in MainApplication.kt

### Permissions Denied
- Request runtime permissions before using the module
- Check that all required permissions are in AndroidManifest.xml
- For Android 12+, ensure new Bluetooth permissions are requested

### No Peers Discovered
- Verify Bluetooth is enabled on all devices
- Check that location services are enabled (required for Nearby Connections)
- Ensure devices are within Bluetooth range (~100m)
- Verify both advertising and discovery are started

### Connection Failures
- Check device logs for detailed error messages
- Verify network connectivity
- Ensure devices aren't at max connection limit (8 peers)

## Dependencies

- **Google Play Services Nearby**: `com.google.android.gms:play-services-nearby:19.0.0`
- **React Native**: Compatible with RN 0.70+
- **Android SDK**: Minimum API 21 (Android 5.0)

## Next Steps

After setting up the native module, proceed with:
1. **Task 2**: Integrate nearbyAdapter from knit backend
2. **Task 3**: Implement message size management
3. **Task 4**: Enhance mode-switching service for hybrid mode

See `.kiro/specs/knit-backend-integration/tasks.md` for the complete implementation plan.
