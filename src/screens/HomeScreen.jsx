import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../navigation/header';
import BottomNavBar from '../components/BottomNavBar';
import {useAuth} from '../context/AuthContext';
import SkeletonLoader from '../components/SkeletonLoader';

const BASE_URL = 'http://13.60.211.186:3000';
const {width} = Dimensions.get('window');
const cardMargin = 10;
const cardWidth = (width - 4 * cardMargin) / 3; // Adjusting width for 3 columns

export const HomeScreen = ({navigation}) => {
  const [spaces, setSpaces] = useState([]);
  const [collections, setCollections] = useState([]);
  const {userToken} = useAuth();
  const [totalItems, setTotalItems] = useState(0);
  const [totalWorth, setTotalWorth] = useState(0);
  const [total_spaces, setTotalSpaces] = useState(0);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentProducts, setRecentProducts] = useState([]);
  const [imageErrors, setImageErrors] = useState({});

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

  const fetchRecentProducts = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(`${BASE_URL}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Recent products response:', response.data);

      if (response.data && Array.isArray(response.data.data)) {
        const products = response.data.data
          .map(product => ({
            id: product.product_id,
            name: product.product_name,
            price: product.price,
            image_url: product.primary_image_url,
            space_name: product.space_name || 'Unknown Space',
            created_at: product.created_at,
          }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 4); // Get only the 4 most recent products

        console.log('Processed recent products:', products);
        setRecentProducts(products);
      }
    } catch (error) {
      console.error('Error fetching recent products:', error);
    }
  };

  useEffect(() => {
    fetchRecentProducts();
  }, []);

  // Prepare sections for SectionList
  useEffect(() => {
    const sectionsData = [];
    
    // Add spaces section if there are spaces
    if (spaces.length > 0) {
      sectionsData.push({
        title: 'Spaces',
        data: [spaces.slice(0, 3)],
        type: 'spaces',
        showSeeAll: spaces.length > 3
      });
    }
    
    // Add collections section if there are collections
    if (collections.length > 0) {
      sectionsData.push({
        title: 'Collections',
        data: [collections.slice(0, 3)],
        type: 'collections',
        showSeeAll: collections.length > 3
      });
    }
    
    // Add recent products section if there are recent products
    if (recentProducts.length > 0) {
      sectionsData.push({
        title: 'Recent Products',
        data: [recentProducts.slice(0, 3)],
        type: 'recentProducts',
        showSeeAll: recentProducts.length > 3
      });
    }
    
    setSections(sectionsData);
  }, [spaces, collections, recentProducts]);

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

      if (response.data && Array.isArray(response.data.data)) {
        const spacesData = response.data.data.map(space => ({
          id: space.id || space.space_id,
          name: space.space_name || space.name || space.title || 'Untitled Space',
          description: space.description || '',
          space_image: space.space_image || null,
          items_count: space.total_products || 0
        }));

        console.log('Processed Spaces:', spacesData);
        setSpaces(spacesData);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching spaces:', error);
      setIsLoading(false);
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

      console.log(
        'Raw Collections Response:',
        JSON.stringify(response.data, null, 2),
      );

      if (response.data && Array.isArray(response.data.data)) {
        const collectionsData = response.data.data.map(collection => ({
          id: collection.id || collection.collection_id,
          name:
            collection.name ||
            collection.collection_name ||
            'Unnamed Collection',
          image:
            collection.collection_image ||
            require('../assets/images/Space_default.jpg'),
          productCount: collection.products.total_products || 0,
          spaceId: collection.space_id,
        }));

        setCollections(collectionsData);
      } else {
        console.log('No collections found or invalid response structure');
        setCollections([]);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      setCollections([]);
    }
  };

  const fetchProductStats = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(`${BASE_URL}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Products API Response:', response.data);

      if (response.data && response.data.data) {
        // Get values from the correct response structure
        const totalCount = response.data.data.totalCount || 0;
        const totalWorth = response.data.data.totalWorth || 0;

        console.log('Setting stats:', {
          totalCount,
          totalWorth
        });

        setTotalItems(totalCount);
        setTotalWorth(totalWorth);
      }
    } catch (error) {
      console.error('Error fetching product stats:', error);
      setTotalItems(0);
      setTotalWorth(0);
    }
  };

  const formatNumber = (num) => {
    return isNaN(num) ? 0 : num;
  };

  const formatCurrency = (amount) => {
    const num = Number(amount);
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchSpaces(),
          fetchCollections(),
          fetchRecentProducts(),
          fetchProductStats()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const renderSectionContent = ({item, section}) => {
    if (section.type === 'spaces') {
      return (
        <FlatList
          data={item}
          numColumns={3}
          renderItem={({item: space}) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('IndividualSpace', {
                  spaceId: space.id,
                  spaceName: space.name,
                  spaceImage: space.space_image,
                  description: space.description,
                  totalProducts: space.items_count,
                })
              }>
              <Image
                source={
                  space.space_image
                    ? {uri: space.space_image}
                    : require('../assets/images/Space_default.jpg')
                }
                style={styles.cardImage}
              />
              <Text style={styles.cardTitle} numberOfLines={1}>
                {space.name}
              </Text>
              <Text style={styles.cardSubtitle}>
                {space.items_count || 0} items
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={space => space.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gridContent}
        />
      );
    }
    
    if (section.type === 'collections') {
      return (
        <FlatList
          data={item}
          numColumns={3}
          renderItem={({item: collection}) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('IndividualCollection', {
                  collectionId: collection.id,
                  collectionName: collection.name,
                  collectionImage: collection.image,
                })
              }>
              <Image
                source={
                  typeof collection.image === 'string'
                    ? {uri: collection.image}
                    : collection.image
                }
                style={styles.cardImage}
              />
              <Text style={styles.cardTitle} numberOfLines={1}>
                {collection.name}
              </Text>
              <Text style={styles.cardSubtitle}>
                {collection.productCount || 0} items
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={collection => collection.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gridContent}
        />
      );
    }

    if (section.type === 'recentProducts') {
      return (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.recentProductsScroll}
        >
          {item.map(product => (
            <TouchableOpacity
              key={product.id}
              style={styles.recentProductCard}
              onPress={() => navigation.navigate('IndividualProductScreen', { productId: product.id })}
            >
              <Image
                source={getImageSource(product)}
                style={styles.recentProductImage}
                resizeMode="cover"
                onError={() => handleImageError(product.id)}
              />
              <View style={styles.recentProductInfo}>
                <Text style={styles.recentProductName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.recentProductPrice}>
                  ${parseFloat(product.price || 0).toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {item.length === 0 && (
            <View style={styles.noRecentProducts}>
              <Text style={styles.noRecentProductsText}>No recent products</Text>
            </View>
          )}
        </ScrollView>
      );
    }
    
    return null;
  };

  const renderSectionHeader = ({section}) => (
    <View style={styles.headerRow}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.showSeeAll && (
        <TouchableOpacity 
          onPress={() => {
            if (section.type === 'spaces') {
              navigation.navigate('Spaces');
            } else if (section.type === 'collections') {
              navigation.navigate('Collections');
            } else if (section.type === 'recentProducts') {
              navigation.navigate('AllProducts');
            }
          }}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#6B46C1" barStyle="light-content" />
        <Header />
        
        <View style={styles.summaryContainer}>
          <SkeletonLoader height={80} width="31%" style={styles.skeletonSummaryCard} />
          <SkeletonLoader height={80} width="31%" style={styles.skeletonSummaryCard} />
          <SkeletonLoader height={80} width="31%" style={styles.skeletonSummaryCard} />
        </View>
        
        {/* Spaces Section Skeleton */}
        <View style={styles.skeletonSectionContainer}>
          <View style={styles.headerRow}>
            <SkeletonLoader height={18} width={80} />
            <SkeletonLoader height={18} width={50} />
          </View>
          <View style={styles.skeletonCardContainer}>
            {[1, 2, 3].map(key => (
              <View key={key} style={[styles.card, {backgroundColor: '#f5f5f5'}]}>
                <SkeletonLoader height={cardWidth} width="100%" />
                <View style={{padding: 8}}>
                  <SkeletonLoader height={14} width="80%" style={{marginTop: 8}} />
                  <SkeletonLoader height={12} width="40%" style={{marginTop: 8, marginBottom: 8}} />
                </View>
              </View>
            ))}
          </View>
        </View>
        
        {/* Collections Section Skeleton */}
        <View style={styles.skeletonSectionContainer}>
          <View style={styles.headerRow}>
            <SkeletonLoader height={18} width={120} />
            <SkeletonLoader height={18} width={50} />
          </View>
          <View style={styles.skeletonCardContainer}>
            {[1, 2, 3].map(key => (
              <View key={key} style={[styles.card, {backgroundColor: '#f5f5f5'}]}>
                <SkeletonLoader height={cardWidth} width="100%" />
                <View style={{padding: 8}}>
                  <SkeletonLoader height={14} width="80%" style={{marginTop: 8}} />
                  <SkeletonLoader height={12} width="40%" style={{marginTop: 8, marginBottom: 8}} />
                </View>
              </View>
            ))}
          </View>
        </View>
        
        {/* Recent Products Section Skeleton */}
        <View style={styles.skeletonSectionContainer}>
          <View style={styles.headerRow}>
            <SkeletonLoader height={18} width={150} />
            <SkeletonLoader height={18} width={50} />
          </View>
          <View style={styles.skeletonCardContainer}>
            {[1, 2, 3].map(key => (
              <View key={key} style={[styles.card, {backgroundColor: '#f5f5f5'}]}>
                <SkeletonLoader height={cardWidth} width="100%" />
                <View style={{padding: 8}}>
                  <SkeletonLoader height={14} width="80%" style={{marginTop: 8}} />
                  <SkeletonLoader height={12} width="40%" style={{marginTop: 8, marginBottom: 8}} />
                </View>
              </View>
            ))}
          </View>
        </View>
        
        <BottomNavBar navigation={navigation} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6B46C1" barStyle="light-content" />
      <Header />
      
      {spaces.length === 0 && collections.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Image 
            source={require('../assets/images/home_empty_state.png')} 
            style={styles.emptyStateImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyStateTitle}>Get Started with TidyCasa!</Text>
          <Text style={styles.emptyStateDescription}>
            Add your first product to begin organizing your home.
          </Text>
          <TouchableOpacity
            style={styles.addProductButton}
            onPress={() => navigation.navigate('ProductUpload')}>
            <Text style={styles.addProductButtonText}>Add Product</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, {backgroundColor: '#E8F5E9'}]}>
              <Text style={styles.summaryNumber}>{formatNumber(totalItems)}</Text>
              <Text style={styles.summaryLabel}>Total Items</Text>
            </View>
            <View style={[styles.summaryCard, {backgroundColor: '#E3F2FD'}]}>
              <Text style={styles.summaryNumber}>{formatCurrency(totalWorth)}</Text>
              <Text style={styles.summaryLabel}>Total Worth</Text>
            </View>
            <View style={[styles.summaryCard, {backgroundColor: '#FFF3E0'}]}>
              <Text style={styles.summaryNumber}>{formatNumber(spaces.length)}</Text>
              <Text style={styles.summaryLabel}>Spaces</Text>
            </View>
          </View>

          <SectionList
            sections={sections}
            keyExtractor={(item, index) => index.toString()}
            renderSectionHeader={renderSectionHeader}
            renderItem={renderSectionContent}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={styles.sectionListContent}
          />
        </View>
      )}
      <BottomNavBar navigation={navigation} />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sectionListContent: {
    paddingBottom: 90,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    height: 30,
    width: 120,
    resizeMode: 'contain',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
  },
  summaryCard: {
    width: '31%',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  spacesContainer: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#6B46C1',
    fontWeight: '500',
  },
  gridContent: {
    paddingHorizontal: 10,
  },
  carouselContent: {
    paddingHorizontal: 10,
  },
  card: {
    width: cardWidth,
    marginHorizontal: cardMargin,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: cardWidth,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginHorizontal: 8,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    marginHorizontal: 8,
  },
  emptyContainer: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateImage: {
    width: '80%',
    height: 250,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  addProductButton: {
    backgroundColor: '#6B46C1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  addProductButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skeletonSummaryCard: {
    borderRadius: 10,
    width: '31%',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  skeletonSectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  skeletonCardContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  skeletonCard: {
    width: cardWidth,
    marginHorizontal: cardMargin,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  recentProductsSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  viewAllButton: {
    padding: 8,
  },
  viewAllText: {
    color: '#6B46C1',
    fontSize: 14,
    fontWeight: '500',
  },
  recentProductsScroll: {
    marginLeft: -16,
    paddingLeft: 16,
  },
  recentProductCard: {
    width: 160,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentProductImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  recentProductInfo: {
    padding: 12,
  },
  recentProductName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  recentProductPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B46C1',
  },
  noRecentProducts: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRecentProductsText: {
    color: '#666',
    fontSize: 14,
  },
});
