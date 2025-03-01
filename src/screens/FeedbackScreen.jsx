import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const FeedbackScreen = () => {
  const navigation = useNavigation();
  const [selectedRating, setSelectedRating] = useState(null);
  const [feedback, setFeedback] = useState('');

  const ratings = [
    { image: require('../assets/images/angry.png'), label: 'Angry', value: 1 },
    { image: require('../assets/images/neutral.png'), label: 'Neutral', value: 2 },
    { image: require('../assets/images/satisfied.png'), label: 'Satisfied', value: 3 },
    { image: require('../assets/images/happy.png'), label: 'Happy', value: 4 },
    { image: require('../assets/images/love.png'), label: 'Love it!', value: 5 },
  ];

  const handleSubmit = () => {
    console.log('Feedback submitted:', { rating: selectedRating, feedback });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F5F5FA" barStyle="dark-content" />

      {/* Back Arrow */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Image
          source={require('../assets/images/arrow_back.png')}
          style={[styles.backIcon, { tintColor: '#000' }]}
        />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>How was your experience?</Text>
          <Text style={styles.subtitle}>Your feedback helps us improve</Text>

          {/* Ratings */}
          <View style={styles.ratingsContainer}>
            {ratings.map((rating) => (
              <TouchableOpacity
                key={rating.value}
                style={styles.ratingItem}
                onPress={() => setSelectedRating(rating.value)}
              >
                <View style={[
                  styles.emojiWrapper,
                  selectedRating === rating.value && styles.selectedEmojiWrapper
                ]}>
                  <Image
                    source={rating.image}
                    style={[
                      styles.emoji,
                      selectedRating !== null && selectedRating !== rating.value
                        ? styles.grayscaleEmoji
                        : null
                    ]}
                  />
                </View>
                <Text style={[
                  styles.ratingLabel,
                  selectedRating === rating.value && styles.selectedRatingLabel
                ]}>
                  {rating.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Feedback Input */}
          <Text style={styles.feedbackLabel}>Tell us more about your experience...</Text>
          <TextInput
            style={styles.feedbackInput}
            placeholder="Type your feedback here..."
            placeholderTextColor="#AAAAAA"
            multiline
            value={feedback}
            onChangeText={setFeedback}
          />

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          </TouchableOpacity>

          {/* Maybe Later */}
          <TouchableOpacity style={styles.maybeLaterButton} onPress={() => navigation.goBack()}>
            <Text style={styles.maybeLaterText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5FA',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 24,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  ratingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  ratingItem: {
    alignItems: 'center',
    width: 60,
  },
  emojiWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedEmojiWrapper: {
    transform: [{ scale: 1.3 }],
  },
  emoji: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  grayscaleEmoji: {
    filter: 'grayscale(100%)', // Converts image to black & white
  },
  ratingLabel: {
    fontSize: 12,
    color: '#666666',
  },
  selectedRatingLabel: {
    color: '#6B46C1',
    fontWeight: '600',
  },
  feedbackLabel: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 12,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
    color: '#333333',
  },
  submitButton: {
    backgroundColor: '#9747FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  maybeLaterButton: {
    alignItems: 'center',
  },
  maybeLaterText: {
    color: '#666666',
    fontSize: 14,
  },
});

export default FeedbackScreen;
