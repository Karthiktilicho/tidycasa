import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StatusBar,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import {fetchSpaces} from '../utils/api';

const defaultSpaceImage = require('../assets/images/Space_default.jpg');

const SpaceScreen = ({navigation}) => {
  const [spaces, setSpaces] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadSpaces = async () => {
    try {
      setRefreshing(true);
      const fetchedSpaces = await fetchSpaces();
      setSpaces(
        fetchedSpaces.map(space => ({
          ...space,
          image: space.image || defaultSpaceImage,
          productCount: space.productCount || 0,
        })),
      );
    } catch (error) {
      console.error('Failed to fetch spaces:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSpaces();
  }, []);

  const renderSpaceItem = ({item}) => {
    // Ensure comprehensive space object is passed
    const spaceDetails = {
      id: item.id || item.space_id,
      title: item.space_name || item.title || item.name || 'Untitled Space',
      description: item.description || '',
      image:
        item.space_image ||
        item.image ||
        require('../assets/images/placeholder.png'),
      items_count: item.total_products || 0,
      total_worth: item.total_worth || 0,
    };

    return (
      <TouchableOpacity
        style={styles.spaceCard}
        onPress={() => {
          // Navigate to individual space with full details
          navigation.navigate('IndividualSpace', {
            space: spaceDetails,
          });
        }}>
        <Image
          source={
            typeof spaceDetails.image === 'string'
              ? {uri: spaceDetails.image}
              : spaceDetails.image
          }
          style={styles.spaceImage}
          defaultSource={require('../assets/images/placeholder.png')}
        />
        <View style={styles.spaceInfo}>
          <Text style={styles.spaceName} numberOfLines={1}>
            {spaceDetails.title}
          </Text>
          <Text style={styles.productCount}>
            {spaceDetails.items_count}{' '}
            <Text style={styles.productCountLabel}>
              {spaceDetails.items_count === 1 ? 'Item' : 'Items'}
            </Text>
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6B46C1" barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#6B46C1', '#9F7AEA']} style={styles.header}>
        <Text style={styles.headerTitle}>Spaces</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('ProductUpload')}>
          <Image
            source={require('../assets/images/Nav/Add.png')}
            style={[styles.addIcon, {tintColor: '#FFFFFF'}]}
          />
          <Text style={styles.addText}>Add Space</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Space List */}
      <FlatList
        data={spaces}
        renderItem={renderSpaceItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.spaceList}
        numColumns={2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadSpaces}
            colors={['#6B46C1']}
          />
        }
      />

      <BottomNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  addText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  spaceList: {
    padding: 16,
  },
  spaceCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  spaceImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  spaceInfo: {
    padding: 12,
  },
  spaceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productCount: {
    fontSize: 14,
    color: '#6B46C1',
    fontWeight: '500',
  },
  productCountLabel: {
    color: '#6B7280',
    fontWeight: '400',
  },
});

export default SpaceScreen;
