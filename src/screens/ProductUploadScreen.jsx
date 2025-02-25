import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
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
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Snackbar from 'react-native-snackbar';
import BottomNavBar from '../components/BottomNavBar';
const BASE_URL = 'http://13.49.68.11:3000';
const ProductUpload = ({navigation, route}) => {
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

  const checkAndroidPermissions = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
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
          showPermissionAlert();
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
          showPermissionAlert();
          return false;
        }
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const showPermissionAlert = () => {
    Alert.alert(
      'Permission Required',
      'This app needs access to your photos to upload product images. Please enable it in your device settings.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Open Settings', onPress: openSettings},
      ],
    );

    // Snackbar.show('Failed to pick image', Snackbar.LENGTH_SHORT);
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const handleImagePick = async () => {
    if (await checkAndroidPermissions()) {
      const options = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 800,
        maxWidth: 800,
        quality: 0.7,
        selectionLimit: 10,
      };

      launchImageLibrary(options, async response => {
        if (response.didCancel) {
          return;
        }

        if (response.errorCode) {
          console.error('Image picker error:', {
            code: response.errorCode,
            message: response.errorMessage,
          });
          // Alert.alert('Error', 'Failed to pick image');
          Snackbar.show('Failed to pick image', Snackbar.LENGTH_SHORT);
          return;
        }

        try {
          const selectedImages = response.assets;
          console.log('Selected images details:', {
            count: selectedImages.length,
          });

          // Ensure the images have proper file paths
          const imageUris = selectedImages.map(image => {
            const imageUri = image.uri.startsWith('file://')
              ? image.uri
              : `file://${image.uri}`;
            return {
              uri: imageUri,
              type: image.type || 'image/jpeg',
              name: `image_${Date.now()}.jpg`,
            };
          });

          setImages([...images, ...imageUris]);
        } catch (error) {
          console.error('Error processing images:', error);
          // Alert.alert('Error', 'Failed to process the selected images');
          Snackbar.show(
            'Failed to process the selected images',
            Snackbar.LENGTH_SHORT,
          );
        }
      });
    }
  };

  const handleCameraLaunch = async () => {
    if (await checkAndroidPermissions()) {
      const options = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 800,
        maxWidth: 800,
        quality: 0.7,
        saveToPhotos: true,
      };

      launchCamera(options, async response => {
        if (response.didCancel) {
          return;
        }

        if (response.errorCode) {
          console.error('Camera error:', {
            code: response.errorCode,
            message: response.errorMessage,
          });
          // Alert.alert('Error', 'Failed to capture image');
          Snackbar.show('Failed to capture image', Snackbar.LENGTH_SHORT);
          return;
        }

        try {
          const selectedImage = response.assets[0];
          console.log('Captured image details:', {
            uri: selectedImage.uri,
            type: selectedImage.type || 'image/jpeg',
            fileSize: selectedImage.fileSize,
            width: selectedImage.width,
            height: selectedImage.height,
          });

          // Ensure the image has a proper file path
          const imageUri = selectedImage.uri.startsWith('file://')
            ? selectedImage.uri
            : `file://${selectedImage.uri}`;

          setImages([...images, selectedImage]);

          // Navigate to OnlineProductSearchScreen with the captured image
          navigation.navigate('OnlineProductSearch', {
            imageUri: imageUri,
            imageType: selectedImage.type || 'image/jpeg',
            returnToUpload: true,
          });
        } catch (error) {
          console.error('Error processing camera image:', error);
          // Alert.alert('Error', 'Failed to process the captured image');
          Snackbar.show(
            'Failed to process the capture image',
            Snackbar.LENGTH_SHORT,
          );
        }
      });
    }
  };

  const handleAddImage = async () => {
    const hasPermission = await checkAndroidPermissions();
    if (!hasPermission) {
      return;
    }

    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 0, // Allow multiple images
      includeBase64: true,
    });

    if (result.didCancel) {
      console.log('User cancelled image selection');
    } else if (result.errorCode) {
      // Alert.alert('Error', 'Failed to select photos: ' + result.errorMessage);
      Snackbar.show(
        'Failed to select photos: ' + result.errorMessage,
        Snackbar.LENGTH_SHORT,
      );
    } else if (result.assets) {
      const newImages = result.assets.map(image => ({
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: `product_image_${Date.now()}.jpg`,
      }));

      if (images.length === 0) {
        // If this is the first image, navigate to search
        setImages([...images, ...newImages]);
        navigation.navigate('OnlineProductSearch', {
          imageUri: newImages[0].uri,
          imageType: newImages[0].type || 'image/jpeg',
          returnToUpload: true,
        });
      } else {
        // For subsequent images, just add them directly
        setImages([...images, ...newImages]);
      }
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
        errorMessage += 'Please check your internet connection.';
      } else if (error.message.includes('timeout')) {
        errorMessage += 'Request timed out. Please try again.';
      } else if (error.message.includes('413')) {
        errorMessage +=
          'Image file is too large. Please choose a smaller image.';
      } else {
        errorMessage += error.message;
      }

      setError(errorMessage);
      // Alert.alert('Error', errorMessage);
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
      // Alert.alert('Error', 'Please enter a collection name');
      Snackbar.show('Please enter a collection name', Snackbar.LENGTH_SHORT);
      return;
    }

    try {
      const token = await AsyncStorage.getItem('accessToken');

      // Create form data for the collection
      const formData = new FormData();
      formData.append('collection_name', newCollectionName.trim());
      formData.append(
        'description',
        newCollectionDescription.trim() || newCollectionName.trim(),
      );

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
          description: response.data.data.description,
          image: response.data.data.collection_image,
        };

        setCollections(prevCollections => [newCollection, ...prevCollections]);
        setSelectedCollections(prev => [...prev, newCollection]);
        setShowCollectionInput(false);
        setNewCollectionName('');
        setNewCollectionDescription('');
        setNewCollectionImage(null);

        // Alert.alert('Success', 'Collection created successfully!');
        Snackbar.show(
          'Collection created successfully!',
          Snackbar.LENGTH_SHORT,
        );
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      // Alert.alert(
      //   'Error',
      //   error.response?.data?.message || 'Failed to create collection',
      // );
      Snackbar.show(
        error.response?.data?.message || 'Failed to create collection',
        Snackbar.LENGTH_SHORT,
      );
    }
  };

  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) {
      // Alert.alert('Error', 'Please enter a space name');
      Snackbar.show('Please enter a space name', Snackbar.LENGTH_SHORT);
      return;
    }

    if (!newSpaceImage) {
      Snackbar.show('Please select a space image', Snackbar.LENGTH_SHORT);
      // Alert.alert('Error', 'Please select a space image');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('accessToken');

      // Create form data for the space
      const formData = new FormData();
      formData.append('space_name', newSpaceName.trim());
      formData.append(
        'description',
        newSpaceDescription.trim() || newSpaceName.trim(),
      );

      // Add space image (mandatory)
      formData.append('space_image', {
        uri: newSpaceImage.uri,
        type: newSpaceImage.type || 'image/jpeg',
        name: 'space_image.jpg',
      });

      const response = await axios.post(`${BASE_URL}/spaces`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        console.log('Space creation response:', response.data);

        const newSpace = {
          id: response.data.data.id,
          name: response.data.data.space_name || newSpaceName.trim(),
          description: response.data.data.description,
          image: response.data.data.space_image,
        };

        console.log('Created new space:', newSpace);

        setSpaces(prevSpaces => [newSpace, ...prevSpaces]);
        setSelectedSpace(newSpace);
        setShowSpaceInput(false);
        setNewSpaceName('');
        setNewSpaceDescription('');
        setNewSpaceImage(null);

        // Alert.alert('Success', 'Space created successfully!');
        Snackbar.show('Space created successfully!', Snackbar.LENGTH_SHORT);
      }
    } catch (error) {
      console.error('Error creating space:', error.response?.data || error);
      // Alert.alert(
      //   'Error',
      //   error.response?.data?.message || 'Failed to create space',
      // );
      Snackbar.show(
        error.response?.data?.message || 'Failed to create space',
        Snackbar.LENGTH_SHORT,
      );
    }
  };

  const handleUpload = async () => {
    try {
      if (!productName.trim()) {
        // Alert.alert('Error', 'Please enter product name');
        Snackbar.show('Please enter product name', Snackbar.LENGTH_SHORT);
        return;
      }

      if (!description.trim()) {
        // Alert.alert('Error', 'Please enter description');
        Snackbar.show('Please enter description', Snackbar.LENGTH_SHORT);
        return;
      }

      if (!price.trim() || isNaN(parseFloat(price))) {
        // Alert.alert('Error', 'Please enter a valid price');
        Snackbar.show('Please enter a valid price', Snackbar.LENGTH_SHORT);
        return;
      }

      if (!selectedSpace?.id) {
        // Alert.alert('Error', 'Please select a space');
        Snackbar.show('Please select a space', Snackbar.LENGTH_SHORT);
        return;
      }

      if (!selectedCollections?.length) {
        // Alert.alert('Error', 'Please select at least one collection');
        Snackbar.show(
          'Please select at least one collection',
          Snackbar.LENGTH_SHORT,
        );
        return;
      }

      if (!images?.length) {
        // Alert.alert('Error', 'Please add at least one image');
        Snackbar.show('Please add at least one image', Snackbar.LENGTH_SHORT);
        return;
      }

      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const formData = new FormData();
      formData.append('product_name', productName.trim());
      formData.append('description', description.trim());
      formData.append('price', price.toString());
      formData.append('space_id', selectedSpace.id.toString());

      // Append collection IDs as collection_id[0], collection_id[1], etc.
      selectedCollections.forEach((collection, index) => {
        if (collection?.id) {
          formData.append(`collection_id[${index}]`, collection.id.toString());
        }
      });

      // Append all images as 'image'
      images.forEach((image, index) => {
        if (image?.uri) {
          formData.append('image', {
            uri: image.uri,
            type: image.type || 'image/jpeg',
            name: `image_${index}.jpg`,
          });
        }
      });

      console.log('Uploading product with data:', {
        product_name: productName.trim(),
        description: description.trim(),
        price: price,
        space_id: selectedSpace.id,
        collection_ids: selectedCollections.map(c => c?.id).filter(Boolean),
        number_of_images: images.length,
      });

      const response = await axios.post(`${BASE_URL}/products`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', response.data);

      if (response.data && response.data.type === 'success') {
        // Alert.alert('Success', 'Product uploaded successfully!', [
        //   {
        //     text: 'OK',
        //     onPress: () => {
        //       // Reset form
        //       setImages([]);
        //       setProductName('');
        //       setDescription('');
        //       setPrice('');
        //       setSelectedSpace(null);
        //       setSelectedCollections([]);
        //       // Navigate back to space
        //       navigation.navigate('IndividualSpace', {
        //         spaceId: selectedSpace.id.toString(),
        //       });
        //     },
        //   },
        // ]);

        Snackbar.show({
          text: 'Product uploaded successfully',
          action: {
            text: 'OK',
            onPress: () => {
              setImages([]);
              setProductName('');
              setDescription('');
              setPrice('');
              setSelectedSpace(null);
              setSelectedCollections([]);
              // Navigate back to space
              navigation.navigate('IndividualSpace', {
                spaceId: selectedSpace.id.toString(),
              });
            },
          },
        });
      } else {
        throw new Error('Upload failed: Invalid response from server');
      }
    } catch (error) {
      console.error(
        'Error uploading product:',
        error.response?.data || error.message,
      );
      // Alert.alert(
      //   'Error',
      //   error.response?.data?.message ||
      //     error.message ||
      //     'Failed to upload product',
      // );
      Snackbar.show(
        error.response?.data?.message ||
          error.message ||
          'Failed to upload product',
        Snackbar.LENGTH_SHORT,
      );
    }
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
          id: space.id || space.space_id,
          name: space.space_name || space.name || 'Unnamed Space',
          description: space.description || '',
          space_image: space.space_image || null,
          total_products: space.total_products || 0,
          created_at: space.created_at,
        }));

        console.log('Processed Spaces:', spacesData);
        setSpaces(spacesData);
      }
    } catch (error) {
      console.error('Error fetching spaces:', error.response?.data || error);
      setSpaces([]);
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
      // Alert.alert('Error', 'An error occurred while fetching collections.');
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

  useEffect(() => {
    if (route.params?.prefillData) {
      const {title, price, description, productImage, uploadedImage} =
        route.params.prefillData;
      setProductName(title);
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
          <Text style={styles.label}>Product Name</Text>
          <TextInput
            style={[styles.input, styles.titleInput]}
            value={productName}
            onChangeText={setProductName}
            placeholder="Enter product name"
            multiline
            numberOfLines={2}
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
                  onPress={() => setSelectedSpace(space)}>
                  <View style={styles.spaceItemContent}>
                    {space.space_image ? (
                      <Image
                        source={{uri: space.space_image}}
                        style={styles.spaceItemImage}
                        onError={e =>
                          console.log('Space image load error:', e.nativeEvent)
                        }
                      />
                    ) : (
                      <Image
                        source={require('../assets/images/Space_default.jpg')}
                        style={styles.spaceItemImage}
                      />
                    )}
                    <View style={styles.spaceItemTextContainer}>
                      <Text
                        style={[
                          styles.spaceText,
                          selectedSpace?.id === space.id &&
                            styles.selectedSpaceText,
                        ]}>
                        {space.name}
                      </Text>
                      <Text style={styles.spaceItemCount}>
                        {space.total_products}{' '}
                        {space.total_products === 1 ? 'Item' : 'Items'}
                      </Text>
                    </View>
                  </View>
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
            <Text style={styles.label}>Collections (Required)</Text>
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
                    <Image
                      source={{uri: collection.image}}
                      style={styles.collectionItemImage}
                      onError={e =>
                        console.log(
                          'Collection image load error:',
                          e.nativeEvent,
                        )
                      }
                    />
                    <Text
                      style={[
                        styles.collectionText,
                        selectedCollections.some(c => c.id === collection.id) &&
                          styles.selectedCollectionText,
                      ]}>
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

          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
            <Text style={styles.uploadButtonText}>Upload Product</Text>
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
          <View style={[styles.modalContent, {width: '90%'}]}>
            <Text style={styles.modalTitle}>Create New Space</Text>

            {/* Space Image */}
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

                  if (
                    !result.didCancel &&
                    !result.errorCode &&
                    result.assets?.[0]
                  ) {
                    setNewSpaceImage(result.assets[0]);
                  }
                } catch (error) {
                  // Alert.alert('Error', 'Failed to select photo');
                  Snackbar.show(
                    'Failed to select photo',
                    Snackbar.LENGTH_SHORT,
                  );
                }
              }}>
              {newSpaceImage ? (
                <Image
                  source={{uri: newSpaceImage.uri}}
                  style={styles.previewImage}
                />
              ) : (
                <Text style={styles.imagePickerText}>
                  Add Space Image (Required)
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
                  (!newSpaceName.trim() || !newSpaceImage) &&
                    styles.disabledButton,
                ]}
                onPress={handleCreateSpace}
                disabled={!newSpaceName.trim() || !newSpaceImage}>
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Collection Modal */}
      <Modal
        visible={showCollectionInput}
        transparent={true}
        animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Collection</Text>

            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={async () => {
                try {
                  const result = await launchImageLibrary({
                    mediaType: 'photo',
                    quality: 0.8,
                    selectionLimit: 1,
                    includeBase64: true,
                  });

                  if (!result.didCancel && result.assets?.[0]) {
                    setNewCollectionImage(result.assets[0]);
                  }
                } catch (error) {
                  console.error('Error picking image:', error);
                }
              }}>
              {newCollectionImage ? (
                <Image
                  source={{uri: newCollectionImage.uri}}
                  style={styles.previewImage}
                />
              ) : (
                <Text style={styles.imagePickerText}>Add Collection Image</Text>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.modalInput}
              placeholder="Collection Name"
              value={newCollectionName}
              onChangeText={setNewCollectionName}
            />

            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Collection Description"
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
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateCollection}>
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
  titleInput: {
    minHeight: 60,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  collectionTextArea: {
    height: 120,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
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
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedSpaceText: {
    color: '#fff',
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
    borderColor: '#ff6b6b',
    borderWidth: 1,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  spaceItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  spaceItemImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  spaceItemTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  spaceItemCount: {
    fontSize: 12,
    color: '#999',
  },
  searchOnlineButton: {
    margin: 16,
    padding: 12,
    backgroundColor: '#6B46C1',
    borderRadius: 8,
    alignItems: 'center',
  },
  searchOnlineButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  imagePreviewWrapper: {
    width: 100,
    height: 100,
    position: 'relative',
    marginRight: 10,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  removeImageButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  removeImageText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
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
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedCollectionText: {
    color: '#fff',
  },
  collectionItemImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
});

export default ProductUpload;
