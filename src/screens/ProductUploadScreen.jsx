import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  FlatList,
  Image,
  Linking,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Snackbar from 'react-native-snackbar';
import BottomNavBar from '../components/BottomNavBar';
const BASE_URL = 'http://13.60.211.186:3000';
export const ProductUploadScreen = ({navigation, route}) => {
  const [images, setImages] = useState([]);
  const [productName, setProductName] = useState(
    route.params?.prefillData?.title || '',
  );
  const [description, setDescription] = useState(
    route.params?.prefillData?.description || '',
  );
  const [price, setPrice] = useState(route.params?.prefillData?.price || '');
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [showSpaceInput, setShowSpaceInput] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceImage, setNewSpaceImage] = useState(null);
  const [newSpaceDescription, setNewSpaceDescription] = useState('');
  const [spaces, setSpaces] = useState([]);
  const [showImageOptions, setShowImageOptions] = useState(false);

  // New state for collections
  const [collections, setCollections] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [showCollectionInput, setShowCollectionInput] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [newCollectionImage, setNewCollectionImage] = useState(null);
  const [loadingCollections, setLoadingCollections] = useState(true);

  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkAndroidPermissions = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      // Request camera permission first - required for all Android versions
      const cameraPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera to take photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      
      if (cameraPermission !== PermissionsAndroid.RESULTS.GRANTED) {
        showPermissionAlert('camera');
        return false;
      }
      
      // For Android 13 and above (API level 33+)
      if (Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: 'Photo Permission',
            message:
              'This app needs access to your photos to upload product images.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          showPermissionAlert('storage');
          return false;
        }
      } else {
        // For Android 12 and below
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Photo Permission',
            message:
              'This app needs access to your photos to upload product images.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          showPermissionAlert('storage');
          return false;
        }
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const showPermissionAlert = (permissionType = 'storage') => {
    const title = 'Permission Required';
    let message = '';
    
    if (permissionType === 'camera') {
      message = 'This app needs access to your camera to take photos. Please enable it in your device settings.';
    } else {
      message = 'This app needs access to your photos to upload product images. Please enable it in your device settings.';
    }
    
    Snackbar.show({
      text: message,
      duration: Snackbar.LENGTH_SHORT,
      action: {
        text: 'Open Settings',
        textColor: 'blue',
        onPress: openSettings,
      },
    });
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const handleImagePick = async () => {
    if (!(await checkAndroidPermissions())) {
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 800,
      maxWidth: 800,
      quality: 0.7,
      selectionLimit: 10,
    };

    try {
      const response = await launchImageLibrary(options);

      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        console.error('Image picker error:', {
          code: response.errorCode,
          message: response.errorMessage,
        });
        Snackbar.show({
          text: 'Failed to pick image: ' + response.errorMessage,
          duration: Snackbar.LENGTH_SHORT,
        });
        return;
      }

      if (!response.assets || response.assets.length === 0) {
        Snackbar.show({
          text: 'No images were selected',
          duration: Snackbar.LENGTH_SHORT,
        });
        return;
      }

      const selectedImages = response.assets;
      console.log('Selected images details:', {
        count: selectedImages.length,
      });

      // Ensure the images have proper file paths
      const imageUris = selectedImages.map(image => {
        const imageUri = Platform.OS === 'android' 
          ? image.uri 
          : image.uri.startsWith('file://') 
            ? image.uri 
            : `file://${image.uri}`;
            
        return {
          uri: imageUri,
          type: image.type || 'image/jpeg',
          name: `image_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
        };
      });

      setImages(prevImages => [...prevImages, ...imageUris]);

      // Navigate to OnlineProductSearch with the first selected image
      if (selectedImages.length > 0) {
        const firstImage = selectedImages[0];
        const imageUri = Platform.OS === 'android'
          ? firstImage.uri
          : firstImage.uri.startsWith('file://')
            ? firstImage.uri
            : `file://${firstImage.uri}`;

        navigation.navigate('OnlineProductSearch', {
          imageUri,
          imageType: firstImage.type || 'image/jpeg',
        });
      }
    } catch (error) {
      console.error('Error in handleImagePick:', error);
      Snackbar.show({
        text: 'An error occurred while picking images. Please try again.',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };

  const handleCameraLaunch = async () => {
    try {
      // Check permissions first
      const hasPermission = await checkAndroidPermissions();
      if (!hasPermission) {
        console.log('Camera permission denied');
        return;
      }

      const options = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 800,
        maxWidth: 800,
        quality: 0.7,
        saveToPhotos: true,
      };

      console.log('Launching camera with options:', options);
      const response = await launchCamera(options);
      
      // Close the image options modal first
      setShowImageOptions(false);

      if (response.didCancel) {
        console.log('User cancelled camera');
        return;
      }

      if (response.errorCode) {
        console.error('Camera error:', {
          code: response.errorCode,
          message: response.errorMessage,
        });
        
        // Show more specific error messages based on error code
        let errorMessage = 'Failed to capture image';
        if (response.errorCode === 'camera_unavailable') {
          errorMessage = 'Camera is not available on this device';
        } else if (response.errorCode === 'permission') {
          errorMessage = 'Camera permission denied';
          // Try to request permission again
          setTimeout(() => {
            checkAndroidPermissions();
          }, 1000);
        }
        
        Snackbar.show({
          text: errorMessage,
          duration: Snackbar.LENGTH_SHORT,
        });
        return;
      }

      if (!response.assets || response.assets.length === 0) {
        console.error('No image captured');
        Snackbar.show({
          text: 'No image captured',
          duration: Snackbar.LENGTH_SHORT,
        });
        return;
      }

      const selectedImage = response.assets[0];
      console.log('Captured image details:', {
        uri: selectedImage.uri,
        type: selectedImage.type || 'image/jpeg',
        fileSize: selectedImage.fileSize,
        width: selectedImage.width,
        height: selectedImage.height,
      });

      // Ensure the image has a proper file path
      const imageUri = Platform.OS === 'android'
        ? selectedImage.uri
        : selectedImage.uri.startsWith('file://')
          ? selectedImage.uri
          : `file://${selectedImage.uri}`;

      // Process image similar to image library method
      const processedImage = {
        uri: imageUri,
        type: selectedImage.type || 'image/jpeg',
        name: `camera_image_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
      };

      setImages([...images, processedImage]);

      // Navigate to OnlineProductSearchScreen with the captured image
      console.log('Navigating to OnlineProductSearch with image:', {
        imageUri,
        imageType: processedImage.type,
        returnToUpload: true,
      });
      navigation.navigate('OnlineProductSearch', {
        imageUri: imageUri,
        imageType: processedImage.type,
        returnToUpload: true,
      });
    } catch (error) {
      console.error('Error processing camera image:', error);
      setShowImageOptions(false);
      Snackbar.show({
        text: 'Failed to process the captured image: ' + error.message,
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };

  const handleAddImage = async () => {
    try {
      const hasPermission = await checkAndroidPermissions();
      if (!hasPermission) {
        console.log('Gallery permission denied');
        return;
      }

      const options = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 800,
        maxWidth: 800,
        quality: 0.7,
        selectionLimit: 1,
      };

      console.log('Launching image library with options:', options);
      const response = await launchImageLibrary(options);
      
      // Close the image options modal first
      setShowImageOptions(false);

      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (response.errorCode) {
        console.error('ImagePicker Error:', {
          code: response.errorCode,
          message: response.errorMessage,
        });
        Snackbar.show({
          text: 'Failed to pick image: ' + response.errorMessage,
          duration: Snackbar.LENGTH_SHORT,
        });
        return;
      }

      if (!response.assets || response.assets.length === 0) {
        console.error('No image selected');
        Snackbar.show({
          text: 'No image selected',
          duration: Snackbar.LENGTH_SHORT,
        });
        return;
      }

      const selectedImage = response.assets[0];
      console.log('Selected image details:', {
        uri: selectedImage.uri,
        type: selectedImage.type || 'image/jpeg',
        fileSize: selectedImage.fileSize,
        width: selectedImage.width,
        height: selectedImage.height,
      });

      // Ensure the image has a proper file path
      const imageUri = Platform.OS === 'android'
        ? selectedImage.uri
        : selectedImage.uri.startsWith('file://')
          ? selectedImage.uri
          : `file://${selectedImage.uri}`;

      // Process image
      const processedImage = {
        uri: imageUri,
        type: selectedImage.type || 'image/jpeg',
        name: `gallery_image_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
      };

      setImages([...images, processedImage]);

      // Navigate to OnlineProductSearchScreen with the selected image
      console.log('Navigating to OnlineProductSearch with image:', {
        imageUri,
        imageType: processedImage.type,
        returnToUpload: true,
      });
      navigation.navigate('OnlineProductSearch', {
        imageUri: imageUri,
        imageType: processedImage.type,
        returnToUpload: true,
      });
    } catch (error) {
      console.error('Error processing gallery image:', error);
      setShowImageOptions(false);
      Snackbar.show({
        text: 'Failed to process the selected image: ' + error.message,
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };

  const handleImageUpload = imageFile => {
    if (images.length === 0) {
      // If it's the first image, trigger the search
      searchProducts(imageFile);
    } else {
      // For subsequent images, just add them directly
      setImages(prevImages => [...prevImages, imageFile]);
    }
  };

  const searchProducts = async imageFile => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting product search with image:', imageFile);

      const formData = new FormData();
      formData.append('search_image', {
        uri: imageFile.uri,
        type: 'image/jpeg',
        name: 'search_image.jpg',
      });

      console.log('Making API request to:', `${BASE_URL}/search-product`);

      const response = await fetch(`${BASE_URL}/search-product`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response format from server');
      }

      console.log('Parsed response data:', responseData);

      if (responseData && Array.isArray(responseData.data)) {
        if (responseData.data.length === 0) {
          setError('No matching products found');
        } else {
          setSearchResults(responseData.data);
        }
      } else {
        console.error('Invalid response structure:', responseData);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Search error:', error.message);
      console.error('Error stack:', error.stack);

      let errorMessage = 'Failed to search products. ';

      if (!navigator.onLine) {
        errorMessage = 'Please check your internet connection.';
        Snackbar.show({
          text: errorMessage,
          duration: Snackbar.LENGTH_LONG,
          action: {
            text: 'RETRY',
            textColor: '#fff',
            onPress: () => {
              // Retry the search
              searchProducts(imageFile);
            },
          },
        });
      } else if (error.message.includes('timeout')) {
        errorMessage += 'Request timed out. Please try again.';
      } else if (error.message.includes('413')) {
        errorMessage += 'Image file is too large. Please choose a smaller image.';
      } else {
        errorMessage += error.message;
      }

      setError(errorMessage);
      Snackbar.show(errorMessage, Snackbar.LENGTH_SHORT);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpace = () => {
    if (newSpaceName.trim() && newSpaceDescription.trim()) {
      const newSpace = {
        id: Date.now().toString(),
        name: newSpaceName.trim(),
        description: newSpaceDescription.trim(),
        image: newSpaceImage || require('../assets/images/Space_default.jpg'),
      };
      setSpaces([...spaces, newSpace]);
      setSelectedSpace(newSpace);
      setNewSpaceName('');
      setNewSpaceDescription('');
      setNewSpaceImage(null);
      setShowSpaceInput(false);
    }
  };

  const handleAddCollection = () => {
    if (newCollectionName.trim() && newCollectionDescription.trim()) {
      const newCollection = {
        id: Date.now().toString(),
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim(),
        image:
          newCollectionImage || require('../assets/images/Space_default.jpg'),
      };
      setCollections([...collections, newCollection]);
      setSelectedCollections([...selectedCollections, newCollection]);
      setNewCollectionName('');
      setNewCollectionDescription('');
      setNewCollectionImage(null);
      setShowCollectionInput(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      Snackbar.show({
        text: 'Please enter a collection name',
        duration: Snackbar.LENGTH_SHORT,
        position: 'top',
      });
      return;
    }

    try {
      const token = await AsyncStorage.getItem('accessToken');

      // Create form data for the collection
      const formData = new FormData();
      formData.append('collection_name', newCollectionName.trim());
      
      // Add description if provided
      if (newCollectionDescription.trim()) {
        formData.append('description', newCollectionDescription.trim());
      }

      // Add collection image if available
      if (newCollectionImage) {
        formData.append('collection_image', {
          uri: newCollectionImage.uri,
          type: newCollectionImage.type || 'image/jpeg',
          name: 'collection_image.jpg',
        });
      }

      const response = await axios.post(`${BASE_URL}/collections`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        const newCollection = {
          id: response.data.data.id,
          name: response.data.data.collection_name,
          description: response.data.data.description || '',
          image: response.data.data.collection_image || require('../assets/images/Space_default.jpg'),
        };

        setCollections(prevCollections => [newCollection, ...prevCollections]);
        setSelectedCollections(prev => [...prev, newCollection]);
        setShowCollectionInput(false);
        setNewCollectionName('');
        setNewCollectionDescription('');
        setNewCollectionImage(null);

        Snackbar.show({
          text: 'Collection created successfully!',
          backgroundColor: '#4CAF50',
          textColor: '#FFFFFF',
          duration: Snackbar.LENGTH_SHORT,
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      Snackbar.show({
        text: error.response?.data?.message || 'Failed to create collection',
        backgroundColor: '#F44336',
        textColor: '#FFFFFF',
        duration: Snackbar.LENGTH_SHORT,
        position: 'top',
      });
    }
  };

  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) {
      Snackbar.show({
        text: 'Please enter a space name',
        duration: Snackbar.LENGTH_SHORT,
        position: 'top',
      });
      return;
    }

    try {
      const token = await AsyncStorage.getItem('accessToken');
      // Create form data for the space
      const formData = new FormData();
      formData.append('space_name', newSpaceName.trim());
      
      // Add description if provided
      if (newSpaceDescription.trim()) {
        formData.append('description', newSpaceDescription.trim());
      }

      // Add space image if provided
      if (newSpaceImage) {
        formData.append('space_image', {
          uri: newSpaceImage.uri,
          type: newSpaceImage.type || 'image/jpeg',
          name: 'space_image.jpg',
        });
      }

      const response = await axios.post(`${BASE_URL}/spaces`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.data) {
        console.log('Space creation response:', response.data);

        // Create new space object with the correct ID format
        const newSpace = {
          id: response.data.data.space_id.toString(), // Convert space_id to string
          name: response.data.data.space_name || newSpaceName.trim(),
          description: response.data.data.description || newSpaceDescription.trim(),
          image: response.data.data.space_image || require('../assets/images/Space_default.jpg'),
          space_image: response.data.data.space_image,
          total_products: 0,
          owner_id: response.data.data.owner_id
        };

        console.log('Created new space:', newSpace);

        // Update spaces list and select the new space
        setSpaces(prevSpaces => [newSpace, ...prevSpaces]);
        
        // Important: Wait for state to update before setting selected space
        await new Promise(resolve => setTimeout(resolve, 100));
        setSelectedSpace(newSpace);
        
        // Reset form fields
        setShowSpaceInput(false);
        setNewSpaceName('');
        setNewSpaceDescription('');
        setNewSpaceImage(null);

        Snackbar.show({
          text: 'Space created successfully!',
          backgroundColor: '#4CAF50',
          textColor: '#FFFFFF',
          duration: Snackbar.LENGTH_SHORT,
          position: 'top',
        });

        // Return the created space
        return newSpace;
      }
    } catch (error) {
      console.error('Error creating space:', error.response?.data || error);
      Snackbar.show({
        text: error.response?.data?.message || 'Failed to create space',
        backgroundColor: '#F44336',
        textColor: '#FFFFFF',
        duration: Snackbar.LENGTH_SHORT,
        position: 'top',
      });
      return null;
    }
  };

  const handleUpload = async () => {
    try {
      // Check for required fields
      if (!productName.trim()) {
        Snackbar.show({
          text: 'Please enter a product name',
          duration: Snackbar.LENGTH_SHORT,
        });
        return;
      }

      if (images.length === 0) {
        Snackbar.show({
          text: 'Please select at least one image',
          duration: Snackbar.LENGTH_SHORT,
        });
        return;
      }

      setIsLoading(true);
      const token = await AsyncStorage.getItem('accessToken');
      const formData = new FormData();

      // Add product name
      formData.append('product_name', productName.trim());
      
      // Add the image
      const imageFile = {
        uri: images[0].uri,
        type: 'image/jpeg',
        name: 'image.jpg'
      };
      formData.append('image', imageFile);

      // Add optional fields if they exist
      if (description) {
        formData.append('description', description.trim());
      }
      
      if (price) {
        formData.append('price', price.toString());
      }

      // Handle space ID
      const spaceId = selectedSpace?.id;
      if (spaceId) {
        console.log('Adding space_id to formData:', spaceId);
        formData.append('space_id', spaceId.toString());
      }

      // Handle collections
      if (selectedCollections.length > 0) {
        const collectionIds = selectedCollections.map(c => c.id);
        console.log('Adding collection_ids to formData:', collectionIds);
        formData.append('collection_ids', JSON.stringify(collectionIds));
      }

      console.log('Uploading product:', {
        product_name: productName.trim(),
        imageUri: images[0].uri,
        space_id: spaceId,
        collection_ids: selectedCollections.map(c => c.id)
      });

      const response = await axios.post(
        `${BASE_URL}/products`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        Snackbar.show({
          text: 'Product uploaded successfully!',
          backgroundColor: '#4CAF50',
          textColor: '#FFFFFF',
          duration: Snackbar.LENGTH_SHORT,
        });

        // Wait for Snackbar to show before navigating
        setTimeout(() => {
          if (spaceId) {
            navigation.replace('IndividualSpace', {
              spaceId: selectedSpace.id,
              spaceName: selectedSpace.name,
              spaceImage: selectedSpace.image || selectedSpace.space_image,
              description: selectedSpace.description,
              totalProducts: selectedSpace.total_products,
              ownerId: selectedSpace.owner_id
            });
          } else {
            navigation.replace('Home');
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      Snackbar.show({
        text: error.response?.data?.message || 'Failed to upload product',
        duration: Snackbar.LENGTH_SHORT,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Enable upload only when image and title are present
  const isUploadEnabled = useMemo(() => {
    return productName.trim().length > 0 && images.length > 0;
  }, [productName, images]);

  const formatProductName = (text) => {
    if (!text) {
      return '';
    }

    // Split into chunks of 25 characters, maintaining word boundaries
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    let currentLength = 0;

    words.forEach(word => {
      if (currentLength + word.length + 1 <= 25) {
        currentLine += (currentLine.length ? ' ' : '') + word;
        currentLength += word.length + 1; // +1 for space
      } else {
        if (currentLine.length) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentLength = word.length + 1;
      }
    });
    if (currentLine.length) {
      lines.push(currentLine);
    }

    return lines.join('\n');
  };

  const handleProductNameChange = (text) => {
    const formattedText = formatProductName(text);
    setProductName(formattedText);
  };

  const fetchSpaces = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(`${BASE_URL}/spaces/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data && Array.isArray(response.data.data)) {
        const spacesData = response.data.data.map(space => ({
          id: space.space_id.toString(), // Convert space_id to string
          name: space.space_name,
          description: space.description,
          image: space.space_image,
          space_image: space.space_image,
          total_products: space.total_products || 0,
          owner_id: space.owner_id
        }));
        setSpaces(spacesData);
      }
    } catch (error) {
      console.error('Error fetching spaces:', error);
      Snackbar.show({
        text: 'Failed to load spaces',
        backgroundColor: '#F44336',
        textColor: '#FFFFFF',
        duration: Snackbar.LENGTH_SHORT,
        position: 'top',
      });
    }
  };
  const fetchCollections = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(
        `${BASE_URL}/collections/user/collections`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data && Array.isArray(response.data.data)) {
        const collectionsData = response.data.data.map(collection => ({
          id: collection.id || collection.collection_id,
          name: collection.collection_name || collection.name,
          description: collection.description,
          image: collection.collection_image,
        }));
        setCollections(collectionsData);
        setLoadingCollections(false);
      } else {
        console.log('No collections found.');
        setCollections([]);
        setLoadingCollections(false);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      Snackbar.show(
        'An error occurred while fetching collections.',
        Snackbar.LENGTH_SHORT,
      );
      setLoadingCollections(false);
    }
  };

  const toggleCollection = collection => {
    if (!collection?.id) {
      return;
    }

    setSelectedCollections(prev => {
      const isSelected = prev.some(c => c.id === collection.id);
      if (isSelected) {
        return prev.filter(c => c.id !== collection.id);
      } else {
        return [...prev, collection];
      }
    });
  };

  const handleDeleteSpace = async spaceId => {
    try {
      Snackbar.show({
        text: 'This feature is not available yet',
        backgroundColor: '#F44336',
        textColor: '#FFFFFF',
        duration: Snackbar.LENGTH_SHORT,
        position: 'top',
      });
    } catch (error) {
      console.error('Error deleting space:', error);
      Snackbar.show({
        text: 'Failed to delete space',
        backgroundColor: '#F44336',
        textColor: '#FFFFFF',
        duration: Snackbar.LENGTH_SHORT,
        position: 'top',
      });
    }
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      const productId = route.params?.productId || route.params?.prefillData?.product_id;
      
      if (productId) {
        try {
          const token = await AsyncStorage.getItem('accessToken');
          const response = await axios.get(`${BASE_URL}/products/${productId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const productData = response.data.data;
          console.log('Fetched product details:', JSON.stringify(productData, null, 2));
          console.log('Available collections:', JSON.stringify(collections, null, 2));

          // Prefill basic product details
          setProductName(
            productData.product_name || 
            productData.title || 
            route.params?.prefillData?.title || 
            ''
          );
          setDescription(productData.description || '');
          setPrice(productData.price ? productData.price.toString() : '');

          // Prefill space
          if (productData.space_id) {
            const spaceToSelect = spaces.find(
              space => space.id === productData.space_id.toString()
            );
            if (spaceToSelect) {
              setSelectedSpace(spaceToSelect);
            }
          }

          // Prefill collections
          const collectionsToSelect = [];
          
          // Try to match collections from product data
          if (productData.collections && productData.collections.length > 0) {
            productData.collections.forEach(collection => {
              const matchedCollection = collections.find(
                c => c.id === collection.id.toString() || 
                     c.name.toLowerCase() === collection.name.toLowerCase()
              );
              if (matchedCollection) {
                collectionsToSelect.push(matchedCollection);
              }
            });
          }

          // Fallback to prefillData collections
          if (collectionsToSelect.length === 0 && route.params?.prefillData) {
            const prefillCollections = route.params.prefillData.collections || 
                                       route.params.prefillData.collection_details || 
                                       [];
            
            const mappedCollections = prefillCollections.map(collectionId => {
              // Handle different possible input formats
              if (typeof collectionId === 'object') {
                // If it's a full collection object
                return collections.find(
                  c => c.id === collectionId.id.toString() || 
                       c.name.toLowerCase() === collectionId.name.toLowerCase()
                );
              } else {
                // If it's just an ID
                return collections.find(c => c.id === collectionId.toString());
              }
            }).filter(Boolean);

            collectionsToSelect.push(...mappedCollections);
          }

          if (collectionsToSelect.length > 0) {
            console.log('Selected collections:', JSON.stringify(collectionsToSelect, null, 2));
            setSelectedCollections(collectionsToSelect);
          } else {
            console.warn('No collections could be matched');
          }

          // Prefill images
          const images = [];
          if (productData.primary_image_url) {
            images.push({
              uri: productData.primary_image_url,
              type: 'image/jpeg',
              name: `product_image_${productId}_primary.jpg`
            });
          }

          if (productData.additional_images && productData.additional_images.length > 0) {
            const additionalImages = productData.additional_images.map((imageUrl, index) => ({
              uri: imageUrl,
              type: 'image/jpeg',
              name: `product_image_${productId}_${index}.jpg`
            }));
            images.push(...additionalImages);
          }

          // Fallback to prefillData images
          if (images.length === 0 && route.params?.prefillData?.images) {
            const prefillImages = route.params.prefillData.images.map((imageUrl, index) => ({
              uri: imageUrl,
              type: 'image/jpeg',
              name: `prefill_image_${index}.jpg`
            }));
            images.push(...prefillImages);
          }

          if (images.length > 0) {
            setImages(images);
          }
        } catch (error) {
          console.error('Error fetching product details:', error);
          
          // Fallback to prefillData if API fetch fails
          const prefillData = route.params?.prefillData;
          if (prefillData) {
            console.log('Falling back to prefill data:', JSON.stringify(prefillData, null, 2));

            // Prefill basic product details
            setProductName(
              prefillData.title || 
              prefillData.product_name || 
              ''
            );
            setDescription(prefillData.description || '');
            setPrice(prefillData.price ? prefillData.price.toString() : '');

            // Prefill space
            if (prefillData.space_id) {
              const spaceToSelect = spaces.find(
                space => space.id === prefillData.space_id.toString()
              );
              if (spaceToSelect) {
                setSelectedSpace(spaceToSelect);
              }
            }

            // Prefill collections
            const prefillCollections = prefillData.collections || 
                                       prefillData.collection_details || 
                                       [];
            
            if (prefillCollections.length > 0) {
              const collectionsToSelect = prefillCollections.map(
                collectionId => collections.find(
                  c => c.id === (typeof collectionId === 'object' ? 
                    collectionId.id : 
                    collectionId
                  )
                )
              ).filter(Boolean);
              
              if (collectionsToSelect.length > 0) {
                console.log('Fallback selected collections:', collectionsToSelect);
                setSelectedCollections(collectionsToSelect);
              }
            }

            // Prefill images
            if (prefillData.images && prefillData.images.length > 0) {
              const prefillImages = prefillData.images.map((imageUrl, index) => ({
                uri: imageUrl,
                type: 'image/jpeg',
                name: `prefill_image_${index}.jpg`
              }));
              setImages(prefillImages);
            }
          }

          Snackbar.show({
            text: 'Failed to load product details',
            duration: Snackbar.LENGTH_SHORT,
          });
        }
      }
    };

    // Only run prefill after spaces and collections are loaded
    if (spaces.length > 0 && collections.length > 0) {
      fetchProductDetails();
    }
  }, [spaces, collections, route.params?.productId, route.params?.prefillData]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      const productId = route.params?.productId || route.params?.prefillData?.product_id;
      
      if (productId) {
        try {
          const token = await AsyncStorage.getItem('accessToken');
          const response = await axios.get(`${BASE_URL}/products/${productId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const productData = response.data.data;
          console.log('Fetched product details:', JSON.stringify(productData, null, 2));

          // Prefill basic product details
          setProductName(
            productData.product_name || 
            productData.title || 
            route.params?.prefillData?.title || 
            ''
          );
          setDescription(productData.description || '');
          setPrice(productData.price ? productData.price.toString() : '');

          // Prefill space
          if (productData.space_id) {
            const spaceToSelect = spaces.find(
              space => space.id === productData.space_id.toString()
            );
            if (spaceToSelect) {
              setSelectedSpace(spaceToSelect);
            }
          }

          // Prefill collections
          const collectionsToSelect = [];
          
          // Try to match collections from product data
          if (productData.collections && productData.collections.length > 0) {
            productData.collections.forEach(collection => {
              const matchedCollection = collections.find(
                c => c.id === collection.id.toString() || 
                     c.name.toLowerCase() === collection.name.toLowerCase()
              );
              if (matchedCollection) {
                collectionsToSelect.push(matchedCollection);
              }
            });
          }

          // Fallback to prefillData collections if API fetch fails
          if (collectionsToSelect.length === 0 && route.params?.prefillData?.collections) {
            const prefillCollections = route.params.prefillData.collections.map(
              collectionId => collections.find(
                c => c.id === (typeof collectionId === 'object' ? 
                  collectionId.id : 
                  collectionId
                )
              )
            ).filter(Boolean);
            
            collectionsToSelect.push(...prefillCollections);
          }

          if (collectionsToSelect.length > 0) {
            console.log('Selected collections:', collectionsToSelect);
            setSelectedCollections(collectionsToSelect);
          }

          // Prefill images
          const images = [];
          if (productData.primary_image_url) {
            images.push({
              uri: productData.primary_image_url,
              type: 'image/jpeg',
              name: `product_image_${productId}_primary.jpg`
            });
          }

          if (productData.additional_images && productData.additional_images.length > 0) {
            const additionalImages = productData.additional_images.map((imageUrl, index) => ({
              uri: imageUrl,
              type: 'image/jpeg',
              name: `product_image_${productId}_${index}.jpg`
            }));
            images.push(...additionalImages);
          }

          // Fallback to prefillData images
          if (images.length === 0 && route.params?.prefillData?.images) {
            const prefillImages = route.params.prefillData.images.map((imageUrl, index) => ({
              uri: imageUrl,
              type: 'image/jpeg',
              name: `prefill_image_${index}.jpg`
            }));
            images.push(...prefillImages);
          }

          if (images.length > 0) {
            setImages(images);
          }
        } catch (error) {
          console.error('Error fetching product details:', error);
          
          // Fallback to prefillData if API fetch fails
          const prefillData = route.params?.prefillData;
          if (prefillData) {
            console.log('Falling back to prefill data:', JSON.stringify(prefillData, null, 2));

            // Prefill basic product details
            setProductName(
              prefillData.title || 
              prefillData.product_name || 
              ''
            );
            setDescription(prefillData.description || '');
            setPrice(prefillData.price ? prefillData.price.toString() : '');

            // Prefill space
            if (prefillData.space_id) {
              const spaceToSelect = spaces.find(
                space => space.id === prefillData.space_id.toString()
              );
              if (spaceToSelect) {
                setSelectedSpace(spaceToSelect);
              }
            }

            // Prefill collections
            if (prefillData.collections && prefillData.collections.length > 0) {
              const collectionsToSelect = prefillData.collections.map(
                collectionId => collections.find(
                  c => c.id === (typeof collectionId === 'object' ? 
                    collectionId.id : 
                    collectionId
                  )
                )
              ).filter(Boolean);
              
              if (collectionsToSelect.length > 0) {
                setSelectedCollections(collectionsToSelect);
              }
            }

            // Prefill images
            if (prefillData.images && prefillData.images.length > 0) {
              const prefillImages = prefillData.images.map((imageUrl, index) => ({
                uri: imageUrl,
                type: 'image/jpeg',
                name: `prefill_image_${index}.jpg`
              }));
              setImages(prefillImages);
            }
          }

          Snackbar.show({
            text: 'Failed to load product details',
            duration: Snackbar.LENGTH_SHORT,
          });
        }
      }
    };

    // Only run prefill after spaces and collections are loaded
    if (spaces.length > 0 && collections.length > 0) {
      fetchProductDetails();
    }
  }, [spaces, collections, route.params?.productId, route.params?.prefillData]);

  useEffect(() => {
    if (route.params?.prefillData) {
      const {title, price, description, productImage, uploadedImage} =
        route.params.prefillData;
      setProductName(title || productImage || '');
      // Ensure price is a clean number without currency symbols
      setPrice(price ? price.toString().replace(/[^0-9.]/g, '') : '');
      setDescription(description);

      // Handle the uploaded/captured image
      if (uploadedImage) {
        const uploadedImageObj = {
          uri: uploadedImage,
          type: 'image/jpeg',
          name: 'uploaded_image.jpg',
        };
        setImages([uploadedImageObj]);
      }

      // Handle the product image from search results
      if (productImage) {
        const productImageObj = {
          uri: productImage,
          type: 'image/jpeg',
          name: 'product_image.jpg',
        };
        // Add product image if we don't have an uploaded image
        if (!uploadedImage) {
          setImages([productImageObj]);
        }
      }
    }
  }, [route.params?.prefillData]);

  useEffect(() => {
    setIsValid(productName.trim() !== '' && images.length > 0);
  }, [productName, images]);

  const formatTitle = title => {
    if (!title) {
      return '';
    }

    // Split into chunks of 25 characters, maintaining word boundaries
    const words = title.split(' ');
    let lines = [];
    let currentLine = '';

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= 25) {
        currentLine += (currentLine.length ? ' ' : '') + word;
      } else {
        if (currentLine.length) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }
    if (currentLine.length) {
      lines.push(currentLine);
    }

    return lines.join('\n');
  };

  const handleProductSelect = product => {
    if (route.params?.returnToUpload) {
      navigation.navigate('ProductUpload', {
        prefillData: {
          title: formatTitle(product.title),
          price: product.price?.value.toString().replace(/[^0-9.]/g, '') || '',
          description: product.description || '',
          productImage: product.image || null,
          uploadedImage: route.params?.imageUri,
        },
      });
    }
  };

  const renderImagePreview = () => {
    if (images.length === 0) {
      return (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>No images selected</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={images}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({item, index}) => (
          <View style={styles.imageContainer}>
            <Image
              source={{uri: item.uri}}
              style={styles.selectedImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => {
                const newImages = [...images];
                newImages.splice(index, 1);
                setImages(newImages);
              }}>
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addMoreButton}
            onPress={() => setShowImageOptions(true)}>
            <Text style={styles.addMoreText}>+</Text>
          </TouchableOpacity>
        }
      />
    );
  };

  useEffect(() => {
    fetchSpaces();
    fetchCollections();
  }, []);

  const SkeletonCard = () => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    }, []);

    const opacity = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    });

    return (
      <View style={styles.collectionSkeletonCard}>
        <Animated.View style={[styles.collectionSkeletonImage, {opacity}]} />
        <View style={styles.collectionSkeletonContent}>
          <Animated.View style={[styles.collectionSkeletonText, {opacity}]} />
        </View>
      </View>
    );
  };

  const renderSkeleton = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </ScrollView>
  );

  return (
    <View style={{flex: 1}}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../assets/images/arrow_back.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Product</Text>
          <View style={{width: 24}} />
        </View>

        {/* Image Upload Section */}
        <View style={styles.uploadSection}>
          <View style={styles.imageSection}>{renderImagePreview()}</View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.uploadOptionButton, styles.cameraButton]}
              onPress={handleCameraLaunch}>
              <Text style={styles.uploadOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.uploadOptionButton, styles.galleryButton]}
              onPress={handleAddImage}>
              <Text style={styles.uploadOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Product Title *"
            value={productName}
            onChangeText={handleProductNameChange}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            placeholder="Price (Optional)"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          {/* Spaces Section */}
          <View style={styles.spacesSection}>
            <Text style={styles.label}>Space</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.spacesList}>
              {spaces.map(space => (
                <TouchableOpacity
                  key={space.id}
                  style={[
                    styles.spaceItem,
                    selectedSpace?.id === space.id && styles.selectedSpaceItem,
                  ]}
                  onPress={() => {
                    console.log('Selecting space:', space);
                    setSelectedSpace(space);
                  }}>
                  <Text 
                    style={[
                      styles.spaceText,
                      selectedSpace?.id === space.id && styles.selectedSpaceText
                    ]}
                  >
                    {space.name}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.addSpaceButton}
                onPress={() => setShowSpaceInput(true)}>
                <Text style={styles.addSpaceText}>+</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Collections Section */}
          <View style={styles.spacesSection}>
            <Text style={styles.label}>Collections (Optional)</Text>
            {loadingCollections ? (
              renderSkeleton()
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.spacesList}>
                {collections.map(collection => (
                  <TouchableOpacity
                    key={collection.id}
                    style={[
                      styles.collectionItem,
                      selectedCollections.some(c => c.id === collection.id) &&
                        styles.selectedCollectionItem,
                    ]}
                    onPress={() => toggleCollection(collection)}>
                    <Text 
                      style={[
                        styles.collectionText,
                        selectedCollections.some(c => c.id === collection.id) &&
                          styles.selectedCollectionText
                      ]}
                    >
                      {collection.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.addSpaceButton}
                  onPress={() => setShowCollectionInput(true)}>
                  <Text style={styles.addSpaceText}>+</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>

          <TouchableOpacity 
            style={[
              styles.uploadButton,
              (!isUploadEnabled || isLoading) && styles.disabledButton
            ]}
            onPress={() => {
              console.log('Upload button pressed');
              handleUpload();
            }}
            disabled={!isUploadEnabled || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.uploadButtonText}>
                {route.params?.prefillData ? 'Update Product' : 'Upload Product'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Image Options Modal */}
      <Modal
        visible={showImageOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageOptions(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowImageOptions(false)}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleCameraLaunch}>
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <View style={styles.modalDivider} />
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleAddImage}>
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <View style={styles.modalDivider} />
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => setShowImageOptions(false)}>
              <Text style={[styles.modalOptionText, {color: '#ff3b30'}]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Space Modal */}
      <Modal visible={showSpaceInput} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Space</Text>

            {/* Space Image Picker */}
            <TouchableOpacity
              style={[
                styles.imagePickerButton,
                !newSpaceImage && styles.mandatoryField,
              ]}
              onPress={async () => {
                try {
                  const hasPermission = await checkAndroidPermissions();
                  if (!hasPermission) {
                    return;
                  }

                  const result = await launchImageLibrary({
                    mediaType: 'photo',
                    quality: 0.8,
                    selectionLimit: 1,
                  });

                  if (!result.didCancel && !result.errorCode && result.assets?.[0]) {
                    setNewSpaceImage(result.assets[0]);
                  }
                } catch (error) {
                  console.error('Error picking image:', error);
                  Snackbar.show({
                    text: 'Failed to select photo',
                    duration: Snackbar.LENGTH_SHORT,
                  });
                }
              }}>
              {newSpaceImage ? (
                <Image
                  source={{uri: newSpaceImage.uri}}
                  style={styles.previewImage}
                />
              ) : (
                <Text style={styles.imagePickerText}>
                  Add Space Image (Optional)
                </Text>
              )}
            </TouchableOpacity>

            <TextInput
              style={[
                styles.modalInput,
                !newSpaceName.trim() && styles.mandatoryField,
              ]}
              placeholder="Space Name (Required)"
              value={newSpaceName}
              onChangeText={setNewSpaceName}
            />

            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Space Description (Optional)"
              value={newSpaceDescription}
              onChangeText={setNewSpaceDescription}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowSpaceInput(false);
                  setNewSpaceName('');
                  setNewSpaceDescription('');
                  setNewSpaceImage(null);
                }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.createButton,
                  (!newSpaceName.trim()) &&
                    styles.disabledButton,
                ]}
                onPress={handleCreateSpace}
                disabled={!newSpaceName.trim()}>
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Collection Modal */}
      <Modal visible={showCollectionInput} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Collection</Text>

            {/* Collection Image Picker */}
            <TouchableOpacity
              style={[
                styles.imagePickerButton,
                !newCollectionImage && styles.mandatoryField,
              ]}
              onPress={async () => {
                try {
                  const hasPermission = await checkAndroidPermissions();
                  if (!hasPermission) {
                    return;
                  }

                  const result = await launchImageLibrary({
                    mediaType: 'photo',
                    quality: 0.8,
                    selectionLimit: 1,
                  });

                  if (!result.didCancel && !result.errorCode && result.assets?.[0]) {
                    setNewCollectionImage(result.assets[0]);
                  }
                } catch (error) {
                  console.error('Error picking image:', error);
                  Snackbar.show({
                    text: 'Failed to select photo',
                    duration: Snackbar.LENGTH_SHORT,
                  });
                }
              }}>
              {newCollectionImage ? (
                <Image
                  source={{uri: newCollectionImage.uri}}
                  style={styles.previewImage}
                />
              ) : (
                <Text style={styles.imagePickerText}>
                  Add Collection Image (Optional)
                </Text>
              )}
            </TouchableOpacity>

            <TextInput
              style={[
                styles.modalInput,
                !newCollectionName.trim() && styles.mandatoryField,
              ]}
              placeholder="Collection Name (Required)"
              value={newCollectionName}
              onChangeText={setNewCollectionName}
            />

            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Collection Description (Optional)"
              value={newCollectionDescription}
              onChangeText={setNewCollectionDescription}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCollectionInput(false);
                  setNewCollectionName('');
                  setNewCollectionDescription('');
                  setNewCollectionImage(null);
                }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.createButton,
                  (!newCollectionName.trim()) &&
                    styles.disabledButton,
                ]}
                onPress={handleCreateCollection}
                disabled={!newCollectionName.trim()}>
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavBar />
    </View>
  );
};

