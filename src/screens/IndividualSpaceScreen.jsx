//

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useAuth} from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavBar from '../components/BottomNavBar';

const BASE_URL = 'http://13.49.68.11:3000';
const {width} = Dimensions.get('window');
const cardMargin = 10;
const cardWidth = (width - 4 * cardMargin) / 3; // Adjusting width for 3 columns

const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  console.log(route.params, 'parmas');
  const [products, setProducts] = useState([]);
  const [spaceName, setSpaceName] = useState('');
  const [error, setError] = useState(null);
  const {userToken} = useAuth();

  const fetchProducts = async () => {
    try {
      // Reset previous errors
      setError(null);

      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      console.log('Fetching products with token:', token);
      
      // Fetch space details first to get space name
      let spaceResponse;
      try {
        spaceResponse = await axios.get(
          `${BASE_URL}/spaces/${route.params.spaceId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 seconds timeout
          },
        );
      } catch (spaceError) {
        console.error('Space Fetch Error:', {
          status: spaceError.response?.status,
          data: spaceError.response?.data,
          message: spaceError.message,
        });
        
        // Set a default space name if fetch fails
        setSpaceName('Space');
      }
      
      // Set space name from response
      if (spaceResponse?.data?.data) {
        setSpaceName(spaceResponse.data.data.space_name || 'Space');
      }

      // Fetch products
      const response = await axios.get(
        `${BASE_URL}/spaces/${route.params.spaceId}/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 seconds timeout
        },
      );

      // Detailed logging of API response
      console.log(
        'Raw Products API Response:',
        JSON.stringify(response.data, null, 2),
      );

      // Validate response data
      if (!response.data || (!response.data.data && !response.data.length)) {
        console.warn('No products data received');
        setProducts([]);
        return;
      }

      // Map the data using product fields from the API response
      const productsData = (response.data?.data || response.data || [])
        .map(product => {
          // Validate each product
          if (!product) {
            console.warn('Skipping invalid product:', product);
            return null;
          }
          return {
            id: product.product_id,
            name: product.product_name || 'Unnamed Product',
            description: product.description || '',
            image:
              product.primary_image_url ||
              require('../assets/images/placeholder.png'),
            price: parseFloat(product.price) || 0,
            owner_id: product.owner_id,
            space_id: product.space_id,
            created_at: product.created_at,
          };
        })
        .filter(product => product !== null) // Remove any null products
        .sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
        );

      console.log(
        'Processed Products Data:',
        JSON.stringify(productsData, null, 2),
      );
      
      setProducts(productsData);
    } catch (error) {
      // Comprehensive error handling
      console.error('Comprehensive Error Details:', {
        name: error.name,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });

      // Set user-friendly error state
      setError({
        message: error.response?.data?.message || 
                 error.message || 
                 'An unexpected error occurred while fetching space details',
        status: error.response?.status
      });

      // Fallback states
      setProducts([]);
      setSpaceName('Space');
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchProducts();
    }
  }, [userToken, route.params.spaceId]);

  // Calculate total products and total price
  const totalProductCount = products.length;
  const totalPrice = products.reduce((sum, product) => sum + product.price, 0);

  // Render error message if exists
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../assets/images/arrow_back.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error.status ? `Error ${error.status}: ` : ''}
            {error.message}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchProducts}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderSpaceCard = ({item}) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        console.log('Navigating to SingleProduct with ID:', item.id);
        navigation.navigate('IndividualProductScreen', {
          productId: item.id,
          productName: item.name,
        });
      }}>
      <Image
        source={typeof item.image === 'number' ? item.image : {uri: item.image}}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productOverlay}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}>
          <Image
            source={require('../assets/images/arrow_back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{spaceName}</Text>
      </View>
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, {backgroundColor: '#FFE8D6'}]}>
          <Text style={styles.summaryNumber}>{totalProductCount}</Text>
          <Text style={styles.summaryLabel}>Total Items</Text>
        </View>
        <View style={[styles.summaryCard, {backgroundColor: '#E8F4F8'}]}>
          <Text style={styles.summaryNumber}>${totalPrice.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Total Worth</Text>
        </View>
        <View style={[styles.summaryCard, {backgroundColor: '#F0E6FF'}]}>
          <Text style={styles.summaryNumber}>0</Text>
          <Text style={styles.summaryLabel}>Categories</Text>
        </View>
      </View>

      <View style={styles.productsContainer}>
        <FlatList
          data={products}
          renderItem={renderSpaceCard}
          keyExtractor={(item, index) =>
            item?.id?.toString() ||
            item?.space_id?.toString() ||
            index.toString()
          }
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productGridContent}
          columnWrapperStyle={styles.productGridRow}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 90,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    width: '100%',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  summaryCard: {
    width: '30%',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  productGridContent: {
    paddingBottom: 16,
  },
  productGridRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 1,
  },
  productImage: {
    width: '100%',
    height: 120, // Reduced height for minimal grid
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productOverlay: {
    padding: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    height: 36, // Fixed height to maintain consistent layout
    overflow: 'hidden',
  },
  productPrice: {
    fontSize: 12,
    color: '#6B46C1',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6B46C1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    elevation: 2,
  },
  retryButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default HomeScreen;
