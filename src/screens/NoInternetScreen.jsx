import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';

const NoInternetScreen = ({ onRetry }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>
          <Text style={styles.tidyText}>tidy</Text>
          <Text style={styles.casaText}>casa</Text>
        </Text>
      </View>

      {/* No Internet Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/images/offline.png')}
          style={styles.noInternetImage}
          resizeMode="contain"
        />
      </View>

      {/* Error Message */}
      <View style={styles.messageContainer}>
        <Text style={styles.errorTitle}>OOPS! NO INTERNET</Text>
        <Text style={styles.errorMessage}>
          Looks like you are facing a temporary network interruption. Or check your network connection.
        </Text>
      </View>

      {/* Try Again Button */}
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <View style={styles.navItem}>
          <Image
            source={require('../assets/images/home-active.png')}
            style={styles.navIcon}
          />
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </View>
        <View style={styles.navItem}>
          <Image
            source={require('../assets/images/collections.png')}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Collections</Text>
        </View>
        <View style={styles.navItem}>
          <View style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </View>
          <Text style={styles.navText}>Add</Text>
        </View>
        <View style={styles.navItem}>
          <Image
            source={require('../assets/images/space.png')}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Space</Text>
        </View>
        <View style={styles.navItem}>
          <Image
            source={require('../assets/images/profile.png')}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Profile</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tidyText: {
    color: '#8B4AE2',
  },
  casaText: {
    color: '#1A1A1A',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noInternetImage: {
    width: '100%',
    height: '60%',
  },
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4AE2',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#8B4AE2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginHorizontal: 40,
    marginBottom: 40,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#666',
  },
  activeNavText: {
    color: '#8B4AE2',
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#8B4AE2',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
  },
});

export default NoInternetScreen;
