import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [spaces, setSpaces] = useState([]);
  const [products, setProducts] = useState([]);

  const addSpace = (newSpace) => {
    setSpaces(prevSpaces => [...prevSpaces, { 
      ...newSpace, 
      id: Date.now().toString(), 
      products: [] 
    }]);
  };

  const addProduct = (product, spaceId) => {
    const newProduct = { 
      ...product, 
      id: Date.now().toString(), 
      spaceId,
      price: parseFloat(product.price) || 0 
    };
    
    setProducts(prevProducts => [...prevProducts, newProduct]);
    
    setSpaces(prevSpaces => 
      prevSpaces.map(space => 
        space.id === spaceId 
          ? { ...space, products: [...space.products, newProduct.id] }
          : space
      )
    );
  };

  const getSpaceById = (spaceId) => {
    return spaces.find(space => space.id === spaceId);
  };

  const getSpaceProducts = (spaceId) => {
    return products.filter(product => product.spaceId === spaceId);
  };

  const getTotalItems = () => products.length;
  
  const getTotalWorth = () => {
    return products.reduce((total, product) => total + (product.price || 0), 0);
  };

  const getSpaceCategories = (spaceId) => {
    const spaceProducts = getSpaceProducts(spaceId);
    return [...new Set(spaceProducts.map(product => product.category))];
  };

  const calculateSpaceWorth = (spaceId) => {
    const spaceProducts = getSpaceProducts(spaceId);
    return spaceProducts.reduce((total, product) => total + (product.price || 0), 0);
  };

  return (
    <AppContext.Provider 
      value={{
        spaces,
        products,
        addSpace,
        addProduct,
        getSpaceById,
        getSpaceProducts,
        getTotalItems,
        getTotalWorth,
        getSpaceCategories,
        calculateSpaceWorth
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
