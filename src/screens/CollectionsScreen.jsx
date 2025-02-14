import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, FlatList, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';

const defaultSpaceImage = require('../assets/images/Space_default.jpg');

const CollectionsScreen = ({ navigation }) => {
  const [collections, setCollections] = React.useState([
    {
      id: '1',
      name: 'Living Room',
      productCount: 12,
      image: defaultSpaceImage
    },
    {
      id: '2',
      name: 'Kitchen',
      productCount: 8,
      image: defaultSpaceImage
    }
  ]);

  const renderCollectionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.collectionCard}
      onPress={() => navigation.navigate('CollectionDetail', { collectionId: item.id })}
    >
      <Image source={item.image} style={styles.collectionImage} />
      <View style={styles.collectionInfo}>
        <Text style={styles.collectionName}>{item.name}</Text>
        <Text style={styles.productCount}>
          <Text style={styles.productCountNumber}>{item.productCount}</Text>
          <Text style={styles.productCountLabel}> Products</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6B46C1" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#6B46C1', '#9F7AEA']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Collections</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('ProductUploadScreen')}
        >
          <Image 
            source={require('../assets/images/Nav/Add.png')}
            style={[styles.addIcon, { tintColor: '#FFFFFF' }]}
          />
          <Text style={styles.addText}>Add Collection</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Collection List */}
      <FlatList
        data={collections}
        renderItem={renderCollectionItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.collectionList}
        numColumns={2}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No collections yet</Text>
            <Text style={styles.emptyStateSubText}>
              Create your first collection by clicking the Add button above
            </Text>
          </View>
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
  collectionList: {
    padding: 16,
  },
  collectionCard: {
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
  collectionImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  collectionInfo: {
    padding: 12,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productCount: {
    fontSize: 14,
  },
  productCountNumber: {
    color: '#6B46C1',
    fontWeight: '500',
  },
  productCountLabel: {
    color: '#6B7280',
    fontWeight: '400',
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
