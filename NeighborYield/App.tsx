/**
 * NeighborYield: Resilience Edition
 * A hybrid resilience network for community food sharing
 *
 * @format
 */

import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { AppProvider } from './src/context';
import { FeedList } from './src/components/feed/FeedList';
import { PresenceIndicator } from './src/components/presence/PresenceIndicator';
import { PresenceTooltip } from './src/components/presence/PresenceTooltip';
import { ConnectivityBanner } from './src/components/connectivity/ConnectivityBanner';
import { PermissionStatusBar } from './src/components/permission/PermissionStatusBar';
import { PostCreatorForm } from './src/components/post/PostCreatorForm';
import { InterestNotificationCard } from './src/components/interest/InterestNotificationCard';
import { LowBatteryNotice } from './src/components/connectivity/LowBatteryNotice';
import { BackgroundMeshToggle } from './src/components/connectivity/BackgroundMeshToggle';
import {
  ConnectivityMode,
  PermissionStatus,
  SharePost,
  RiskTier,
  MeshPermission,
  InterestAck,
} from './src/types';

// Mock data for demo
const mockPosts: SharePost[] = [
  {
    id: '1',
    authorId: 'user1',
    authorIdentifier: 'Neighbor-A3F9',
    title: 'Fresh Garden Tomatoes',
    description: 'Just picked from my garden. About 2 lbs available.',
    riskTier: 'high',
    createdAt: Date.now() - 5 * 60 * 1000, // 5 min ago
    expiresAt: Date.now() + 10 * 60 * 1000, // expires in 10 min
    source: 'local',
  },
  {
    id: '2',
    authorId: 'user2',
    authorIdentifier: 'Neighbor-B7C2',
    title: 'Homemade Bread',
    description: 'Baked this morning. Sourdough loaf.',
    riskTier: 'medium',
    createdAt: Date.now() - 15 * 60 * 1000, // 15 min ago
    expiresAt: Date.now() + 15 * 60 * 1000, // expires in 15 min
    source: 'local',
  },
  {
    id: '3',
    authorId: 'user3',
    authorIdentifier: 'Neighbor-D4E1',
    title: 'Canned Vegetables',
    description: 'Assorted canned goods - beans, corn, peas.',
    riskTier: 'low',
    createdAt: Date.now() - 30 * 60 * 1000, // 30 min ago
    expiresAt: Date.now() + 30 * 60 * 1000, // expires in 30 min
    source: 'supabase',
  },
];

const mockInterest: InterestAck = {
  id: 'int1',
  postId: '1',
  interestedUserId: 'user4',
  interestedUserIdentifier: 'Neighbor-F2G8',
  timestamp: Date.now() - 2 * 60 * 1000,
  source: 'local',
  status: 'pending',
};

type Screen = 'feed' | 'create' | 'settings';

