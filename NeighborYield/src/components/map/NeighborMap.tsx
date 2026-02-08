/**
 * NeighborMap Component
 * A dual-mode map component that displays nearby neighbors and adapts to connectivity conditions.
 * - Abundance mode: Full-featured map with rich styling
 * - Survival mode: Simplified radar-style view with peer positions (no tile loading)
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  MapPin,
  Navigation,
  Users,
  AlertTriangle,
  List,
  Map as MapIcon,
  Compass,
} from 'lucide-react-native';
import { ThemeMode } from '../../theme/ThemeContext';
import { DesignTokens, abundanceDesignTokens, survivalDesignTokens } from '../../theme/tokens';
import { PeerInfo } from '../../types';

// ============================================
// Types and Interfaces
// ============================================

export interface MeshPeer extends PeerInfo {
  /** Distance from user in meters */
  distance?: number;
  /** Direction from user in degrees (0-360) */
  direction?: number;
  /** Relative position for radar view */
  relativePosition?: { x: number; y: number };
}

export interface NeighborMapProps {
  /** Current theme mode */
  mode: ThemeMode;
  /** List of mesh peers to display */
  peers: MeshPeer[];
  /** Whether map data is available */
  mapDataAvailable?: boolean;
  /** User's current location */
  userLocation?: { latitude: number; longitude: number };
  /** Callback when a peer marker is pressed */
  onPeerPress?: (peer: MeshPeer) => void;
  /** Callback when map view is toggled */
  onViewToggle?: () => void;
  /** Test ID for testing */
  testID?: string;
}

export type MapViewMode = 'map' | 'radar' | 'list';

export interface MarkerPosition {
  x: Animated.Value;
  y: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
}

// ============================================
// Constants
// ============================================

const RADAR_SIZE = 280;
const RADAR_RING_COUNT = 4;
const MARKER_SIZE = 32;
const MARKER_ANIMATION_DURATION = 500;

// ============================================
// Utility Functions
// ============================================

/**
 * Get design tokens based on theme mode
 */
export function getTokensForMode(mode: ThemeMode): DesignTokens {
  return mode === 'survival' ? survivalDesignTokens : abundanceDesignTokens;
}

/**
 * Determine the appropriate view mode based on theme and data availability
 * Requirements: 8.2, 8.6
 */
export function determineViewMode(
  mode: ThemeMode,
  mapDataAvailable: boolean,
  forceListView: boolean,
): MapViewMode {
  // Survival mode always uses radar view (no tile loading)
  // Requirements: 8.2, 8.4
  if (mode === 'survival') {
    return 'radar';
  }

  // If map data unavailable, fall back to list view
  // Requirements: 8.6
  if (!mapDataAvailable || forceListView) {
    return 'list';
  }

  // Abundance mode with available data uses map view
  // Requirements: 8.1
  return 'map';
}

/**
 * Format distance for display
 */
