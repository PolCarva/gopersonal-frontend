import { useState } from 'react';
import { Product } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
}

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity: number) => {
    setItems(currentItems => {
      // Buscar si el producto ya existe en el carrito
      const existingItemIndex = currentItems.findIndex(
        item => item.product.id === product.id
      );

      if (existingItemIndex !== -1) {
        // Si existe, actualizamos su cantidad
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Si no existe, lo agregamos como nuevo item
        return [...currentItems, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setItems(currentItems => 
      currentItems.filter(item => item.product.id !== productId)
    );
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setItems(currentItems => 
      currentItems.map(item => 
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = (): number => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = (): number => {
    return items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  };
}; 