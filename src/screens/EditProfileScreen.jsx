import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, TextInput, StatusBar, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';

const EditProfileScreen = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState(require('../assets/images/profile.png'));

  const handleImagePick = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
      selectionLimit: 1,
    };

    try {
      const result = await launchImageLibrary(options);
      
      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', 'Failed to pick image');
        return;
      }

      if (result.assets && result.assets[0]) {
        setProfileImage({ uri: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6B46C1" barStyle="light-content" />
      
      {/* Header with Gradient */}
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
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} /> {/* For alignment */}
        </View>

        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <Image 
            source={profileImage}
            style={styles.profileImage}
          />
          <TouchableOpacity 
            style={styles.editIconContainer}
            onPress={handleImagePick}
          >
            <Image 
              source={require('../assets/images/Edit.png')}
              style={[styles.editIcon, { resizeMode: 'contain' }]}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Form Fields */}
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value="Sindhu Mallepalli"
            placeholderTextColor="#666666"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value="sindhu@gmail.com"
            keyboardType="email-address"
            placeholderTextColor="#666666"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value="+91 70956 43265"
            keyboardType="phone-pad"
            placeholderTextColor="#666666"
          />
        </View>
      </View>
    </View>
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
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  icon: {
    width: 24,
    height: 24,
  },
  profileImageContainer: {
    alignItems: 'center',
    position: 'relative',
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    padding: 4,
    zIndex: 1,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    width: 30,
    height: 30,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
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
