import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import Snackbar from '../components/Snackbar';

const BASE_URL = 'http://13.60.211.186:3000';

const ProductSkeleton = () => (
  <View style={styles.productCard}>
    <View style={[styles.productImage, styles.skeleton]} />
    <View style={styles.productInfo}>
      <View style={[styles.skeleton, { height: 20, width: '80%', marginBottom: 8 }]} />
      <View style={[styles.skeleton, { height: 16, width: '40%' }]} />
    </View>
  </View>
);

const AllProductsScreen = ({navigation}) => {
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'success'
  });
  const [imageErrors, setImageErrors] = useState({});

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

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('accessToken');

      const response = await axios.get(`${BASE_URL}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Products API Response:', response.data);

      if (response.data && response.data.type === 'success' && response.data.data) {
        const productsData = response.data.data.products.map(product => ({
          id: product.product_id,
          name: product.product_name,
          description: product.description || '',
          price: product.price || '0',
          image_url: product.primary_image_url,
          product_space: product.product_space || 'No Space Selected',
          space_id: product.space_id,
          created_at: product.created_at,
        }));

        console.log('Processed products:', productsData);
        setProducts(productsData);
      } else {
        console.error('Invalid products response structure:', response.data);
        setProducts([]);
        showSnackbar('No products found', 'error');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showSnackbar('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, [fetchProducts]);

  useEffect(() => {
    console.log('AllProductsScreen mounted');
    fetchProducts();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProducts();
    });
    return unsubscribe;
  }, [navigation, fetchProducts]);

  const handleImageError = (productId) => {
    setImageErrors(prev => ({
      ...prev,
      [productId]: true
    }));
  };

  const getImageSource = (product) => {
    if (imageErrors[product.id] || !product.image_url) {
      return require('../assets/images/placeholder.png');
    }
    return { uri: product.image_url };
  };

  const renderSkeletons = () => (
    <View style={styles.productsContainer}>
      {[1, 2, 3, 4].map(key => (
        <ProductSkeleton key={key} />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Image 
            source={require('../assets/images/arrow_back.png')} 
            style={[styles.icon, { tintColor: '#FFFFFF' }]}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>All Products</Text>
        <View style={styles.placeholderIcon} />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6B46C1']}
          />
        }
        contentContainerStyle={styles.scrollContent}>

        {loading ? (
          renderSkeletons()
        ) : products.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Image 
              source={require('../assets/images/No_Products.png')}
              style={styles.emptyStateImage}
            />
            <Text style={styles.emptyStateTitle}>
              Your Product Collection is Empty!
            </Text>
            <Text style={styles.emptyStateText}>
              Start adding products to keep your space organized and accessible anytime.
            </Text>
            <TouchableOpacity 
              style={styles.addFirstProductButton}
              onPress={() => navigation.navigate('ProductUpload')}>
              <Text style={styles.addFirstProductText}>+ Add Your First Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.productsContainer}>
            {products.map(product => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => navigation.navigate('IndividualProductScreen', { 
                  productId: product.id,
                  productName: product.name,
                  description: product.description,
                  price: product.price,
                  image: product.image_url,
                  spaceName: product.product_space,
                  spaceId: product.space_id
                })}>
                <Image
                  source={getImageSource(product)}
                  style={styles.productImage}
                  resizeMode="cover"
                  onError={() => handleImageError(product.id)}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    ${parseFloat(product.price || 0).toFixed(2)}
                  </Text>
                  <Text style={styles.spaceName}>
                    {product.product_space}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNavBar navigation={navigation} />
      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
      />
    </View>
  );
};

export default AllProductsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    backgroundColor: '#6B46C1',
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
  },
  icon: {
    width: 24,
    height: 24,
  },
  placeholderIcon: {
    width: 24,
    height: 24,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  productsContainer: {
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  spaceName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyStateImage: {
    width: '80%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  addFirstProductButton: {
    backgroundColor: '#6B46C1',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFirstProductText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  skeleton: {
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
    overflow: 'hidden',
  },
  '@keyframes shimmer': {
    '0%': {
      backgroundColor: '#E1E9EE',
    },
    '100%': {
      backgroundColor: '#F4F4F4',
    },
  },
});
