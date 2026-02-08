/**
 * Mock NearbyConnectionsModule for testing without physical devices
 * Simulates peer discovery, connections, and message transmission
 */

import { EventEmitter } from 'events';

class MockNearbyConnectionsModule extends EventEmitter {
  private isAdvertising = false;
  private isDiscovering = false;
  private connectedEndpoints: Set<string> = new Set();
  private mockPeers: Array<{ id: string; name: string }> = [];

  /**
   * Simulate discovering mock peers after a delay
   */
  async startAdvertising(displayName: string): Promise<void> {
    console.log(`[Mock Nearby] Starting advertising as "${displayName}"`);
    this.isAdvertising = true;
    
    // Simulate being discovered by mock peers
    setTimeout(() => {
      this.simulatePeerConnection('mock-peer-1', 'TestDevice1');
    }, 1000);
  }

  async startDiscovery(): Promise<void> {
    console.log('[Mock Nearby] Starting discovery');
    this.isDiscovering = true;
    
    // Simulate discovering mock peers
    setTimeout(() => {
      this.emit('onEndpointFound', {
        endpointId: 'mock-peer-2',
        endpointName: 'TestDevice2',
      });
      this.connectedEndpoints.add('mock-peer-2');
    }, 1500);

    setTimeout(() => {
      this.emit('onEndpointFound', {
        endpointId: 'mock-peer-3',
        endpointName: 'TestDevice3',
      });
      this.connectedEndpoints.add('mock-peer-3');
    }, 2000);
  }

  async stopAll(): Promise<void> {
    console.log('[Mock Nearby] Stopping all');
    this.isAdvertising = false;
    this.isDiscovering = false;
    
    // Simulate endpoints being lost
    this.connectedEndpoints.forEach(endpointId => {
      this.emit('onEndpointLost', { endpointId });
    });
    
    this.connectedEndpoints.clear();
  }

  async sendPayload(endpointId: string, payload: string): Promise<void> {
    if (!this.connectedEndpoints.has(endpointId)) {
      throw new Error(`Endpoint ${endpointId} not connected`);
    }
    
    console.log(`[Mock Nearby] Sending payload to ${endpointId}: ${payload.substring(0, 50)}...`);
    
    // Simulate receiving an echo response after a delay
    setTimeout(() => {
      this.emit('onPayloadReceived', {
        endpointId,
        payload: JSON.stringify({
          type: 'ack',
          originalPayload: payload,
          timestamp: Date.now(),
        }),
      });
    }, 500);
  }

  async broadcastPayload(payload: string): Promise<void> {
    console.log(`[Mock Nearby] Broadcasting payload to ${this.connectedEndpoints.size} peers`);
    
    // Simulate each peer receiving the payload
    this.connectedEndpoints.forEach(endpointId => {
      setTimeout(() => {
        this.emit('onPayloadReceived', {
          endpointId,
          payload,
        });
      }, Math.random() * 1000); // Random delay 0-1s
    });
  }

  /**
   * Test helper: Simulate a peer connecting
   */
  simulatePeerConnection(endpointId: string, endpointName: string): void {
    this.emit('onEndpointFound', { endpointId, endpointName });
    this.connectedEndpoints.add(endpointId);
  }

  /**
   * Test helper: Simulate a peer disconnecting
   */
  simulatePeerDisconnection(endpointId: string): void {
    this.emit('onEndpointLost', { endpointId });
    this.connectedEndpoints.delete(endpointId);
  }

  /**
   * Test helper: Simulate receiving a payload from a peer
   */
  simulateIncomingPayload(endpointId: string, payload: string): void {
    this.emit('onPayloadReceived', { endpointId, payload });
  }

  /**
   * Test helper: Get current state
   */
  getState() {
    return {
      isAdvertising: this.isAdvertising,
      isDiscovering: this.isDiscovering,
      connectedPeers: Array.from(this.connectedEndpoints),
    };
  }
}

export const mockNearbyModule = new MockNearbyConnectionsModule();

// Export for React Native NativeModules mock
export default {
  startAdvertising: (name: string) => mockNearbyModule.startAdvertising(name),
  startDiscovery: () => mockNearbyModule.startDiscovery(),
  stopAll: () => mockNearbyModule.stopAll(),
  sendPayload: (id: string, payload: string) => mockNearbyModule.sendPayload(id, payload),
  broadcastPayload: (payload: string) => mockNearbyModule.broadcastPayload(payload),
  addListener: (event: string, handler: Function) => {
    mockNearbyModule.on(event, handler);
    return {
      remove: () => mockNearbyModule.off(event, handler),
    };
  },
  removeListeners: (count: number) => {
    mockNearbyModule.removeAllListeners();
  },
};
