import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const AllSpacesScreen = () => {
  const navigation = useNavigation();

  // Mock data for spaces (replace with actual data from your state management)
  const spaces = [
    {
      id: '1',
      name: 'Bedroom',
      image: require('../assets/images/bedroom.jpg'),
      itemCount: 56,
    },
    {
      id: '2',
      name: 'Garage',
      image: require('../assets/images/bedroom.jpg'),
      itemCount: 2,
    },
    {
      id: '3',
      name: 'Kitchen',
      image: require('../assets/images/bedroom.jpg'),
      itemCount: 2,
    },
  ];

  const renderSpaceCard = ({ item: space }) => (
    <TouchableOpacity
      style={styles.spaceCard}
      onPress={() => navigation.navigate('IndividualSpace', { 
        spaceId: space.id,
        spaceName: space.name 
      })}
    >
      <Image source={space.image} style={styles.spaceImage} />
      <View style={styles.spaceInfo}>
        <Text style={styles.spaceName}>{space.name}</Text>
        <Text style={styles.itemCount}>{space.itemCount} Items</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Spaces</Text>
      </View>
      <FlatList
        data={spaces}
        renderItem={renderSpaceCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />
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
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    padding: 8,
  },
  spaceCard: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    fontWeight: 'bold',
    color: '#333',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default AllSpacesScreen;
