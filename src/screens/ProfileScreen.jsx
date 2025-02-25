import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, StatusBar, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { getUserProfile } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    collections: 0,
    spaces: 0,
    products: 0
  });
  const [userStats, setUserStats] = useState({
    spacesCount: 0,
    productsCount: 0,
    collectionsCount: 0
  });
  const { signOut } = useAuth();

  useEffect(() => {
    loadUserProfile();
    fetchUserStats();
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

  const fetchUserStats = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log('Token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        throw new Error('No access token found');
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch spaces count
      console.log('Fetching spaces...');
      const spacesResponse = await axios.get('http://13.49.68.11:3000/spaces/user', { headers });
      console.log('Spaces response:', spacesResponse.data);
      const spacesCount = spacesResponse.data?.data?.length || 0;

      // Fetch products count
      console.log('Fetching products...');
      const productsResponse = await axios.get('http://13.49.68.11:3000/products', { headers });
      console.log('Products response:', productsResponse.data);
      const productsCount = productsResponse.data?.data?.length || 0;

      // Fetch collections count
      console.log('Fetching collections...');
      const collectionsResponse = await axios.get('http://13.49.68.11:3000/collections/user/collections', { headers });
      console.log('Collections response:', collectionsResponse.data);
      const collectionsCount = collectionsResponse.data?.data?.length || 0;

      console.log('Setting stats:', { spacesCount, productsCount, collectionsCount });
      setUserStats({
        spacesCount,
        productsCount,
        collectionsCount
      });
    } catch (error) {
      console.error('Error fetching user stats:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Set default values in case of error
      setUserStats({
        spacesCount: 0,
        productsCount: 0,
        collectionsCount: 0
      });

      // Show error to user
      Alert.alert(
        'Error',
        'Failed to fetch your stats. Please check your internet connection and try again.'
      );
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserStats();
    });

    return unsubscribe;
  }, [navigation]);

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
          <TouchableOpacity
            style={styles.statsBox}
            onPress={() => navigation.navigate('Products')}>
            <Image
              source={require('../assets/images/Product.png')}
              style={styles.statsIcon}
            />
            <Text style={styles.statsText}>Products</Text>
            <Text style={styles.statsCount}>{userStats.productsCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statsBox}
            onPress={() => navigation.navigate('Spaces')}>
            <Image
              source={require('../assets/images/Home.png')}
              style={styles.statsIcon}
            />
            <Text style={styles.statsText}>Spaces</Text>
            <Text style={styles.statsCount}>{userStats.spacesCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statsBox}
            onPress={() => navigation.navigate('Collections')}>
            <Image
              source={require('../assets/images/Folder.png')}
              style={styles.statsIcon}
            />
            <Text style={styles.statsText}>Collections</Text>
            <Text style={styles.statsCount}>{userStats.collectionsCount}</Text>
          </TouchableOpacity>
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
  statsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '30%',
    height: 100,
    justifyContent: 'center',
  },
  statsIcon: {
    width: 22,
    height: 22,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  statsText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  statsCount: {
    fontSize: 16,
    color: '#6B46C1',
    fontWeight: 'bold',
    marginTop: 4,
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
