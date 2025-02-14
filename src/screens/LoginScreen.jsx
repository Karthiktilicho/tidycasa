import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, StatusBar, Alert, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://13.49.68.11:3000';

const BackgroundPattern = () => (
  <View style={styles.backgroundPattern}>
    <LinearGradient
      colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.diagonalStripe}
    />
    <LinearGradient
      colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[styles.diagonalStripe, { top: '30%' }]}
    />
  </View>
);

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    // Validate inputs first
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email');
      return;
    }

    if (!password) {
      Alert.alert('Validation Error', 'Please enter your password');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting login with email:', email.trim());

      const response = await axios.post(
        `${BASE_URL}/auth/login`,
        {
          email: email.trim(),
          password: password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 seconds timeout
        }
      );

      console.log('Login Response:', JSON.stringify(response.data, null, 2));

      // More robust response checking
      if (response.data && 
          (response.data.status === "success" || response.data.token)) {
        const token = response.data.data?.token || response.data.token;
        const refreshToken = response.data.data?.refreshToken || response.data.refreshToken;

        if (!token) {
          throw new Error('No authentication token received');
        }

        // Store tokens and user info
        await AsyncStorage.multiSet([
          ['userEmail', email],
          ['token', token],
          ['refreshToken', refreshToken || ''],
          ['keepSignedIn', keepSignedIn ? 'true' : 'false']
        ]);

        // Ensure sign in context is updated
        await signIn({ token, refreshToken });

        // Reset loading state before navigation
        setLoading(false);

        // Navigate to Home screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }]
        });
      } else {
        // Handle unexpected response structure
        throw new Error('Invalid login response');
      }
    } catch (error) {
      // Reset loading state
      setLoading(false);

      // Comprehensive error handling
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with an error
          console.error('Login error response:', error.response.data);
          const errorMessage = error.response.data.message || 
                               error.response.data.error || 
                               'Login failed. Please try again.';
          Alert.alert('Login Error', errorMessage);
        } else if (error.request) {
          // Request made but no response received
          console.error('No response received:', error.request);
          Alert.alert('Network Error', 'Unable to connect to the server. Please check your internet connection.');
        } else {
          // Something else went wrong
          console.error('Login error:', error.message);
          Alert.alert('Error', error.message || 'An unexpected error occurred. Please try again.');
        }
      } else {
        // Non-axios error
        console.error('Unexpected login error:', error);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6B46C1" barStyle="light-content" />
      <BackgroundPattern />
      
      <View style={styles.logoContainer}>
        <View style={styles.shadowCircle2}>
          <View style={styles.shadowCircle1}>
            <View style={styles.logoCircle}>
              <Image 
                source={require('../assets/images/Logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Welcome back to tidycasa</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#A0AEC0"
              editable={!loading}
            />
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
              }}
              secureTextEntry={!showPassword}
              placeholderTextColor="#A0AEC0"
              editable={!loading}
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={togglePasswordVisibility}
              disabled={loading}
            >
              <Image 
                source={showPassword ? require('../assets/images/Eye.png') : require('../assets/images/EyeOff.png')} 
                style={styles.eyeIconImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setKeepSignedIn(!keepSignedIn)}
              disabled={loading}
            >
              <View style={[styles.checkbox, keepSignedIn && styles.checkboxChecked]}>
                {keepSignedIn && (
                  <Image 
                    source={require('../assets/images/Check.png')}
                    style={styles.checkmark}
                    resizeMode="contain"
                  />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Keep me signed in</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => navigation.navigate('ForgotPassword')}
              disabled={loading}
            >
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign in with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} disabled={loading}>
              <Image 
                source={require("../assets/images/Apple.png")} 
                style={styles.socialLogo}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} disabled={loading}>
              <Image 
                source={require("../assets/images/Google.png")} 
                style={styles.socialLogo}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} disabled={loading}>
              <Image 
                source={require("../assets/images/Facebook.png")} 
                style={styles.socialLogo}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Do not have an account? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('CreateAccount')}
              disabled={loading}
            >
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B46C1',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  diagonalStripe: {
    position: 'absolute',
    width: '200%',
    height: 300,
    transform: [{ rotate: '-35deg' }],
    left: '-50%',
  },
  logoContainer: {
    position: 'absolute',
    top: '8%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  shadowCircle2: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowCircle1: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 80,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    width: '100%',
    marginTop: '35%',
    paddingTop: 30,
    paddingBottom: 30,
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B46C1',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 32,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  passwordContainer: {
    width: '100%',
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: '#F7FAFC',
    borderRadius: 28,
    paddingHorizontal: 24,
    fontSize: 16,
    color: '#4A5568',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    top: 16,
    padding: 5,
  },
  eyeIconImage: {
    width: 24,
    height: 24,
    opacity: 0.6,
  },
  optionsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#6B46C1',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6B46C1',
  },
  checkmark: {
    width: 12,
    height: 12,
    tintColor: '#FFFFFF',
  },
  checkboxLabel: {
    color: '#4A5568',
    fontSize: 14,
  },
  forgotPassword: {
    color: '#6B46C1',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#6B46C1',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    color: '#718096',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 24,
    marginBottom: 24,
  },
  socialButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  socialLogo: {
    width: 24,
    height: 24,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
  },
  signupText: {
    color: '#718096',
    fontSize: 14,
  },
  signupLink: {
    color: '#6B46C1',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default LoginScreen;