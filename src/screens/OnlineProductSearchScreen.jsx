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
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';

const BASE_URL = 'http://13.49.68.11:3000';

const OnlineProductSearchScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);

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
      setError(null);
      console.log('Starting product search with image:', imageFile);
      
      const formData = new FormData();
      formData.append('search_image', {
        uri: imageFile.uri,
        type: 'image/jpeg',
        name: 'search_image.jpg'
      });

      console.log('Making API request to:', `${BASE_URL}/search-product`);
      
      const response = await fetch(`${BASE_URL}/search-product`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
        timeout: 30000 // 30 second timeout
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response format from server');
      }

      console.log('Parsed response data:', responseData);

      if (responseData && Array.isArray(responseData.data)) {
        if (responseData.data.length === 0) {
          setError('No matching products found');
        } else {
          setSearchResults(responseData.data);
        }
      } else {
        console.error('Invalid response structure:', responseData);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Search error:', error.message);
      console.error('Error stack:', error.stack);

      let errorMessage = 'Failed to search products. ';
      
      if (!navigator.onLine) {
        errorMessage += 'Please check your internet connection.';
      } else if (error.message.includes('timeout')) {
        errorMessage += 'Request timed out. Please try again.';
      } else if (error.message.includes('413')) {
        errorMessage += 'Image file is too large. Please choose a smaller image.';
      } else {
        errorMessage += error.message;
      }

      setError(errorMessage);
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
      // Remove $ symbol and any other non-numeric characters except decimal point
      const priceValue = product.price?.value 
        ? product.price.value.toString().replace(/[^0-9.]/g, '')
        : '';

      navigation.navigate('ProductUpload', {
        prefillData: {
          title: product.title || '',
          price: priceValue,
          description: product.description || '',
          productImage: product.image || null,
          uploadedImage: route.params?.imageUri // Pass the uploaded image back
        }
      });
    }
  };

  const renderProduct = ({ item }) => {
    // Get thumbnail URL or fallback to main image
    const imageUrl = item.thumbnail || item.image;
    
    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => handleProductSelect(item)}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={imageUrl ? { uri: imageUrl } : require('../assets/images/placeholder.png')}
            style={styles.productImage}
            resizeMode="cover"
            onError={() => {
              console.log('Failed to load image:', imageUrl);
            }}
          />
        </View>
        <View style={styles.productInfo}>
          <Text 
            style={styles.productTitle} 
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>
          <View style={styles.priceSourceContainer}>
            <Text style={styles.productPrice}>
              ${item.price?.value?.toString().replace(/[^0-9.]/g, '') || 'N/A'}
            </Text>
            <Text style={styles.productSource}>
              {item.source || 'Unknown'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image 
            source={require('../assets/images/arrow_back.png')} 
            style={styles.backButtonImage} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Similar Products</Text>
      </View>

      {loading ? (
        <FlatList
          data={[1,2,3,4,6]}
          renderItem={() => (
            <View style={styles.productCard}>
              <View style={[styles.imageContainer, styles.skeleton]} />
              <View style={styles.productInfo}>
                <View style={[styles.skeleton, { height: 36, marginBottom: 8 }]} />
                <View style={styles.priceSourceContainer}>
                  <View style={[styles.skeleton, { height: 16, width: 60 }]} />
                  <View style={[styles.skeleton, { height: 14, width: 80 }]} />
                </View>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderProduct}
          keyExtractor={(item, index) => item.id || index.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonImage: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  listContainer: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    padding: 8,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 18,
    minHeight: 36,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  skeleton: {
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
  },
  priceSourceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productSource: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  placeholderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default OnlineProductSearchScreen;
