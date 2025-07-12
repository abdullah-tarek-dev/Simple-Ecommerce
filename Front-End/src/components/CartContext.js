import React, { createContext, useState } from 'react';

// إنشاء السياق
export const CartContext = createContext();

// مزود السياق
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const updateCartItems = (newCartItems) => {
    setCartItems(newCartItems);
  };

  return (
    <CartContext.Provider value={{ cartItems, updateCartItems }}>
      {children}
    </CartContext.Provider>
  );
};
