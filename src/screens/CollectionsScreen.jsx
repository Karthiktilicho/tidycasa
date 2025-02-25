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

const BASE_URL = 'http://13.49.68.11:3000';

const CollectionsScreen = ({navigation}) => {
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

      Alert.alert('Error', 'Could not fetch collections. Please try again.', [
        {
          text: 'Retry',
          onPress: fetchCollections,
        },
      ]);

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
          <Text style={styles.headerTitle}>Collections</Text>
        </View>
        {renderSkeletonLoaders()}
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
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No collections found</Text>
            <TouchableOpacity
              style={styles.createCollectionButton}
              onPress={() => navigation.navigate('CreateCollection')}>
              <Text style={styles.createCollectionButtonText}>
                Create First Collection
              </Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  collectionGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  collectionCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  collectionImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  collectionInfo: {
    padding: 12,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productCount: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default CollectionsScreen;
