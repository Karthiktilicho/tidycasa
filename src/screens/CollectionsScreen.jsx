import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, FlatList, StatusBar, ActivityIndicator, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://13.49.68.11:3000';
const defaultSpaceImage = require('../assets/images/Space_default.jpg');

const CollectionsScreen = ({ navigation, route }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState(route.params?.selectedCollections || []);
  const isSelectionMode = route.params?.selectionMode || false;

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(`${BASE_URL}/collections/user/collections`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && Array.isArray(response.data.data)) {
        const collectionsData = response.data.data.map(collection => ({
          id: collection.id || collection.collection_id,
          collection_name: collection.collection_name || collection.name,
          description: collection.description || '',
          collection_image: collection.collection_image,
          items_count: collection.items_count || 0,
          total_worth: collection.total_worth || 0
        }));
        setCollections(collectionsData);
      } else {
        setCollections([]);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      Alert.alert('Error', 'Failed to fetch collections');
    } finally {
      setLoading(false);
    }
  };

  const toggleCollectionSelection = (collection) => {
    if (selectedCollections.find(c => c.id === collection.id)) {
      setSelectedCollections(selectedCollections.filter(c => c.id !== collection.id));
    } else {
      setSelectedCollections([...selectedCollections, collection]);
    }
  };

  const handleDone = () => {
    if (route.params?.onSelectCollections) {
      route.params.onSelectCollections(selectedCollections);
      navigation.goBack();
    }
  };

  const handleCollectionPress = (item) => {
    if (isSelectionMode) {
      toggleCollectionSelection(item);
    } else {
      navigation.navigate('CollectionDetail', { collectionId: item.id });
    }
  };

  const renderCollectionItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.collectionCard,
        isSelectionMode && selectedCollections.find(c => c.id === item.id) && styles.selectedCard
      ]}
      onPress={() => isSelectionMode ? toggleCollectionSelection(item) : navigation.navigate('CollectionDetail', { collectionId: item.id })}
    >
      {item.collection_image ? (
        <Image 
          source={{ uri: item.collection_image }}
          style={styles.collectionImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.collectionImage, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>{item.collection_name[0]}</Text>
        </View>
      )}
      <View style={styles.collectionInfo}>
        <Text style={styles.collectionName}>{item.collection_name}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>{item.items_count} items</Text>
          <Text style={styles.statsText}>₹{item.total_worth}</Text>
        </View>
      </View>
      {isSelectionMode && selectedCollections.find(c => c.id === item.id) && (
        <View style={styles.selectedOverlay}>
          <Image 
            source={require('../assets/images/Check.png')} 
            style={styles.checkIcon}
          />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6B46C1" barStyle="light-content" />
      
      <LinearGradient
        colors={['#6B46C1', '#9F7AEA']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Collections</Text>
        {isSelectionMode && (
          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Done ({selectedCollections.length})</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#6B46C1" />
      ) : (
        <FlatList
          data={collections}
          renderItem={renderCollectionItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.collectionList}
          numColumns={2}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No collections yet</Text>
              <Text style={styles.emptyStateSubText}>
                Create a collection when uploading a product
              </Text>
            </View>
          }
        />
      )}

      {!isSelectionMode && <BottomNavBar />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  collectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#6B46C1',
  },
  collectionImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F3F4F6',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  collectionInfo: {
    padding: 16,
  },
  collectionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  doneButtonText: {
    color: '#6B46C1',
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default CollectionsScreen;
