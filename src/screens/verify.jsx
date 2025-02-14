import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, StatusBar } from 'react-native';
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
      style={[styles.diagonalStripe, { top: '30%' }]}
    />
  </View>
);

const VerificationCode = ({ navigation }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState('');
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    if (text.length > 1) text = text.charAt(0);
    let newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setOtpError('');

    if (text && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (key, index) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    // Reset error
    setOtpError('');

    // Check if OTP is complete
    if (otp.some(digit => !digit.trim())) {
      setOtpError('Please enter the complete verification code');
      return;
    }

    // Check if OTP is numeric
    if (otp.some(digit => isNaN(digit))) {
      setOtpError('Verification code must contain only numbers');
      return;
    }

    // Proceed to new password screen
    navigation.navigate('NewPassword');
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
              onPress={() => navigation.goBack()}
            >
              <Image 
                source={require('../assets/images/arrow_back.png')}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <Text style={styles.title}>Verification</Text>
          </View>

          <Text style={styles.subtitle}>Enter Verification Code</Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(input) => (inputs.current[index] = input)}
                style={[styles.otpInput, otpError && styles.inputError]}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={({ nativeEvent: { key } }) => handleBackspace(key, index)}
                keyboardType="numeric"
                maxLength={1}
              />
            ))}
          </View>
          {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>If don't receive code! </Text>
            <TouchableOpacity onPress={() => console.log("Resend code")}>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleVerify}
          >
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

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
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 30,
  },
  otpInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    fontSize: 20,
    textAlign: 'center',
    backgroundColor: '#F5F5F5',
    color: '#1A1A1A',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  resendText: {
    color: '#666666',
    fontSize: 14,
  },
  resendLink: {
    color: '#6B46C1',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#6B46C1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default VerificationCode;
