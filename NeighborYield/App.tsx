/**
 * NeighborYield: Resilience Edition
 * A hybrid resilience network for community food sharing
 *
 * @format
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  Animated,
  useWindowDimensions,
  Image,
  Alert,
} from 'react-native';
import { Newspaper, MapPin, PlusCircle, MessageCircle, Settings } from 'lucide-react-native';
import { AppProvider, useAppContext } from './src/context';
import { AnimatedThemeProvider, useAnimatedTheme } from './src/theme';
import { FeedList } from './src/components/feed/FeedList';
import { PresenceTooltip } from './src/components/presence/PresenceTooltip';
import { DynamicIsland } from './src/components/connectivity/DynamicIsland';
import { PermissionStatusBar } from './src/components/permission/PermissionStatusBar';
import { PostCreatorForm } from './src/components/post/PostCreatorForm';
import { InterestNotificationCard } from './src/components/interest/InterestNotificationCard';
import { LowBatteryNotice } from './src/components/connectivity/LowBatteryNotice';
import { BackgroundMeshToggle } from './src/components/connectivity/BackgroundMeshToggle';
import { ConnectionCelebration } from './src/components/animations/ConnectionCelebration';
import {
  LoginScreen,
  RegisterScreen,
  RegisterData,
  MessagesScreen,
  ChatScreen,
} from './src/screens';
import {
  ConnectivityMode,
  PermissionStatus,
  SharePost,
  RiskTier,
  MeshPermission,
  InterestAck,
} from './src/types';
import {
  signIn,
  register,
  getCurrentUser,
  signOut as authSignOut,
  resetPassword,
  AuthUser,
} from './src/services/auth.service';
import {
  fetchPosts,
  createPost,
  subscribeToPostUpdates,
  CreatePostData,
} from './src/services/posts.service';
import {
  fetchMyPostsInterests,
  expressInterest,
  updateInterestStatus,
  subscribeToInterestUpdates,
} from './src/services/interests.service';

type Screen = 'feed' | 'map' | 'create' | 'messages' | 'settings';

interface FloatingTabBarProps {
  activeScreen: Screen;
  onTabPress: (screen: Screen) => void;
  mode: 'abundance' | 'survival';
}

function FloatingTabBar({
  activeScreen,
  onTabPress,
  mode,
}: FloatingTabBarProps): React.JSX.Element {
  const { width } = useWindowDimensions();
  const scaleAnims = useRef({
    feed: new Animated.Value(1),
    map: new Animated.Value(1),
    create: new Animated.Value(1),
    messages: new Animated.Value(1),
    settings: new Animated.Value(1),
  }).current;

  const handlePress = (screen: Screen) => {
    // Animate scale down and back up
    Animated.sequence([
      Animated.timing(scaleAnims[screen], {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[screen], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onTabPress(screen);
  };

  const backgroundColor =
    mode === 'abundance' ? 'rgba(45, 90, 61, 0.92)' : 'rgba(13, 18, 16, 0.95)';

  const tabWidth = width * 0.85;

  return (
    <View style={[styles.floatingTabBar, { width: tabWidth, backgroundColor }]}>
      {/* Feed Tab */}
      <Pressable style={styles.floatingTab} onPress={() => handlePress('feed')}>
        <Animated.View style={{ transform: [{ scale: scaleAnims.feed }] }}>
          <Newspaper size={24} color="white" opacity={activeScreen === 'feed' ? 1.0 : 0.6} />
          {activeScreen === 'feed' && <View style={styles.tabIndicator} />}
        </Animated.View>
      </Pressable>

      {/* Map Tab */}
      <Pressable style={styles.floatingTab} onPress={() => handlePress('map')}>
        <Animated.View style={{ transform: [{ scale: scaleAnims.map }] }}>
          <MapPin size={24} color="white" opacity={activeScreen === 'map' ? 1.0 : 0.6} />
          {activeScreen === 'map' && <View style={styles.tabIndicator} />}
        </Animated.View>
      </Pressable>

      {/* Create Tab */}
      <Pressable style={styles.floatingTab} onPress={() => handlePress('create')}>
        <Animated.View style={{ transform: [{ scale: scaleAnims.create }] }}>
          <PlusCircle size={24} color="white" opacity={activeScreen === 'create' ? 1.0 : 0.6} />
          {activeScreen === 'create' && <View style={styles.tabIndicator} />}
        </Animated.View>
      </Pressable>

      {/* Messages Tab */}
      <Pressable style={styles.floatingTab} onPress={() => handlePress('messages')}>
        <Animated.View style={{ transform: [{ scale: scaleAnims.messages }] }}>
          <MessageCircle
            size={24}
            color="white"
            opacity={activeScreen === 'messages' ? 1.0 : 0.6}
          />
          {activeScreen === 'messages' && <View style={styles.tabIndicator} />}
        </Animated.View>
      </Pressable>

      {/* Settings Tab */}
      <Pressable style={styles.floatingTab} onPress={() => handlePress('settings')}>
        <Animated.View style={{ transform: [{ scale: scaleAnims.settings }] }}>
          <Settings size={24} color="white" opacity={activeScreen === 'settings' ? 1.0 : 0.6} />
          {activeScreen === 'settings' && <View style={styles.tabIndicator} />}
        </Animated.View>
      </Pressable>
    </View>
  );
}

