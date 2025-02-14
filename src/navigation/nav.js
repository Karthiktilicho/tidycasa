import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

function Nav() {
  const [activeIcon, setActiveIcon] = useState("home");
  const navigation = useNavigation();

  const handlePress = (screenName, iconName) => {
    setActiveIcon(iconName);
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => handlePress("Home", "Home")}
      >
        <Image
          source={require("../assets/images/Nav/Home.png")}
          style={[
            styles.icon,
            { tintColor: activeIcon === "Home" ? "#6B3CE9" : "#94A3B8" },
          ]}
        />
        <Text
          style={[
            styles.iconText,
            { color: activeIcon === "Home" ? "#6B3CE9" : "#94A3B8" },
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => handlePress("ProductUploadScreen", "Add")}
      >
        <Image
          source={require("../assets/images/Nav/Add.png")}
          style={[
            styles.icon,
            { tintColor: activeIcon === "Add" ? "#6B3CE9" : "#94A3B8" },
          ]}
        />
        <Text
          style={[
            styles.iconText,
            { color: activeIcon === "Add" ? "#6B3CE9" : "#94A3B8" },
          ]}
        >
          Add
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => handlePress("ProfileScreen", "ProfileScreen")}
      >
        <Image
          source={require("../assets/images/Nav/Account.png")}
          style={[
            styles.icon,
            { tintColor: activeIcon === "ProfileScreen" ? "#6B3CE9" : "#94A3B8" },
          ]}
        />
        <Text
          style={[
            styles.iconText,
            { color: activeIcon === "ProfileScreen" ? "#6B3CE9" : "#94A3B8" },
          ]}
        >
          Account
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  iconContainer: {
    alignItems: "center",
  },
  icon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  iconText: {
    fontSize: 12,
  },
});

export default Nav;
