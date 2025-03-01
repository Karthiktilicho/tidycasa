import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://13.60.211.186:3000';

// Centralized logging function
const logEvent = (eventType, data) => {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({
    timestamp,
    eventType,
    ...data
  }, null, 2));
};

// Function to refresh the access token
const refreshAccessToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      // throw new Error('No refresh token found');
    }

    const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
      refresh_token: refreshToken,
    });

    if (response.data && response.data.access_token) {
      await AsyncStorage.setItem('accessToken', response.data.access_token);
      if (response.data.refresh_token) {
        await AsyncStorage.setItem('refreshToken', response.data.refresh_token);
      }
      return response.data.access_token;
    } else {
      throw new Error('Invalid refresh token response');
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};

const getAuthHeaders = async () => {
  try {
    let accessToken = await AsyncStorage.getItem('accessToken');

    if (!accessToken) {
      // Try to refresh the token if no access token is found
      try {
        accessToken = await refreshAccessToken();
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        throw new Error('No access token found. Please log in again.');
      }
    }

    logEvent('AUTH_HEADERS', {
      tokenStatus: accessToken ? 'Token exists' : 'No token found',
      tokenLength: accessToken ? accessToken.length : 0,
    });

    if (!accessToken) {
      throw new Error('No access token found. Please log in again.');
    }

    return {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    logEvent('AUTH_HEADERS_ERROR', {
      errorMessage: error.message,
      errorStack: error.stack,
    });
    console.error('Error getting auth headers:', error);
    throw error;
  }
};

// Axios interceptor to handle token refresh
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    console.log('firstdsfsd', error);

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const newAccessToken = await refreshAccessToken();

        // Update the failed request with the new token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        throw refreshError;
      }
    }

    return Promise.reject(error);
  },
);

const handleApiError = (error, context) => {
  logEvent('API_ERROR', {
    context,
    errorMessage: error.message,
    errorName: error.name,
    errorStack: error.stack,
    responseData: error.response?.data,
    responseStatus: error.response?.status,
    requestConfig: {
      method: error.config?.method,
      url: error.config?.url,
      data: error.config?.data,
    },
  });

  console.error(`API Error in ${context}:`, {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
  });

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    if (error.response.status === 401) {
      // Token might be expired, prompt re-login
      throw new Error('Session expired. Please log in again.');
    } else if (error.response.status === 400) {
      // Bad request, likely validation error
      throw new Error(error.response.data.message || 'Invalid data submitted');
    } else {
      throw new Error(
        error.response.data.message || 'An unexpected error occurred',
      );
    }
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error(
      'No response received from server. Check your network connection.',
    );
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error('Error setting up the request: ' + error.message);
  }
};

export const createSpace = async spaceData => {
  try {
    // Create the request body exactly as shown in Postman
    const formData = new FormData();

    // These field names must match exactly what works in Postman
    formData.append('space_name', spaceData.name);
    formData.append('description', spaceData.description);

    if (spaceData.image) {
      formData.append('space_image', {
        uri: spaceData.image.uri,
        name: spaceData.image.fileName,
        type: 'image/jpeg',
      });
    }

    const headers = await getAuthHeaders();
    headers.headers['Content-Type'] = 'multipart/form-data';

    console.log('Sending space creation request:', {
      url: `${BASE_URL}/spaces`,
      formData: Object.fromEntries(formData._parts),
    });

    const response = await axios.post(`${BASE_URL}/spaces`, formData, headers);

    console.log('Space creation response:', response.data);

    return {
      id: response.data.id,
      name: response.data.space_name,
      description: response.data.description,
      image: response.data.space_image,
      backendId: true,
    };
  } catch (error) {
    console.error('Space creation failed:', {
      error: error.message,
      response: error.response?.data,
    });
    throw error;
  }
};

export const createProduct = async productData => {
  try {
    console.log('Raw Product Data:', productData);

    // Create FormData object
    const formData = new FormData();

    // Match exact field names from Postman
    formData.append('product_name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('space_id', productData.spaceId);

    // Handle image
    if (productData.images && productData.images.length > 0) {
      const image = productData.images[0];
      console.log('Image data:', image);

      formData.append('image', {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || 'image.jpg',
      });
    }

    // Log the exact FormData contents
    console.log('FormData contents:');
    for (let pair of formData._parts) {
      console.log(pair[0], pair[1]);
    }

    const config = {
      method: 'post',
      url: `${BASE_URL}/products`,
      headers: {
        'Content-Type': 'multipart/form-data',
        // Add any auth headers if needed
      },
      data: formData,
    };

    console.log('Request config:', {
      url: config.url,
      headers: config.headers,
      method: config.method,
    });

    const response = await axios(config);
    console.log('Upload response:', response.data);

    return response.data;
  } catch (error) {
    console.error('Upload error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const createCollection = async collectionData => {
  try {
    logEvent('CREATE_COLLECTION_REQUEST', {collectionData});
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${BASE_URL}/collections`,
      collectionData,
      headers,
    );
    logEvent('CREATE_COLLECTION_RESPONSE', {
      responseData: response.data,
      status: response.status,
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'createCollection');
  }
};

export const fetchSpaces = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${BASE_URL}/spaces/user`, headers);
    logEvent('FETCH_SPACES_RESPONSE', {
      spacesCount: response.data.length,
      status: response.status,
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetchSpaces');
  }
};

export const getUserProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const userEmail = await AsyncStorage.getItem('userEmail');
    const userName = await AsyncStorage.getItem('userName');
    const userPhone = await AsyncStorage.getItem('userPhone');

    return {
      name: userName,
      email: userEmail,
      phone: userPhone,
      collections_count: 0,
      spaces_count: 0,
      products_count: 0,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};
