import { NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native';

interface NearbyConnectionsInterface {
  startAdvertising(displayName: string): Promise<void>;
  startDiscovery(): Promise<void>;
  stopAll(): Promise<void>;
  sendPayload(endpointId: string, payload: string): Promise<void>;
  broadcastPayload(payload: string): Promise<void>;
  getConnectedEndpoints(): Promise<string[]>;
}

interface PayloadReceivedEvent {
  endpointId: string;
  payload: string;
}

interface EndpointFoundEvent {
  endpointId: string;
  endpointName?: string;
  success?: boolean;
}

interface EndpointLostEvent {
  endpointId: string;
}

interface ConnectionInitiatedEvent {
  endpointId: string;
  endpointName: string;
}

interface ConnectionResultEvent {
  endpointId: string;
  success: boolean;
  error?: string;
}

const { NearbyConnections } = NativeModules;

if (!NearbyConnections) {
  console.warn('NearbyConnections native module is not available');
}

const nearbyConnectionsModule: NearbyConnectionsInterface = NearbyConnections || {
  startAdvertising: () => Promise.reject(new Error('Module not available')),
  startDiscovery: () => Promise.reject(new Error('Module not available')),
  stopAll: () => Promise.reject(new Error('Module not available')),
  sendPayload: () => Promise.reject(new Error('Module not available')),
  broadcastPayload: () => Promise.reject(new Error('Module not available')),
  getConnectedEndpoints: () => Promise.resolve([]),
};

const eventEmitter = NearbyConnections ? new NativeEventEmitter(NearbyConnections) : null;

export type {
  PayloadReceivedEvent,
  EndpointFoundEvent,
  EndpointLostEvent,
  ConnectionInitiatedEvent,
  ConnectionResultEvent,
};

export const NearbyConnectionsAPI = {
  /**
   * Start advertising this device for peer discovery
   * @param displayName The name to advertise as
   */
  startAdvertising: (displayName: string): Promise<void> => {
    return nearbyConnectionsModule.startAdvertising(displayName);
  },

  /**
   * Start discovering nearby devices
   */
  startDiscovery: (): Promise<void> => {
    return nearbyConnectionsModule.startDiscovery();
  },

  /**
   * Stop all advertising, discovery, and connections
   */
  stopAll: (): Promise<void> => {
    return nearbyConnectionsModule.stopAll();
  },

  /**
   * Send a payload to a specific endpoint
   * @param endpointId The endpoint to send to
   * @param payload The payload string (must be < 512 bytes when serialized)
   */
  sendPayload: (endpointId: string, payload: string): Promise<void> => {
    return nearbyConnectionsModule.sendPayload(endpointId, payload);
  },

  /**
   * Broadcast a payload to all connected endpoints
   * @param payload The payload string (must be < 512 bytes when serialized)
   */
  broadcastPayload: (payload: string): Promise<void> => {
    return nearbyConnectionsModule.broadcastPayload(payload);
  },

  /**
   * Get list of currently connected endpoint IDs
   */
  getConnectedEndpoints: (): Promise<string[]> => {
    return nearbyConnectionsModule.getConnectedEndpoints();
  },

  /**
   * Subscribe to payload received events
   * @param handler Callback function to handle received payloads
   * @returns Subscription object with remove() method
   */
  onPayloadReceived: (
    handler: (event: PayloadReceivedEvent) => void
  ): EmitterSubscription | null => {
    if (!eventEmitter) return null;
    return eventEmitter.addListener('onPayloadReceived', handler);
  },

  /**
   * Subscribe to endpoint found events
   * @param handler Callback function to handle discovered endpoints
   * @returns Subscription object with remove() method
   */
  onEndpointFound: (
    handler: (event: EndpointFoundEvent) => void
  ): EmitterSubscription | null => {
    if (!eventEmitter) return null;
    return eventEmitter.addListener('onEndpointFound', handler);
  },

  /**
   * Subscribe to endpoint lost events
   * @param handler Callback function to handle lost endpoints
   * @returns Subscription object with remove() method
   */
  onEndpointLost: (
    handler: (event: EndpointLostEvent) => void
  ): EmitterSubscription | null => {
    if (!eventEmitter) return null;
    return eventEmitter.addListener('onEndpointLost', handler);
  },

  /**
   * Subscribe to connection initiated events
   * @param handler Callback function to handle connection initiation
   * @returns Subscription object with remove() method
   */
  onConnectionInitiated: (
    handler: (event: ConnectionInitiatedEvent) => void
  ): EmitterSubscription | null => {
    if (!eventEmitter) return null;
    return eventEmitter.addListener('onConnectionInitiated', handler);
  },

  /**
   * Subscribe to connection result events
   * @param handler Callback function to handle connection results
   * @returns Subscription object with remove() method
   */
  onConnectionResult: (
    handler: (event: ConnectionResultEvent) => void
  ): EmitterSubscription | null => {
    if (!eventEmitter) return null;
    return eventEmitter.addListener('onConnectionResult', handler);
  },

  /**
   * Check if the native module is available
   */
  isAvailable: (): boolean => {
    return !!NearbyConnections;
  },
};

export default NearbyConnectionsAPI;
