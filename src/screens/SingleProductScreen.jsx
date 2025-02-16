import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const ProductDetailsScreen = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}>
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity>
          <Text style={styles.iconText}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Product Image Card */}
      <View style={styles.productCard}>
        <Image
          source={{uri: 'your-watch-image-url'}}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>Titan Wrist Watch</Text>
          <Text style={styles.productPrice}>299$</Text>
        </View>
      </View>

      {/* Product Metadata */}
      <View style={styles.metadataContainer}>
        <View style={styles.metadataRow}>
          <View style={styles.metadata}>
            <Text style={{fontSize: 14, fontWeight: 500}}>Added on</Text>
            <Text style={styles.metadataText}> Jan 15, 2025</Text>
          </View>
        </View>

        <View style={styles.metadataRow}>
          <View style={styles.metadata}>
            {/* <Text style={{fontSize: 14, fontWeight: 500}}>Added on</Text> */}
            <Text style={styles.metadataText}> Furniture</Text>
          </View>
        </View>
      </View>

      {/* Spaces Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spaces</Text>
        <View style={styles.tagContainer}>
          <SpaceTag label={'🛏️ Bed Room'} />
          <SpaceTag label={'💻 Office'} />
        </View>
      </View>

      {/* Collection Section */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Collection</Text>
        <View style={styles.tagContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>💪 Gym Equipment</Text>
          </View>
        </View>
      </View> */}

      {/* <SpaceTag label={'text'} /> */}
      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.buttonText}>+ Add new product</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sellButton}>
          <Text style={styles.sellButtonText}>Sell Product</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2E6DF',
    position: 'absolute',
    width: '100%',
    height: 289,

    // zIndex: 100,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  iconText: {
    fontSize: 20,
    // fontWeight: 500,
  },
  productCard: {
    marginHorizontal: 34,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 200,
  },
  productInfo: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  metadataContainer: {
    // padding: 16,
    flexDirection: 'row',
    gap: 5,
    // justifyContent: 'space-between',
    marginHorizontal: 34,
  },
  metadataRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#F2F2F2',
    width: 'auto',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    // backgroundColor: '#F2F2F2',
  },
  metadataText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 400,
  },
  section: {
    padding: 16,
    backgroundColor: '#F2F2F2',
    marginTop: 10,
    marginHorizontal: 30,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  tagText: {
    color: 'white',
  },

  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 25,
    gap: 6,
  },
  icon: {
    fontSize: 16,
    color: '#fff',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    marginLeft: 4,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomButtons: {
    padding: 16,
    gap: 12,
    marginTop: 'auto',
    flexDirection: 'row',
    width: '100%',

    // justifyContent: 'space-between',
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8844ee',
    padding: 16,
    borderRadius: 30,
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  sellButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 30,
    flex: 1,
  },
  sellButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ProductDetailsScreen;

const SpaceTag = ({label, onRemove}) => (
  <View style={styles.tag}>
    <Text style={styles.tagText}>{label}</Text>
    <TouchableOpacity onPress={onRemove}>
      <Text style={styles.tagText}>&#x2715;</Text>
    </TouchableOpacity>
  </View>
);
