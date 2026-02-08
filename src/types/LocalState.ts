/**
 * Local State Store
 * Maintains the application's local state using Map data structures
 */

import { SharePost } from './SharePost';
import { InterestAck } from './InterestAck';
import { PeerInfo } from './PeerInfo';
import { PermissionState, ConnectivityMode } from './Common';

export interface LocalState {
  /** Posts indexed by ID */
  posts: Map<string, SharePost>;
  
  /** Outgoing interests (my interests) indexed by interest ID */
  myInterests: Map<string, InterestAck>;
  
  /** Incoming interests indexed by post ID */
  receivedInterests: Map<string, InterestAck[]>;
  
  /** Active peers indexed by endpoint ID */
  peers: Map<string, PeerInfo>;
  
  /** Permission states */
  permissions: {
    bluetooth: PermissionState;
    location: PermissionState;
    nearbyDevices: PermissionState;
  };
  
  /** Current connectivity mode */
  connectivityMode: ConnectivityMode;
  
  /** Current user's ID */
  userId: string;
}
