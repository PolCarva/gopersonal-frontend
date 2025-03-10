import { getToken } from './authApi';
import { CartItem } from '../hooks/useCart';

// URL del backend - ajustar según entorno
// Para emulador Android
const API_URL = 'http://10.0.2.2:5000/api';
// Para dispositivo físico o iOS, usa tu IP local
// const API_URL = 'http://192.168.1.X:5000/api'; // Reemplaza X con tu IP
// Para web o iOS usando localhost
// const API_URL = 'http://localhost:5000/api';

// Interfaces
export interface CartItemAPI {
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  _id: string;
}

export interface CartResponse {
  _id: string;
  user: string;
  items: CartItemAPI[];
  updatedAt: string;
  createdAt: string;
}

// Obtener el carrito del usuario
export const getCart = async (): Promise<CartResponse> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    console.log('Obteniendo carrito del usuario');
    const response = await fetch(`${API_URL}/carts/mycart`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error en respuesta de obtención de carrito:', errorData);
      throw new Error(errorData.message || 'Error al obtener el carrito');
    }

    const cartData = await response.json();
    console.log('Carrito obtenido:', cartData);
    return cartData;
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    throw error;
  }
};

// Añadir un producto al carrito
export const addItemToCart = async (item: CartItem): Promise<CartResponse> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    console.log('Añadiendo item al carrito:', item);
    const response = await fetch(`${API_URL}/carts/item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        quantity: item.quantity
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error en respuesta de añadir item al carrito:', errorData);
      throw new Error(errorData.message || 'Error al añadir item al carrito');
    }

    const cartData = await response.json();
    console.log('Item añadido al carrito:', cartData);
    return cartData;
  } catch (error) {
    console.error('Error al añadir item al carrito:', error);
    throw error;
  }
};

// Actualizar la cantidad de un producto en el carrito
export const updateCartItemQuantity = async (productId: number, quantity: number): Promise<CartResponse> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    console.log(`Actualizando cantidad del producto ${productId} a ${quantity}`);
    const response = await fetch(`${API_URL}/carts/item/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error en respuesta de actualizar item del carrito:', errorData);
      throw new Error(errorData.message || 'Error al actualizar item del carrito');
    }

    const cartData = await response.json();
    console.log('Cantidad de item actualizada:', cartData);
    return cartData;
  } catch (error) {
    console.error('Error al actualizar cantidad del item:', error);
    throw error;
  }
};

// Eliminar un producto del carrito
export const removeItemFromCart = async (productId: number): Promise<CartResponse> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    console.log(`Eliminando producto ${productId} del carrito`);
    const response = await fetch(`${API_URL}/carts/item/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error en respuesta de eliminar item del carrito:', errorData);
      throw new Error(errorData.message || 'Error al eliminar item del carrito');
    }

    const cartData = await response.json();
    console.log('Item eliminado del carrito:', cartData);
    return cartData;
  } catch (error) {
    console.error('Error al eliminar item del carrito:', error);
    throw error;
  }
};

// Vaciar el carrito
export const clearCart = async (): Promise<CartResponse> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    console.log('Vaciando el carrito');
    const response = await fetch(`${API_URL}/carts/clear`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error en respuesta de vaciar carrito:', errorData);
      throw new Error(errorData.message || 'Error al vaciar el carrito');
    }

    const cartData = await response.json();
    console.log('Carrito vaciado:', cartData);
    return cartData;
  } catch (error) {
    console.error('Error al vaciar el carrito:', error);
    throw error;
  }
};

// Convertir la respuesta de la API a formato de CartItem
export const apiToCartItems = (cartResponse: CartResponse): CartItem[] => {
  return cartResponse.items.map(item => ({
    product: {
      id: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      description: '', // La API no almacena descripciones
      category: '' // La API no almacena categorías
    },
    quantity: item.quantity
  }));
}; 