import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const SubscriptionScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <StatusBar 
        backgroundColor="#2D2A54" 
        barStyle="light-content" 
      />
      <LinearGradient
        colors={['#2D2A54', '#1E1B3E']}
        style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Image
              source={require('../assets/images/arrow_back.png')}
              style={[styles.backIcon, {tintColor: '#FFFFFF'}]}
            />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.topSection}>
            <View style={styles.rocketContainer}>
              <Text style={styles.rocketEmoji}>🚀</Text>
            </View>
            <Text style={styles.comingSoonText}>Coming Soon!</Text>
            <Text style={styles.subtitleText}>
              Exciting subscription plans are on the way. Stay tuned!
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureCard}>
              <View style={styles.iconContainer}>
                <Text style={styles.featureIcon}>👑</Text>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Premium Features</Text>
                <Text style={styles.featureDescription}>
                  Access exclusive content and premium features
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.iconContainer}>
                <Text style={styles.featureIcon}>⚡</Text>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Unlimited Storage</Text>
                <Text style={styles.featureDescription}>
                  Unlimited spaces & collections for all your items
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.iconContainer}>
                <Text style={styles.featureIcon}>💎</Text>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Exclusive Access</Text>
                <Text style={styles.featureDescription}>
                  Be the first to try new features
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.notifyButton}>
            <Text style={styles.notifyButtonText}>Get Notified</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  topSection: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  rocketContainer: {
    marginBottom: 20,
  },
  rocketEmoji: {
    fontSize: 40,
  },
  comingSoonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: '#B8B8D0',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#B8B8D0',
  },
  notifyButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
  },
  notifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SubscriptionScreen;
