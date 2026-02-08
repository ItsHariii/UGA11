/**
 * Transport Error Handler Usage Examples
 * 
 * This file demonstrates how to use the TransportErrorHandler
 * for retry logic, message queuing, and error logging.
 */

import {
  TransportErrorHandler,
  transportErrorHandler,
  DEFAULT_RETRY_CONFIG,
} from './transportErrorHandler';

// ============================================
// Example 1: Basic Retry with Exponential Backoff
// ============================================

async function example1_BasicRetry() {
  console.log('=== Example 1: Basic Retry ===\n');

  // Define an operation that might fail
  const unreliableOperation = async () => {
    const random = Math.random();
    if (random < 0.7) {
      throw new Error('Network timeout');
    }
    return 'Success!';
  };

  try {
    const result = await transportErrorHandler.executeWithRetry(
      unreliableOperation,
      {
        operation: 'sendMessage',
        metadata: { messageId: 'msg-123' },
      }
    );
    console.log('Operation succeeded:', result);
  } catch (error) {
    console.error('Operation failed after all retries:', error);
  }
}

// ============================================
// Example 2: Custom Retry Configuration
// ============================================

async function example2_CustomRetryConfig() {
  console.log('\n=== Example 2: Custom Retry Configuration ===\n');

  // Create a handler with custom retry configuration
  const customHandler = new TransportErrorHandler({
    backoffIntervals: [500, 1000, 2000], // Faster retries
    maxRetries: 3,
    logRetries: true,
  });

  const operation = async () => {
    console.log('Attempting operation...');
    throw new Error('Simulated failure');
  };

  try {
    await customHandler.executeWithRetry(operation, {
      operation: 'quickRetry',
    });
  } catch (error) {
    console.log('Failed after 3 quick retries');
  }
}

// ============================================
// Example 3: Message Queuing
// ============================================

async function example3_MessageQueuing() {
  console.log('\n=== Example 3: Message Queuing ===\n');

  // Queue operations when transport is unavailable
  const sosMessage = async () => {
    console.log('Sending SOS message');
    return 'SOS sent';
  };

  const regularMessage = async () => {
    console.log('Sending regular message');
    return 'Message sent';
  };

  // Queue with different priorities (lower = higher priority)
  const sosId = transportErrorHandler.queueOperation(
    sosMessage,
    { operation: 'sendSOS' },
    0 // Highest priority
  );

  const regularId = transportErrorHandler.queueOperation(
    regularMessage,
    { operation: 'sendRegular' },
    5 // Lower priority
  );

  console.log('Queued operations:', { sosId, regularId });
  console.log('Queue stats:', transportErrorHandler.getQueueStats());

  // Process queue when transport becomes available
  console.log('\nProcessing queue...');
  const successCount = await transportErrorHandler.processQueue();
  console.log(`Successfully processed ${successCount} operations`);
}

// ============================================
// Example 4: Error Logging and Monitoring
// ============================================

async function example4_ErrorLogging() {
  console.log('\n=== Example 4: Error Logging ===\n');

  // Simulate some failed operations
  for (let i = 0; i < 3; i++) {
    try {
      await transportErrorHandler.executeWithRetry(
        async () => {
          throw new Error(`Error ${i + 1}`);
        },
        {
          operation: `operation-${i}`,
          metadata: { attempt: i + 1 },
        }
      );
    } catch (error) {
      // Expected to fail
    }
  }

  // Get error logs
  const recentErrors = transportErrorHandler.getErrorLogs(5);
  console.log('Recent errors:', recentErrors.length);

  // Get unresolved errors
  const unresolved = transportErrorHandler.getUnresolvedErrors();
  console.log('Unresolved errors:', unresolved.length);

  // Mark an error as resolved
  if (recentErrors.length > 0) {
    transportErrorHandler.markErrorResolved(recentErrors[0].id);
    console.log('Marked first error as resolved');
  }

  // Clear old logs
  transportErrorHandler.clearErrorLogs();
  console.log('Cleared error logs');
}

// ============================================
// Example 5: Integration with Supabase Transport
// ============================================

async function example5_SupabaseIntegration() {
  console.log('\n=== Example 5: Supabase Integration ===\n');

  // The SupabaseTransport already uses transportErrorHandler internally
  // All sendPost, sendInterest, sendResponse, and fetchPosts operations
  // automatically get retry logic with exponential backoff

  // Example of what happens internally:
  const mockSupabaseOperation = async () => {
    // Simulate Supabase call
    const success = Math.random() > 0.3;
    if (!success) {
      throw new Error('Supabase connection failed');
    }
    return { data: 'Post created', error: null };
  };

  try {
    const result = await transportErrorHandler.executeWithRetry(
      mockSupabaseOperation,
      {
        operation: 'supabase.sendPost',
        metadata: { postId: 'post-123', postType: 'SOS' },
      }
    );
    console.log('Supabase operation succeeded:', result);
  } catch (error) {
    console.error('Supabase operation failed:', error);
  }
}

