import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, isCustomer } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('handloom_guest_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);

  // Fetch server cart when customer is authenticated
  const fetchServerCart = async () => {
    if (!isAuthenticated || !isCustomer) return;
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.success && res.cart) {
        setCartItems(res.cart.items || []);
      }
    } catch (err) {
      console.warn('Failed to load server cart:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isCustomer) {
      fetchServerCart();
    } else if (!isAuthenticated) {
      const saved = localStorage.getItem('handloom_guest_cart');
      setCartItems(saved ? JSON.parse(saved) : []);
    }
  }, [isAuthenticated, isCustomer]);

  const addToCart = async (product, quantity = 1) => {
    const qty = Math.max(1, parseInt(quantity, 10));

    if (isAuthenticated && isCustomer) {
      try {
        const res = await api.post('/cart/add', {
          productId: product._id,
          quantity: qty,
        });
        if (res.success) {
          await fetchServerCart();
          return { success: true };
        }
      } catch (err) {
        return { success: false, message: err.message };
      }
    } else {
      // Local cart for guest / not yet logged in
      setCartItems((prev) => {
        const existingIdx = prev.findIndex((item) => (item.product?._id || item.product) === product._id);
        let updated;
        if (existingIdx > -1) {
          updated = [...prev];
          updated[existingIdx].quantity += qty;
        } else {
          updated = [...prev, { product, quantity: qty, priceAtAddition: product.price }];
        }
        localStorage.setItem('handloom_guest_cart', JSON.stringify(updated));
        return updated;
      });
      return { success: true };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    const qty = parseInt(quantity, 10);

    if (isAuthenticated && isCustomer) {
      try {
        const res = await api.put('/cart/update', { productId, quantity: qty });
        if (res.success) {
          await fetchServerCart();
          return { success: true };
        }
      } catch (err) {
        return { success: false, message: err.message };
      }
    } else {
      setCartItems((prev) => {
        let updated;
        if (qty <= 0) {
          updated = prev.filter((item) => (item.product?._id || item.product) !== productId);
        } else {
          updated = prev.map((item) => {
            if ((item.product?._id || item.product) === productId) {
              return { ...item, quantity: qty };
            }
            return item;
          });
        }
        localStorage.setItem('handloom_guest_cart', JSON.stringify(updated));
        return updated;
      });
      return { success: true };
    }
  };

  const removeFromCart = async (productId) => {
    if (isAuthenticated && isCustomer) {
      try {
        const res = await api.delete(`/cart/item/${productId}`);
        if (res.success) {
          await fetchServerCart();
        }
      } catch (err) {
        console.error('Failed to remove cart item:', err);
      }
    } else {
      setCartItems((prev) => {
        const updated = prev.filter((item) => (item.product?._id || item.product) !== productId);
        localStorage.setItem('handloom_guest_cart', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const clearCart = async () => {
    if (isAuthenticated && isCustomer) {
      try {
        await api.delete('/cart/clear');
        setCartItems([]);
      } catch (err) {
        console.error('Failed to clear cart:', err);
      }
    } else {
      setCartItems([]);
      localStorage.removeItem('handloom_guest_cart');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.priceAtAddition || 0;
    return sum + price * item.quantity;
  }, 0);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    cartItems,
    subtotal,
    totalItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchServerCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
