import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {ActivityIndicator, StatusBar, useColorScheme, View} from 'react-native';
import {enableScreens} from 'react-native-screens';
import {AppProvider} from './src/context/AppContext';
import {AuthProvider, useAuth} from './src/context/AuthContext';

// Enable react-native-screens
enableScreens();

// Import screens
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import CollectionsScreen from './src/screens/CollectionsScreen';
import CreateAccountDetailsScreen from './src/screens/CreateAccountDetailsScreen';
import CreateAccountScreen from './src/screens/CreateAccountScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import IndividualCollectionScreen from './src/screens/IndividualCollectionScreen';
import IndividualSpaceScreen from './src/screens/IndividualSpaceScreen';
import LoginScreen from './src/screens/LoginScreen';
import NewPasswordScreen from './src/screens/NewPasswordScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import OnlineProductSearchScreen from './src/screens/OnlineProductSearchScreen';
import ProductUploadScreen from './src/screens/ProductUploadScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ProductDetailsScreen from './src/screens/SingleProductScreen';
import SpaceDetailsScreen from './src/screens/SpaceDetailsScreen';
import SpacesScreen from './src/screens/SpacesScreen';
import VerifyScreen from './src/screens/verify';
import AllProductsScreen from './src/screens/AllProductsScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';

const Stack = createNativeStackNavigator();

// Auth stack
const AuthStack = () => (
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
      name="ForgotPassword"
      component={ForgotPasswordScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="Verify"
      component={VerifyScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="NewPassword"
      component={NewPasswordScreen}
      options={{headerShown: false}}
    />
  </>
);
console.log('App screen componetn');

// App stack
const AppStack = () => (
  <>
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="Spaces"
      component={SpacesScreen}
      options={{headerShown: false}}
    />

    <Stack.Screen
      name="IndividualSpace"
      component={IndividualSpaceScreen}
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
      name="EditProfile"
      component={EditProfileScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="SpaceDetails"
      component={SpaceDetailsScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="IndividualProductScreen"
      component={ProductDetailsScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="IndividualCollection"
      component={IndividualCollectionScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="OnlineProductSearch"
      component={OnlineProductSearchScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="AllProducts"
      component={AllProductsScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Subscription"
      component={SubscriptionScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Feedback"
      component={FeedbackScreen}
      options={{
        headerShown: false,
      }}
    />
  </>
);

// Navigation component that uses the auth context
const Navigation = () => {
  const {isLoading, userToken} = useAuth();
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode
    ? {
        primary: '#818cf8',
        background: '#1f2937',
        surface: '#374151',
        text: '#f9fafb',
        textSecondary: '#9ca3af',
      }
    : {
        primary: '#6366f1',
        background: '#ffffff',
        surface: '#f3f4f6',
        text: '#1f2937',
        textSecondary: '#6b7280',
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
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <Stack.Navigator>
        {userToken == null
          ? // No token found, show auth screens
            AuthStack()
          : // Valid token found, show app screens
            AppStack()}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Main App component wrapped with Providers
const App = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <Navigation />
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
