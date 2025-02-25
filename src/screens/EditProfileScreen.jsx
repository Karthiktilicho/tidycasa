import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import Snackbar from 'react-native-snackbar';

const EditProfileScreen = ({navigation, route}) => {
  const {initialName, initialPhone, initialProfileImage} = route.params || {};
  const [profileImage, setProfileImage] = useState(
    initialProfileImage
      ? {uri: initialProfileImage}
      : require('../assets/images/profile.png'),
  );
  const [userProfile, setUserProfile] = useState({
    name: initialName || '',
    phone: initialPhone || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Update profile image when route params change
    if (route.params?.initialProfileImage) {
      setProfileImage({uri: route.params.initialProfileImage});
    }
  }, [route.params?.initialProfileImage]);

  const handleUpdateProfile = async () => {
    if (!userProfile.name) {
      // Alert.alert('Error', 'Name is required');
      Snackbar.show('Error', 'Name is required', Snackbar.LENGTH_SHORT);
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const formData = new FormData();
      formData.append('username', userProfile.name);
      formData.append('phone_number', userProfile.phone);

      // Only append profile image if it's from gallery (has uri)
      if (profileImage.uri && !profileImage.uri.startsWith('http')) {
        const imageFile = {
          uri: profileImage.uri,
          type: 'image/jpeg',
          name: 'profile_image.jpg',
        };
        console.log('Uploading image:', imageFile);
        formData.append('profile_image', imageFile);
      }

      console.log('Sending form data:', formData);
      const response = await axios.put(
        'http://13.49.68.11:3000/profile/update-profile',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        },
      );

      console.log('Update response:', response.data);

      if (response.data) {
        // Get the updated profile to ensure we have the latest data
        const profileResponse = await axios.get(
          'http://13.49.68.11:3000/profile',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        const updatedProfileData = profileResponse.data.data;

        // Alert.alert(
        //   'Success',
        //   'Profile updated successfully',
        //   [
        //     {
        //       text: 'OK',
        //       onPress: () => {
        //         // Navigate back with the latest profile data
        //         navigation.navigate('Profile', {
        //           refresh: true,
        //           updatedProfile: {
        //             name: updatedProfileData.name,
        //             phone: updatedProfileData.phone_number,
        //             profile_image: updatedProfileData.profile_image,
        //           },
        //         });
        //       },
        //     },
        //   ],
        //   {cancelable: false},
        // );

        Snackbar.show({
          text: 'Error, Name is required',
          duration: Snackbar.LENGTH_INDEFINITE,
          action: {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Profile', {
                refresh: true,
                updatedProfile: {
                  name: updatedProfileData.name,
                  phone: updatedProfileData.phone_number,
                  profile_image: updatedProfileData.profile_image,
                },
              });
            },
          },
        });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      console.error('Error response:', error.response?.data);
      // Alert.alert(
      //   'Error',
      //   error.response?.data?.message || 'Failed to update profile',
      // );
      Snackbar.show(
        error.response?.data?.message || 'Failed to update profile',
        Snackbar.LENGTH_SHORT,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePick = async () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    };

    try {
      const result = await launchImageLibrary(options);

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        // Alert.alert('Error', 'Failed to pick image');
        Snackbar.show('Failed to pick image', Snackbar.LENGTH_SHORT);
        return;
      }

      if (result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];
        // Check file size (limit to 5MB)
        if (selectedImage.fileSize > 5 * 1024 * 1024) {
          // Alert.alert('Error', 'Image size should be less than 5MB');
          Snackbar.show(
            'Image size should be less than 5MB',
            Snackbar.LENGTH_SHORT,
          );
          return;
        }

        console.log('Selected image:', selectedImage);
        setProfileImage({
          uri: selectedImage.uri,
          type: selectedImage.type || 'image/jpeg',
          name: selectedImage.fileName || 'profile_image.jpg',
        });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      // Alert.alert('Error', 'Failed to pick image');
      Snackbar.show('Failed to pick image', Snackbar.LENGTH_SHORT);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <StatusBar backgroundColor="#6B46C1" barStyle="light-content" />

      <LinearGradient colors={['#6B46C1', '#9F7AEA']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../assets/images/arrow_back.png')}
              style={[styles.icon, {tintColor: '#FFFFFF'}]}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleUpdateProfile} disabled={isLoading}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileImageContainer}>
          <Image source={profileImage} style={styles.profileImage} />
          <TouchableOpacity
            style={styles.editIconContainer}
            onPress={handleImagePick}>
            <Image
              source={require('../assets/images/Edit.png')}
              style={[styles.editIcon, {resizeMode: 'contain'}]}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={userProfile.name}
            onChangeText={text =>
              setUserProfile(prev => ({...prev, name: text}))
            }
            placeholderTextColor="#666666"
            placeholder="Enter your name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={userProfile.phone}
            onChangeText={text =>
              setUserProfile(prev => ({...prev, phone: text}))
            }
            keyboardType="phone-pad"
            placeholderTextColor="#666666"
            placeholder="Enter your phone number"
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 40,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  icon: {
    width: 24,
    height: 24,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIconContainer: {
    position: 'absolute',
    right: '35%',
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 8,
    elevation: 3,
  },
  editIcon: {
    width: 20,
    height: 20,
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
});

export default EditProfileScreen;
