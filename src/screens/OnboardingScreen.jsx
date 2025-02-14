import React, { useRef, useState, useEffect } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity, FlatList, Animated, StatusBar } from "react-native";
import LinearGradient from 'react-native-linear-gradient';

const slides = [
  { id: "1", description: "Welcome to Home Organizer! Simplify your life by managing your rooms, items, and collections effortlessly." },
  { id: "2", description: "Stay organized and productive with powerful tools to track your progress." },
  { id: "3", description: "Achieve your goals effortlessly with seamless organization features." },
];

const BackgroundPattern = () => (
  <View style={styles.backgroundPattern}>
    <LinearGradient
      colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.diagonalStripe}
    />
    <LinearGradient
      colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[styles.diagonalStripe, { top: '30%' }]}
    />
  </View>
);

function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  // Auto-scroll every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= slides.length) {
        nextIndex = 0; 
      }
      flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 3000); // 3 seconds interval

    return () => clearInterval(interval); 
  }, [currentIndex]);

 
  const updateCurrentIndex = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / 320);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6B46C1" barStyle="light-content" />
      <BackgroundPattern />
      <View style={styles.cardContainer}>
        <Text style={styles.welcomeText}>Welcome</Text>
        <Image source={require("../assets/images/Logo.png")} style={styles.logo} />
        
        <View style={styles.flatListContainer}>
          <FlatList
            data={slides}
            renderItem={renderItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={updateCurrentIndex}
            ref={flatListRef}
            style={styles.flatList}
            contentContainerStyle={styles.flatListContent}
          />
        </View>

        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.activeDot]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("CreateAccount")}>
          <Text style={styles.create}>Create an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6B46C1",
    padding: 20,
    justifyContent: "center",
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 20,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },

  },
  title: {
    fontSize: 28,
    color: "#6B46C1",
    marginBottom: 20,
    textAlign: "center",
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E9D8FD",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#6B46C1",
    width: 20,
  },
  button: {
    backgroundColor: "#6B46C1",
    paddingVertical: 15,
    borderRadius: 25,
    width: "80%",
    marginBottom: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  create: {
    color: "#6B46C1",
    fontSize: 16,
    marginBottom: 10,
  },
  slide: {
    width: 320, 
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  flatListContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  flatList: {
    width: '100%',
  },
  flatListContent: {
    alignItems: 'center',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  diagonalStripe: {
    position: 'absolute',
    width: '200%',
    height: 300,
    transform: [{ rotate: '-35deg' }],
    left: '-50%',
  },
  welcomeText: {
    fontSize: 28,
    color: "#6B46C1",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
});
export default OnboardingScreen;