function AppContent(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('feed');
  const [connectivityMode, setConnectivityMode] = useState<ConnectivityMode>('hybrid');
  const [peerCount, setPeerCount] = useState(3);
  const [showTooltip, setShowTooltip] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showLowBattery, setShowLowBattery] = useState(false);
  const [backgroundMesh, setBackgroundMesh] = useState(false);
  const [permissions, setPermissions] = useState<PermissionStatus>({
    bluetooth: 'granted',
    location: 'granted',
    nearbyDevices: 'granted',
    canUseMesh: true,
  });

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleInterestPress = useCallback((postId: string) => {
    console.log('Interest pressed for post:', postId);
  }, []);

  const handlePermissionPress = useCallback((permission: MeshPermission) => {
    console.log('Permission pressed:', permission);
  }, []);

  const handlePostSubmit = useCallback((data: { title: string; description: string; riskTier: RiskTier }) => {
    console.log('Post submitted:', data);
    setScreen('feed');
  }, []);

  const cycleConnectivity = useCallback(() => {
    const modes: ConnectivityMode[] = ['online', 'offline', 'hybrid', 'disconnected'];
    const currentIndex = modes.indexOf(connectivityMode);
    setConnectivityMode(modes[(currentIndex + 1) % modes.length]);
  }, [connectivityMode]);

  const cyclePeerCount = useCallback(() => {
    setPeerCount((prev) => (prev + 1) % 6);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>NeighborYield</Text>
        <Pressable onPress={() => setShowTooltip(!showTooltip)}>
          <PresenceIndicator
            peerCount={peerCount}
            connectivityMode={connectivityMode}
            onPress={cyclePeerCount}
          />
        </Pressable>
      </View>

      <PresenceTooltip
        visible={showTooltip}
        peerCount={peerCount}
        connectivityMode={connectivityMode}
        onClose={() => setShowTooltip(false)}
      />

      {/* Connectivity Banner */}
      <View style={styles.bannerContainer}>
        <Pressable onPress={cycleConnectivity}>
          <ConnectivityBanner mode={connectivityMode} />
        </Pressable>
      </View>

      {/* Low Battery Notice */}
      <LowBatteryNotice
        batteryLevel={12}
        visible={showLowBattery}
        onDismiss={() => setShowLowBattery(false)}
      />

      {/* Navigation Tabs */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, screen === 'feed' && styles.activeTab]}
          onPress={() => setScreen('feed')}
        >
          <Text style={[styles.tabText, screen === 'feed' && styles.activeTabText]}>
            Feed
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, screen === 'create' && styles.activeTab]}
          onPress={() => setScreen('create')}
        >
          <Text style={[styles.tabText, screen === 'create' && styles.activeTabText]}>
            Share
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, screen === 'settings' && styles.activeTab]}
          onPress={() => setScreen('settings')}
        >
          <Text style={[styles.tabText, screen === 'settings' && styles.activeTabText]}>
            Settings
          </Text>
        </Pressable>
      </View>

      {/* Screen Content */}
      {screen === 'feed' && (
        <View style={styles.screenContent}>
          {/* Incoming Interest Demo */}
          <View style={styles.interestContainer}>
            <InterestNotificationCard
              interest={mockInterest}
              postTitle="Fresh Garden Tomatoes"
              onAccept={() => console.log('Accepted')}
              onDecline={() => console.log('Declined')}
            />
          </View>
          
          <FeedList
            posts={mockPosts}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onInterestPress={handleInterestPress}
          />
        </View>
      )}

      {screen === 'create' && (
        <ScrollView style={styles.screenContent}>
          <PostCreatorForm onSubmit={handlePostSubmit} />
        </ScrollView>
      )}

      {screen === 'settings' && (
        <ScrollView style={styles.screenContent}>
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Permissions</Text>
            <PermissionStatusBar
              permissionStatus={permissions}
              onPermissionPress={handlePermissionPress}
              isBluetoothEnabled={true}
            />
          </View>

          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Battery & Mesh</Text>
            <BackgroundMeshToggle
              enabled={backgroundMesh}
              onToggle={setBackgroundMesh}
            />
          </View>

          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Demo Controls</Text>
            <Pressable
              style={styles.demoButton}
              onPress={() => setShowLowBattery(!showLowBattery)}
            >
              <Text style={styles.demoButtonText}>
                Toggle Low Battery Notice
              </Text>
            </Pressable>
            <Pressable
              style={styles.demoButton}
              onPress={() => {
                setPermissions((prev) => ({
                  ...prev,
                  bluetooth: prev.bluetooth === 'granted' ? 'denied' : 'granted',
                  canUseMesh: prev.bluetooth !== 'granted',
                }));
              }}
            >
              <Text style={styles.demoButtonText}>
                Toggle Bluetooth Permission
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function App(): React.JSX.Element {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  tooltipContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bannerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  noticeContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2e7d32',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  activeTabText: {
    color: '#2e7d32',
  },
  screenContent: {
    flex: 1,
  },
  interestContainer: {
    padding: 16,
  },
  settingsSection: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 12,
  },
  demoButton: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  demoButtonText: {
    color: '#2e7d32',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default App;
