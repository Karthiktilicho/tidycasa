import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const BottomNavBar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const isActive = (routeName) => {
    return route.name === routeName;
  };

  const navItems = [
    {
      name: 'Home',
      icon: require('../assets/images/Nav/Home.png'),
      route: 'Home'
    },
    {
      name: 'Collections',
      icon: require('../assets/images/Nav/Collection.png'),
      route: 'Collections'
    },
    {
      name: 'Add',
      icon: require('../assets/images/Nav/Add.png'),
      route: 'ProductUpload',
      isCenter: true
    },
    {
      name: 'Space',
      icon: require('../assets/images/Nav/Spaces.png'),
      route: 'Space'
    },
    {
      name: 'Profile',
      icon: require('../assets/images/Nav/Account.png'),
      route: 'Profile'
    }
  ];

  const handleNavigation = (route) => {
    try {
      navigation.navigate(route);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {navItems.map((item, index) => {
        const active = isActive(item.route);
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.navItem,
              item.isCenter && styles.centerButton
            ]}
            onPress={() => handleNavigation(item.route)}
          >
            {item.isCenter ? (
              <View style={styles.addButton}>
                <Image
                  source={item.icon}
                  style={styles.addIcon}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <>
                <Image
                  source={item.icon}
                  style={[
                    styles.icon,
                    { tintColor: active ? '#6B46C1' : '#666666' }
                  ]}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.text,
                    { color: active ? '#6B46C1' : '#666666' }
                  ]}
                >
                  {item.name}
                </Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 30,
    height: 65,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    minWidth: 40,
    paddingHorizontal: 5,
  },
  centerButton: {
    marginTop: -20,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  icon: {
    width: 20,
    height: 20,
    marginBottom: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default BottomNavBar;