function AppContent(): React.JSX.Element {
  const { state, setConnectivityMode, setPeerCount } = useAppContext();
  const { mode: themeMode, tokens, animatedColors } = useAnimatedTheme();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [screen, setScreen] = useState<Screen>('feed');
  const [showTooltip, setShowTooltip] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showLowBattery, setShowLowBattery] = useState(false);
  const [backgroundMesh, setBackgroundMesh] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(true);
  const [permissions, setPermissions] = useState<PermissionStatus>({
    bluetooth: 'granted',
    location: 'granted',
    nearbyDevices: 'granted',
    canUseMesh: true,
  });

  // Chat screen navigation state
  const [chatParams, setChatParams] = useState<{
    conversationId: string;
    postTitle: string;
    otherUserIdentifier: string;
  } | null>(null);

  // Real data from Supabase
  const [posts, setPosts] = useState<SharePost[]>([]);
  const [interests, setInterests] = useState<InterestAck[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Use connectivity mode from app context
  const connectivityMode = state.connectivityMode;
  const peerCount = state.peerCount;

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { user, error } = await getCurrentUser();

        if (error) {
          console.log('No active session:', error.message);
          setIsAuthenticated(false);
        } else if (user) {
          console.log('Session restored for:', user.email);
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Session check error:', err);
        setIsAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };

    checkSession();
  }, []);

  // Load posts when authenticated
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const loadPosts = async () => {
      setPostsLoading(true);
      const { posts: fetchedPosts, error } = await fetchPosts();

      if (error) {
        console.error('Error loading posts:', error.message);
        Alert.alert('Error', 'Failed to load posts: ' + error.message);
      } else {
        setPosts(fetchedPosts);
        console.log(`Loaded ${fetchedPosts.length} posts from Supabase`);
      }

      setPostsLoading(false);
    };

    loadPosts();

    // Subscribe to realtime updates
    const subscription = subscribeToPostUpdates(
      newPost => {
        console.log('New post received:', newPost.title);
        setPosts(prev => [newPost, ...prev]);
      },
      updatedPost => {
        console.log('Post updated:', updatedPost.title);
        setPosts(prev => prev.map(p => (p.id === updatedPost.id ? updatedPost : p)));
      },
      deletedPostId => {
        console.log('Post deleted:', deletedPostId);
        setPosts(prev => prev.filter(p => p.id !== deletedPostId));
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [isAuthenticated, currentUser]);

  // Load interests when authenticated
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const loadInterests = async () => {
      const { interests: fetchedInterests, error } = await fetchMyPostsInterests(currentUser.id);

      if (error) {
        console.error('Error loading interests:', error.message);
      } else {
        setInterests(fetchedInterests);
        console.log(`Loaded ${fetchedInterests.length} interests from Supabase`);
      }
    };

    loadInterests();

    // Subscribe to realtime interest updates
    const subscription = subscribeToInterestUpdates(
      currentUser.id,
      newInterest => {
        console.log('New interest received');
        setInterests(prev => [newInterest, ...prev]);
      },
      updatedInterest => {
        console.log('Interest updated');
        setInterests(prev => prev.map(i => (i.id === updatedInterest.id ? updatedInterest : i)));
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [isAuthenticated, currentUser]);

  const handleRefresh = useCallback(async () => {
    if (!currentUser) return;

    setRefreshing(true);

    // Reload posts
    const { posts: fetchedPosts, error: postsError } = await fetchPosts();
    if (!postsError) {
      setPosts(fetchedPosts);
    }

    // Reload interests
    const { interests: fetchedInterests, error: interestsError } = await fetchMyPostsInterests(
      currentUser.id,
    );
    if (!interestsError) {
      setInterests(fetchedInterests);
    }

    setRefreshing(false);
  }, [currentUser]);

  const handleInterestPress = useCallback(
    async (postId: string) => {
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to express interest');
        return;
      }

      const { interest, error } = await expressInterest(
        postId,
        currentUser.id,
        currentUser.userIdentifier,
      );

      if (error) {
        Alert.alert('Error', 'Failed to express interest: ' + error.message);
      } else if (interest) {
        // Ask user if they want to send an initial message
        Alert.alert('Interest Sent!', 'Would you like to send a message to the post author?', [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: () => {
              Alert.alert('Success', 'Your interest has been sent to the post author!');
            },
          },
          {
            text: 'Send Message',
            onPress: async () => {
              // Fetch conversations to find the one just created
              const { fetchConversations } = await import('./src/services/messaging.service');
              const { conversations } = await fetchConversations(currentUser.id);
              const conversation = conversations.find(c => c.interestId === interest.id);

              if (conversation) {
                // Navigate to chat screen
                setScreen('messages');
                setChatParams({
                  conversationId: conversation.id,
                  postTitle: conversation.postTitle,
                  otherUserIdentifier: conversation.otherUserIdentifier,
                });
              } else {
                Alert.alert(
                  'Error',
                  'Could not find conversation. Please try again from the Messages tab.',
                );
              }
            },
          },
        ]);
        console.log('Interest expressed:', interest);
      }
    },
    [currentUser],
  );

  const handlePermissionPress = useCallback((permission: MeshPermission) => {
    console.log('Permission pressed:', permission);
  }, []);

  const handlePostSubmit = useCallback(
    async (data: { title: string; description: string; riskTier: RiskTier; imageUrl?: string }) => {
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to create a post');
        return;
      }

      const postData: CreatePostData = {
        title: data.title,
        description: data.description,
        riskTier: data.riskTier,
        imageUrl: data.imageUrl, // Pass imageUrl to posts service
      };

      const { post, error } = await createPost(
        postData,
        currentUser.id,
        currentUser.userIdentifier,
      );

      if (error) {
        Alert.alert('Error', 'Failed to create post: ' + error.message);
      } else {
        const successMessage = data.imageUrl 
          ? 'Your post with image has been created!' 
          : 'Your post has been created!';
        Alert.alert('Success', successMessage);
        console.log('Post created:', post);
        setScreen('feed');

        // Refresh posts to show the new one
        handleRefresh();
      }
    },
    [currentUser, handleRefresh],
  );

  const cycleConnectivity = useCallback(() => {
    const modes: ConnectivityMode[] = ['online', 'offline'];
    const currentIndex = modes.indexOf(connectivityMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setConnectivityMode(nextMode);
  }, [connectivityMode, setConnectivityMode]);

  const cyclePeerCount = useCallback(() => {
    const newCount = (peerCount + 1) % 6;
    setPeerCount(newCount);
  }, [peerCount, setPeerCount]);

  const handleLogin = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    setAuthLoading(true);

    try {
      const { user, error } = await signIn(email, password);

      if (error) {
        setAuthError(error.message);
        Alert.alert('Login Failed', error.message);
        return;
      }

      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        console.log('Login successful:', user.email);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setAuthError(errorMessage);
      Alert.alert('Login Error', errorMessage);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleSwitchToRegister = useCallback(() => {
    setAuthMode('register');
    setAuthError(null);
  }, []);

  const handleSwitchToLogin = useCallback(() => {
    setAuthMode('login');
    setAuthError(null);
  }, []);

  const handleRegister = useCallback(async (data: RegisterData) => {
    setAuthError(null);
    setAuthLoading(true);

    try {
      const { user, error } = await register(data);

      if (error) {
        setAuthError(error.message);
        Alert.alert('Registration Failed', error.message);
        return;
      }

      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        console.log('Registration successful:', user.email);
        Alert.alert(
          'Welcome to Knit!',
          `Your account has been created successfully. Welcome, ${user.fullName}!`,
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setAuthError(errorMessage);
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleForgotPassword = useCallback(async () => {
    Alert.prompt(
      'Reset Password',
      'Enter your email address to receive a password reset link',
      async email => {
        if (email) {
          const { error } = await resetPassword(email);

          if (error) {
            Alert.alert('Error', error.message);
          } else {
            Alert.alert(
              'Check Your Email',
              'If an account exists with that email, you will receive a password reset link.',
            );
          }
        }
      },
      'plain-text',
    );
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      const { error } = await authSignOut();

      if (error) {
        Alert.alert('Logout Error', error.message);
        return;
      }

      setCurrentUser(null);
      setIsAuthenticated(false);
      console.log('Logout successful');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      Alert.alert('Logout Error', errorMessage);
    }
  }, []);

  // Navigation handler for messaging screens
  const navigation = {
    navigate: (screenName: string, params?: any) => {
      if (screenName === 'Chat') {
        setChatParams(params);
      }
    },
    goBack: () => {
      setChatParams(null);
    },
  };

  // Dynamic styles based on theme
  const containerStyle = {
    backgroundColor: animatedColors.backgroundPrimary,
  };

  const headerStyle = {
    backgroundColor: animatedColors.backgroundCard,
  };

  // Show loading screen while checking session
  if (authLoading) {
    return (
      <View style={[styles.container, containerStyle, styles.loadingContainer]}>
        <StatusBar
          barStyle={themeMode === 'survival' ? 'light-content' : 'dark-content'}
          backgroundColor={animatedColors.backgroundSecondary}
        />
        <Image
          source={require('./src/assets/knit-logo.png')}
          style={styles.loadingLogo}
          resizeMode="contain"
        />
        <Text style={[styles.loadingText, { color: animatedColors.textPrimary }]}>Loading...</Text>
      </View>
    );
  }

  // Show login/register screen if not authenticated
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, containerStyle]}>
        <StatusBar
          barStyle={themeMode === 'survival' ? 'light-content' : 'dark-content'}
          backgroundColor={animatedColors.backgroundSecondary}
        />

        {authMode === 'login' ? (
          <LoginScreen
            onLogin={handleLogin}
            onSwitchToRegister={handleSwitchToRegister}
            onForgotPassword={handleForgotPassword}
            serverError={authError}
          />
        ) : (
          <RegisterScreen
            onRegister={handleRegister}
            onSwitchToLogin={handleSwitchToLogin}
            serverError={authError}
          />
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, containerStyle]}>
      <StatusBar
        barStyle={themeMode === 'survival' ? 'light-content' : 'dark-content'}
        backgroundColor={animatedColors.backgroundSecondary}
      />

      {/* Connection Restored Celebration */}
      <ConnectionCelebration />

      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={[styles.header, headerStyle]}>
          <Image
            source={require('./src/assets/header.png')}
            style={styles.headerImage}
            resizeMode="cover"
          />
        </View>
      </View>

      <PresenceTooltip
        visible={showTooltip}
        peerCount={peerCount}
        connectivityMode={connectivityMode}
        onClose={() => setShowTooltip(false)}
      />

      {/* Dynamic Island - Replaces ConnectivityBanner */}
      <View style={styles.dynamicIslandContainer}>
        <DynamicIsland
          connectivityMode={connectivityMode}
          peerCount={peerCount}
          isDiscovering={isDiscovering}
          onPress={cycleConnectivity}
          testID="dynamic-island"
        />
      </View>

      {/* Low Battery Notice */}
      <LowBatteryNotice
        batteryLevel={12}
        visible={showLowBattery}
        onDismiss={() => setShowLowBattery(false)}
      />

      {/* Screen Content */}
      {screen === 'feed' && (
        <View style={styles.screenContent}>
          {/* Show pending interests for user's posts */}
          {interests.filter(i => i.status === 'pending').length > 0 && (
            <View style={styles.interestContainer}>
              {interests
                .filter(i => i.status === 'pending')
                .slice(0, 1)
                .map(interest => {
                  const post = posts.find(p => p.id === interest.postId);
                  return (
                    <InterestNotificationCard
                      key={interest.id}
                      interest={interest}
                      postTitle={post?.title || 'Unknown Post'}
                      onAccept={async () => {
                        const { error } = await updateInterestStatus(interest.id, 'accepted');
                        if (error) {
                          Alert.alert('Error', 'Failed to accept interest');
                        } else {
                          Alert.alert('Success', 'Interest accepted!');
                          handleRefresh();
                        }
                      }}
                      onDecline={async () => {
                        const { error } = await updateInterestStatus(interest.id, 'declined');
                        if (error) {
                          Alert.alert('Error', 'Failed to decline interest');
                        } else {
                          Alert.alert('Success', 'Interest declined');
                          handleRefresh();
                        }
                      }}
                    />
                  );
                })}
            </View>
          )}

          {postsLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: animatedColors.textPrimary }]}>
                Loading posts...
              </Text>
            </View>
          ) : posts.length === 0 ? (
            <View style={styles.emptyState}>
              <Newspaper size={48} color={animatedColors.textMuted} />
              <Text style={[styles.emptyStateText, { color: animatedColors.textSecondary }]}>
                No posts yet
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: animatedColors.textMuted }]}>
                Be the first to share food in your neighborhood!
              </Text>
            </View>
          ) : (
            <FeedList
              posts={posts}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              onInterestPress={handleInterestPress}
            />
          )}
        </View>
      )}

      {screen === 'create' && (
        <ScrollView style={styles.screenContent}>
          <PostCreatorForm onSubmit={handlePostSubmit} />
        </ScrollView>
      )}

      {screen === 'map' && (
        <ScrollView style={styles.screenContent}>
          <View style={[styles.mapContainer, { backgroundColor: animatedColors.backgroundCard }]}>
            <Text style={[styles.sectionTitle, { color: animatedColors.textPrimary }]}>
              Nearby Food Shares
            </Text>
            <View style={styles.mapPlaceholder}>
              <MapPin size={48} color={animatedColors.textMuted} />
              <Text style={[styles.mapPlaceholderText, { color: animatedColors.textSecondary }]}>
                Map view showing general areas of food shares
              </Text>
              <Text style={[styles.mapPlaceholderSubtext, { color: animatedColors.textMuted }]}>
                {peerCount} active user{peerCount !== 1 ? 's' : ''} nearby
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {screen === 'messages' && !chatParams && currentUser && (
        <View style={styles.screenContent}>
          <MessagesScreen
            navigation={navigation}
            userId={currentUser.id}
            userIdentifier={currentUser.userIdentifier}
          />
        </View>
      )}

      {chatParams && currentUser && (
        <View style={styles.screenContent}>
          <ChatScreen
            route={{ params: chatParams }}
            userId={currentUser.id}
            userIdentifier={currentUser.userIdentifier}
          />
          <Pressable
            style={[styles.backButton, { backgroundColor: animatedColors.backgroundCard }]}
            onPress={() => navigation.goBack()}>
            <Text style={[styles.backButtonText, { color: animatedColors.textPrimary }]}>
              ← Back
            </Text>
          </Pressable>
        </View>
      )}

      {screen === 'settings' && (
        <ScrollView style={styles.screenContent}>
          <View
            style={[styles.settingsSection, { backgroundColor: animatedColors.backgroundCard }]}>
            <Text style={[styles.sectionTitle, { color: animatedColors.textPrimary }]}>
              Permissions
            </Text>
            <PermissionStatusBar
              permissionStatus={permissions}
              onPermissionPress={handlePermissionPress}
              isBluetoothEnabled={true}
            />
          </View>

          <View
            style={[styles.settingsSection, { backgroundColor: animatedColors.backgroundCard }]}>
            <Text style={[styles.sectionTitle, { color: animatedColors.textPrimary }]}>
              Battery & Mesh
            </Text>
            <BackgroundMeshToggle enabled={backgroundMesh} onToggle={setBackgroundMesh} />
          </View>

          <View
            style={[styles.settingsSection, { backgroundColor: animatedColors.backgroundCard }]}>
            <Text style={[styles.sectionTitle, { color: animatedColors.textPrimary }]}>
              Demo Controls
            </Text>
            <Pressable
              style={[styles.demoButton, { backgroundColor: tokens.colors.accentPrimary + '20' }]}
              onPress={() => setShowLowBattery(!showLowBattery)}>
              <Text style={[styles.demoButtonText, { color: animatedColors.accentPrimary }]}>
                Toggle Low Battery Notice
              </Text>
            </Pressable>
            <Pressable
              style={[styles.demoButton, { backgroundColor: tokens.colors.accentPrimary + '20' }]}
              onPress={() => setIsDiscovering(!isDiscovering)}>
              <Text style={[styles.demoButtonText, { color: animatedColors.accentPrimary }]}>
                Toggle Mesh Discovery
              </Text>
            </Pressable>
            <Pressable
              style={[styles.demoButton, { backgroundColor: tokens.colors.accentPrimary + '20' }]}
              onPress={() => {
                setPermissions(prev => ({
                  ...prev,
                  bluetooth: prev.bluetooth === 'granted' ? 'denied' : 'granted',
                  canUseMesh: prev.bluetooth !== 'granted',
                }));
              }}>
              <Text style={[styles.demoButtonText, { color: animatedColors.accentPrimary }]}>
                Toggle Bluetooth Permission
              </Text>
            </Pressable>
          </View>

          <View
            style={[styles.settingsSection, { backgroundColor: animatedColors.backgroundCard }]}>
            <Text style={[styles.sectionTitle, { color: animatedColors.textPrimary }]}>
              Account
            </Text>
            {currentUser && (
              <View style={styles.userInfo}>
                <Text style={[styles.userInfoLabel, { color: animatedColors.textMuted }]}>
                  Signed in as
                </Text>
                <Text style={[styles.userInfoText, { color: animatedColors.textPrimary }]}>
                  {currentUser.fullName}
                </Text>
                <Text style={[styles.userInfoSubtext, { color: animatedColors.textSecondary }]}>
                  {currentUser.email}
                </Text>
                <Text style={[styles.userInfoSubtext, { color: animatedColors.textSecondary }]}>
                  {currentUser.userIdentifier}
                </Text>
              </View>
            )}
            <Pressable
              style={[styles.logoutButton, { backgroundColor: animatedColors.accentDanger }]}
              onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}

      {/* Floating Tab Bar */}
      <FloatingTabBar activeScreen={screen} onTabPress={setScreen} mode={themeMode} />
    </SafeAreaView>
  );
}

function App(): React.JSX.Element {
  return (
    <AppProvider>
      <AnimatedThemeProvider>
        <AppContent />
      </AnimatedThemeProvider>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    borderRadius: 20,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    height: 60,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  dynamicIslandContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  screenContent: {
    flex: 1,
    paddingBottom: 90,
  },
  interestContainer: {
    padding: 16,
  },
  settingsSection: {
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'sans-serif',
  },
  demoButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  demoButtonText: {
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  floatingTabBar: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 6,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 16,
  },
  floatingTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tabIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
    marginTop: 4,
  },
  mapContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
  },
  mapPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  mapPlaceholderText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  messagesContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'sans-serif',
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  logoutButton: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  userInfo: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    marginBottom: 8,
  },
  userInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  userInfoText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'sans-serif',
  },
  userInfoSubtext: {
    fontSize: 14,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
});

export default App;
