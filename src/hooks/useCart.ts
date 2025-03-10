import { useState, useEffect } from 'react';
import { Product } from '../types';
import { 
  getCart, 
  addItemToCart, 
  updateCartItemQuantity, 
  removeItemFromCart, 
  clearCart as clearCartApi,
  apiToCartItems
} from '../services/cartApi';
import { getUserData } from '../services/authApi';

export interface CartItem {
  product: Product;
  quantity: number;
}

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticación al iniciar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getUserData();
        const authenticated = !!userData;
        setIsAuthenticated(authenticated);
        
        // Si no está autenticado, limpiar el carrito local
        if (!authenticated) {
          setItems([]);
          setError(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        setIsAuthenticated(false);
        setLoading(false);
        setItems([]);
      }
    };
    
    checkAuth();
  }, []);

  // Cargar el carrito desde la API cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      console.log('No se puede cargar el carrito: usuario no autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Establecer un timeout para evitar que se quede cargando indefinidamente
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Tiempo de espera agotado')), 5000)
      );
      
      // Intentar obtener el carrito con un límite de tiempo
      const cartData = await Promise.race([
        getCart(),
        timeoutPromise
      ]);
      
      const cartItems = apiToCartItems(cartData);
      setItems(cartItems);
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setError('Tiempo de espera agotado. El servidor puede estar caído o hay problemas de conexión.');
        } else {
          setError(`No se pudo cargar el carrito: ${error.message}`);
        }
      } else {
        setError('Error desconocido al cargar el carrito');
      }
      // No limpiar los items existentes en caso de error
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity: number) => {
    if (!isAuthenticated) {
      console.log('No se puede añadir al carrito: usuario no autenticado');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Buscar si el producto ya existe en el carrito local
      const existingItemIndex = items.findIndex(
        item => item.product.id === product.id
      );

      const newQuantity = existingItemIndex !== -1 
        ? items[existingItemIndex].quantity + quantity 
        : quantity;

      const newItem: CartItem = {
        product,
        quantity: newQuantity
      };

      // Llamar a la API para actualizar el carrito
      await addItemToCart(newItem);
      
      // Actualizar el estado local optimísticamente
      setItems(currentItems => {
        if (existingItemIndex !== -1) {
          // Si existe, actualizamos su cantidad
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex].quantity = newQuantity;
          return updatedItems;
        } else {
          // Si no existe, lo agregamos como nuevo item
          return [...currentItems, { product, quantity }];
        }
      });
      
      // Recargar el carrito para asegurar sincronización
      await fetchCart();
    } catch (error) {
      console.error('Error al añadir al carrito:', error);
      setError('No se pudo añadir el producto al carrito');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: number) => {
    if (!isAuthenticated) {
      console.log('No se puede eliminar del carrito: usuario no autenticado');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Actualizar el estado local optimísticamente
      setItems(currentItems => 
        currentItems.filter(item => item.product.id !== productId)
      );
      
      // Llamar a la API para eliminar el producto
      await removeItemFromCart(productId);
      
      // Recargar el carrito para asegurar sincronización
      await fetchCart();
    } catch (error) {
      console.error('Error al eliminar del carrito:', error);
      setError('No se pudo eliminar el producto del carrito');
      
      // Revertir el cambio en caso de error
      await fetchCart();
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!isAuthenticated) {
      console.log('No se puede actualizar el carrito: usuario no autenticado');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Validar que la cantidad sea al menos 1
      const validQuantity = Math.max(1, quantity);
      
      // Actualizar el estado local optimísticamente
      setItems(currentItems => 
        currentItems.map(item => 
          item.product.id === productId
            ? { ...item, quantity: validQuantity }
            : item
        )
      );
      
      // Llamar a la API para actualizar la cantidad
      await updateCartItemQuantity(productId, validQuantity);
      
      // Recargar el carrito para asegurar sincronización
      await fetchCart();
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      setError('No se pudo actualizar la cantidad del producto');
      
      // Revertir el cambio en caso de error
      await fetchCart();
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      console.log('No se puede vaciar el carrito: usuario no autenticado');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Actualizar el estado local optimísticamente
      setItems([]);
      
      // Llamar a la API para vaciar el carrito
      await clearCartApi();
    } catch (error) {
      console.error('Error al vaciar el carrito:', error);
      setError('No se pudo vaciar el carrito');
      
      // Revertir el cambio en caso de error
      await fetchCart();
    } finally {
      setLoading(false);
    }
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
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    refreshCart: fetchCart,
  };
}; 