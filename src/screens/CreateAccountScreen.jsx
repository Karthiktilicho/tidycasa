import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
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

const CreateAccountScreen = ({navigation}) => {
  return (
    <ScrollView style={styles.container}>
      <StatusBar backgroundColor="#6B46C1" barStyle="light-content" />
      <BackgroundPattern />

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.navigate('Home')}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Get start with tidy casa</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('CreateAccountDetails')}>
            <Image
              source={require('../assets/images/User.png')}
              style={styles.buttonIcon}
              resizeMode="contain"
            />
            <Text style={styles.buttonText}>Use phone or email</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Image
              source={require('../assets/images/Apple.png')}
              style={styles.buttonIcon}
              resizeMode="contain"
            />
            <Text style={styles.buttonText}>Sign with apple</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Image
              source={require('../assets/images/Google.png')}
              style={styles.buttonIcon}
              resizeMode="contain"
            />
            <Text style={styles.buttonText}>Sign with google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Image
              source={require('../assets/images/Facebook.png')}
              style={styles.buttonIcon}
              resizeMode="contain"
            />
            <Text style={styles.buttonText}>Sign with facebook</Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('LoginScreen')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
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
    transform: [{rotate: '-35deg'}],
    left: '-50%',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    width: '100%',
    marginTop: '50%',
    paddingTop: 40,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: '#6B46C1',
    fontWeight: '600',
    textAlign: 'left',
    marginBottom: 8,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    width: '100%',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 0,
    marginBottom: 16,
  },
  buttonIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    marginLeft: 50,
  },
  buttonText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
    flex: 1,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#666666',
  },
  loginLink: {
    fontSize: 14,
    color: '#6B46C1',
    fontWeight: '600',
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 2,
    padding: 10,
  },
  skipText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default CreateAccountScreen;
