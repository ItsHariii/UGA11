import { NearbyConnectionsAPI } from './NearbyConnections';

describe('NearbyConnections Module', () => {
  describe('Module Availability', () => {
    it('should check if module is available', () => {
      const isAvailable = NearbyConnectionsAPI.isAvailable();
      expect(typeof isAvailable).toBe('boolean');
    });
  });

  describe('API Methods', () => {
    it('should have startAdvertising method', () => {
      expect(typeof NearbyConnectionsAPI.startAdvertising).toBe('function');
    });

    it('should have startDiscovery method', () => {
      expect(typeof NearbyConnectionsAPI.startDiscovery).toBe('function');
    });

    it('should have stopAll method', () => {
      expect(typeof NearbyConnectionsAPI.stopAll).toBe('function');
    });

    it('should have sendPayload method', () => {
      expect(typeof NearbyConnectionsAPI.sendPayload).toBe('function');
    });

    it('should have broadcastPayload method', () => {
      expect(typeof NearbyConnectionsAPI.broadcastPayload).toBe('function');
    });

    it('should have getConnectedEndpoints method', () => {
      expect(typeof NearbyConnectionsAPI.getConnectedEndpoints).toBe('function');
    });
  });

  describe('Event Subscription Methods', () => {
    it('should have onPayloadReceived method', () => {
      expect(typeof NearbyConnectionsAPI.onPayloadReceived).toBe('function');
    });

    it('should have onEndpointFound method', () => {
      expect(typeof NearbyConnectionsAPI.onEndpointFound).toBe('function');
    });

    it('should have onEndpointLost method', () => {
      expect(typeof NearbyConnectionsAPI.onEndpointLost).toBe('function');
    });

    it('should have onConnectionInitiated method', () => {
      expect(typeof NearbyConnectionsAPI.onConnectionInitiated).toBe('function');
    });

    it('should have onConnectionResult method', () => {
      expect(typeof NearbyConnectionsAPI.onConnectionResult).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should handle module unavailable gracefully', async () => {
      if (!NearbyConnectionsAPI.isAvailable()) {
        await expect(NearbyConnectionsAPI.startAdvertising('test')).rejects.toThrow();
        await expect(NearbyConnectionsAPI.startDiscovery()).rejects.toThrow();
        await expect(NearbyConnectionsAPI.sendPayload('test', 'payload')).rejects.toThrow();
      }
    });

    it('should return empty array for getConnectedEndpoints when unavailable', async () => {
      if (!NearbyConnectionsAPI.isAvailable()) {
        const endpoints = await NearbyConnectionsAPI.getConnectedEndpoints();
        expect(endpoints).toEqual([]);
      }
    });

    it('should return null for event subscriptions when unavailable', () => {
      if (!NearbyConnectionsAPI.isAvailable()) {
        const subscription = NearbyConnectionsAPI.onPayloadReceived(() => {});
        expect(subscription).toBeNull();
      }
    });
  });
});
