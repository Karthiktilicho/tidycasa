import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import axios from 'axios';

const BASE_URL = 'http://13.49.68.11:3000';

const OnlineProductSearchScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Auto-search when image data is provided
  useEffect(() => {
    if (route.params?.imageUri) {
      searchProducts({
        uri: route.params.imageUri,
        type: route.params.imageType || 'image/jpeg',
        name: 'search_image.jpg'
      });
    }
  }, [route.params?.imageUri]);

  const searchProducts = async (imageFile) => {
    try {
      setLoading(true);
      
      // Create form data
      const formData = new FormData();
      
      // If we have a file path, create a file object
      const file = {
        uri: imageFile.uri,
        type: 'image/jpeg',
        name: 'search_image.jpg'
      };
      
      formData.append('search_image', file);

      console.log('Making API request to:', `${BASE_URL}/search-product`);
      console.log('Image file details:', {
        uri: file.uri,
        type: file.type,
        name: file.name
      });

      const config = {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      };

      console.log('Request config:', config);

      const searchResponse = await axios.post(
        `${BASE_URL}/search-product`,
        formData,
        config
      );

      console.log('Search Response:', {
        status: searchResponse.status,
        data: searchResponse.data
      });

      if (searchResponse.data && Array.isArray(searchResponse.data.data)) {
        setSearchResults(searchResponse.data.data);
      } else {
        console.log('Invalid response format:', searchResponse.data);
        setSearchResults([]);
        Alert.alert('No Results', 'No matching products found');
      }
    } catch (error) {
      console.error('Search error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
        stack: error.stack
      });

      let errorMessage = 'Failed to search products.';
      
      if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response?.status === 413) {
        errorMessage = 'Image file is too large. Please choose a smaller image.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 800, // Reduced size
      maxWidth: 800,  // Reduced size
      quality: 0.7,   // Reduced quality
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        console.error('Image picker error:', {
          code: response.errorCode,
          message: response.errorMessage
        });
        Alert.alert('Error', 'Failed to pick image');
        return;
      }

      const selectedImage = response.assets[0];
      console.log('Selected image details:', {
        uri: selectedImage.uri,
        type: selectedImage.type,
        fileSize: selectedImage.fileSize,
        width: selectedImage.width,
        height: selectedImage.height
      });

      searchProducts({
        uri: selectedImage.uri,
        type: selectedImage.type || 'image/jpeg',
        name: 'search_image.jpg'
      });
    });
  };

  const handleProductSelect = (product) => {
    if (route.params?.returnToUpload) {
      // Navigate back to product upload with prefilled data
      navigation.navigate('ProductUpload', {
        prefillData: {
          title: product.title || '',
          price: product.price || '',
          description: product.description || '',
        }
      });
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => handleProductSelect(item)}
    >
      {item.image && (
        <Image 
          source={{ uri: item.image }} 
          style={styles.productImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.productPrice}>
          ₹{item.price || 'N/A'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Similar Products</Text>
      </View>

      {!route.params?.imageUri && (
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={handleImageUpload}
        >
          <Text style={styles.uploadButtonText}>
            Upload Image to Search
          </Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#6B46C1" style={styles.loader} />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderProduct}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          contentContainerStyle={styles.productList}
          numColumns={2}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {route.params?.imageUri ? 'Searching for similar products...' : 'Upload an image to search for similar products'}
            </Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#6B46C1',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  uploadButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#6B46C1',
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  productList: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    maxWidth: '47%',
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B46C1',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#666',
    fontSize: 16,
  },
});

export default OnlineProductSearchScreen;
