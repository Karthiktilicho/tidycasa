import React, {useState} from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

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
      style={[styles.diagonalStripe, {top: '30%'}]}
    />
  </View>
);

function ForgotPasswordScreen({navigation}) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleVerify = () => {
    // Reset error
    setEmailError('');

    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    // Proceed to verification
    navigation.navigate('Verify');
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6B46C1" barStyle="light-content" />
      <BackgroundPattern />

      <View style={styles.cardContainer}>
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

        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Image
                source={require('../assets/images/arrow_back.png')}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <Text style={styles.title}>Forgot Password</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, emailError && styles.inputError]}
              placeholder="Email Address"
              value={email}
              onChangeText={text => {
                setEmail(text);
                setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#A0AEC0"
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleVerify}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToSignIn}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backToSignInText}>Back to sign in</Text>
          </TouchableOpacity>
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
    transform: [{rotate: '-35deg'}],
    left: '-50%',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    width: '100%',
    marginTop: '50%',
    paddingTop: 80,
    paddingBottom: 30,
  },
  logoContainer: {
    position: 'absolute',
    top: -90,
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
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 80,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingRight: 45,
  },
  backButton: {
    padding: 5,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    flex: 1,
    fontSize: 24,
    color: '#6B46C1',
    fontWeight: '600',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#1A1A1A',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#6B46C1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  backToSignIn: {
    alignItems: 'center',
  },
  backToSignInText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;
