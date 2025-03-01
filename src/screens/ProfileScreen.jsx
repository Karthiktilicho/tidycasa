import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StatusBar, 
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Snackbar from '../components/Snackbar';

const BASE_URL = 'http://13.60.211.186:3000';

export const ProfileScreen = ({ navigation, route }) => {
  const [userProfile, setUserProfile] = useState({
    username: '',
    email: '',
    name: '',
    phone: '',
    profile_image: null
  });
  const [userStats, setUserStats] = useState({
    spacesCount: 0,
    productsCount: 0,
    collectionsCount: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    username: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'success'
  });
  const { signOut } = useAuth();

  const showSnackbar = (message, type = 'success') => {
    setSnackbar({
      visible: true,
      message,
      type
    });
    // Hide snackbar after 3 seconds
    setTimeout(() => {
      setSnackbar(prev => ({...prev, visible: false}));
    }, 3000);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.get(`${BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Profile response:', response.data);

      if (response.data && response.data.data) {
        const profileData = response.data.data;
        setUserProfile({
          username: profileData.username || '',
          email: profileData.email || '',
          name: profileData.name || profileData.username || '',
          phone: profileData.phone_number || '',
          profile_image: profileData.profile_image || null
        });
        setEditedProfile({
          username: profileData.username || '',
          email: profileData.email || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showSnackbar('Failed to fetch profile details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.put(
        `${BASE_URL}/profile/update-profile`,
        {
          username: editedProfile.username,
          email: editedProfile.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.status === 'success') {
        setUserProfile(editedProfile);
        setIsEditing(false);
        showSnackbar('Profile updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showSnackbar('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        throw new Error('No access token found');
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Single API call to get all stats
      console.log('Fetching user stats...');
      const response = await axios.get(`${BASE_URL}/products`, { headers });
      console.log('Stats response:', response.data);

      // Access the correct data structure from API response
      const data = response.data.data || {};
      const stats = {
        productsCount: data.totalCount || 0,
        spacesCount: data.total_spaces || 0,
        collectionsCount: data.total_collections || 0
      };

      setUserStats(stats);
      console.log('Updated stats:', stats);
    } catch (error) {
      console.error('Error fetching user stats:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      setUserStats({
        spacesCount: 0,
        productsCount: 0,
        collectionsCount: 0
      });

      showSnackbar('Failed to fetch your stats. Please try again.', 'error');
    }
  };

  const fetchProfileDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.get(`${BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Profile response:', response.data);

      if (response.data && response.data.data) {
        const profileData = response.data.data;
        setUserProfile({
          username: profileData.username || '',
          email: profileData.email || '',
          name: profileData.name || profileData.username || '',
          phone: profileData.phone_number || '',
          profile_image: profileData.profile_image
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showSnackbar('Failed to fetch profile details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchUserStats();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfile();
      fetchUserStats();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (route.params?.refresh) {
      if (route.params?.updatedProfile) {
        // Immediately update with the new data
        setUserProfile(prev => ({
          ...prev,
          name: route.params.updatedProfile.name,
          phone: route.params.updatedProfile.phone,
          profile_image: route.params.updatedProfile.profile_image
        }));
      }
      // Then fetch the full profile to ensure everything is in sync
      fetchProfileDetails();
      // Clear the params
      navigation.setParams({ refresh: undefined, updatedProfile: undefined });
    }
  }, [route.params?.refresh]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
      showSnackbar('Failed to logout', 'error');
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
          <View style={{flex: 1}} />
          <View style={{width: 24}} />
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.profileImageContainer}>
            <Image
              source={
                userProfile.profile_image
                  ? { uri: userProfile.profile_image }
                  : require('../assets/images/profile.png')
              }
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.name}>{userProfile.username}</Text>
          <Text style={styles.email}>{userProfile.email}</Text>
        </View>

        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statsBox}
            onPress={() => {
              console.log('Navigating to AllProducts');
              navigation.navigate('AllProducts');
            }}>
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

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditing}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={editedProfile.username}
              onChangeText={(text) => setEditedProfile(prev => ({...prev, username: text}))}
              placeholderTextColor="#666"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={editedProfile.email}
              onChangeText={(text) => setEditedProfile(prev => ({...prev, email: text}))}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#666"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsEditing(false);
                  setEditedProfile(userProfile);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={updateProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Menu Options */}
      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('EditProfile', {
            initialName: userProfile.name,
            initialPhone: userProfile.phone,
            initialProfileImage: userProfile.profile_image
          })}
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
          onPress={() => navigation.navigate('Subscription')}
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
      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
      />
    </View>
  );
};

export default ProfileScreen;

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
  icon: {
    width: 24,
    height: 24,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    overflow: 'hidden'
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
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
    shadowRadius: 5,
    elevation: 4,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#E53E3E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#8B4AE2',
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
