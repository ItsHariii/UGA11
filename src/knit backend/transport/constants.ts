/**
 * Transport layer constants.
 */

/** Nearby Connections service ID (must be unique; app package used for hackathon) */
export const NEARBY_SERVICE_ID = 'com.neighboryieldtemp.neighboryield';

/** Heartbeat version for payload compatibility */
export const HEARTBEAT_VERSION = 1;

/** Max heartbeat payload size in bytes (requirement: <1KB) */
export const HEARTBEAT_MAX_BYTES = 1024;
