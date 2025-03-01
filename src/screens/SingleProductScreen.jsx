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
import backArrowIcon from '../assets/images/arrow_back.png';

const BASE_URL = 'http://13.60.211.186:3000';

const ProductSkeleton = () => (
  <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton}>
        <Image source={backArrowIcon} style={styles.backIcon} />
      </TouchableOpacity>
    </View>
    <View style={[styles.skeletonImage, styles.skeleton]} />
    <View style={styles.contentContainer}>
      <View style={[styles.skeletonText, styles.skeleton, { width: '80%' }]} />
      <View style={[styles.skeletonText, styles.skeleton, { width: '60%' }]} />
      <View style={[styles.skeletonText, styles.skeleton, { width: '40%' }]} />
    </View>
  </View>
);

export const ProductDetailsScreen = ({ navigation, route }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
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

      // Handle multiple images
      const images = [];
      if (productData.primary_image_url) {
        images.push(productData.primary_image_url);
      }
      if (productData.additional_images && productData.additional_images.length > 0) {
        images.push(...productData.additional_images);
      }
      
      setProductImages(images);
      setProduct(productData);
      setError(null);

    } catch (error) {
      console.error('Error fetching product details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      prefillData: {
        product_id: product.id,
        title: product.product_name,
        description: product.description,
        price: product.price,
        space_id: product.space_id,
        space_name: product.space_name,
        collections: product.collections ? product.collections.map(c => c.id) : [],
        collection_details: product.collections || [],
        images: [
          product.primary_image_url, 
          ...(product.additional_images || [])
        ]
      }
    });
  };

  if (loading) {
    return <ProductSkeleton />;
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
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
            style={styles.swiper} 
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
        <Text 
          style={styles.productTitle} 
          numberOfLines={2} 
          ellipsizeMode="tail"
        >
          {product.product_name || 'Unnamed Product'}
        </Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Price:</Text>
          <Text style={styles.infoValue}>
            ${parseFloat(product.price || 0).toFixed(2)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Space:</Text>
          <Text style={styles.infoValue}>{product.space_name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Collection:</Text>
          <Text style={styles.infoValue}>
            {product.collection_names && product.collection_names.length > 0 
              ? product.collection_names.join(', ') 
              : 'No Collection'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Updated:</Text>
          <Text style={styles.infoValue}>
            {moment(product.updated_at).format('MMMM Do YYYY, h:mm a')}
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
            style={[styles.button, styles.updateButton]}
            onPress={() => navigation.navigate('ProductUpload', { 
              prefillData: {
                product_id: product.id,
                title: product.product_name,
                description: product.description,
                price: product.price,
                space_id: product.space_id,
                space_name: product.space_name,
                collections: product.collections ? product.collections.map(c => c.id) : [],
                collection_details: product.collections || [],
                images: [
                  product.primary_image_url, 
                  ...(product.additional_images || [])
                ]
              }
            })}
          >
            <Text style={styles.updateButtonText}>Update Product</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.addButton]} 
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
    height: 300,
    position: 'relative',
  },
  swiper: {
    height: 300,
  },
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    lineHeight: 30,
    maxHeight: 60, // Two lines of text
    overflow: 'hidden',
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
    marginTop: 10,
  },
  descriptionLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#666666',
  },
  descriptionText: {
    color: '#333333',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  updateButton: {
      backgroundColor: '#F5F3FF',
  },
  addButton: {
    backgroundColor: '#6B3CE9',
  },
  updateButtonText: {
    color: '#6B3CE9',
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  skeleton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
  },
  skeletonImage: {
    width: '100%',
    height: 250,
  },
  skeletonText: {
    height: 20,
    marginBottom: 10,
  },
  contentContainer: {
    padding: 20,
  },
});

export default ProductDetailsScreen;