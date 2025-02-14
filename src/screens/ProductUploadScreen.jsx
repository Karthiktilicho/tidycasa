import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  FlatList,
  Modal,
  PermissionsAndroid,
  Platform,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import BottomNavBar from '../components/BottomNavBar';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://13.49.68.11:3000';

const ProductUploadScreen = ({ navigation }) => {
  const [images, setImages] = useState([]);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [showSpaceInput, setShowSpaceInput] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceDescription, setNewSpaceDescription] = useState('');
  const [newSpaceImage, setNewSpaceImage] = useState(null);
  const [spaces, setSpaces] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showCollectionInput, setShowCollectionInput] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [newCollectionImage, setNewCollectionImage] = useState(null);
  const [collections, setCollections] = useState([]);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const { userToken } = useAuth();

  const checkAndroidPermissions = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      // For Android 13 and above (API level 33+)
      if (Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: 'Photo Permission',
            message: 'This app needs access to your photos to upload product images.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          return false;
        }
      } else {
        // For Android 12 and below
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Photo Permission',
            message: 'This app needs access to your photos to upload product images.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          return false;
        }
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const checkCameraPermissions = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const cameraPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera to take product photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      const storagePermission = await PermissionsAndroid.request(
        Platform.Version >= 33 
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'This app needs access to your storage to save and upload photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      return (
        cameraPermission === PermissionsAndroid.RESULTS.GRANTED &&
        storagePermission === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {
      console.warn('Permission check error:', err);
      return false;
    }
  };

  const fetchSpaces = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(`${BASE_URL}/spaces/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && Array.isArray(response.data.data)) {
        const spacesData = response.data.data.map(space => ({
          id: space.id || space.space_id,
          title: space.space_name || space.title || space.name,
          description: space.description,
          image: space.space_image
        }));
        setSpaces(spacesData);
      }
    } catch (error) {
      console.error('Error fetching spaces:', error.response?.data || error.message);
    }
  };

  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) return;

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const spaceData = {
        space_name: newSpaceName.trim(),
        description: newSpaceDescription.trim() || newSpaceName.trim(),
        space_image: newSpaceImage ? newSpaceImage.uri : null,
        total_worth: 0,
        items_count: 0
      };

      const spaceResponse = await axios.post(
        `${BASE_URL}/spaces`,
        spaceData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (spaceResponse.data) {
        const newSpace = {
          id: spaceResponse.data.id || spaceResponse.data.space_id,
          title: spaceResponse.data.space_name || spaceResponse.data.name,
          description: spaceResponse.data.description,
          image: spaceResponse.data.space_image
        };

        setSpaces(prevSpaces => [newSpace, ...prevSpaces]);
        setSelectedSpace(newSpace);
        setShowSpaceInput(false);
        setNewSpaceName('');
        setNewSpaceDescription('');
        setNewSpaceImage(null);
      }
    } catch (error) {
      console.error('Error creating space:', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCamera = async () => {
    try {
      // Check and request permissions
      const hasPermission = await checkCameraPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied', 
          'Camera and storage permissions are required to take and save photos.',
          [
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }

      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
        includeBase64: false,
        maxWidth: 1024,
        maxHeight: 1024,
        cameraType: 'back', // Use back camera by default
        presentationStyle: 'fullScreen',
      });

      if (result.didCancel) {
        console.log('User cancelled camera');
        return;
      } 
      
      if (result.errorCode) {
        console.log('Camera Error', result.errorMessage);
        Alert.alert('Camera Error', result.errorMessage || 'Failed to take photo');
        return;
      }

      if (result.assets && result.assets[0]) {
        const newImage = result.assets[0];
        console.log('Camera Image:', newImage);
        setImages([...images, newImage]);
      }
    } catch (error) {
      console.error('Camera Launch Error:', error);
      Alert.alert(
        'Camera Error', 
        'Failed to launch camera. Please check app permissions.',
        [
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
    setShowImageOptions(false);
  };

  const handleGallery = async () => {
    try {
      const hasPermission = await checkAndroidPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied', 
          'Storage permission is required to select photos.',
          [
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }

      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1, // Only allow one image
        includeBase64: false,
        maxWidth: 1024,
        maxHeight: 1024,
      });

      if (result.didCancel) {
        console.log('User cancelled image selection');
        return;
      }

      if (result.errorCode) {
        console.log('Gallery Error', result.errorMessage);
        Alert.alert('Gallery Error', result.errorMessage || 'Failed to select photo');
        return;
      }

      if (result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];
        console.log('Selected Gallery Image:', selectedImage);
        setImages([selectedImage]);
      }
    } catch (error) {
      console.error('Gallery Launch Error:', error);
      Alert.alert(
        'Gallery Error', 
        'Failed to open gallery. Please check app permissions.',
        [
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
    setShowImageOptions(false);
  };

  const handleProductUpload = async () => {
    // Validate inputs
    if (!productName.trim()) {
      Alert.alert('Error', 'Please enter a product name');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a product description');
      return;
    }
    if (!price.trim() || isNaN(parseFloat(price))) {
      Alert.alert('Error', 'Please enter a valid product price');
      return;
    }
    if (!selectedSpace) {
      Alert.alert('Error', 'Please select a space');
      return;
    }
    if (images.length === 0) {
      Alert.alert('Error', 'Please upload at least one product image');
      return;
    }

    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Create form data
      const formData = new FormData();
      
      // Add product details as strings
      formData.append('product_name', productName.trim());
      formData.append('description', description.trim());
      formData.append('price', price.trim());
      formData.append('space_id', selectedSpace.id.toString());

      // Process and append images
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const imageUri = Platform.OS === 'android' ? image.uri : image.uri.replace('file://', '');
        
        if (!imageUri) {
          throw new Error('Invalid image data');
        }

        // Get file extension from uri or default to jpg
        const uriParts = imageUri.split('.');
        const fileType = uriParts[uriParts.length - 1] || 'jpg';

        // Create file object for multer
        formData.append('product_images', {
          uri: imageUri,
          type: `image/${fileType}`,
          name: `image_${i}.${fileType}`
        });
      }

      // Log request details for debugging
      console.log('Upload Request Details:', {
        url: `${BASE_URL}/products`,
        formDataKeys: Array.from(formData._parts).map(part => part[0]),
        imageCount: images.length
      });

      // Make the upload request
      const response = await axios({
        method: 'POST',
        url: `${BASE_URL}/products`,
        data: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        transformRequest: (data, headers) => {
          // Don't transform the data
          return data;
        },
        timeout: 30000 // 30 second timeout
      });

      if (response.data) {
        Alert.alert(
          'Success', 
          'Product uploaded successfully',
          [{ 
            text: 'OK',
            onPress: () => {
              // Reset form
              setProductName('');
              setDescription('');
              setPrice('');
              setImages([]);
              setSelectedSpace(null);
              // Navigate back
              navigation.goBack();
            }
          }]
        );
      }
    } catch (error) {
      console.error('Upload Error Details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });

      let errorMessage = 'Failed to upload product. ';
      
      if (error.response) {
        // Server responded with error
        if (error.response.status === 413) {
          errorMessage += 'Image file size is too large.';
        } else if (error.response.status === 401) {
          errorMessage += 'Please log in again.';
        } else {
          errorMessage += error.response.data?.message || 'Server error occurred.';
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timed out. Please check your internet connection.';
      } else if (!navigator.onLine) {
        errorMessage += 'No internet connection.';
      } else {
        errorMessage += 'Please check your internet connection and try again.';
      }

      Alert.alert('Upload Failed', errorMessage, [
        { 
          text: 'Try Again',
          onPress: () => setIsLoading(false)
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCollection = () => {
    if (newCollectionName.trim() && newCollectionDescription.trim()) {
      const newCollection = {
        id: Date.now().toString(),
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim(),
        image: newCollectionImage || require('../assets/images/placeholder.png')
      };
      setCollections([...collections, newCollection]);
      setSelectedCollection(newCollection);
      setNewCollectionName('');
      setNewCollectionDescription('');
      setNewCollectionImage(null);
      setShowCollectionInput(false);
    }
  };

  const LoadingOverlay = () => (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size="large" color="#6B46C1" />
      <Text style={styles.loadingText}>Uploading product...</Text>
    </View>
  );

  const renderSpaceItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.spaceItem,
        selectedSpace?.id === item.id && styles.selectedSpaceItem
      ]}
      onPress={() => setSelectedSpace(item)}
    >
      <Text style={[
        styles.spaceText,
        selectedSpace?.id === item.id && styles.selectedSpaceText
      ]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderSpaceSelector = () => (
    <View style={styles.spacesSection}>
      <Text style={styles.sectionTitle}>Select Space</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.spaceScrollView}
      >
        {spaces.map((space) => (
          <TouchableOpacity 
            key={space.id} 
            style={[
              styles.spaceItem, 
              selectedSpace?.id === space.id && styles.selectedSpaceItem
            ]}
            onPress={() => setSelectedSpace(space)}
          >
            <Text style={[
              styles.spaceTitle, 
              selectedSpace?.id === space.id && styles.selectedSpaceTitle
            ]}>
              {space.title}
            </Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity 
          style={styles.addSpaceButton}
          onPress={() => setShowSpaceInput(true)}
        >
          <Text style={styles.addSpaceButtonText}>+ Add Space</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  useEffect(() => {
    if (userToken) {
      fetchSpaces();
    }
  }, [userToken]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../assets/images/back-arrow.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Product</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Image Upload Section */}
        <View style={styles.uploadSection}>
          <View style={styles.imageSection}>
            {images.length > 0 ? (
              <FlatList
                data={images}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.selectedImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => {
                        const newImages = [...images];
                        newImages.splice(index, 1);
                        setImages(newImages);
                      }}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
                ListFooterComponent={
                  <TouchableOpacity 
                    style={styles.addMoreButton}
                    onPress={() => setShowImageOptions(true)}
                  >
                    <Text style={styles.addMoreText}>+</Text>
                  </TouchableOpacity>
                }
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>No images selected</Text>
              </View>
            )}
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.uploadOptionButton, styles.cameraButton]}
              onPress={handleCamera}
            >
              <Text style={styles.uploadOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.uploadOptionButton, styles.galleryButton]}
              onPress={handleGallery}
            >
              <Text style={styles.uploadOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Product Name</Text>
          <TextInput
            style={styles.input}
            value={productName}
            onChangeText={setProductName}
            placeholder="Enter product name"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter product description"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="Enter price"
            keyboardType="numeric"
          />

          {/* Spaces Section */}
          {renderSpaceSelector()}

          {/* Collections Section */}
          <View style={styles.spacesSection}>
            <Text style={styles.label}>Collection</Text>
            <View style={styles.spacesList}>
              {collections.map((collection) => (
                <TouchableOpacity
                  key={collection.id}
                  style={[
                    styles.spaceItem,
                    selectedCollection?.id === collection.id && styles.selectedSpaceItem
                  ]}
                  onPress={() => setSelectedCollection(collection)}
                >
                  <Text style={[
                    styles.spaceText,
                    selectedCollection?.id === collection.id && styles.selectedSpaceText
                  ]}>
                    {collection.name}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.addSpaceButton}
                onPress={() => setShowCollectionInput(true)}
              >
                <Text style={styles.addSpaceText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleProductUpload}
            disabled={isLoading}
          >
            <Text style={styles.uploadButtonText}>Upload Product</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Image Options Modal */}
      <Modal
        visible={showImageOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowImageOptions(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleCamera}
            >
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <View style={styles.modalDivider} />
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleGallery}
            >
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <View style={styles.modalDivider} />
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={[styles.modalOptionText, { color: '#ff3b30' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Space Modal */}
      <Modal
        visible={showSpaceInput}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: '90%' }]}>
            <Text style={styles.modalTitle}>Add New Space</Text>
            
            {/* Space Image */}
            <TouchableOpacity 
              style={styles.spaceImageContainer}
              onPress={async () => {
                try {
                  const hasPermission = await checkAndroidPermissions();
                  if (!hasPermission) return;

                  const result = await launchImageLibrary({
                    mediaType: 'photo',
                    quality: 0.8,
                    selectionLimit: 1,
                  });

                  if (!result.didCancel && !result.errorCode && result.assets?.[0]) {
                    setNewSpaceImage(result.assets[0]);
                  }
                } catch (error) {
                  console.log('Error', 'Failed to select photo');
                }
              }}
            >
              {newSpaceImage ? (
                <Image
                  source={{ uri: newSpaceImage.uri }}
                  style={styles.spaceImage}
                />
              ) : (
                <View style={styles.spaceImagePlaceholder}>
                  <Image 
                    source={require('../assets/images/Space_default.jpg')}
                    style={styles.spaceImage}
                  />
                  <View style={styles.addSpaceImageButton}>
                    <Text style={styles.addSpaceImageText}>+</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.modalInput}
              value={newSpaceName}
              onChangeText={setNewSpaceName}
              placeholder="Enter space name"
              autoFocus
            />
            <TextInput
              style={styles.modalInput}
              value={newSpaceDescription}
              onChangeText={setNewSpaceDescription}
              placeholder="Enter space description (max 20 characters)"
              maxLength={20}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowSpaceInput(false);
                  setNewSpaceName('');
                  setNewSpaceDescription('');
                  setNewSpaceImage(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleCreateSpace}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Collection Modal */}
      <Modal
        visible={showCollectionInput}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: '90%' }]}>
            <Text style={styles.modalTitle}>Add New Collection</Text>
            
            {/* Collection Image */}
            <TouchableOpacity 
              style={styles.spaceImageContainer}
              onPress={async () => {
                try {
                  const hasPermission = await checkAndroidPermissions();
                  if (!hasPermission) return;

                  const result = await launchImageLibrary({
                    mediaType: 'photo',
                    quality: 0.8,
                    selectionLimit: 1,
                  });

                  if (!result.didCancel && !result.errorCode && result.assets?.[0]) {
                    setNewCollectionImage(result.assets[0]);
                  }
                } catch (error) {
                  console.log('Error', 'Failed to select photo');
                }
              }}
            >
              {newCollectionImage ? (
                <Image
                  source={{ uri: newCollectionImage.uri }}
                  style={styles.spaceImage}
                />
              ) : (
                <View style={styles.spaceImagePlaceholder}>
                  <Image 
                    source={require('../assets/images/placeholder.png')}
                    style={styles.spaceImage}
                  />
                  <View style={styles.addSpaceImageButton}>
                    <Text style={styles.addSpaceImageText}>+</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.modalInput}
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              placeholder="Enter collection name"
              autoFocus
            />
            <TextInput
              style={styles.modalInput}
              value={newCollectionDescription}
              onChangeText={setNewCollectionDescription}
              placeholder="Enter collection description (max 20 characters)"
              maxLength={20}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCollectionInput(false);
                  setNewCollectionName('');
                  setNewCollectionDescription('');
                  setNewCollectionImage(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddCollection}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 80, // Added padding for bottom navigation
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  uploadSection: {
    width: '100%',
    minHeight: 250,
    backgroundColor: '#f5f5f5',
    padding: 15,
    marginBottom: 20,
  },
  imageSection: {
    width: '100%',
    height: 200,
    marginBottom: 15,
  },
  imageContainer: {
    width: 180,
    height: 200,
    marginRight: 10,
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#fff',

  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  addMoreButton: {
    width: 180,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8b4ae2',
    borderStyle: 'dashed',
  },
  addMoreText: {
    fontSize: 40,
    color: '#8b4ae2',
    fontWeight: '300',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e1e1e1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  uploadOptionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    flex: 0.35, 
  },
  galleryButton: {
    flex: 0.65, 
  },
  uploadOptionText: {
    color: '#8b4ae2',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
    paddingBottom: 100, // Added extra padding at the bottom
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  spacesSection: {
    marginVertical: 10,
  },
  spacesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  spaceItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedSpaceItem: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  spaceText: {
    color: '#333',
    fontSize: 14,
  },
  selectedSpaceText: {
    color: '#fff',
  },
  spaceTitle: {
    color: '#333',
    fontSize: 14,
  },
  selectedSpaceTitle: {
    color: '#fff',
  },
  addSpaceButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#6B46C1',
  },
  addSpaceButtonText: {
    color: '#6B46C1',
    fontSize: 14,
  },
  spaceScrollView: {
    paddingHorizontal: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#000',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  addButton: {
    backgroundColor: '#8b4ae2',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  uploadButton: {
    backgroundColor: '#8b4ae2',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOption: {
    padding: 20,
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 18,
    color: '#8b4ae2',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#ddd',
  },
  spaceImageContainer: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
  },
  spaceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  spaceImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  addSpaceImageButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSpaceImageText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    color: '#6B46C1',
    fontSize: 16,
  },
  sectionContainer: {
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  spaceList: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  dropdownContainer: {
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  dropdown: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  closeModalButton: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProductUploadScreen;
