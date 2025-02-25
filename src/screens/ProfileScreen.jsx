import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StatusBar, 
  Alert,
  TextInput,
  Modal,
  ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://13.49.68.11:3000';

const ProfileScreen = ({ navigation, route }) => {
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
  const { signOut } = useAuth();

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
      Alert.alert('Error', 'Failed to fetch profile details');
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
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
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

      // Fetch spaces count
      console.log('Fetching spaces...');
      const spacesResponse = await axios.get(`${BASE_URL}/spaces/user`, { headers });
      console.log('Spaces response:', spacesResponse.data);
      const spacesCount = spacesResponse.data?.data?.length || 0;

      // Fetch products count
      console.log('Fetching products...');
      const productsResponse = await axios.get(`${BASE_URL}/products`, { headers });
      console.log('Products response:', productsResponse.data);
      const productsCount = productsResponse.data?.data?.length || 0;

      // Fetch collections count
      console.log('Fetching collections...');
      const collectionsResponse = await axios.get(`${BASE_URL}/collections/user/collections`, { headers });
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
      Alert.alert('Error', 'Failed to fetch profile details');
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
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Image 
              source={require('../assets/images/arrow_back.png')} 
              style={[styles.icon, { tintColor: '#FFFFFF' }]}
            />
          </TouchableOpacity>
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

export default ProfileScreen;
