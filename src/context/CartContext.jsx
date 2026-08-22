import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { TOKEN_PACKAGES } from '../services/mockData';
import { useLanguage } from './LanguageContext';
import { useWallet } from './WalletContext';

const CartContext = createContext();

const STORAGE_KEY = 'mycode_token_cart';

export function CartProvider({ children }) {
  const { t } = useLanguage();
  const { addToast } = useWallet();

  const [cartItems, setCartItems] = useState(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Filter only valid packages that exist in TOKEN_PACKAGES
            return parsed.filter(item => 
              item && item.packageId && TOKEN_PACKAGES.some(p => p.id === item.packageId) && item.quantity > 0
            );
          }
        }
      }
    } catch (e) {
      console.warn('[CartContext] Failed to load cart from storage:', e);
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
      }
    } catch (e) {
      console.error('[CartContext] Failed to persist cart:', e);
    }
  }, [cartItems]);

  // Derived enriched items
  const items = useMemo(() => {
    return cartItems.map(item => {
      const pkg = TOKEN_PACKAGES.find(p => p.id === item.packageId);
      if (!pkg) return null;
      return {
        ...pkg,
        packageId: item.packageId,
        quantity: item.quantity,
        itemSubtotal: pkg.price * item.quantity,
        itemTokens: pkg.tokenAmount * item.quantity
      };
    }).filter(Boolean);
  }, [cartItems]);

  const totalItemCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  }, [cartItems]);

  const totalTokens = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.itemTokens || 0), 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.itemSubtotal || 0), 0);
  }, [items]);

  const addToCart = useCallback((packageId, qty = 1) => {
    const pkg = TOKEN_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return false;

    setCartItems(prev => {
      const existing = prev.find(item => item.packageId === packageId);
      if (existing) {
        return prev.map(item =>
          item.packageId === packageId
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { packageId, quantity: qty }];
    });

    const packageName = t(pkg.nameKey);
    addToast(t('cart.item_added_toast', { name: packageName }), 'success');
    return true;
  }, [t, addToast]);

  const removeFromCart = useCallback((packageId) => {
    const pkg = TOKEN_PACKAGES.find(p => p.id === packageId);
    setCartItems(prev => prev.filter(item => item.packageId !== packageId));
    if (pkg) {
      const packageName = t(pkg.nameKey);
      addToast(t('cart.item_removed_toast', { name: packageName }), 'info');
    }
  }, [t, addToast]);

  const updateQuantity = useCallback((packageId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(packageId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.packageId === packageId ? { ...item, quantity: newQty } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    if (cartItems.length > 0) {
      setCartItems([]);
      addToast(t('cart.cart_cleared_toast'), 'info');
    }
  }, [cartItems.length, t, addToast]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);

  const openCheckout = useCallback(() => {
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  }, []);
  const closeCheckout = useCallback(() => setIsCheckoutModalOpen(false), []);

  return (
    <CartContext.Provider
      value={{
        items,
        cartItems,
        totalItemCount,
        totalTokens,
        subtotal,
        packages: TOKEN_PACKAGES,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        isCheckoutModalOpen,
        openCheckout,
        closeCheckout
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
