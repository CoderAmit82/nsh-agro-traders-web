import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const localData = localStorage.getItem('cart');
    return localData ? JSON.parse(localData) : [];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product._id === product._id);
      const qtyToAdd = Number(quantity);

      if (existingItem) {
        // Limit to stock
        const newQty = Math.min(existingItem.quantity + qtyToAdd, product.stock);
        return prevItems.map((item) =>
          item.product._id === product._id ? { ...item, quantity: newQty } : item
        );
      } else {
        return [...prevItems, { product, quantity: Math.min(qtyToAdd, product.stock) }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product._id !== productId));
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    const qty = Number(quantity);
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product._id === productId
          ? { ...item, quantity: Math.min(qty, item.product.stock) }
          : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Get total price after discount
  const getCartTotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = item.product.price;
      const discount = item.product.discount || 0;
      const finalPrice = price * (1 - discount / 100);
      return acc + finalPrice * item.quantity;
    }, 0);
  };

  // Get total count of items
  const getCartCount = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
