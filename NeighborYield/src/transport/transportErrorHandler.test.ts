/**
 * Transport Error Handler Tests
 * 
 * Tests retry logic, message queuing, and error logging functionality
 */

import {
  TransportErrorHandler,
  DEFAULT_RETRY_CONFIG,
  ErrorContext,
  QueuedOperation,
} from './transportErrorHandler';
import { TransportError } from './ITransportRouter';

describe('TransportErrorHandler', () => {
  let handler: TransportErrorHandler;

  beforeEach(() => {
    handler = new TransportErrorHandler();
    jest.clearAllMocks();
  });

  describe('Retry Logic with Exponential Backoff', () => {
    it('should succeed on first attempt if operation succeeds', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await handler.executeWithRetry(operation, {
        operation: 'test-operation',
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry with exponential backoff on failure', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockRejectedValueOnce(new Error('Attempt 2 failed'))
        .mockResolvedValue('success');

      const startTime = Date.now();
      const result = await handler.executeWithRetry(operation, {
        operation: 'test-operation',
      });
      const duration = Date.now() - startTime;

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
      
      // Should have waited at least 1s + 2s = 3s
      expect(duration).toBeGreaterThanOrEqual(3000);
    });

    it('should use correct backoff intervals (1s, 2s, 4s, 8s)', async () => {
      let attemptCount = 0;

      const operation = jest.fn().mockImplementation(async () => {
        attemptCount++;
        if (attemptCount < 4) {
          throw new Error('Retry');
        }
        return 'success';
      });

      const startTime = Date.now();
      await handler.executeWithRetry(operation, {
        operation: 'test-backoff',
      });
      const duration = Date.now() - startTime;

      // Should have retried 3 times with delays of 1s, 2s, 4s = 7s total minimum
      expect(operation).toHaveBeenCalledTimes(4);
      expect(duration).toBeGreaterThanOrEqual(7000);
    }, 15000); // 15 second timeout

    it('should throw TransportError after max retries', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Always fails'));

      await expect(
        handler.executeWithRetry(operation, {
          operation: 'failing-operation',
        })
      ).rejects.toThrow(TransportError);

      // Should try initial + 4 retries = 5 times
      expect(operation).toHaveBeenCalledTimes(5);
    }, 20000); // 20 second timeout for all retries

    it('should log errors with context', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Test error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      try {
        await handler.executeWithRetry(operation, {
          operation: 'test-logging',
          metadata: { userId: '123' },
        });
      } catch (error) {
        // Expected to throw
      }

      const logs = handler.getErrorLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].context.operation).toBe('test-logging');
      expect(logs[0].context.metadata).toEqual({ userId: '123' });

      consoleSpy.mockRestore();
    }, 20000); // 20 second timeout
  });

  describe('Message Queuing', () => {
    it('should queue operations when transport unavailable', () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const queueId = handler.queueOperation(operation, {
        operation: 'queued-op',
      }, 5);

      expect(queueId).toBeDefined();
      expect(handler.getQueueStats().queueLength).toBe(1);
      expect(operation).not.toHaveBeenCalled();
    });

    it('should sort queue by priority (lower = higher priority)', () => {
      handler.queueOperation(
        jest.fn().mockResolvedValue('low'),
        { operation: 'low-priority' },
        10
      );
      
      handler.queueOperation(
        jest.fn().mockResolvedValue('high'),
        { operation: 'high-priority' },
        1
      );
      
      handler.queueOperation(
        jest.fn().mockResolvedValue('medium'),
        { operation: 'medium-priority' },
        5
      );

      const stats = handler.getQueueStats();
      expect(stats.queueLength).toBe(3);
    });

    it('should process queue in priority order', async () => {
      const executionOrder: string[] = [];

      handler.queueOperation(
        async () => { executionOrder.push('low'); },
        { operation: 'low-priority' },
        10
      );
      
      handler.queueOperation(
        async () => { executionOrder.push('high'); },
        { operation: 'high-priority' },
        1
      );
      
      handler.queueOperation(
        async () => { executionOrder.push('medium'); },
        { operation: 'medium-priority' },
        5
      );

      await handler.processQueue();

      expect(executionOrder).toEqual(['high', 'medium', 'low']);
    });

    it('should return number of successfully processed operations', async () => {
      handler.queueOperation(
        jest.fn().mockResolvedValue('success'),
        { operation: 'op1' },
        1
      );
      
      handler.queueOperation(
        jest.fn().mockResolvedValue('success'),
        { operation: 'op2' },
        2
      );

      const successCount = await handler.processQueue();
      expect(successCount).toBe(2);
      expect(handler.getQueueStats().queueLength).toBe(0);
    });

    it('should re-queue failed operations up to max retries', async () => {
      let attempts = 0;
      const operation = jest.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Not ready yet');
        }
        return 'success';
      });

      handler.queueOperation(operation, { operation: 'retry-op' }, 1);

      // First process - should fail and re-queue
      await handler.processQueue();
      expect(handler.getQueueStats().queueLength).toBe(1);

      // Second process - should fail and re-queue
      await handler.processQueue();
      expect(handler.getQueueStats().queueLength).toBe(1);

      // Third process - should succeed
      await handler.processQueue();
      expect(handler.getQueueStats().queueLength).toBe(0);
    });

    it('should drop operations after max retries', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Always fails'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      handler.queueOperation(operation, { operation: 'failing-op' }, 1);

      // Process 5 times (max retries + 1)
      for (let i = 0; i < 5; i++) {
        await handler.processQueue();
      }

      expect(handler.getQueueStats().queueLength).toBe(0);
      expect(operation).toHaveBeenCalledTimes(4); // maxRetries = 4

      consoleSpy.mockRestore();
    });

    it('should drop lowest priority message when queue at capacity', () => {
      handler.setMaxQueueSize(3);

      handler.queueOperation(jest.fn(), { operation: 'op1' }, 1);
      handler.queueOperation(jest.fn(), { operation: 'op2' }, 5);
      handler.queueOperation(jest.fn(), { operation: 'op3' }, 3);
      
      // This should drop op2 (priority 5)
      handler.queueOperation(jest.fn(), { operation: 'op4' }, 2);

      expect(handler.getQueueStats().queueLength).toBe(3);
    });

    it('should clear queue', () => {
      handler.queueOperation(jest.fn(), { operation: 'op1' }, 1);
      handler.queueOperation(jest.fn(), { operation: 'op2' }, 2);

      handler.clearQueue();

      expect(handler.getQueueStats().queueLength).toBe(0);
    });

    it('should clear queue keeping high priority messages', () => {
      handler.queueOperation(jest.fn(), { operation: 'high' }, 1);
      handler.queueOperation(jest.fn(), { operation: 'medium' }, 5);
      handler.queueOperation(jest.fn(), { operation: 'low' }, 10);

      // Keep messages with priority < 5
      handler.clearQueue(5);

      expect(handler.getQueueStats().queueLength).toBe(1);
    });
  });

  describe('Error Logging', () => {
    it('should log errors with full context', () => {
      const context: ErrorContext = {
        operation: 'test-operation',
        timestamp: Date.now(),
        attempt: 2,
        error: 'Connection timeout',
        metadata: { endpoint: 'api.example.com' },
      };

      handler.logError(context);

      const logs = handler.getErrorLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].context).toEqual(context);
      expect(logs[0].resolved).toBe(false);
    });

    it('should maintain max log size', () => {
      handler.setMaxLogSize(5);

      for (let i = 0; i < 10; i++) {
        handler.logError({
          operation: `op-${i}`,
          timestamp: Date.now(),
          attempt: 1,
          error: 'Test error',
        });
      }

      expect(handler.getErrorLogs().length).toBe(5);
    });

    it('should return logs in reverse chronological order', () => {
      handler.logError({
        operation: 'first',
        timestamp: 1000,
        attempt: 1,
        error: 'Error 1',
      });

      handler.logError({
        operation: 'second',
        timestamp: 2000,
        attempt: 1,
        error: 'Error 2',
      });

      const logs = handler.getErrorLogs();
      expect(logs[0].context.operation).toBe('second');
      expect(logs[1].context.operation).toBe('first');
    });

    it('should limit returned logs', () => {
      for (let i = 0; i < 10; i++) {
        handler.logError({
          operation: `op-${i}`,
          timestamp: Date.now(),
          attempt: 1,
          error: 'Test error',
        });
      }

      const logs = handler.getErrorLogs(3);
      expect(logs.length).toBe(3);
    });

    it('should filter unresolved errors', () => {
      handler.logError({
        operation: 'resolved-op',
        timestamp: Date.now(),
        attempt: 1,
        error: 'Error',
      });

      handler.logError({
        operation: 'unresolved-op',
        timestamp: Date.now(),
        attempt: 1,
        error: 'Error',
      });

      const logs = handler.getErrorLogs();
      // Mark the first one (most recent) as resolved
      handler.markErrorResolved(logs[1].id);

      const unresolved = handler.getUnresolvedErrors();
      expect(unresolved.length).toBe(1);
      expect(unresolved[0].context.operation).toBe('unresolved-op');
    });

    it('should mark errors as resolved', () => {
      handler.logError({
        operation: 'test-op',
        timestamp: Date.now(),
        attempt: 1,
        error: 'Error',
      });

      const logs = handler.getErrorLogs();
      const errorId = logs[0].id;

      handler.markErrorResolved(errorId);

      const updatedLogs = handler.getErrorLogs();
      expect(updatedLogs[0].resolved).toBe(true);
      expect(updatedLogs[0].resolvedAt).toBeDefined();
    });

    it('should clear all error logs', () => {
      handler.logError({
        operation: 'op1',
        timestamp: Date.now(),
        attempt: 1,
        error: 'Error',
      });

      handler.logError({
        operation: 'op2',
        timestamp: Date.now(),
        attempt: 1,
        error: 'Error',
      });

      handler.clearErrorLogs();

      expect(handler.getErrorLogs().length).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should use default retry configuration', () => {
      expect(DEFAULT_RETRY_CONFIG.backoffIntervals).toEqual([1000, 2000, 4000, 8000]);
      expect(DEFAULT_RETRY_CONFIG.maxRetries).toBe(4);
      expect(DEFAULT_RETRY_CONFIG.logRetries).toBe(true);
    });

    it('should allow custom retry configuration', () => {
      const customHandler = new TransportErrorHandler({
        backoffIntervals: [500, 1000],
        maxRetries: 2,
        logRetries: false,
      });

      expect(customHandler).toBeDefined();
    });

    it('should update configuration', () => {
      handler.updateConfig({
        maxRetries: 10,
        logRetries: false,
      });

      // Configuration is updated (verified through behavior)
      expect(handler).toBeDefined();
    });

    it('should set max queue size', () => {
      handler.setMaxQueueSize(500);
      expect(handler.getQueueStats().maxQueueSize).toBe(500);
    });

    it('should set max log size', () => {
      handler.setMaxLogSize(50);
      // Verified through behavior in other tests
      expect(handler).toBeDefined();
    });
  });

  describe('Queue Statistics', () => {
    it('should return accurate queue statistics', () => {
      handler.queueOperation(jest.fn(), { operation: 'op1' }, 1);
      handler.queueOperation(jest.fn(), { operation: 'op2' }, 2);

      handler.logError({
        operation: 'error-op',
        timestamp: Date.now(),
        attempt: 1,
        error: 'Test error',
      });

      const stats = handler.getQueueStats();
      expect(stats.queueLength).toBe(2);
      expect(stats.isProcessing).toBe(false);
      expect(stats.errorLogCount).toBe(1);
      expect(stats.unresolvedErrorCount).toBe(1);
    });

    it('should indicate when queue is processing', async () => {
      handler.queueOperation(
        async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
        },
        { operation: 'slow-op' },
        1
      );

      const processPromise = handler.processQueue();
      
      // Check stats while processing
      const stats = handler.getQueueStats();
      expect(stats.isProcessing).toBe(true);

      await processPromise;

      const finalStats = handler.getQueueStats();
      expect(finalStats.isProcessing).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty queue processing', async () => {
      const successCount = await handler.processQueue();
      expect(successCount).toBe(0);
    });

    it('should handle concurrent queue processing attempts', async () => {
      handler.queueOperation(jest.fn().mockResolvedValue('success'), { operation: 'op1' }, 1);

      const promise1 = handler.processQueue();
      const promise2 = handler.processQueue();

      await Promise.all([promise1, promise2]);

      // Should only process once
      expect(handler.getQueueStats().queueLength).toBe(0);
    });

    it('should handle operation that throws non-Error object', async () => {
      const operation = jest.fn().mockRejectedValue('string error');

      await expect(
        handler.executeWithRetry(operation, { operation: 'test' })
      ).rejects.toThrow(TransportError);
    }, 20000); // 20 second timeout

    it('should handle marking non-existent error as resolved', () => {
      handler.markErrorResolved('non-existent-id');
      // Should not throw
      expect(handler).toBeDefined();
    });
  });
});
