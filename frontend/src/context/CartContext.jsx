import React, { createContext, useContext, useReducer, useEffect } from 'react';
import cartService from '../services/cartService';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const initialState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  appliedCoupon: null,
  couponDiscount: 0,
  deliveryCharge: 0,
  finalAmount: 0,
  isLoading: true,
  isDrawerOpen: false,
};

const calculateTotals = (items, appliedCoupon) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.flatDiscount) {
      couponDiscount = appliedCoupon.flatDiscount;
    } else if (appliedCoupon.discountPercent) {
      couponDiscount = Math.min(
        (totalAmount * appliedCoupon.discountPercent) / 100,
        appliedCoupon.maxDiscount || Infinity
      );
    }
  }

  // Free delivery above ₹999, else ₹49
  const deliveryCharge = totalAmount >= 999 || totalAmount === 0 ? 0 : 49;
  const finalAmount = Math.max(0, totalAmount - couponDiscount + deliveryCharge);

  return {
    totalItems,
    totalAmount,
    couponDiscount: Math.round(couponDiscount),
    deliveryCharge,
    finalAmount: Math.round(finalAmount),
  };
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART': {
      const { items } = action.payload;
      const totals = calculateTotals(items, state.appliedCoupon);
      return {
        ...state,
        items,
        ...totals,
        isLoading: false,
      };
    }
    case 'APPLY_COUPON': {
      const coupon = action.payload;
      const totals = calculateTotals(state.items, coupon);
      return {
        ...state,
        appliedCoupon: coupon,
        ...totals,
      };
    }
    case 'REMOVE_COUPON': {
      const totals = calculateTotals(state.items, null);
      return {
        ...state,
        appliedCoupon: null,
        ...totals,
      };
    }
    case 'TOGGLE_DRAWER':
      return {
        ...state,
        isDrawerOpen: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart on startup
  useEffect(() => {
    const loadCart = async () => {
      try {
        const cart = await cartService.getCart();
        dispatch({ type: 'SET_CART', payload: cart });
      } catch (err) {
        dispatch({ type: 'SET_CART', payload: { items: [] } });
      }
    };
    loadCart();
  }, []);

  const addToCart = async (product, quantity = 1, size = '4 Litres', finish = 'Matte') => {
    try {
      const updated = await cartService.addItem(product, quantity, size, finish);
      dispatch({ type: 'SET_CART', payload: updated });
      toast.success(`${product.name.slice(0, 22)}... added to cart!`);
    } catch {
      toast.error('Failed to add item to cart');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const updated = await cartService.updateQuantity(itemId, quantity);
      dispatch({ type: 'SET_CART', payload: updated });
    } catch {
      toast.error('Could not update quantity');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const updated = await cartService.removeItem(itemId);
      dispatch({ type: 'SET_CART', payload: updated });
      toast.success('Item removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      const empty = await cartService.clearCart();
      dispatch({ type: 'SET_CART', payload: empty });
      dispatch({ type: 'REMOVE_COUPON' });
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  const applyCoupon = (coupon) => {
    dispatch({ type: 'APPLY_COUPON', payload: coupon });
    toast.success(`Coupon ${coupon.code} applied!`);
  };

  const removeCoupon = () => {
    dispatch({ type: 'REMOVE_COUPON' });
    toast.success('Coupon removed');
  };

  const openDrawer = () => dispatch({ type: 'TOGGLE_DRAWER', payload: true });
  const closeDrawer = () => dispatch({ type: 'TOGGLE_DRAWER', payload: false });

  const value = {
    items: state.items,
    totalItems: state.totalItems,
    totalAmount: state.totalAmount,
    appliedCoupon: state.appliedCoupon,
    couponDiscount: state.couponDiscount,
    deliveryCharge: state.deliveryCharge,
    finalAmount: state.finalAmount,
    isLoading: state.isLoading,
    isDrawerOpen: state.isDrawerOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    openDrawer,
    closeDrawer,
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
