/**
 * Transport Error Handler
 * 
 * Provides retry logic with exponential backoff, message queuing,
 * and error logging for transport operations.
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

import { TransportError } from './ITransportRouter';

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Exponential backoff intervals in milliseconds */
  backoffIntervals: number[];
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Whether to log retry attempts */
  logRetries: boolean;
}

/**
 * Default retry configuration with exponential backoff (1s, 2s, 4s, 8s)
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  backoffIntervals: [1000, 2000, 4000, 8000],
  maxRetries: 4,
  logRetries: true,
};

/**
 * Error context for debugging
 */
export interface ErrorContext {
  operation: string;
  timestamp: number;
  attempt: number;
  error: string;
  metadata?: Record<string, any>;
}

/**
 * Error log entry
 */
export interface ErrorLog {
  id: string;
  context: ErrorContext;
  resolved: boolean;
  resolvedAt?: number;
}

/**
 * Message queue entry for failed operations
 */
export interface QueuedOperation<T = any> {
  id: string;
  operation: () => Promise<T>;
  context: ErrorContext;
  retryCount: number;
  priority: number;
  timestamp: number;
}

/**
 * Transport Error Handler
 * Manages retry logic, message queuing, and error logging
 */
export class TransportErrorHandler {
  private errorLogs: ErrorLog[] = [];
  private messageQueue: QueuedOperation[] = [];
  private isProcessingQueue: boolean = false;
  private maxLogSize: number = 100;
  private maxQueueSize: number = 1000;

  constructor(
    private config: RetryConfig = DEFAULT_RETRY_CONFIG
  ) {}

  /**
   * Execute an operation with retry logic and exponential backoff
   * 
   * @param operation - The async operation to execute
   * @param context - Error context for logging
   * @returns Promise resolving to the operation result
   * @throws TransportError if all retries fail
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: Omit<ErrorContext, 'timestamp' | 'attempt' | 'error'>
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        // Execute the operation
        const result = await operation();
        
        // If successful and this was a retry, log success
        if (attempt > 0 && this.config.logRetries) {
          console.log(
            `[TransportErrorHandler] Operation succeeded after ${attempt} retries: ${context.operation}`
          );
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Log the error
        this.logError({
          ...context,
          timestamp: Date.now(),
          attempt,
          error: lastError.message,
        });

        // If this was the last attempt, throw
        if (attempt >= this.config.maxRetries) {
          if (this.config.logRetries) {
            console.error(
              `[TransportErrorHandler] Operation failed after ${attempt} attempts: ${context.operation}`,
              lastError
            );
          }
          throw new TransportError(
            `Operation failed after ${attempt} attempts: ${lastError.message}`,
            lastError,
            context.operation
          );
        }

        // Calculate backoff delay
        const delay = this.config.backoffIntervals[attempt] || 
                     this.config.backoffIntervals[this.config.backoffIntervals.length - 1];

        if (this.config.logRetries) {
          console.log(
            `[TransportErrorHandler] Retrying ${context.operation} in ${delay}ms (attempt ${attempt + 1}/${this.config.maxRetries})`
          );
        }

        // Wait before retrying
        await this.sleep(delay);
      }
    }

    // This should never be reached, but TypeScript needs it
    throw new TransportError(
      `Operation failed: ${lastError?.message}`,
      lastError,
      context.operation
    );
  }

  /**
   * Queue an operation for later execution when transport becomes available
   * 
   * @param operation - The operation to queue
   * @param context - Error context for logging
   * @param priority - Priority level (lower = higher priority)
   * @returns Queue entry ID
   */
  queueOperation<T>(
    operation: () => Promise<T>,
    context: Omit<ErrorContext, 'timestamp' | 'attempt' | 'error'>,
    priority: number = 5
  ): string {
    const id = this.generateId();
    
    const queueEntry: QueuedOperation<T> = {
      id,
      operation,
      context: {
        ...context,
        timestamp: Date.now(),
        attempt: 0,
        error: 'Queued - transport unavailable',
      },
      retryCount: 0,
      priority,
      timestamp: Date.now(),
    };

    // Check queue capacity
    if (this.messageQueue.length >= this.maxQueueSize) {
      console.warn(
        `[TransportErrorHandler] Queue at capacity (${this.maxQueueSize}), dropping lowest priority message`
      );
      this.dropLowestPriorityMessage();
    }

    this.messageQueue.push(queueEntry);
    
    // Sort by priority (lower number = higher priority)
    this.messageQueue.sort((a, b) => a.priority - b.priority);

    console.log(
      `[TransportErrorHandler] Queued operation: ${context.operation} (priority: ${priority}, queue size: ${this.messageQueue.length})`
    );

    return id;
  }