// ============================================
// Example 6: Queue Management
// ============================================

async function example6_QueueManagement() {
  console.log('\n=== Example 6: Queue Management ===\n');

  // Set maximum queue size
  transportErrorHandler.setMaxQueueSize(100);

  // Queue multiple operations
  for (let i = 0; i < 10; i++) {
    transportErrorHandler.queueOperation(
      async () => console.log(`Operation ${i}`),
      { operation: `op-${i}` },
      i // Priority based on index
    );
  }

  console.log('Queue stats:', transportErrorHandler.getQueueStats());

  // Clear low-priority messages (keep priority < 5)
  transportErrorHandler.clearQueue(5);
  console.log('After clearing low priority:', transportErrorHandler.getQueueStats());

  // Clear entire queue
  transportErrorHandler.clearQueue();
  console.log('After clearing all:', transportErrorHandler.getQueueStats());
}

// ============================================
// Example 7: Real-World Scenario - Offline Mode
// ============================================

async function example7_OfflineMode() {
  console.log('\n=== Example 7: Offline Mode Scenario ===\n');

  let isOnline = false;

  // Simulate user creating posts while offline
  const createPost = async (postData: any) => {
    if (!isOnline) {
      console.log('Offline: Queuing post for later');
      return transportErrorHandler.queueOperation(
        async () => {
          console.log('Sending queued post:', postData.title);
          return { success: true };
        },
        {
          operation: 'sendPost',
          metadata: { postId: postData.id, postType: postData.type },
        },
        postData.type === 'SOS' ? 0 : 5 // SOS gets highest priority
      );
    } else {
      console.log('Online: Sending post immediately');
      return transportErrorHandler.executeWithRetry(
        async () => {
          console.log('Sending post:', postData.title);
          return { success: true };
        },
        {
          operation: 'sendPost',
          metadata: { postId: postData.id },
        }
      );
    }
  };

  // Create posts while offline
  await createPost({ id: '1', title: 'Need Water', type: 'SOS' });
  await createPost({ id: '2', title: 'Have Food', type: 'HAVE' });
  await createPost({ id: '3', title: 'Want Batteries', type: 'WANT' });

  console.log('\nQueue stats:', transportErrorHandler.getQueueStats());

  // Simulate coming back online
  console.log('\n--- Coming back online ---\n');
  isOnline = true;

  // Process queued messages
  const processed = await transportErrorHandler.processQueue();
  console.log(`\nProcessed ${processed} queued operations`);
  console.log('Final queue stats:', transportErrorHandler.getQueueStats());
}

// ============================================
// Example 8: Monitoring and Debugging
// ============================================

function example8_Monitoring() {
  console.log('\n=== Example 8: Monitoring and Debugging ===\n');

  // Get comprehensive statistics
  const stats = transportErrorHandler.getQueueStats();
  console.log('Queue Statistics:', {
    queueLength: stats.queueLength,
    isProcessing: stats.isProcessing,
    maxQueueSize: stats.maxQueueSize,
    errorLogCount: stats.errorLogCount,
    unresolvedErrorCount: stats.unresolvedErrorCount,
  });

  // Get recent error logs for debugging
  const recentErrors = transportErrorHandler.getErrorLogs(10);
  console.log('\nRecent Errors:');
  recentErrors.forEach(log => {
    console.log(`- ${log.context.operation}: ${log.context.error}`);
    console.log(`  Attempt: ${log.context.attempt}, Resolved: ${log.resolved}`);
    if (log.context.metadata) {
      console.log(`  Metadata:`, log.context.metadata);
    }
  });

  // Get only unresolved errors
  const unresolved = transportErrorHandler.getUnresolvedErrors();
  console.log(`\nUnresolved Errors: ${unresolved.length}`);
}

// ============================================
// Run Examples
// ============================================

async function runAllExamples() {
  try {
    await example1_BasicRetry();
    await example2_CustomRetryConfig();
    await example3_MessageQueuing();
    await example4_ErrorLogging();
    await example5_SupabaseIntegration();
    await example6_QueueManagement();
    await example7_OfflineMode();
    example8_Monitoring();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Uncomment to run examples:
// runAllExamples();

export {
  example1_BasicRetry,
  example2_CustomRetryConfig,
  example3_MessageQueuing,
  example4_ErrorLogging,
  example5_SupabaseIntegration,
  example6_QueueManagement,
  example7_OfflineMode,
  example8_Monitoring,
};
