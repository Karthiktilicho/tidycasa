import React from "react";
import { StyleSheet, View, Image } from 'react-native';

function Header() {
  return (
    <View style={styles.header}> 
      <Image source={require('../assets/images/LogoHorizontal.png')} style={styles.logo} /> 
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 60,
  },
  logo: {
    width: 150,
    height: 26,
    resizeMode: 'contain'
  }
});

export default Header;
