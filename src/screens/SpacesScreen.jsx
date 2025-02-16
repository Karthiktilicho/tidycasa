import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const BASE_URL = 'http://13.49.68.11:3000';
const {width} = Dimensions.get('window');
const numColumns = 2;
const cardMargin = 10;
const cardWidth = (width - (numColumns + 1) * cardMargin) / numColumns;

const SpacesScreen = () => {
  const navigation = useNavigation();
  const [spaces, setSpaces] = useState([]);
  const {userToken} = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const fetchSpaces = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(`${BASE_URL}/spaces/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data && Array.isArray(response.data.data)) {
        const spacesData = response.data.data.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });
        setSpaces(spacesData);
      }
    } catch (error) {
      console.error(
        'Error fetching spaces:',
        error.response?.data || error.message,
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchSpaces();
    }
  }, [userToken]);

  const renderSpaceCard = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.spaceCard}
        onPress={() =>
          navigation.navigate('IndividualSpace', {spaceId: item.id})
        }>
        <Image
          source={
            item.space_image
              ? {uri: item.space_image}
              : item.image
              ? {uri: item.image}
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
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Spaces</Text>
          <View style={{width: 30}} /> {/* Empty view for spacing */}
        </View>
      </LinearGradient>

      <FlatList
        data={spaces}
        renderItem={renderSpaceCard}
        keyExtractor={item => item?.id?.toString()}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No spaces found</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    height: 60,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    fontSize: 24,
    color: '#fff',
    paddingHorizontal: 10,
  },
  gridContainer: {
    padding: cardMargin,
  },
  spaceCard: {
    width: cardWidth,
    aspectRatio: 1,
    margin: cardMargin / 2,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  spaceImage: {
    width: '100%',
    height: '100%',
  },
  spaceOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  spaceName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  itemCount: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default SpacesScreen;
