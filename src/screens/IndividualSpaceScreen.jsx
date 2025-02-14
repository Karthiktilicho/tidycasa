import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://13.49.68.11:3000';
const { width } = Dimensions.get('window');
const cardMargin = 10;
const cardWidth = (width - (4 * cardMargin)) / 2; // Adjusting width for 2 columns

const IndividualSpaceScreen = ({ route, navigation }) => {
  const { space } = route.params;
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalWorth, setTotalWorth] = useState(0);

  useEffect(() => {
    fetchSpaceProducts();
  }, [space.id]);

  const fetchSpaceProducts = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(`${BASE_URL}/products/space/${space.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && Array.isArray(response.data.data)) {
        const fetchedProducts = response.data.data;
        setProducts(fetchedProducts);
        
        // Calculate total worth of products in the space
        const worth = fetchedProducts.reduce((total, product) => {
          return total + (parseFloat(product.price) || 0);
        }, 0);
        setTotalWorth(worth);
      } else {
        // Handle case where no data is returned
        setProducts([]);
        setTotalWorth(0);
      }
    } catch (error) {
      console.error('Error fetching space products:', error.response?.data || error.message);
      
      // Show user-friendly error message
      Alert.alert(
        'Error Loading Products', 
        'Unable to fetch products for this space. Please try again later.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      
      setProducts([]);
      setTotalWorth(0);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProductCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => {
        // TODO: Add product details navigation if needed
        console.log('Product clicked:', item);
      }}
    >
      <Image 
        source={{ 
          uri: item.images && item.images.length > 0 
            ? item.images[0].url 
            : 'https://via.placeholder.com/150' 
        }} 
        style={styles.productImage} 
      />
      <View style={styles.productDetails}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.product_name}
        </Text>
        <Text style={styles.productPrice}>
          ${parseFloat(item.price).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B46C1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Space Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        
        <Image 
          source={
            typeof space.image === 'string' 
              ? { uri: space.image } 
              : space.image
          } 
          style={styles.spaceHeaderImage} 
        />
        
        <View style={styles.spaceInfoContainer}>
          <Text style={styles.spaceName}>{space.title}</Text>
          <Text style={styles.spaceDescription} numberOfLines={2}>
            {space.description}
          </Text>
          
          <View style={styles.spaceStatsContainer}>
            <View style={styles.spaceStat}>
              <Text style={styles.spaceStatNumber}>{products.length}</Text>
              <Text style={styles.spaceStatLabel}>Products</Text>
            </View>
            <View style={styles.spaceStat}>
              <Text style={styles.spaceStatNumber}>${totalWorth.toFixed(2)}</Text>
              <Text style={styles.spaceStatLabel}>Total Worth</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products in this space yet</Text>
          </View>
        }
      />

      {/* Add Product Button */}
      <TouchableOpacity 
        style={styles.addProductButton}
        onPress={() => navigation.navigate('ProductUpload', { spaceId: space.id })}
      >
        <Text style={styles.addProductButtonText}>+ Add Product</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    backgroundColor: '#f8f9fa',
    paddingBottom: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 15,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  spaceHeaderImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  spaceInfoContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  spaceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  spaceDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  spaceStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spaceStat: {
    alignItems: 'center',
    flex: 1,
  },
  spaceStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B46C1',
  },
  spaceStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 80,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    resizeMode: 'cover',
  },
  productDetails: {
    padding: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    color: '#6B46C1',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
  },
  addProductButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#6B46C1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addProductButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default IndividualSpaceScreen;
