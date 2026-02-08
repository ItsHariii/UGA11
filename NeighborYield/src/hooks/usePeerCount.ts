/**
 * usePeerCount Hook
 * Provides access to peer count and presence-related state from AppContext.
 *
 * Requirements: 3.5, 3.6, 4.1, 4.2, 4.3
 */

import { useCallback, useMemo } from 'react';
import { useAppContext } from '../context';
import { PeerInfo } from '../types';

export interface UsePeerCountResult {
  /** Current number of peers in range */
  peerCount: number;

  /** Map of all active peers */
  peers: Map<string, PeerInfo>;

  /** Whether there are any peers in range */
  hasPeers: boolean;

  /** Formatted display string for peer count */
  displayText: string;

  /** Add a peer to the list */
  addPeer: (peer: PeerInfo) => void;

  /** Remove a peer from the list */
  removePeer: (endpointId: string) => void;

  /** Set all peers at once */
  setPeers: (peers: Map<string, PeerInfo>) => void;

  /** Set peer count directly */
  setPeerCount: (count: number) => void;

  /** Get a specific peer by endpoint ID */
  getPeer: (endpointId: string) => PeerInfo | undefined;

  /** Get list of all peer identifiers */
  peerIdentifiers: string[];
}

/**
 * Formats the peer count for display
 * Property 11: Peer Count Display Format
 */
export function formatPeerCount(count: number): string {
  if (count === 0) {
    return 'No neighbors in range';
  }
  if (count === 1) {
    return '1 neighbor in range';
  }
  return `${count} neighbors in range`;
}

/**
 * Hook for accessing peer count and presence state
 */
export function usePeerCount(): UsePeerCountResult {
  const { state, addPeer, removePeer, setPeers, setPeerCount } = useAppContext();

  const hasPeers = useMemo(() => state.peerCount > 0, [state.peerCount]);

  const displayText = useMemo(
    () => formatPeerCount(state.peerCount),
    [state.peerCount]
  );

  const getPeer = useCallback(
    (endpointId: string): PeerInfo | undefined => {
      return state.peers.get(endpointId);
    },
    [state.peers]
  );

  const peerIdentifiers = useMemo((): string[] => {
    return Array.from(state.peers.values()).map((p) => p.userIdentifier);
  }, [state.peers]);

  return {
    peerCount: state.peerCount,
    peers: state.peers,
    hasPeers,
    displayText,
    addPeer,
    removePeer,
    setPeers,
    setPeerCount,
    getPeer,
    peerIdentifiers,
  };
}

export default usePeerCount;
