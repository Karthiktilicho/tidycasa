import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BottomNavBar from '../components/BottomNavBar';
import SkeletonLoader from '../components/SkeletonLoader';

const BASE_URL = 'http://13.49.68.11:3000';

const IndividualCollectionScreen = ({route, navigation}) => {
  const {collectionId, collectionName} = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await axios.get(
        `${BASE_URL}/collections/${collectionId}/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      if (!response.data || (!response.data.data && !response.data.length)) {
        console.warn('No products data received');
        setProducts([]);
        return;
      }

      const productsData = (response.data?.data || response.data || [])
        .map(product => {
          if (!product) {
            console.warn('Skipping invalid product:', product);
            return null;
          }
          return {
            id: product.product_id,
            name: product.product_name || 'Unnamed Product',
            description: product.description || '',
            image: product.primary_image_url,
            price: parseFloat(product.price) || 0,
            owner_id: product.owner_id,
            created_at: product.created_at,
          };
        })
        .filter(product => product !== null)
        .sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
        );

      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError({
        message: error.response?.data?.message || 
                error.message || 
                'Failed to fetch products',
        status: error.response?.status
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [collectionId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const totalProductCount = products.length;
  const totalPrice = products.reduce((sum, product) => sum + product.price, 0);

  const renderSkeletonLoaders = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../assets/images/arrow_back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{collectionName}</Text>
      </View>

      <View style={styles.summaryContainer}>
        {[1, 2, 3].map(key => (
          <View
            key={key}
            style={[styles.summaryCard, {backgroundColor: '#f5f5f5'}]}>
            <SkeletonLoader width="60%" height={24} style={{marginBottom: 8}} />
            <SkeletonLoader width="40%" height={16} />
          </View>
        ))}
      </View>

      <View style={styles.productsContainer}>
        <View style={styles.productGridRow}>
          {[1, 2, 3, 4].map(key => (
            <View key={key} style={styles.productCard}>
              <SkeletonLoader width="100%" height={150} />
              <View style={styles.productOverlay}>
                <SkeletonLoader
                  width="80%"
                  height={20}
                  style={{marginBottom: 8}}
                />
                <SkeletonLoader width="40%" height={16} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

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

  if (loading) {
    return renderSkeletonLoaders();
  }

  const renderProduct = ({item}) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        navigation.navigate('IndividualProductScreen', {
          productId: item.id,
          productName: item.name,
        });
      }}>
      <Image
        source={{uri: item.image}}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productOverlay}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>₹{item.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../assets/images/arrow_back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{collectionName}</Text>
      </View>

      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, {backgroundColor: '#FFE8D6'}]}>
          <Text style={styles.summaryNumber}>{totalProductCount}</Text>
          <Text style={styles.summaryLabel}>Total Items</Text>
        </View>
        <View style={[styles.summaryCard, {backgroundColor: '#E8F4F8'}]}>
          <Text style={styles.summaryNumber}>₹{totalPrice.toFixed(2)}</Text>
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
          renderItem={renderProduct}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productGridContent}
          columnWrapperStyle={styles.productGridRow}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          )}
        />
      </View>

      <BottomNavBar />
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
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  productGridContent: {
    paddingVertical: 8,
  },
  productGridRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  productOverlay: {
    padding: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b4ae2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#8b4ae2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default IndividualCollectionScreen;
