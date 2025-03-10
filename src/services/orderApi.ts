import { getToken } from './authApi';
import { CartItem } from '../hooks/useCart';

const API_URL = 'http://10.0.2.2:5000/api'; // Para emulador Android localhost

export interface OrderData {
  items: {
    productId: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
  }[];
  totalAmount: number;
  shippingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: 'tarjeta' | 'efectivo' | 'transferencia';
}

export interface Order extends OrderData {
  _id: string;
  user: string;
  status: 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';
  createdAt: string;
  updatedAt: string;
}

// Transformar CartItems a OrderItems para la API
export const transformCartToOrderItems = (cartItems: CartItem[]) => {
  return cartItems.map(item => ({
    productId: item.product.id,
    name: item.product.name,
    price: item.product.price,
    image: item.product.image,
    quantity: item.quantity
  }));
};

// Crear un nuevo pedido
export const createOrder = async (orderData: OrderData): Promise<Order> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear el pedido');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al crear pedido:', error);
    throw error;
  }
};

// Obtener los pedidos del usuario
export const getUserOrders = async (): Promise<Order[]> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    const response = await fetch(`${API_URL}/orders/myorders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener pedidos');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    throw error;
  }
};

// Obtener un pedido específico
export const getOrderById = async (orderId: string): Promise<Order> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener el pedido');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error al obtener pedido ${orderId}:`, error);
    throw error;
  }
}; 