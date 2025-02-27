import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Image,
  Animated,
  FlatList,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavBar from '../components/BottomNavBar';
import SkeletonLoader from '../components/SkeletonLoader';

const BASE_URL = 'http://13.49.68.11:3000';

const SpacesScreen = ({ navigation }) => {
  const [spaces, setSpaces] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch spaces with basic details
  const fetchSpaces = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('accessToken');
      
      console.log('Fetching spaces with token:', token);

      const response = await axios.get(`${BASE_URL}/spaces/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Raw Spaces Response:', JSON.stringify(response.data, null, 2));

      if (response.data && Array.isArray(response.data.data)) {
        const spacesData = response.data.data.map(space => ({
          id: space.id || space.space_id,
          name: space.space_name || space.name || 'Unnamed Space',
          description: space.description || '',
          space_image: space.space_image || null,
          items_count: space.items_count || 0,
          created_at: space.created_at,
        }));

        const sortedSpaces = spacesData.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        console.log('Processed Spaces:', sortedSpaces);
        setSpaces(sortedSpaces);
      } else {
        console.log('No spaces found or invalid response structure');
        setSpaces([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching spaces:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      Alert.alert(
        'Error',
        'Unable to fetch spaces. Please check your internet connection and try again.'
      );
      setSpaces([]);
      setLoading(false);
    }
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSpaces();
    setRefreshing(false);
  }, [fetchSpaces]);

  // Fetch spaces on component mount
  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  const renderSkeletonLoaders = () => (
    <View style={styles.spacesGrid}>
      {[1, 2, 3, 4].map(key => (
        <View key={key} style={styles.spaceCard}>
          <SkeletonLoader width="100%" height={150} />
          <View style={styles.spaceInfo}>
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
          <Text style={styles.headerTitle}>Spaces</Text>
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
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Spaces</Text>
        </View>

        {spaces.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No spaces found</Text>
            <TouchableOpacity 
              style={styles.createSpaceButton}
              onPress={() => navigation.navigate('CreateSpace')}
            >
              <Text style={styles.createSpaceButtonText}>Create First Space</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.spacesContainer}>
            {spaces.map(space => (
              <TouchableOpacity 
                key={space.id} 
                style={styles.spaceCard}
                onPress={() => navigation.navigate('IndividualSpace', { 
                  spaceId: space.id,
                  spaceName: space.name 
                })}
              >
                <Image 
                  source={space.space_image ? { uri: space.space_image } : require('../assets/images/Space_default.jpg')}
                  style={styles.spaceImage} 
                  resizeMode="cover"
                  onError={(e) => {
                    console.log('Space image load error:', {
                      spaceId: space.id,
                      spaceName: space.name,
                      space_image: space.space_image,
                      error: e.nativeEvent
                    });
                  }}
                />
                <View style={styles.spaceOverlay}>
                  <Text style={styles.spaceName} numberOfLines={1}>
                    {space.name}
                  </Text>
                  <Text style={styles.itemCount}>
                    {space.items_count || 0} Items
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
  spacesContainer: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  spaceCard: {
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
  spaceImage: {
    width: '100%',
    height: 150,
  },
  spaceOverlay: {
    padding: 10,
  },
  spaceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemCount: {
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
  createSpaceButton: {
    backgroundColor: '#6B46C1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  createSpaceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spacesGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  spaceCard: {
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
  spaceInfo: {
    padding: 12,
  },
});

export default SpacesScreen;
