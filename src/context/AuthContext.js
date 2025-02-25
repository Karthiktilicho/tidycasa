import React, {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'https://13.49.68.11:3000';
const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  // Create axios instance
  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor to add token
  api.interceptors.request.use(
    async config => {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    },
  );

  // Add response interceptor to handle token refresh
  api.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;

      console.log('error.vond', error);

      // If error is 401 and we haven't tried to refresh token yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = await AsyncStorage.getItem('refreshToken');
          if (!refreshToken) throw new Error('No refresh token available');

          const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
            refresh_token: refreshToken,
          });

          if (response.data && response.data.access_token) {
            // Store new tokens
            await AsyncStorage.setItem(
              'accessToken',
              response.data.access_token,
            );
            if (response.data.refresh_token) {
              await AsyncStorage.setItem(
                'refreshToken',
                response.data.refresh_token,
              );
            }

            // Update userToken state
            setUserToken(response.data.access_token);

            // Update authorization header
            api.defaults.headers.common[
              'Authorization'
            ] = `Bearer ${response.data.access_token}`;
            originalRequest.headers[
              'Authorization'
            ] = `Bearer ${response.data.access_token}`;

            // Retry original request
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          await signOut();
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    },
  );

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('refreshToken'),
      ]);

      if (!accessToken && refreshToken) {
        // Try to refresh the token
        try {
          const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
            refresh_token: refreshToken,
          });

          if (response.data && response.data.access_token) {
            await AsyncStorage.setItem(
              'accessToken',
              response.data.access_token,
            );
            if (response.data.refresh_token) {
              await AsyncStorage.setItem(
                'refreshToken',
                response.data.refresh_token,
              );
            }
            setUserToken(response.data.access_token);
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          await signOut();
        }
      } else if (accessToken) {
        setUserToken(accessToken);
      }
    } catch (error) {
      console.error('Auth state check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async response => {
    try {
      console.log('sign in Tidycasass', {response});

      console.log('getting token');
      const responseDummy = {
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMywiZW1haWwiOiJrYXJ0aGlrdGVzdEBnbWFpbC5jb20iLCJ1c2VybmFtZSI6ImthcnRoaWt0ZXN0IiwiaWF0IjoxNzM5NTEyODQ1LCJleHAiOjE3Mzk1OTkyNDV9.8zMBD9wjDdsZAX92tyTF0aJ4MB-AhbcFp_YANZ7J2Yw',
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMywiZW1haWwiOiJrYXJ0aGlrdGVzdEBnbWFpbC5jb20iLCJ1c2VybmFtZSI6ImthcnRoaWt0ZXN0IiwiaWF0IjoxNzM5NTEyODQ1LCJleHAiOjE3NDIxMDQ4NDV9.A9zIFIoxmmsFYdvIjT0-n_HJqbA1POirZ7P8PQHBHG0',
      };

      // Get tokens from response data
      const token = response.token;
      const refreshToken = response.refreshToken;
      console.log({token, refreshToken});

      if (!token) {
        throw new Error('No token in response');
      }

      // Store tokens
      await AsyncStorage.setItem('accessToken', token);
      if (refreshToken) {
        await AsyncStorage.setItem('refreshToken', refreshToken);
      }
      console.log('AftADding token to Api.defaults'); // Set default auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUserToken(token);
    } catch (error) {
      console.error('SignIn error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear all tokens and user data
      await Promise.all([
        AsyncStorage.removeItem('accessToken'),
        AsyncStorage.removeItem('refreshToken'),
        AsyncStorage.removeItem('userEmail'),
        AsyncStorage.removeItem('keepSignedIn'),
      ]);

      // Clear auth header
      delete api.defaults.headers.common['Authorization'];
      setUserToken(null);
    } catch (error) {
      console.error('SignOut error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        signIn,
        signOut,
        api,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
