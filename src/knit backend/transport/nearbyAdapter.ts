/**
 * React Native adapter for Nearby Connections.
 * Wraps the native module and exposes start/stop, sendPayload, and payload events.
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { NEARBY_SERVICE_ID } from './constants';
import type { Unsubscribe } from './types';

const NativeNearby = NativeModules.NearbyConnections;

export const isNearbyAvailable = Platform.OS === 'android' && NativeNearby != null;

/** Payload received from a peer */
export interface PayloadReceivedEvent {
  endpointId: string;
  payload: string;
}

/** Endpoint found during discovery */
export interface EndpointFoundEvent {
  endpointId: string;
  endpointName?: string;
  error?: string;
}

/** Endpoint lost */
export interface EndpointLostEvent {
  endpointId: string;
}

export interface NearbyAdapter {
  startAdvertising(displayName: string): Promise<void>;
  startDiscovery(): Promise<void>;
  stopAll(): Promise<void>;
  sendPayload(endpointId: string, jsonString: string): Promise<void>;
  broadcastPayload(jsonString: string): Promise<void>;
  onPayloadReceived(handler: (event: PayloadReceivedEvent) => void): Unsubscribe;
  onEndpointFound(handler: (event: EndpointFoundEvent) => void): Unsubscribe;
  onEndpointLost(handler: (event: EndpointLostEvent) => void): Unsubscribe;
}

function createNoopUnsubscribe(): Unsubscribe {
  return () => {};
}

function createAdapter(): NearbyAdapter {
  if (!isNearbyAvailable) {
    return {
      startAdvertising: () => Promise.reject(new Error('Nearby not available (iOS or module missing)')),
      startDiscovery: () => Promise.reject(new Error('Nearby not available')),
      stopAll: () => Promise.resolve(),
      sendPayload: () => Promise.reject(new Error('Nearby not available')),
      broadcastPayload: () => Promise.reject(new Error('Nearby not available')),
      onPayloadReceived: () => createNoopUnsubscribe(),
      onEndpointFound: () => createNoopUnsubscribe(),
      onEndpointLost: () => createNoopUnsubscribe(),
    };
  }

  const eventEmitter = new NativeEventEmitter(NativeNearby);

  return {
    async startAdvertising(displayName: string) {
      await NativeNearby.startAdvertising(displayName);
    },

    async startDiscovery() {
      await NativeNearby.startDiscovery();
    },

    async stopAll() {
      await NativeNearby.stopAll();
    },

    async sendPayload(endpointId: string, jsonString: string) {
      await NativeNearby.sendPayload(endpointId, jsonString);
    },

    async broadcastPayload(jsonString: string) {
      await NativeNearby.broadcastPayload(jsonString);
    },

    onPayloadReceived(handler: (event: PayloadReceivedEvent) => void): Unsubscribe {
      const sub = eventEmitter.addListener('onPayloadReceived', handler);
      return () => sub.remove();
    },

    onEndpointFound(handler: (event: EndpointFoundEvent) => void): Unsubscribe {
      const sub = eventEmitter.addListener('onEndpointFound', handler);
      return () => sub.remove();
    },

    onEndpointLost(handler: (event: EndpointLostEvent) => void): Unsubscribe {
      const sub = eventEmitter.addListener('onEndpointLost', handler);
      return () => sub.remove();
    },
  };
}

export const nearbyAdapter: NearbyAdapter = createAdapter();
export { NEARBY_SERVICE_ID };
