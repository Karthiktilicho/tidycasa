import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import Swiper from 'react-native-swiper';
import backArrowIcon from '../assets/images/back-arrow.png';

const BASE_URL = 'http://13.49.68.11:3000';

const SingleProductScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [spaceName, setSpaceName] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [productImages, setProductImages] = useState([]);
  const [userSpaces, setUserSpaces] = useState([]);

  const fetchProductDetails = useCallback(async () => {
    try {
      // Reset previous states
      setLoading(true);
      setError(null);

      // Get the product ID from route params
      const { productId } = route.params;
      
      if (!productId) {
        throw new Error('No product ID provided');
      }

      console.log('Fetching product details for ID:', productId);

      // Retrieve access token
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No access token found. Please log in again.');
      }

      // Create axios cancel token for request cancellation
      const source = axios.CancelToken.source();
      const timeoutId = setTimeout(() => {
        source.cancel('Request timed out');
      }, 10000); // 10 seconds timeout

      // Fetch product details
      const productResponse = await axios.get(`${BASE_URL}/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cancelToken: source.token,
      });

      // Clear timeout
      clearTimeout(timeoutId);

      // Extract product details
      const productData = productResponse.data.data || productResponse.data;

      if (!productData) {
        throw new Error('No product data received');
      }

      // Fetch space details
      let spaceName = 'Unknown Space';
      try {
        if (productData.space_id) {
          const spaceResponse = await axios.get(`${BASE_URL}/spaces/${productData.space_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          spaceName = spaceResponse.data.data?.name || 'Unknown Space';
        }
      } catch (spaceError) {
        console.warn('Error fetching space details:', spaceError.message);
      }

      // Fetch collection details
      let collectionName = 'Unknown Collection';
      try {
        if (productData.collection_id) {
          const collectionResponse = await axios.get(`${BASE_URL}/collections/${productData.collection_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          collectionName = collectionResponse.data.data?.name || 'Unknown Collection';
        }
      } catch (collectionError) {
        console.warn('Error fetching collection details:', collectionError.message);
      }

      // Handle multiple images
      const images = [];
      if (productData.primary_image_url) {
        images.push(productData.primary_image_url);
      }
      if (productData.additional_images && productData.additional_images.length > 0) {
        images.push(...productData.additional_images);
      }
      
      setProductImages(images);

      // Combine product data with fallback values
      const fullProductData = {
        ...productData,
        space_name: spaceName,
        collection_name: collectionName,
        uploaded_at: productData.uploaded_at || new Date().toISOString()
      };

      setProduct(fullProductData);
      setSpaceName(spaceName);
      setCollectionName(collectionName);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      // Clear any ongoing refresh state
      setRefreshing(false);

      // Handle cancellation separately
      if (axios.isCancel(error)) {
        console.warn('Request cancelled:', error.message);
        Alert.alert(
          'Request Timeout',
          'The request took too long. Please try again.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        console.error('Comprehensive Error Details:', {
          name: error.name,
          message: error.message,
          code: error.code,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          } : 'No response',
        });

        // Show an alert with the error
        Alert.alert(
          'Error Fetching Product',
          error.response?.data?.message || error.message || 'An unexpected error occurred',
          [{ 
            text: 'Retry', 
            onPress: fetchProductDetails 
          }, { 
            text: 'Cancel', 
            onPress: () => navigation.goBack() 
          }]
        );
      }

      setError({
        message: error.response?.data?.message || 
                 error.message || 
                 'Failed to fetch product details',
        status: error.response?.status
      });
      setLoading(false);
    }
  }, [route.params.productId, navigation]);

  const fetchUserSpaces = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await axios.get(`${BASE_URL}/spaces`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const spaces = response.data.data || [];
      setUserSpaces(spaces);
    } catch (error) {
      console.warn('Error fetching user spaces:', error.message);
    }
  }, []);

  useEffect(() => {
    fetchProductDetails();
    fetchUserSpaces();
  }, [fetchProductDetails, fetchUserSpaces]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProductDetails();
  }, [fetchProductDetails]);

  // Navigate to Product Upload Screen
  const handleAddProduct = () => {
    navigation.navigate('ProductUpload', {
      spaceId: route.params.spaceId
    });
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B46C1" />
        <Text>Loading Product Details...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error.message}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={fetchProductDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image
            source={backArrowIcon}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
      </View>

      {/* Product Image */}
      <View style={styles.imageContainer}>
        {product && productImages.length > 0 ? (
          <Swiper 
            style={styles.wrapper} 
            showsButtons={productImages.length > 1}
            loop={false}
          >
            {productImages.map((imageUrl, index) => (
              <View key={index} style={styles.slide}>
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.productImage} 
                  resizeMode="cover" 
                />
              </View>
            ))}
          </Swiper>
        ) : (
          <Image 
            source={{ uri: 'https://via.placeholder.com/350x350.png?text=No+Image' }} 
            style={styles.productImage} 
            resizeMode="cover" 
          />
        )}
      </View>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.productTitle}>{product.product_name || 'Unnamed Product'}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Price:</Text>
          <Text style={styles.infoValue}>
            ${parseFloat(product.price || 0).toFixed(2)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Space:</Text>
          <Text style={styles.infoValue}>{spaceName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Collection:</Text>
          <Text style={styles.infoValue}>{collectionName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Uploaded:</Text>
          <Text style={styles.infoValue}>
            {moment(product.uploaded_at).format('MMMM Do YYYY, h:mm a')}
          </Text>
        </View>

        {product.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Description:</Text>
            <Text style={styles.descriptionText}>
              {product.description}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.addProductButton} 
            onPress={handleAddProduct}
          >
            <Text style={styles.buttonText}>Add Product</Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#F4F4F4',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#000', 
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  imageContainer: {
    width: '100%',
    height: 350, // Fixed height for consistent layout
  },
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 20,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: 'bold',
    marginRight: 10,
    color: '#666666',
    width: 100,
  },
  infoValue: {
    flex: 1,
    color: '#333333',
  },
  descriptionContainer: {
    marginTop: 15,
  },
  descriptionLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#666666',
  },
  descriptionText: {
    color: '#333333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  addProductButton: {
    flex: 1,
    backgroundColor: '#6B46C1',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6B46C1',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#6B46C1',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default SingleProductScreen;
