import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { AuthInput } from '../components/auth/AuthInput';
import { AuthButton } from '../components/auth/AuthButton';
import { validateEmail, validatePassword } from '../utils/validation';

const { height } = Dimensions.get('window');

interface LoginScreenProps {
  onLogin: (email: string, password: string) => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
  serverError?: string | null;
}

/**
 * LoginScreen Component
 * Clean, beautiful login interface for returning users
 * Requirements: 1.1-1.4, 2.1-2.7, 6.1-6.7, 7.1-7.2
 */
export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onSwitchToRegister,
  onForgotPassword,
  serverError,
}) => {
  const { tokens } = useTheme();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Error state
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  // Loading state
  const [loading, setLoading] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Validation handlers
  const handleEmailBlur = () => {
    const error = validateEmail(email);
    setEmailError(error);
  };

  const handlePasswordBlur = () => {
    const error = validatePassword(password);
    setPasswordError(error);
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      email.trim() !== '' &&
      password.trim() !== '' &&
      validateEmail(email) === null &&
      validatePassword(password) === null
    );
  };

  // Handle login submission
  const handleLogin = () => {
    // Validate all fields
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    
    if (!emailErr && !passwordErr) {
      setLoading(true);
      onLogin(email, password);
      // Note: Loading state should be reset by parent component
    }
  };

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={[
          tokens.colors.backgroundPrimary,
          tokens.colors.backgroundSecondary,
          tokens.colors.backgroundPrimary,
        ]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative circles */}
      <View style={[styles.decorativeCircle, styles.circle1, { backgroundColor: tokens.colors.accentPrimary + '10' }]} />
      <View style={[styles.decorativeCircle, styles.circle2, { backgroundColor: tokens.colors.accentSecondary + '15' }]} />
      <View style={[styles.decorativeCircle, styles.circle3, { backgroundColor: tokens.colors.accentPrimary + '08' }]} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: '#FBF4EE' + '99', // Warm beige matching logo background, 60% opacity
                shadowColor: tokens.colors.shadowColor,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Backdrop blur effect simulation with border */}
            <View style={[styles.cardBorder, { borderColor: tokens.colors.borderDefault + '40' }]} />
            
            {/* Logo with animation */}
            <Animated.View
              style={{
                transform: [
                  { scale: Animated.multiply(logoScaleAnim, pulseAnim) }
                ],
              }}
            >
              <Image
                source={require('../assets/knit-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>

            {/* Title */}
            <Text
              style={[
                styles.title,
                {
                  color: tokens.colors.accentPrimary,
                },
              ]}
            >
              Welcome Back
            </Text>

            {/* Subtitle */}
            <Text
              style={[
                styles.subtitle,
                {
                  color: tokens.colors.textPrimary,
                },
              ]}
            >
              Sign in to connect with your community
            </Text>

            {/* Server Error Display */}
            {serverError && (
              <View style={[styles.errorBanner, { backgroundColor: tokens.colors.accentDanger + '15' }]}>
                <Text style={[styles.errorText, { color: tokens.colors.accentDanger }]}>
                  {serverError}
                </Text>
              </View>
            )}

            {/* Email Input */}
            <AuthInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError || undefined}
              onBlur={handleEmailBlur}
            />

            {/* Password Input */}
            <AuthInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              error={passwordError || undefined}
              onBlur={handlePasswordBlur}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={onForgotPassword}
              style={styles.forgotPasswordContainer}
            >
              <Text
                style={[
                  styles.forgotPasswordText,
                  {
                    color: tokens.colors.accentPrimary,
                  },
                ]}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <AuthButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              disabled={!isFormValid()}
            />

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: tokens.colors.borderDefault }]} />
              <Text style={[styles.dividerText, { color: tokens.colors.textMuted }]}>or</Text>
              <View style={[styles.divider, { backgroundColor: tokens.colors.borderDefault }]} />
            </View>

            {/* Switch to Register Link */}
            <TouchableOpacity
              onPress={onSwitchToRegister}
              style={styles.switchModeContainer}
            >
              <Text
                style={[
                  styles.switchModeText,
                  {
                    color: tokens.colors.textSecondary,
                  },
                ]}
              >
                New to Knit?{' '}
                <Text
                  style={{
                    color: tokens.colors.accentPrimary,
                    fontWeight: '700',
                  }}
                >
                  Create Account
                </Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 9999,
  },
  circle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: -50,
    left: -50,
  },
  circle3: {
    width: 150,
    height: 150,
    top: height * 0.4,
    left: -75,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 40,
  },
  card: {
    padding: 40,
    borderRadius: 32,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
    borderWidth: 1,
    pointerEvents: 'none',
  },
  logo: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia-Bold' : 'serif',
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  switchModeContainer: {
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 15,
  },
  errorBanner: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
