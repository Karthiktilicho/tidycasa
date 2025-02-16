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
  const {userToken} = useAuth();

  console.log(products, 'spaces');

  const fetchProducts = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log('Fetching products with token:', token);
      const response = await axios.get(
        `${BASE_URL}/spaces/${route.params.spaceId}/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log(
        'Raw Products API Response:',
        JSON.stringify(response.data, null, 2),
      );

      // Map the data using product fields from the API response
      const productsData = (response.data?.data || response.data || [])
        .map(product => ({
          id: product.product_id,
          name: product.product_name || 'Unnamed Product',
          description: product.description || '',
          image:
            product.primary_image_url ||
            require('../assets/images/placeholder.png'),
          price: product.price,
          owner_id: product.owner_id,
          space_id: product.space_id,
          created_at: product.created_at,
        }))
        .sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
        );

      console.log(
        'Processed Products Data:',
        JSON.stringify(productsData, null, 2),
      );
      setProducts(productsData); // or setSpaces(productsData) if you're still using that state variable
    } catch (error) {
      console.error(
        'Error fetching products:',
        error.response?.data || error.message,
      );
      // Optionally set empty array or show error to user
      setProducts([]); // or setSpaces([])
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchProducts();
    }
  }, [userToken]);

  const renderSpaceCard = ({item}) => (
    <TouchableOpacity
      style={styles.spaceCard}
      onPress={() =>
        navigation.navigate('IndividualProductScreen', {
          spaceId: item.id,
          spaceName: item.name,
        })
      }>
      <Image
        source={typeof item.image === 'number' ? item.image : {uri: item.image}}
        style={styles.spaceImage}
        resizeMode="cover"
      />
      <View style={styles.spaceOverlay}>
        <Text style={styles.spaceName}>{item.name}</Text>
        <Text style={styles.itemCount}>{item.items_count} Items</Text>
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
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Space Details</Text>
      </View>
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, {backgroundColor: '#FFE8D6'}]}>
          <Text style={styles.summaryNumber}>0</Text>
          <Text style={styles.summaryLabel}>Total Items</Text>
        </View>
        <View style={[styles.summaryCard, {backgroundColor: '#E8F4F8'}]}>
          <Text style={styles.summaryNumber}>$0</Text>
          <Text style={styles.summaryLabel}>Total Worth</Text>
        </View>
        <View style={[styles.summaryCard, {backgroundColor: '#F0E6FF'}]}>
          <Text style={styles.summaryNumber}>0</Text>
          <Text style={styles.summaryLabel}>Categories</Text>
        </View>
      </View>

      <View style={styles.spacesContainer}>
        {/* <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Spaces</Text>
          {spaces.length > 3 && (
            <TouchableOpacity onPress={() => navigation.navigate('Spaces')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          )}
        </View> */}
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
          contentContainerStyle={styles.carouselContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No spaces found</Text>
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
    // justifyContent: 'space-between',
    // alignItems: 'center',
    gap: 16,
    padding: 16,
    // backgroundColor: '#F2E6DF',
    // position: 'absolute',
    width: '100%',
    // height: 289,

    // zIndex: 100,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    height: 32,
    width: 120,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: -9,
  },
  summaryCard: {
    width: (width - 48) / 3,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  spacesContainer: {
    flex: 1,

    // paddingVertical: 20,
  },
  carouselContent: {
    paddingHorizontal: 15,
  },
  spaceCard: {
    width: cardWidth,
    aspectRatio: 1, // Ensures a square shape
    margin: cardMargin / 2,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
    flex: 1,
  },
  spaceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  spaceOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 2,
    paddingLeft: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  spaceName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  itemCount: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  emptyContainer: {
    width: width - 10,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#6B46C1',
    fontWeight: '600',
  },
});

export default HomeScreen;
