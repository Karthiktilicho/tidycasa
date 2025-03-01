import React from "react";
import { StyleSheet, View, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

function Header() {
  return (
    <LinearGradient colors={['#6B46C1', '#9F7AEA']} style={styles.header}>
      <View style={styles.headerTop}>
        <Image
          source={require('../assets/images/LogoHorizontal.png')}
          style={[styles.logo, {tintColor: '#fff'}]}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    height: 30,
    width: 120,
    resizeMode: 'contain',
  }
});

export default Header;
