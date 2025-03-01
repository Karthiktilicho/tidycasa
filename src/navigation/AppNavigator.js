import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, ActivityIndicator, Image} from 'react-native';

import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';
import CreateAccountDetailsScreen from '../screens/CreateAccountDetailsScreen';
import HomeScreen from '../screens/HomeScreen';
import ForgotScreen from '../screens/ForgotScreen';
import VerifyScreen from '../screens/VerifyScreen';
import ProductUploadScreen from '../screens/ProductUploadScreen';
import CollectionsScreen from '../screens/CollectionsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SpaceScreen from '../screens/SpaceScreen';
import IndividualSpaceScreen from '../screens/IndividualSpaceScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import AllProductsScreen from '../screens/AllProductsScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import FeedbackScreen from '../screens/FeedbackScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
    <Stack.Screen name="CreateAccountDetails" component={CreateAccountDetailsScreen} />
    <Stack.Screen name="Forgot" component={ForgotScreen} />
    <Stack.Screen name="Verify" component={VerifyScreen} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Space" component={SpaceScreen} />
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="ProductUpload" component={ProductUploadScreen} />
    <Stack.Screen name="Collections" component={CollectionsScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen 
      name="IndividualSpace" 
      component={IndividualSpaceScreen} 
      options={{headerShown: true}}
    />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <Stack.Screen name="Individual Product Screen" component={ProductDetailsScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="AllProducts" component={AllProductsScreen} options={{headerShown: false}} />
    <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{headerShown: false}}/>
    <Stack.Screen name="Feedback" component={FeedbackScreen} />
  </Stack.Navigator>
);

export const AppNavigator = () => {
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
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
