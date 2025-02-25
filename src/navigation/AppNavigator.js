import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, ActivityIndicator} from 'react-native';

import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';
import CreateAccountDetailsScreen from '../screens/CreateAccountDetailsScreen';
import HomeScreen from '../screens/home';
import ForgotScreen from '../screens/forgot';
import VerifyScreen from '../screens/verify';
import ProductUploadScreen from '../screens/ProductUploadScreen';
import CollectionsScreen from '../screens/CollectionsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SpaceScreen from '../screens/SpaceScreen';
import IndividualSpaceScreen from '../screens/IndividualSpaceScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ProductDetailsScreen from '../screens/SingleProductScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      console.log('Auth Check:', {hasToken: !!accessToken});
      setIsAuthenticated(!!accessToken);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#6B46C1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'Space' : 'Onboarding'}
        // screenOptions={{
        //   headerStyle: {
        //     backgroundColor: '#f4511e',
        //   },
        //   headerTintColor: '#fff',
        //   headerTitleStyle: {
        //     fontWeight: 'bold',
        //   },
        // }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="CreateAccount"
              component={CreateAccountScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="CreateAccountDetails"
              component={CreateAccountDetailsScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Forgot"
              component={ForgotScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Verify"
              component={VerifyScreen}
              options={{headerShown: false}}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Space"
              component={SpaceScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ProductUpload"
              component={ProductUploadScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Collections"
              component={CollectionsScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Individual Space"
              component={IndividualSpaceScreen}
              options={{headerShown: true}}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Individual Product Screen"
              component={ProductDetailsScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{headerShown: false}}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
