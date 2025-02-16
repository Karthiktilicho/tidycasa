import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  FlatList,
  Alert,
  Modal,
  PermissionsAndroid,
  Platform,
  Linking,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import BottomNavBar from '../components/BottomNavBar';

const ProductUpload = ({ navigation }) => {
  const [images, setImages] = useState([]);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [showSpaceInput, setShowSpaceInput] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceImage, setNewSpaceImage] = useState(null);
  const [newSpaceDescription, setNewSpaceDescription] = useState('');
  const [spaces, setSpaces] = useState([]);
  const [showImageOptions, setShowImageOptions] = useState(false);

  // New state for collections
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showCollectionInput, setShowCollectionInput] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [newCollectionImage, setNewCollectionImage] = useState(null);

  const checkAndroidPermissions = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      // For Android 13 and above (API level 33+)
      if (Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: 'Photo Permission',
            message: 'This app needs access to your photos to upload product images.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          showPermissionAlert();
          return false;
        }
      } else {
        // For Android 12 and below
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Photo Permission',
            message: 'This app needs access to your photos to upload product images.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          showPermissionAlert();
          return false;
        }
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const showPermissionAlert = () => {
    Alert.alert(
      'Permission Required',
      'This app needs access to your photos to upload product images. Please enable it in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: openSettings }
      ]
    );
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const handleCamera = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
        includeBase64: true,
      });

      if (result.didCancel) {
        console.log('User cancelled camera');
      } else if (result.errorCode) {
        Alert.alert('Error', 'Failed to take photo: ' + result.errorMessage);
      } else if (result.assets && result.assets[0]) {
        const newImage = result.assets[0];
        setImages([...images, newImage]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      console.log('Camera Error: ', error);
    }
    setShowImageOptions(false);
  };

  const handleGallery = async () => {
    try {
      const hasPermission = await checkAndroidPermissions();
      if (!hasPermission) return;

      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 0,
        includeBase64: true,
      });

      if (result.didCancel) {
        console.log('User cancelled image selection');
      } else if (result.errorCode) {
        Alert.alert('Error', 'Failed to select photos: ' + result.errorMessage);
      } else if (result.assets) {
        setImages([...images, ...result.assets]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select photos. Please try again.');
      console.log('Gallery Error: ', error);
    }
    setShowImageOptions(false);
  };

  const handleAddSpace = () => {
    if (newSpaceName.trim() && newSpaceDescription.trim()) {
      const newSpace = {
        id: Date.now().toString(),
        name: newSpaceName.trim(),
        description: newSpaceDescription.trim(),
        image: newSpaceImage || require('../assets/images/Space_default.jpg')
      };
      setSpaces([...spaces, newSpace]);
      setSelectedSpace(newSpace);
      setNewSpaceName('');
      setNewSpaceDescription('');
      setNewSpaceImage(null);
      setShowSpaceInput(false);
    }
  };

  const handleAddCollection = () => {
    if (newCollectionName.trim() && newCollectionDescription.trim()) {
      const newCollection = {
        id: Date.now().toString(),
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim(),
        image: newCollectionImage || require('../assets/images/Space_default.jpg')
      };
      setCollections([...collections, newCollection]);
      setSelectedCollection(newCollection);
      setNewCollectionName('');
      setNewCollectionDescription('');
      setNewCollectionImage(null);
      setShowCollectionInput(false);
    }
  };

  const handleUpload = () => {
    if (!selectedSpace) {
      Alert.alert('Error', 'Please select or create a space for the product');
      return;
    }
    if (!selectedCollection) {
      Alert.alert('Error', 'Please select or create a collection for the product');
      return;
    }
    if (!productName.trim()) {
      Alert.alert('Error', 'Please enter product name');
      return;
    }
    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one image');
      return;
    }

    // Here you would typically upload to your backend
    const productData = {
      id: Date.now().toString(),
      name: productName,
      description,
      images,
      spaceId: selectedSpace.id,
      spaceName: selectedSpace.name,
      spaceDescription: selectedSpace.description,
      collectionId: selectedCollection.id,
      collectionName: selectedCollection.name
    };

    // For now, we'll just navigate back
    navigation.navigate('Home', { newProduct: productData });
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../assets/images/back-arrow.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Product</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Image Upload Section */}
        <View style={styles.uploadSection}>
          <View style={styles.imageSection}>
            {images.length > 0 ? (
              <FlatList
                data={images}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.selectedImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => {
                        const newImages = [...images];
                        newImages.splice(index, 1);
                        setImages(newImages);
                      }}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
                ListFooterComponent={
                  <TouchableOpacity 
                    style={styles.addMoreButton}
                    onPress={() => setShowImageOptions(true)}
                  >
                    <Text style={styles.addMoreText}>+</Text>
                  </TouchableOpacity>
                }
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>No images selected</Text>
              </View>
            )}
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.uploadOptionButton, styles.cameraButton]}
              onPress={handleCamera}
            >
              <Text style={styles.uploadOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.uploadOptionButton, styles.galleryButton]}
              onPress={handleGallery}
            >
              <Text style={styles.uploadOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Product Name</Text>
          <TextInput
            style={styles.input}
            value={productName}
            onChangeText={setProductName}
            placeholder="Enter product name"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter product description"
            multiline
            numberOfLines={4}
          />

          {/* Spaces Section */}
          <View style={styles.spacesSection}>
            <Text style={styles.label}>Space</Text>
            <View style={styles.spacesList}>
              {spaces.map((space) => (
                <TouchableOpacity
                  key={space.id}
                  style={[
                    styles.spaceItem,
                    selectedSpace?.id === space.id && styles.selectedSpaceItem
                  ]}
                  onPress={() => setSelectedSpace(space)}
                >
                  <Text style={[
                    styles.spaceText,
                    selectedSpace?.id === space.id && styles.selectedSpaceText
                  ]}>
                    {space.name}
                  </Text>
                  <Text style={[
                    styles.spaceDescription,
                    selectedSpace?.id === space.id && styles.selectedSpaceDescription
                  ]}>
                    {space.description}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.addSpaceButton}
                onPress={() => setShowSpaceInput(true)}
              >
                <Text style={styles.addSpaceText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Collections Section */}
          <View style={styles.spacesSection}>
            <Text style={styles.label}>Collection</Text>
            <View style={styles.spacesList}>
              {collections.map((collection) => (
                <TouchableOpacity
                  key={collection.id}
                  style={[
                    styles.spaceItem,
                    selectedCollection?.id === collection.id && styles.selectedSpaceItem
                  ]}
                  onPress={() => setSelectedCollection(collection)}
                >
                  <Text style={[
                    styles.spaceText,
                    selectedCollection?.id === collection.id && styles.selectedSpaceText
                  ]}>
                    {collection.name}
                  </Text>
                  <Text style={[
                    styles.spaceDescription,
                    selectedCollection?.id === collection.id && styles.selectedSpaceDescription
                  ]}>
                    {collection.description}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.addSpaceButton}
                onPress={() => setShowCollectionInput(true)}
              >
                <Text style={styles.addSpaceText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUpload}
          >
            <Text style={styles.uploadButtonText}>Upload Product</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Image Options Modal */}
      <Modal
        visible={showImageOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowImageOptions(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleCamera}
            >
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <View style={styles.modalDivider} />
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleGallery}
            >
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <View style={styles.modalDivider} />
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={[styles.modalOptionText, { color: '#ff3b30' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Space Modal */}
      <Modal
        visible={showSpaceInput}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: '90%' }]}>
            <Text style={styles.modalTitle}>Add New Space</Text>
            
            {/* Space Image */}
            <TouchableOpacity 
              style={styles.spaceImageContainer}
              onPress={async () => {
                try {
                  const hasPermission = await checkAndroidPermissions();
                  if (!hasPermission) return;

                  const result = await launchImageLibrary({
                    mediaType: 'photo',
                    quality: 0.8,
                    selectionLimit: 1,
                  });

                  if (!result.didCancel && !result.errorCode && result.assets?.[0]) {
                    setNewSpaceImage(result.assets[0]);
                  }
                } catch (error) {
                  Alert.alert('Error', 'Failed to select photo');
                }
              }}
            >
              {newSpaceImage ? (
                <Image
                  source={{ uri: newSpaceImage.uri }}
                  style={styles.spaceImage}
                />
              ) : (
                <View style={styles.spaceImagePlaceholder}>
                  <Image 
                    source={require('../assets/images/Space_default.jpg')}
                    style={styles.spaceImage}
                  />
                  <View style={styles.addSpaceImageButton}>
                    <Text style={styles.addSpaceImageText}>+</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.modalInput}
              value={newSpaceName}
              onChangeText={setNewSpaceName}
              placeholder="Enter space name"
              autoFocus
            />
            <TextInput
              style={[styles.modalInput, styles.collectionTextArea]}
              value={newSpaceDescription}
              onChangeText={setNewSpaceDescription}
              placeholder="Enter space description"
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowSpaceInput(false);
                  setNewSpaceName('');
                  setNewSpaceDescription('');
                  setNewSpaceImage(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddSpace}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Collection Modal */}
      <Modal
        visible={showCollectionInput}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: '90%' }]}>
            <Text style={styles.modalTitle}>Add New Collection</Text>
            
            {/* Collection Image */}
            <TouchableOpacity 
              style={styles.spaceImageContainer}
              onPress={async () => {
                try {
                  const hasPermission = await checkAndroidPermissions();
                  if (!hasPermission) return;

                  const result = await launchImageLibrary({
                    mediaType: 'photo',
                    quality: 0.8,
                    selectionLimit: 1,
                  });

                  if (!result.didCancel && !result.errorCode && result.assets?.[0]) {
                    setNewCollectionImage(result.assets[0]);
                  }
                } catch (error) {
                  Alert.alert('Error', 'Failed to select photo');
                }
              }}
            >
              {newCollectionImage ? (
                <Image
                  source={{ uri: newCollectionImage.uri }}
                  style={styles.spaceImage}
                />
              ) : (
                <View style={styles.spaceImagePlaceholder}>
                  <Image 
                    source={require('../assets/images/Space_default.jpg')}
                    style={styles.spaceImage}
                  />
                  <View style={styles.addSpaceImageButton}>
                    <Text style={styles.addSpaceImageText}>+</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.modalInput}
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              placeholder="Enter collection name"
              autoFocus
            />
            <TextInput
              style={[styles.modalInput, styles.collectionTextArea]}
              value={newCollectionDescription}
              onChangeText={setNewCollectionDescription}
              placeholder="Enter collection description"
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCollectionInput(false);
                  setNewCollectionName('');
                  setNewCollectionDescription('');
                  setNewCollectionImage(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddCollection}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 80, // Added padding for bottom navigation
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  uploadSection: {
    width: '100%',
    minHeight: 250,
    backgroundColor: '#f5f5f5',
    padding: 15,
    marginBottom: 20,
  },
  imageSection: {
    width: '100%',
    height: 200,
    marginBottom: 15,
  },
  imageContainer: {
    width: 180,
    height: 200,
    marginRight: 10,
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  addMoreButton: {
    width: 180,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8b4ae2',
    borderStyle: 'dashed',
  },
  addMoreText: {
    fontSize: 40,
    color: '#8b4ae2',
    fontWeight: '300',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e1e1e1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  uploadOptionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    flex: 0.35, 
  },
  galleryButton: {
    flex: 0.65, 
  },
  uploadOptionText: {
    color: '#8b4ae2',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
    paddingBottom: 100, // Added extra padding at the bottom
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  collectionTextArea: {
    height: 120,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  spacesSection: {
    marginBottom: 20,
  },
  spacesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  spaceItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    maxWidth: 200,
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
  spaceDescription: {
    color: '#999',
    fontSize: 12,
  },
  selectedSpaceDescription: {
    color: '#fff',
  },
  addSpaceButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#8b4ae2',
    borderStyle: 'dashed',
  },
  addSpaceText: {
    color: '#8b4ae2',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#000',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  addButton: {
    backgroundColor: '#8b4ae2',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  uploadButton: {
    backgroundColor: '#8b4ae2',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOption: {
    padding: 20,
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 18,
    color: '#8b4ae2',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#ddd',
  },
  spaceImageContainer: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
  },
  spaceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  spaceImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  addSpaceImageButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSpaceImageText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
  },
});

export default ProductUpload;