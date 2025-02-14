import React, { useEffect, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavBar from '../components/BottomNavBar';

const BASE_URL = 'http://13.49.68.11:3000';
const { width } = Dimensions.get('window');
const cardMargin = 10;
const cardWidth = (width - (4 * cardMargin)) / 3; // Adjusting width for 3 columns

const HomeScreen = () => {
  const navigation = useNavigation();
  const [spaces, setSpaces] = useState([]);
  const { userToken } = useAuth();
  const [totalItems, setTotalItems] = useState(0);
  const [totalWorth, setTotalWorth] = useState(0);

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
      console.log('Raw API Response:', response.data);
      if (response.data && Array.isArray(response.data.data)) {
        // Sort spaces by creation date (most recent first)
        const spacesData = response.data.data.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });
        console.log('Processed Spaces Data:', spacesData);
        setSpaces(spacesData);
        let items = 0;
        let worth = 0;
        spacesData.forEach((space) => {
          items += space?.items_count || 0;
          worth += space?.total_worth || 0;
        });
        setTotalItems(items);
        setTotalWorth(worth);
      } else {
        console.error('Invalid API response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching spaces:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchSpaces();
    }
  }, [userToken]);

  const renderSpaceCard = ({ item }) => {
    console.log('Rendering space with image:', item.space_image || item.image);
    return (
      <TouchableOpacity
        style={styles.spaceCard}
        onPress={() => navigation.navigate('Individual Space', { 
          space: {
            id: item.id || item.space_id,
            title: item.space_name || item.title || item.name || 'Untitled Space',
            description: item.description || '',
            image: item.space_image || item.image || require('../assets/images/placeholder.png'),
            items_count: item.items_count || 0,
            total_worth: item.total_worth || 0
          }
        })}
      >
        <Image
          source={
            item.space_image
              ? { uri: item.space_image }
              : item.image
              ? { uri: item.image }
              : require('../assets/images/placeholder.png')
          }
          style={styles.spaceImage}
          resizeMode="cover"
        />
        <View style={styles.spaceOverlay}>
          <Text style={styles.spaceName}>
            {item?.space_name || item?.title || item?.name || 'Untitled'}
          </Text>
          <Text style={styles.itemCount}>{item?.items_count || 0} Items</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#6B46C1" barStyle="light-content" />
      <LinearGradient colors={['#6B46C1', '#9F7AEA']} style={styles.header}>
        <View style={styles.headerTop}>
          <Image source={require('../assets/images/LogoHorizontal.png')} style={styles.logo} />
        </View>
      </LinearGradient>
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: '#FFE8D6' }]}>
          <Text style={styles.summaryNumber}>{totalItems}</Text>
          <Text style={styles.summaryLabel}>Total Items</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#E8F4F8' }]}>
          <Text style={styles.summaryNumber}>{spaces.length}</Text>
          <Text style={styles.summaryLabel}>Spaces</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#F0E6FF' }]}>
          <Text style={styles.summaryNumber}>${totalWorth}</Text>
          <Text style={styles.summaryLabel}>Total Worth</Text>
        </View>
      </View>
      <View style={styles.spacesContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Spaces</Text>
          {spaces.length > 3 && (
            <TouchableOpacity onPress={() => navigation.navigate('Spaces')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          )}
        </View>
        {console.log('Rendering FlatList with spaces:', spaces.slice(0, 3))}
        <FlatList
          data={spaces.slice(0, 3)}
          renderItem={renderSpaceCard}
          keyExtractor={(item, index) => item?.id?.toString() || item?.space_id?.toString() || index.toString()}
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
    paddingLeft:10,
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