export function formatDistance(meters?: number): string {
  if (meters === undefined || meters === null) {
    return 'Unknown';
  }
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Calculate relative position on radar from direction and distance
 * Requirements: 8.2 - Radar-style view with peer positions
 */
export function calculateRadarPosition(
  direction: number,
  distance: number,
  maxDistance: number,
  radarRadius: number,
): { x: number; y: number } {
  // Normalize distance to radar radius (max at 80% of radius)
  const normalizedDistance = Math.min(distance / maxDistance, 1) * (radarRadius * 0.8);

  // Convert direction to radians (0 = North, clockwise)
  const radians = ((direction - 90) * Math.PI) / 180;

  return {
    x: Math.cos(radians) * normalizedDistance,
    y: Math.sin(radians) * normalizedDistance,
  };
}

/**
 * Get signal strength indicator
 */
export function getSignalStrengthLabel(signalStrength?: number): string {
  if (signalStrength === undefined) return 'Unknown';
  if (signalStrength >= -50) return 'Excellent';
  if (signalStrength >= -60) return 'Good';
  if (signalStrength >= -70) return 'Fair';
  return 'Weak';
}

// ============================================
// Radar Ring Component
// ============================================

interface RadarRingProps {
  index: number;
  totalRings: number;
  size: number;
  color: string;
}

function RadarRing({ index, totalRings, size, color }: RadarRingProps): React.JSX.Element {
  const ringSize = (size / totalRings) * (index + 1);

  return (
    <View
      style={[
        styles.radarRing,
        {
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
          borderColor: color,
        },
      ]}
    />
  );
}

// ============================================
// Radar View Component
// Requirements: 8.2 - Simplified radar-style view
// ============================================

interface RadarViewProps {
  peers: MeshPeer[];
  tokens: DesignTokens;
  markerPositions: Map<string, MarkerPosition>;
  onPeerPress?: (peer: MeshPeer) => void;
  testID?: string;
}

function RadarView({
  peers,
  tokens,
  markerPositions,
  onPeerPress,
  testID,
}: RadarViewProps): React.JSX.Element {
  const radarRadius = RADAR_SIZE / 2;

  // Calculate max distance for normalization
  const maxDistance = useMemo(() => {
    const distances = peers.map(p => p.distance || 0).filter(d => d > 0);
    return Math.max(...distances, 100); // Minimum 100m range
  }, [peers]);

  return (
    <View style={styles.radarContainer} testID={testID}>
      {/* Radar rings */}
      <View style={[styles.radarBase, { width: RADAR_SIZE, height: RADAR_SIZE }]}>
        {Array.from({ length: RADAR_RING_COUNT }).map((_, index) => (
          <RadarRing
            key={`ring-${index}`}
            index={index}
            totalRings={RADAR_RING_COUNT}
            size={RADAR_SIZE}
            color={tokens.colors.borderDefault}
          />
        ))}

        {/* Cardinal directions */}
        <Text
          style={[styles.cardinalDirection, styles.cardinalN, { color: tokens.colors.textMuted }]}>
          N
        </Text>
        <Text
          style={[styles.cardinalDirection, styles.cardinalE, { color: tokens.colors.textMuted }]}>
          E
        </Text>
        <Text
          style={[styles.cardinalDirection, styles.cardinalS, { color: tokens.colors.textMuted }]}>
          S
        </Text>
        <Text
          style={[styles.cardinalDirection, styles.cardinalW, { color: tokens.colors.textMuted }]}>
          W
        </Text>

        {/* Center point (user location) */}
        <View style={[styles.radarCenter, { backgroundColor: tokens.colors.accentPrimary }]} />

        {/* Peer markers */}
        {peers.map(peer => {
          const position = markerPositions.get(peer.endpointId);
          if (!position) return null;

          return (
            <Animated.View
              key={peer.endpointId}
              style={[
                styles.radarMarker,
                {
                  transform: [
                    { translateX: position.x },
                    { translateY: position.y },
                    { scale: position.scale },
                  ],
                  opacity: position.opacity,
                  left: radarRadius - MARKER_SIZE / 2,
                  top: radarRadius - MARKER_SIZE / 2,
                },
              ]}>
              <TouchableOpacity
                onPress={() => onPeerPress?.(peer)}
                style={[styles.markerTouchable, { backgroundColor: tokens.colors.accentSecondary }]}
                testID={`radar-marker-${peer.endpointId}`}>
                <Users size={16} color={tokens.colors.backgroundPrimary} />
              </TouchableOpacity>
              <Text
                style={[styles.markerDistance, { color: tokens.colors.textAccent }]}
                numberOfLines={1}>
                {formatDistance(peer.distance)}
              </Text>
            </Animated.View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.radarLegend}>
        <Text style={[styles.legendText, { color: tokens.colors.textMuted }]}>
          {peers.length} peer{peers.length !== 1 ? 's' : ''} nearby
        </Text>
        <Text style={[styles.legendText, { color: tokens.colors.textMuted }]}>
          Range: {formatDistance(maxDistance)}
        </Text>
      </View>
    </View>
  );
}

// ============================================
// Map View Component (Abundance Mode)
// Requirements: 8.1 - Full-featured map with rich styling
// ============================================

interface MapViewComponentProps {
  peers: MeshPeer[];
  tokens: DesignTokens;
  userLocation?: { latitude: number; longitude: number };
  markerPositions: Map<string, MarkerPosition>;
  onPeerPress?: (peer: MeshPeer) => void;
  testID?: string;
}

function MapViewComponent({
  peers,
  tokens,
  userLocation,
  markerPositions,
  onPeerPress,
  testID,
}: MapViewComponentProps): React.JSX.Element {
  // In a real implementation, this would use react-native-maps
  // For now, we render a placeholder with peer markers
  const mapSize = Dimensions.get('window').width - 32;

  return (
    <View
      style={[
        styles.mapContainer,
        {
          backgroundColor: tokens.colors.backgroundSecondary,
          borderColor: tokens.colors.borderDefault,
        },
      ]}
      testID={testID}>
      {/* Map placeholder - would be replaced with actual MapView */}
      <View style={[styles.mapPlaceholder, { width: mapSize, height: mapSize * 0.75 }]}>
        <MapIcon size={48} color={tokens.colors.textMuted} strokeWidth={1.5} />
        <Text style={[styles.mapPlaceholderText, { color: tokens.colors.textMuted }]}>
          Map View
        </Text>

        {/* User location marker */}
        {userLocation && (
          <View style={[styles.userMarker, { backgroundColor: tokens.colors.accentPrimary }]}>
            <Navigation size={16} color="#FFFFFF" />
          </View>
        )}

        {/* Peer markers overlay */}
        {peers.map((peer, index) => {
          const position = markerPositions.get(peer.endpointId);
          if (!position) return null;

          // Distribute markers in a circle for demo
          const angle = (index / peers.length) * 2 * Math.PI;
          const radius = mapSize * 0.25;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <Animated.View
              key={peer.endpointId}
              style={[
                styles.mapMarker,
                {
                  transform: [
                    { translateX: position.x },
                    { translateY: position.y },
                    { scale: position.scale },
                  ],
                  opacity: position.opacity,
                  left: mapSize / 2 - MARKER_SIZE / 2 + x,
                  top: (mapSize * 0.75) / 2 - MARKER_SIZE / 2 + y,
                },
              ]}>
              <TouchableOpacity
                onPress={() => onPeerPress?.(peer)}
                style={[
                  styles.mapMarkerTouchable,
                  {
                    backgroundColor: tokens.colors.accentPrimary,
                    shadowColor: tokens.colors.shadowColor,
                  },
                ]}
                testID={`map-marker-${peer.endpointId}`}>
                <MapPin size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <View
                style={[styles.mapMarkerLabel, { backgroundColor: tokens.colors.backgroundCard }]}>
                <Text
                  style={[styles.mapMarkerText, { color: tokens.colors.textPrimary }]}
                  numberOfLines={1}>
                  {peer.userIdentifier}
                </Text>
                <Text style={[styles.mapMarkerDistance, { color: tokens.colors.textSecondary }]}>
                  {formatDistance(peer.distance)}
                </Text>
              </View>
            </Animated.View>
          );
        })}
      </View>

      {/* Map controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity
          style={[
            styles.mapControlButton,
            {
              backgroundColor: tokens.colors.backgroundCard,
              borderColor: tokens.colors.borderDefault,
            },
          ]}>
          <Compass size={20} color={tokens.colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================
// List View Component (Fallback)
// Requirements: 8.6 - List view fallback when map data unavailable
// ============================================

interface ListViewProps {
  peers: MeshPeer[];
  tokens: DesignTokens;
  mode: ThemeMode;
  onPeerPress?: (peer: MeshPeer) => void;
  testID?: string;
}

function ListView({ peers, tokens, mode, onPeerPress, testID }: ListViewProps): React.JSX.Element {
  const renderPeerItem = useCallback(
    ({ item: peer }: { item: MeshPeer }) => (
      <TouchableOpacity
        style={[
          styles.listItem,
          {
            backgroundColor: tokens.colors.backgroundCard,
            borderColor: tokens.colors.borderDefault,
            borderRadius: mode === 'survival' ? 2 : 12,
          },
        ]}
        onPress={() => onPeerPress?.(peer)}
        testID={`list-item-${peer.endpointId}`}>
        <View style={[styles.listItemIcon, { backgroundColor: tokens.colors.accentSecondary }]}>
          <Users size={20} color={tokens.colors.backgroundPrimary} />
        </View>
        <View style={styles.listItemContent}>
          <Text
            style={[styles.listItemTitle, { color: tokens.colors.textPrimary }]}
            numberOfLines={1}>
            {peer.userIdentifier}
          </Text>
          <Text style={[styles.listItemSubtitle, { color: tokens.colors.textSecondary }]}>
            Signal: {getSignalStrengthLabel(peer.signalStrength)}
          </Text>
        </View>
        <View style={styles.listItemDistance}>
          <Text style={[styles.distanceValue, { color: tokens.colors.textAccent }]}>
            {formatDistance(peer.distance)}
          </Text>
          {peer.direction !== undefined && (
            <Text style={[styles.directionValue, { color: tokens.colors.textMuted }]}>
              {Math.round(peer.direction)}°
            </Text>
          )}
        </View>
      </TouchableOpacity>
    ),
    [tokens, mode, onPeerPress],
  );

  const keyExtractor = useCallback((peer: MeshPeer) => peer.endpointId, []);

  return (
    <View style={styles.listContainer} testID={testID}>
      <FlatList
        data={peers}
        renderItem={renderPeerItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <AlertTriangle size={32} color={tokens.colors.textMuted} />
            <Text style={[styles.emptyListText, { color: tokens.colors.textMuted }]}>
              No peers found nearby
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ============================================
// Main NeighborMap Component
// Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
// ============================================

function NeighborMapComponent({
  mode,
  peers,
  mapDataAvailable = true,
  userLocation,
  onPeerPress,
  onViewToggle,
  testID,
}: NeighborMapProps): React.JSX.Element {
  const [forceListView, setForceListView] = useState(false);

  // Get tokens based on mode
  const tokens = useMemo(() => getTokensForMode(mode), [mode]);

  // Determine view mode
  // Requirements: 8.2, 8.6
  const viewMode = useMemo(
    () => determineViewMode(mode, mapDataAvailable, forceListView),
    [mode, mapDataAvailable, forceListView],
  );

  // Create animated marker positions
  // Requirements: 8.5 - Animate marker positions on peer discovery/movement
  const markerPositionsRef = useRef<Map<string, MarkerPosition>>(new Map());

  // Initialize and update marker positions
  useEffect(() => {
    const currentPositions = markerPositionsRef.current;
    const radarRadius = RADAR_SIZE / 2;
    const maxDistance = Math.max(...peers.map(p => p.distance || 0), 100);

    peers.forEach(peer => {
      if (!currentPositions.has(peer.endpointId)) {
        // Create new animated values for new peer
        const radarPos = calculateRadarPosition(
          peer.direction || 0,
          peer.distance || 50,
          maxDistance,
          radarRadius,
        );

        const position: MarkerPosition = {
          x: new Animated.Value(0),
          y: new Animated.Value(0),
          scale: new Animated.Value(0),
          opacity: new Animated.Value(0),
        };

        currentPositions.set(peer.endpointId, position);

        // Animate in new marker
        // Requirements: 8.5 - Animate marker positions on peer discovery
        Animated.parallel([
          Animated.timing(position.x, {
            toValue: radarPos.x,
            duration: MARKER_ANIMATION_DURATION,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(position.y, {
            toValue: radarPos.y,
            duration: MARKER_ANIMATION_DURATION,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(position.scale, {
            toValue: 1,
            duration: MARKER_ANIMATION_DURATION,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(position.opacity, {
            toValue: 1,
            duration: MARKER_ANIMATION_DURATION * 0.5,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Update existing marker position
        // Requirements: 8.5 - Animate marker positions on movement
        const position = currentPositions.get(peer.endpointId)!;
        const radarPos = calculateRadarPosition(
          peer.direction || 0,
          peer.distance || 50,
          maxDistance,
          radarRadius,
        );

        Animated.parallel([
          Animated.timing(position.x, {
            toValue: radarPos.x,
            duration: MARKER_ANIMATION_DURATION,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(position.y, {
            toValue: radarPos.y,
            duration: MARKER_ANIMATION_DURATION,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      }
    });

    // Remove markers for peers that are no longer present
    const currentPeerIds = new Set(peers.map(p => p.endpointId));
    currentPositions.forEach((position, endpointId) => {
      if (!currentPeerIds.has(endpointId)) {
        // Animate out removed marker
        Animated.parallel([
          Animated.timing(position.scale, {
            toValue: 0,
            duration: MARKER_ANIMATION_DURATION * 0.5,
            useNativeDriver: true,
          }),
          Animated.timing(position.opacity, {
            toValue: 0,
            duration: MARKER_ANIMATION_DURATION * 0.5,
            useNativeDriver: true,
          }),
        ]).start(() => {
          currentPositions.delete(endpointId);
        });
      }
    });
  }, [peers]);

  // Toggle between map and list view (abundance mode only)
  const handleViewToggle = useCallback(() => {
    if (mode === 'abundance') {
      setForceListView(prev => !prev);
      onViewToggle?.();
    }
  }, [mode, onViewToggle]);

  // Get view toggle icon and label
  const viewToggleConfig = useMemo(() => {
    if (viewMode === 'list') {
      return { icon: MapIcon, label: 'Map View' };
    }
    return { icon: List, label: 'List View' };
  }, [viewMode]);

  return (
    <View
      style={[styles.container, { backgroundColor: tokens.colors.backgroundPrimary }]}
      testID={testID}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: tokens.colors.backgroundSecondary,
            borderBottomColor: tokens.colors.borderDefault,
          },
        ]}>
        <View style={styles.headerLeft}>
          <Users size={20} color={tokens.colors.accentPrimary} />
          <Text style={[styles.headerTitle, { color: tokens.colors.textPrimary }]}>Neighbors</Text>
          <View style={[styles.peerCountBadge, { backgroundColor: tokens.colors.accentPrimary }]}>
            <Text style={styles.peerCountText}>{peers.length}</Text>
          </View>
        </View>

        {/* View toggle (abundance mode only) */}
        {mode === 'abundance' && mapDataAvailable && (
          <TouchableOpacity
            style={[
              styles.viewToggle,
              {
                backgroundColor: tokens.colors.backgroundCard,
                borderColor: tokens.colors.borderDefault,
              },
            ]}
            onPress={handleViewToggle}
            testID="view-toggle">
            <viewToggleConfig.icon size={18} color={tokens.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content based on view mode */}
      <View style={styles.content}>
        {viewMode === 'radar' && (
          <RadarView
            peers={peers}
            tokens={tokens}
            markerPositions={markerPositionsRef.current}
            onPeerPress={onPeerPress}
            testID={`${testID}-radar`}
          />
        )}

        {viewMode === 'map' && (
          <MapViewComponent
            peers={peers}
            tokens={tokens}
            userLocation={userLocation}
            markerPositions={markerPositionsRef.current}
            onPeerPress={onPeerPress}
            testID={`${testID}-map`}
          />
        )}

        {viewMode === 'list' && (
          <ListView
            peers={peers}
            tokens={tokens}
            mode={mode}
            onPeerPress={onPeerPress}
            testID={`${testID}-list`}
          />
        )}
      </View>

      {/* Survival mode indicator */}
      {mode === 'survival' && (
        <View
          style={[
            styles.survivalIndicator,
            { backgroundColor: tokens.colors.backgroundSecondary },
          ]}>
          <AlertTriangle size={14} color={tokens.colors.accentWarning} />
          <Text style={[styles.survivalIndicatorText, { color: tokens.colors.textMuted }]}>
            Radar view • No network requests
          </Text>
        </View>
      )}
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  peerCountBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  peerCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  viewToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Radar styles
  radarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  radarBase: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRing: {
    position: 'absolute',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  radarCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
  },
  cardinalDirection: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: '600',
  },
  cardinalN: {
    top: -20,
  },
  cardinalE: {
    right: -16,
  },
  cardinalS: {
    bottom: -20,
  },
  cardinalW: {
    left: -16,
  },
  radarMarker: {
    position: 'absolute',
    alignItems: 'center',
  },
  markerTouchable: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDistance: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  radarLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: RADAR_SIZE,
    marginTop: 16,
    paddingHorizontal: 8,
  },
  legendText: {
    fontSize: 12,
  },
  // Map styles
  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    margin: 16,
    borderWidth: 1,
  },
  mapPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mapPlaceholderText: {
    fontSize: 14,
    marginTop: 8,
  },
  userMarker: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mapMarker: {
    position: 'absolute',
    alignItems: 'center',
  },
  mapMarkerTouchable: {
    width: MARKER_SIZE + 4,
    height: MARKER_SIZE + 4,
    borderRadius: (MARKER_SIZE + 4) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mapMarkerLabel: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapMarkerText: {
    fontSize: 11,
    fontWeight: '500',
  },
  mapMarkerDistance: {
    fontSize: 10,
  },
  mapControls: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  mapControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  // List styles
  listContainer: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    gap: 12,
  },
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  listItemSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  listItemDistance: {
    alignItems: 'flex-end',
  },
  distanceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  directionValue: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyListText: {
    fontSize: 14,
  },
  // Survival indicator
  survivalIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  survivalIndicatorText: {
    fontSize: 12,
  },
});

// ============================================
// Memoized Export
// ============================================

export const NeighborMap = React.memo(NeighborMapComponent);
NeighborMap.displayName = 'NeighborMap';

export default NeighborMap;