  /**
   * Process the message queue
   * Attempts to execute all queued operations
   * 
   * @returns Number of successfully processed operations
   */
  async processQueue(): Promise<number> {
    if (this.isProcessingQueue) {
      console.log('[TransportErrorHandler] Queue processing already in progress');
      return 0;
    }

    this.isProcessingQueue = true;
    let successCount = 0;
    const failedOperations: QueuedOperation[] = [];

    console.log(`[TransportErrorHandler] Processing queue (${this.messageQueue.length} operations)`);

    while (this.messageQueue.length > 0) {
      const entry = this.messageQueue.shift();
      if (!entry) break;

      try {
        await entry.operation();
        successCount++;
        
        console.log(
          `[TransportErrorHandler] Successfully processed queued operation: ${entry.context.operation}`
        );
      } catch (error) {
        console.error(
          `[TransportErrorHandler] Failed to process queued operation: ${entry.context.operation}`,
          error
        );

        // Increment retry count
        entry.retryCount++;

        // If under max retries, re-queue
        if (entry.retryCount < this.config.maxRetries) {
          failedOperations.push(entry);
        } else {
          console.error(
            `[TransportErrorHandler] Dropping operation after ${entry.retryCount} failed attempts: ${entry.context.operation}`
          );
          
          this.logError({
            ...entry.context,
            timestamp: Date.now(),
            attempt: entry.retryCount,
            error: `Dropped after ${entry.retryCount} failed attempts`,
          });
        }
      }

      // Small delay between operations
      await this.sleep(100);
    }

    // Re-queue failed operations
    this.messageQueue.push(...failedOperations);
    this.messageQueue.sort((a, b) => a.priority - b.priority);

    this.isProcessingQueue = false;

    console.log(
      `[TransportErrorHandler] Queue processing complete: ${successCount} succeeded, ${failedOperations.length} re-queued`
    );

    return successCount;
  }

  /**
   * Log an error with context for debugging
   * 
   * @param context - Error context
   */
  logError(context: ErrorContext): void {
    const log: ErrorLog = {
      id: this.generateId(),
      context,
      resolved: false,
    };

    this.errorLogs.push(log);

    // Maintain max log size
    if (this.errorLogs.length > this.maxLogSize) {
      this.errorLogs.shift();
    }

    // Log to console with context
    console.error(
      `[TransportErrorHandler] Error logged:`,
      JSON.stringify({
        operation: context.operation,
        attempt: context.attempt,
        error: context.error,
        metadata: context.metadata,
      }, null, 2)
    );
  }

  /**
   * Get recent error logs
   * 
   * @param limit - Maximum number of logs to return
   * @returns Array of error logs
   */
  getErrorLogs(limit?: number): ErrorLog[] {
    const logs = [...this.errorLogs].reverse();
    return limit ? logs.slice(0, limit) : logs;
  }

  /**
   * Get unresolved error logs
   * 
   * @returns Array of unresolved error logs
   */
  getUnresolvedErrors(): ErrorLog[] {
    return this.errorLogs.filter(log => !log.resolved);
  }

  /**
   * Mark an error as resolved
   * 
   * @param errorId - Error log ID
   */
  markErrorResolved(errorId: string): void {
    const log = this.errorLogs.find(l => l.id === errorId);
    if (log) {
      log.resolved = true;
      log.resolvedAt = Date.now();
    }
  }

  /**
   * Clear all error logs
   */
  clearErrorLogs(): void {
    this.errorLogs = [];
    console.log('[TransportErrorHandler] Error logs cleared');
  }

  /**
   * Get queue statistics
   * 
   * @returns Queue statistics
   */
  getQueueStats() {
    return {
      queueLength: this.messageQueue.length,
      isProcessing: this.isProcessingQueue,
      maxQueueSize: this.maxQueueSize,
      errorLogCount: this.errorLogs.length,
      unresolvedErrorCount: this.getUnresolvedErrors().length,
    };
  }

  /**
   * Clear the message queue
   * 
   * @param keepPriority - If specified, only clear messages with priority >= this value
   */
  clearQueue(keepPriority?: number): void {
    if (keepPriority !== undefined) {
      const before = this.messageQueue.length;
      this.messageQueue = this.messageQueue.filter(op => op.priority < keepPriority);
      console.log(
        `[TransportErrorHandler] Cleared ${before - this.messageQueue.length} low-priority operations (kept priority < ${keepPriority})`
      );
    } else {
      this.messageQueue = [];
      console.log('[TransportErrorHandler] Queue cleared');
    }
  }

  /**
   * Drop the lowest priority message from the queue
   */
  private dropLowestPriorityMessage(): void {
    if (this.messageQueue.length === 0) return;

    // Find the lowest priority (highest number)
    let lowestPriorityIndex = 0;
    let lowestPriority = this.messageQueue[0].priority;

    for (let i = 1; i < this.messageQueue.length; i++) {
      if (this.messageQueue[i].priority > lowestPriority) {
        lowestPriority = this.messageQueue[i].priority;
        lowestPriorityIndex = i;
      }
    }

    const dropped = this.messageQueue.splice(lowestPriorityIndex, 1)[0];
    console.warn(
      `[TransportErrorHandler] Dropped message: ${dropped.context.operation} (priority: ${dropped.priority})`
    );
  }

  /**
   * Sleep for a specified duration
   * 
   * @param ms - Duration in milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update retry configuration
   * 
   * @param config - New retry configuration
   */
  updateConfig(config: Partial<RetryConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[TransportErrorHandler] Configuration updated:', this.config);
  }

  /**
   * Set maximum queue size
   * 
   * @param size - Maximum queue size
   */
  setMaxQueueSize(size: number): void {
    this.maxQueueSize = size;
    console.log(`[TransportErrorHandler] Max queue size set to ${size}`);
  }

  /**
   * Set maximum log size
   * 
   * @param size - Maximum log size
   */
  setMaxLogSize(size: number): void {
    this.maxLogSize = size;
    console.log(`[TransportErrorHandler] Max log size set to ${size}`);
  }
}

/**
 * Singleton instance for global use
 */
export const transportErrorHandler = new TransportErrorHandler();