export default ProductUploadScreen;

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
    width: 200,
    height: 200,
    marginRight: 10,
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  addMoreButton: {
    width: 200,
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
    height: 150,
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
    textAlignVertical: 'top',
    minHeight: 50,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  spacesSection: {
    marginBottom: 20,
  },
  spacesList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  spaceItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedSpaceItem: {
    backgroundColor: '#8b4ae2',
    borderColor: '#8b4ae2',
  },
  spaceText: {
    color: '#000',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedSpaceText: {
    color: 'white',
  },
  addSpaceButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#8b4ae2',
    borderStyle: 'dashed',
  },
  addSpaceText: {
    color: '#8b4ae2',
    fontSize: 16,
    fontWeight: '500',
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
  createButton: {
    backgroundColor: '#8b4ae2',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  imagePickerButton: {
    width: '100%',
    height: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  imagePickerText: {
    color: '#666',
  },
  mandatoryField: {
    borderColor: '#ddd',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
  imageTitle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: 'white',
    padding: 5,
    textAlign: 'center',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  modalButton: {
    backgroundColor: '#6B46C1',
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  selectedListItem: {
    backgroundColor: '#f0e6ff',
  },
  listItemTitle: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#6B46C1',
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  collectionSkeletonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  collectionSkeletonImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E1E1E1',
  },
  collectionSkeletonContent: {
    flex: 1,
    marginLeft: 12,
  },
  collectionSkeletonText: {
    height: 20,
    width: '60%',
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
  },
  collectionItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedCollectionItem: {
    backgroundColor: '#8b4ae2',
    borderColor: '#8b4ae2',
  },
  collectionText: {
    color: '#000',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedCollectionText: {
    color: 'white',
  },
  collectionItemImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  createButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderText: {
    color: '#888',
    fontStyle: 'italic',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  imageUploadContainer: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6E6FA',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  imagePickerButtonText: {
    color: '#6B46C1',
    marginLeft: 10,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginTop: 15,
    flexDirection: 'row',
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageTitle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: 'white',
    padding: 5,
    textAlign: 'center',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  modalButton: {
    backgroundColor: '#6B46C1',
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  selectedListItem: {
    backgroundColor: '#f0e6ff',
  },
  listItemTitle: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#6B46C1',
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  collectionSkeletonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  collectionSkeletonImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E1E1E1',
  },
  collectionSkeletonContent: {
    flex: 1,
    marginLeft: 12,
  },
  collectionSkeletonText: {
    height: 20,
    width: '60%',
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
  },
  collectionItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedCollectionItem: {
    backgroundColor: '#8b4ae2',
    borderColor: '#8b4ae2',
  },
  collectionText: {
    color: '#000',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedCollectionText: {
    color: 'white',
  },
  collectionItemImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  createButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderText: {
    color: '#888',
    fontStyle: 'italic',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  imageUploadContainer: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6E6FA',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  imagePickerButtonText: {
    color: '#6B46C1',
    marginLeft: 10,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginTop: 15,
    flexDirection: 'row',
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageTitle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: 'white',
    padding: 5,
    textAlign: 'center',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  modalButton: {
    backgroundColor: '#6B46C1',
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  selectedListItem: {
    backgroundColor: '#f0e6ff',
  },
  listItemTitle: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#6B46C1',
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  collectionSkeletonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  collectionSkeletonImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E1E1E1',
  },
  collectionSkeletonContent: {
    flex: 1,
    marginLeft: 12,
  },
  collectionSkeletonText: {
    height: 20,
    width: '60%',
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
  },
  collectionItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedCollectionItem: {
    backgroundColor: '#8b4ae2',
    borderColor: '#8b4ae2',
  },
  collectionText: {
    color: '#000',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedCollectionText: {
    color: 'white',
  },
  collectionItemImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  createButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderText: {
    color: '#888',
    fontStyle: 'italic',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  imageUploadContainer: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6E6FA',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  imagePickerButtonText: {
    color: '#6B46C1',
    marginLeft: 10,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginTop: 15,
    flexDirection: 'row',
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageTitle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: 'white',
    padding: 5,
    textAlign: 'center',
    fontSize: 12,
  },
  mandatoryInput: {
    borderColor: '#ddd',
  },
  mandatorySection: {
    borderColor: '#ddd',
    borderWidth: 1,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
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
  createButton: {
    backgroundColor: '#8b4ae2',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  imagePickerButton: {
    width: '100%',
    height: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  imagePickerText: {
    color: '#666',
  },
  mandatoryField: {
    borderColor: '#ddd',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
});
