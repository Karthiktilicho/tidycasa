import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StatusBar, 
  Image,
  ActivityIndicator,
  Alert 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://192.168.0.194:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

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

function CreateAccountDetailsScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateInputs = () => {
    let isValid = true;
    
    // Reset errors
    setUsernameError('');
    setEmailError('');
    setPasswordError('');

    // Validate username
    if (!username.trim()) {
      setUsernameError('Username is required');
      isValid = false;
    }

    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      isValid = false;
    }

    return isValid;
  };

  const handleCreateAccount = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      console.log('Sending registration request with:', { username, email, password });
      
      const response = await axios.post('http://13.49.68.11:3000/auth/register', {
        username,
        email,
        password
      });

      console.log('Registration response:', response.data);

      if (response.data) {
        // Store user details from API response
        const userData = response.data.user || {};
        await AsyncStorage.setItem('userName', userData.username || username);
        await AsyncStorage.setItem('userEmail', userData.email || email);
        await AsyncStorage.setItem('userPhone', userData.phone || '');
        
        Alert.alert(
          'Success',
          'Account created successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('LoginScreen')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Registration error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || error.message || 'An error occurred during registration'
      );
    } finally {
      setLoading(false);
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
          <Text style={styles.title}>Create an Account</Text>
          <Text style={styles.subtitle}>Get start with tidy casa</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, usernameError && styles.inputError]}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setUsernameError('');
              }}
              placeholder="Enter username"
              placeholderTextColor="#A0AEC0"
              autoCapitalize="none"
              editable={!loading}
            />
            {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, emailError && styles.inputError]}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter your email"
              placeholderTextColor="#A0AEC0"
              editable={!loading}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <View style={[styles.passwordContainer, passwordError && styles.inputError]}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                }}
                secureTextEntry={!showPassword}
                placeholder="Enter your password"
                placeholderTextColor="#A0AEC0"
                editable={!loading}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <Image 
                  source={showPassword ? require('../assets/images/Eye.png') : require('../assets/images/EyeOff.png')} 
                  style={styles.eyeIconImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateAccount}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
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
    padding: 20,
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
    top: '10%',
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
    width: 100,
    height: 100,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    width: '100%',
    marginTop: '40%',
    paddingTop: 80,
    paddingBottom: 30,
  },
  contentContainer: {
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B46C1',
    marginBottom: 8,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 30,
    textAlign: 'left',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F7FAFC',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#4A5568',
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#F7FAFC',
    borderRadius: 25,
    paddingHorizontal: 20,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#4A5568',
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    top: 13,
    padding: 5,
  },
  eyeIconImage: {
    width: 20,
    height: 20,
    opacity: 0.5,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#6B46C1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
    alignSelf: 'center',
  },
  loginText: {
    color: '#718096',
  },
  loginLink: {
    color: '#6B46C1',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
});

export default CreateAccountDetailsScreen;
