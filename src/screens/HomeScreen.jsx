import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import {useAuth} from '../context/AuthContext';

const BASE_URL = 'http://13.49.68.11:3000';
const {width} = Dimensions.get('window');
const cardMargin = 10;
const cardWidth = (width - 4 * cardMargin) / 3; // Adjusting width for 3 columns

const HomeScreen = () => {
  const navigation = useNavigation();
  const [spaces, setSpaces] = useState([]);
  const [collections, setCollections] = useState([]);
  const {userToken} = useAuth();
  const [totalItems, setTotalItems] = useState(0);
  const [totalWorth, setTotalWorth] = useState(0);

  const fetchSpaceDetails = async (spaceId, token) => {
    try {
      // Fetch detailed information for each space
      const detailResponse = await axios.get(
        `${BASE_URL}/spaces/${spaceId}/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const products = detailResponse.data?.data || detailResponse.data || [];

      return {
        items_count: products.length,
        total_worth: products.reduce(
          (sum, product) => sum + (parseFloat(product.price) || 0),
          0,
        ),
        primary_image:
          products.length > 0 ? products[0].primary_image_url || null : null,
      };
    } catch (error) {
      console.error(`Error fetching space ${spaceId} details:`, error.message);
      return {
        items_count: 0,
        total_worth: 0,
        primary_image: null,
      };
    }
  };

  const fetchSpaces = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log('Fetching spaces with token:', token);

      const response = await axios.get(`${BASE_URL}/spaces/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(
        'Raw Space Response:',
        JSON.stringify(response.data, null, 2),
      );

      const spacesWithDetails = await Promise.all(
        (response.data?.data || response.data || []).map(async space => {
          const details = await fetchSpaceDetails(
            space.id || space.space_id,
            token,
          );

          console.log('Processing space:', {
            id: space.id,
            name: space.name,
            space_image: space.space_image,
          });

          return {
            id: space.id || space.space_id,
            name:
              space.space_name || space.name || space.title || 'Untitled Space',
            description: space.description || '',
            space_image: space.space_image || null,
            items_count: details.items_count,
            total_worth: details.total_worth,
            created_at: space.created_at,
          };
        }),
      );

      const sortedSpaces = spacesWithDetails.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
      );

      console.log('Processed Spaces:', sortedSpaces);

      const totalItemsCount = sortedSpaces.reduce(
        (sum, space) => sum + (space.items_count || 0),
        0,
      );
      const totalSpacesWorth = sortedSpaces.reduce(
        (sum, space) => sum + (space.total_worth || 0),
        0,
      );

      setSpaces(sortedSpaces);
      setTotalItems(totalItemsCount);
      setTotalWorth(totalSpacesWorth);
    } catch (error) {
      console.error('Error fetching spaces:', error);
      setSpaces([]);
      setTotalItems(0);
      setTotalWorth(0);
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

      const collectionsWithDetails = await Promise.all(
        (response.data?.data || response.data || []).map(async collection => {
          try {
            console.log('colll', collection);
            const productsResponse = await axios.get(
              `${BASE_URL}/collections/${collection.collection_id}/products`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              },
            );

            const products =
              productsResponse.data?.data || productsResponse.data || [];

            return {
              id: collection.id || collection.collection_id,
              name:
                collection.collection_name ||
                collection.name ||
                'Untitled Collection',
              description: collection?.description || '',
              image:
                products.length > 0
                  ? products[0].primary_image_url || null
                  : collection.collection_image ||
                    collection.image ||
                    require('../assets/images/placeholder.png'),
              items_count: collection.products.total_products,
              total_worth: products.reduce(
                (sum, product) => sum + (parseFloat(product.price) || 0),
                0,
              ),
              created_at: collection.created_at,
            };
          } catch (detailError) {
            console.log(
              `Error fetching collection ${collection.id} details:`,
              detailError.message,
            );
            return {
              id: collection.id || collection.collection_id,
              name:
                collection.collection_name ||
                collection.name ||
                'Untitled Collection',
              description: collection.description || '',
              image:
                collection.collection_image ||
                collection.image ||
                require('../assets/images/placeholder.png'),
              items_count: 0,
              total_worth: 0,
              created_at: collection.created_at,
            };
          }
        }),
      );

      const sortedCollections = collectionsWithDetails.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
      );

      setCollections(sortedCollections);

      console.log(
        'Processed Collections Data:',
        JSON.stringify(sortedCollections, null, 2),
      );
    } catch (error) {
      console.log(
        'Error fetching collections:',
        error.response?.data || error.message,
      );
      setCollections([]);
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchSpaces();
      fetchCollections();
    }
  }, [userToken]);

  const renderSpaceCard = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.spaceCard}
        onPress={() =>
          navigation.navigate('IndividualSpace', {
            spaceId: item.id,
            spaceName: item.name,
          })
        }>
        <Image
          source={
            item.space_image
              ? {uri: item.space_image}
              : require('../assets/images/Space_default.jpg')
          }
          style={styles.spaceImage}
          resizeMode="cover"
          onError={e =>
            console.log('Space image load error:', {
              spaceId: item.id,
              spaceName: item.name,
              space_image: item.space_image,
              error: e.nativeEvent,
            })
          }
        />
        <View style={styles.spaceOverlay}>
          <Text style={styles.spaceName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemCount}>{item.items_count || 0} Items</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCollectionCard = ({item}) => (
    <TouchableOpacity
      style={styles.spaceCard}
      onPress={() => {
        console.log('Navigating to CollectionDetail with ID:', item.id);
        navigation.navigate(
          'IndividualCollection',
          {
            collectionId: item.id,
            collectionName: item.name,
          },
          //   {
          //   collection: {
          //     id: item.id,
          //     name: item.name,
          //     description: item.description,
          //     image:
          //       typeof item.image === 'number' ? item.image : {uri: item.image},
          //     items_count: item.items_count,
          //   },
          // }
        );
      }}>
      <Image
        source={typeof item.image === 'number' ? item.image : {uri: item.image}}
        style={styles.spaceImage}
        resizeMode="cover"
      />
      <View style={styles.spaceOverlay}>
        <Text style={styles.spaceName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.itemCount}>{item.items_count || 0} Items</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#6B46C1" barStyle="light-content" />
      <LinearGradient colors={['#6B46C1', '#9F7AEA']} style={styles.header}>
        <View style={styles.headerTop}>
          <Image
            source={require('../assets/images/LogoHorizontal.png')}
            style={styles.logo}
          />
        </View>
      </LinearGradient>
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, {backgroundColor: '#FFE8D6'}]}>
          <Text style={styles.summaryNumber}>{totalItems}</Text>
          <Text style={styles.summaryLabel}>Total Items</Text>
        </View>
        <View style={[styles.summaryCard, {backgroundColor: '#E8F4F8'}]}>
          <Text style={styles.summaryNumber}>${totalWorth.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Total Worth</Text>
        </View>
        <View style={[styles.summaryCard, {backgroundColor: '#F0E6FF'}]}>
          <Text style={styles.summaryNumber}>{spaces.length}</Text>
          <Text style={styles.summaryLabel}>Spaces</Text>
        </View>
      </View>

      {/* Spaces Section */}
      <View style={styles.spacesContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Spaces</Text>
          {spaces.length > 3 && (
            <TouchableOpacity onPress={() => navigation.navigate('Spaces')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          data={spaces.slice(0, 3)}
          renderItem={renderSpaceCard}
          keyExtractor={(item, index) =>
            item?.id?.toString() ||
            item?.space_id?.toString() ||
            index.toString()
          }
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No spaces found</Text>
            </View>
          )}
        />
      </View>

      {/* Collections Section */}
      <View style={styles.spacesContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Collections</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Collections')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={collections.slice(0, 3)}
          renderItem={renderCollectionCard}
          keyExtractor={(item, index) =>
            item?.id?.toString() ||
            item?.collection_id?.toString() ||
            index.toString()
          }
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No collections found</Text>
            </View>
          )}
        />
      </View>

      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 90,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    height: 80,
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
    paddingVertical: 20,
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
