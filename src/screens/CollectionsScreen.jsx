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
} from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import SkeletonLoader from '../components/SkeletonLoader';
import Snackbar from 'react-native-snackbar';

const BASE_URL = 'http://13.60.211.186:3000';

export const CollectionsScreen = ({navigation}) => {
  const [collections, setCollections] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch collections with details
  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
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
        'Collections Response:',
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
        setLoading(false);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Error fetching collections:', error);

      // Alert.alert('Error', 'Could not fetch collections. Please try again.', [
      //   {
      //     text: 'Retry',
      //     onPress: fetchCollections,
      //   },
      // ]);

      Snackbar.show({
        text: error.response?.data?.message || 'Failed to change password',
        duration: Snackbar.LENGTH_SHORT,
        action: {
          text: 'Retry',
          onPress: () => {
            fetchCollections();
          },
        },
      });

      setLoading(false);
    }
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCollections();
    setRefreshing(false);
  }, [fetchCollections]);

  // Fetch collections on component mount
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const renderSkeletonLoaders = () => (
    <View style={styles.collectionGrid}>
      {[1, 2, 3, 4].map(key => (
        <View key={key} style={styles.collectionCard}>
          <SkeletonLoader width="100%" height={150} />
          <View style={styles.collectionInfo}>
            <SkeletonLoader width="80%" height={20} style={{marginBottom: 8}} />
            <SkeletonLoader width="40%" height={16} />
          </View>
        </View>
      ))}
    </View>
  );

  // Render loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <SkeletonLoader width="50%" height={20} />
        </View>
        <View style={styles.collectionGrid}>
          {[1, 2, 3, 4, 5, 6].map(key => (
            <View key={key} style={styles.collectionCard}>
              <SkeletonLoader width="100%" height={150} />
              <View style={styles.collectionInfo}>
                <SkeletonLoader width="80%" height={20} style={{marginBottom: 8}} />
                <SkeletonLoader width="40%" height={16} />
              </View>
            </View>
          ))}
        </View>
        <BottomNavBar navigation={navigation} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6B46C1']}
          />
        }>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Collections</Text>
        </View>

        {collections.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Image 
              source={require('../assets/images/collections_empty_state.png')} 
              style={styles.emptyStateImage}
              resizeMode="contain"
            />
            <Text style={styles.emptyStateTitle}>No Collections Yet</Text>
            <Text style={styles.emptyStateDescription}>
              Create your first collection by adding similar products.
            </Text>
            <TouchableOpacity
              style={styles.addProductButton}
              onPress={() => navigation.navigate('ProductUpload')}>
              <Text style={styles.addProductButtonText}>Add Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.collectionGrid}>
            {collections.map(collection => (
              <TouchableOpacity
                key={collection.id}
                style={styles.collectionCard}
                onPress={() =>
                  navigation.navigate('IndividualCollection', {
                    collectionId: collection.id,
                    collectionName: collection.name,
                  })
                }>
                <Image
                  source={
                    typeof collection.image === 'string'
                      ? {uri: collection.image}
                      : collection.image
                  }
                  style={styles.collectionImage}
                />
                <View style={styles.collectionInfo}>
                  <Text style={styles.collectionName} numberOfLines={1}>
                    {collection.name}
                  </Text>
                  <Text style={styles.productCount}>
                    {collection.productCount}{' '}
                    {collection.productCount === 1 ? 'Product' : 'Products'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNavBar navigation={navigation} />
    </View>
  );
};

export default CollectionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    backgroundColor: '#6B46C1',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  collectionGrid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  collectionCard: {
    width: '48%', // Slightly less than half to allow for spacing
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
  },
  collectionImage: {
    width: '100%',
    height: 150,
  },
  collectionOverlay: {
    padding: 10,
  },
  collectionInfo: {
    padding: 10,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
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
});
