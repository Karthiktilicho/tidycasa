import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavBar from '../components/BottomNavBar';

const BASE_URL = 'http://13.49.68.11:3000';

const CollectionsScreen = ({ navigation }) => {
  const [collections, setCollections] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch collections with details
  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('accessToken');
      
      const response = await axios.get(`${BASE_URL}/collections/user/collections`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Collections Response:', JSON.stringify(response.data, null, 2));

      if (response.data && Array.isArray(response.data.data)) {
        const collectionsData = response.data.data.map(collection => ({
          id: collection.id || collection.collection_id,
          name: collection.name || collection.collection_name || 'Unnamed Collection',
          image: collection.collection_image || require('../assets/images/Space_default.jpg'),
          productCount: collection.product_count || 0,
          spaceId: collection.space_id
        }));

        setCollections(collectionsData);
        setLoading(false);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Error fetching collections:', error);

      Alert.alert(
        'Error', 
        'Could not fetch collections. Please try again.',
        [{ 
          text: 'Retry', 
          onPress: fetchCollections 
        }]
      );
      
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

  // Render loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading Collections...</Text>
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
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Collections</Text>
        </View>

        {collections.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No collections found</Text>
            <TouchableOpacity 
              style={styles.createCollectionButton}
              onPress={() => navigation.navigate('CreateCollection')}
            >
              <Text style={styles.createCollectionButtonText}>Create First Collection</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.collectionsContainer}>
            {collections.map(collection => (
              <TouchableOpacity 
                key={collection.id} 
                style={styles.collectionCard}
                onPress={() => navigation.navigate('IndividualSpace', { 
                  spaceId: collection.spaceId,
                  collectionId: collection.id,
                  collectionName: collection.name
                })}
              >
                <Image 
                  source={typeof collection.image === 'string' ? { uri: collection.image } : collection.image}
                  style={styles.collectionCardImage} 
                  resizeMode="cover"
                />
                <View style={styles.collectionCardContent}>
                  <Text style={styles.collectionCardTitle} numberOfLines={1}>
                    {collection.name}
                  </Text>
                  <Text style={styles.collectionCardSubtitle}>
                    {collection.productCount} Products
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
  collectionsContainer: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  collectionCardImage: {
    width: '100%',
    height: 150,
  },
  collectionCardContent: {
    padding: 10,
  },
  collectionCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  collectionCardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
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
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  createCollectionButton: {
    backgroundColor: '#6B46C1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  createCollectionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CollectionsScreen;
