import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';

const BASE_URL = 'http://13.49.68.11:3000';

const SpaceCreationScreen = ({ navigation, route }) => {
  const [spaceName, setSpaceName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { onSpaceCreated } = route.params || {};

  const createSpace = async () => {
    if (!spaceName.trim()) {
      Alert.alert('Error', 'Please enter a space name');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/spaces`, {
        name: spaceName.trim(),
        description: description.trim()
      });

      console.log('Space creation response:', response.data);

      if (response.data && response.data.id) {
        Alert.alert(
          'Success',
          'Space created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onSpaceCreated) {
                  onSpaceCreated(response.data.id);
                }
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        throw new Error('No space ID returned');
      }
    } catch (error) {
      console.error('Space creation error:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create space. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#6B46C1', '#9F7AEA']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Create New Space</Text>
      </LinearGradient>

      <View style={styles.form}>
        <Text style={styles.label}>Space Name *</Text>
        <TextInput
          style={styles.input}
          value={spaceName}
          onChangeText={setSpaceName}
          placeholder="Enter space name"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter space description"
          placeholderTextColor="#666"
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={createSpace}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Create Space</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 20,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#6B46C1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SpaceCreationScreen;
