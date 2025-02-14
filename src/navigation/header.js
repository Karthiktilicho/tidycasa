import React from "react";
import { StyleSheet, View, Image } from 'react-native';

function Header() {
  return (
    <View style={styles.header}> 
      <Image source={require('./logo.png')} style={{width:160,height:30,marginTop:5,marginLeft:5}} /> 
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    paddingTop: 10,
    backgroundColor: 'white',
    borderBottomWidth: 0.5, 
    borderBottomColor: 'gray', 
  },

  title: {
    marginLeft: 15,
    textAlign: 'left',
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  }
});

export default Header;
