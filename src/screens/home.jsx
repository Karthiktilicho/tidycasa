import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  StatusBar
} from 'react-native';
import Header from '../components/header';
import BottomNavBar from '../components/BottomNavBar';

const HomeScreen = ({ navigation, route }) => {
  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Handle new product addition
    if (route.params?.newProduct) {
      const newProduct = route.params.newProduct;
      setProducts([...products, newProduct]);
      
      // Check if space exists, if not add it
      if (!spaces.find(s => s.id === newProduct.spaceId)) {
        setSpaces([...spaces, {
          id: newProduct.spaceId,
          name: newProduct.spaceName
        }]);
      }
    }
  }, [route.params?.newProduct]);

  const renderSpaceItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.spaceItem,
        selectedSpace?.id === item.id && styles.selectedSpaceItem
      ]}
      onPress={() => setSelectedSpace(item)}
    >
      <Text style={[
        styles.spaceText,
        selectedSpace?.id === item.id && styles.selectedSpaceText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <Image
        source={{ uri: item.images[0].uri }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </View>
  );

  const filteredProducts = selectedSpace
    ? products.filter(p => p.spaceId === selectedSpace.id)
    : products;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <Header />
      {/* Spaces Section */}
      <View style={styles.spacesSection}>
        <Text style={styles.sectionTitle}>Spaces</Text>
        <FlatList
          data={spaces}
          renderItem={renderSpaceItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.spacesList}
          ListHeaderComponent={
            <TouchableOpacity
              style={[
                styles.spaceItem,
                !selectedSpace && styles.selectedSpaceItem
              ]}
              onPress={() => setSelectedSpace(null)}
            >
              <Text style={[
                styles.spaceText,
                !selectedSpace && styles.selectedSpaceText
              ]}>
                All
              </Text>
            </TouchableOpacity>
          }
        />
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsGrid}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {selectedSpace 
                ? `No products in ${selectedSpace.name} yet`
                : 'No products added yet'}
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
    backgroundColor: '#f5f5f5',
    paddingBottom: 90,
  },
  spacesSection: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  spacesList: {
    paddingHorizontal: 15,
    gap: 10,
  },
  spaceItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedSpaceItem: {
    backgroundColor: '#8b4ae2',
    borderColor: '#8b4ae2',
  },
  spaceText: {
    color: '#666',
    fontSize: 14,
  },
  selectedSpaceText: {
    color: '#fff',
  },
  productsGrid: {
    padding: 10,
  },
  productCard: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
  },
});

export default HomeScreen;