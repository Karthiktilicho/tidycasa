import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, {useCallback, useEffect, useState} from 'react';
import {
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
import Snackbar from '../components/Snackbar';

const BASE_URL = 'http://13.60.211.186:3000';

const SpacesScreen = ({navigation}) => {
  const [spaces, setSpaces] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

  const showSnackbar = (message, type = 'success') => {
    setSnackbar({
      visible: true,
      message,
      type
    });
    // Hide snackbar after 3 seconds
    setTimeout(() => {
      setSnackbar(prev => ({...prev, visible: false}));
    }, 3000);
  };

  // Fetch spaces with basic details
  const fetchSpaces = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('accessToken');

      const response = await axios.get(`${BASE_URL}/spaces/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(
        'Raw Spaces Response:',
        JSON.stringify(response.data, null, 2),
      );

      if (response.data && Array.isArray(response.data.data)) {
        const spacesData = response.data.data.map(space => ({
          id: space.id || space.space_id,
          name: space.space_name || space.name || 'Unnamed Space',
          description: space.description || '',
          space_image: space.space_image || null,
          items_count: space.products.total_products || 0,
          created_at: space.created_at,
        }));

        const sortedSpaces = spacesData.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
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
        config: error.config,
      });
      showSnackbar('Unable to fetch spaces. Please check your internet connection and try again.', 'error');
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

  // Render loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <SkeletonLoader width="50%" height={20} />
        </View>
        <View style={styles.spacesContainer}>
          {[1, 2, 3, 4, 5, 6].map(key => (
            <View key={key} style={styles.spaceCard}>
              <SkeletonLoader width="100%" height={150} />
              <View style={styles.spaceOverlay}>
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
          <Text style={styles.headerTitle}>Spaces</Text>
        </View>

        {spaces.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Image 
              source={require('../assets/images/space_empty_state.png')} 
              style={styles.emptyStateImage}
              resizeMode="contain"
            />
            <Text style={styles.emptyStateTitle}>No Spaces Yet</Text>
            <Text style={styles.emptyStateDescription}>
              Add your first product to begin organizing your space.
            </Text>
            <TouchableOpacity
              style={styles.addProductButton}
              onPress={() => navigation.navigate('ProductUpload')}>
              <Text style={styles.addProductButtonText}>Add Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.spacesContainer}>
            {spaces.map(space => (
              <TouchableOpacity
                key={space.id}
                style={styles.spaceCard}
                onPress={() =>
                  navigation.navigate('IndividualSpace', {
                    spaceId: space.id,
                    spaceName: space.name,
                  })
                }>
                <Image
                  source={
                    space.space_image
                      ? {uri: space.space_image}
                      : require('../assets/images/Space_default.jpg')
                  }
                  style={styles.spaceImage}
                  resizeMode="cover"
                  onError={e => {
                    console.log('Space image load error:', {
                      spaceId: space.id,
                      spaceName: space.name,
                      space_image: space.space_image,
                      error: e.nativeEvent,
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
      <Snackbar visible={snackbar.visible} message={snackbar.message} type={snackbar.type} />
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
    marginTop: 40,
  },
  emptyStateImage: {
    width: '80%',
    height: 250,
    marginBottom: 20,
    borderRadius: 8,
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

export default SpacesScreen;
