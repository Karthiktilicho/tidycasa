import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, StatusBar, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { getUserProfile } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    collections: 0,
    spaces: 0,
    products: 0
  });
  const { signOut } = useAuth();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile();
      setUserProfile({
        name: profile.name === null ? '' : profile.name,
        email: profile.email === null ? '' : profile.email,
        phone: profile.phone === null ? '' : profile.phone,
        collections: profile.collections_count || 0,
        spaces: profile.spaces_count || 0,
        products: profile.products_count || 0
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      setUserProfile(prev => ({
        ...prev,
        name: '',
        email: '',
        phone: ''
      }));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6B46C1" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#6B46C1', '#9F7AEA']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image 
              source={require('../assets/images/arrow_back.png')} 
              style={[styles.icon, { tintColor: '#FFFFFF' }]}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 24 }} /> {/* For alignment */}
        </View>

        <View style={styles.profileInfo}>
          <Image 
            source={require('../assets/images/profile.png')}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{userProfile.name}</Text>
          <Text style={styles.email}>{userProfile.email}</Text>
          <Text style={styles.phone}>{userProfile.phone}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Image 
              source={require('../assets/images/Folder.png')}
              style={styles.statIcon}
            />
            <Text style={styles.statLabel}>Collections</Text>
            <Text style={styles.statValue}>{userProfile.collections}</Text>
          </View>

          <View style={styles.statBox}>
            <Image 
              source={require('../assets/images/Home.png')}
              style={styles.statIcon}
            />
            <Text style={styles.statLabel}>Spaces</Text>
            <Text style={styles.statValue}>{userProfile.spaces}</Text>
          </View>

          <View style={styles.statBox}>
            <Image 
              source={require('../assets/images/Product.png')}
              style={styles.statIcon}
            />
            <Text style={styles.statLabel}>Products</Text>
            <Text style={styles.statValue}>{userProfile.products}</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Menu Options */}
      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <View style={styles.menuLeft}>
            <Image 
              source={require('../assets/images/User.png')}
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Edit Profile</Text>
          </View>
          <Image 
            source={require('../assets/images/RightArrow.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <View style={styles.menuLeft}>
            <Image 
              source={require('../assets/images/Lock.png')}
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Change Password</Text>
          </View>
          <Image 
            source={require('../assets/images/RightArrow.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Subscriptions')}
        >
          <View style={styles.menuLeft}>
            <Image 
              source={require('../assets/images/Money.png')}
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Manage Subscriptions</Text>
          </View>
          <Image 
            source={require('../assets/images/RightArrow.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Feedback')}
        >
          <View style={styles.menuLeft}>
            <Image 
              source={require('../assets/images/Feedback.png')}
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Feedback</Text>
          </View>
          <Image 
            source={require('../assets/images/RightArrow.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      </View>

      <BottomNavBar navigation={navigation} currentScreen="Profile" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingBottom: 90,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  icon: {
    width: 24,
    height: 24,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  phone: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '30%',
    height: 100,
    justifyContent: 'center',
  },
  statIcon: {
    width: 22,
    height: 22,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 4
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    margin: 20,
    padding: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 22,
    height: 22,
    marginRight: 15,
    resizeMode: 'contain',
  },
  menuText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  arrowIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#E53E3E',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
