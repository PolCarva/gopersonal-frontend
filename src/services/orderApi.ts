import { getToken } from './authApi';
import { CartItem } from '../hooks/useCart';

// URL del backend - ajustar según entorno
// Para emulador Android
const API_URL = 'http://10.0.2.2:5000/api';
// Para dispositivo físico o iOS, usa tu IP local
// const API_URL = 'http://192.168.1.X:5000/api'; // Reemplaza X con tu IP
// Para web o iOS usando localhost
// const API_URL = 'http://localhost:5000/api';

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
    
    console.log('Creando pedido:', orderData);
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData),
    });

    console.log('Respuesta de crear pedido:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error en respuesta de creación de pedido:', errorData);
      throw new Error(errorData.message || 'Error al crear el pedido');
    }

    const createdOrder = await response.json();
    console.log('Pedido creado:', createdOrder);
    return createdOrder;
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
    
    console.log('Obteniendo pedidos del usuario');
    const response = await fetch(`${API_URL}/orders/myorders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    console.log('Respuesta de obtener pedidos:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error en respuesta de obtención de pedidos:', errorData);
      throw new Error(errorData.message || 'Error al obtener pedidos');
    }

    const orders = await response.json();
    console.log(`Pedidos obtenidos: ${orders.length}`);
    return orders;
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
    
    console.log(`Obteniendo pedido: ${orderId}`);
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    console.log('Respuesta de obtener pedido por ID:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error en respuesta de obtención de pedido:', errorData);
      throw new Error(errorData.message || 'Error al obtener el pedido');
    }

    const order = await response.json();
    console.log('Pedido obtenido:', order._id);
    return order;
  } catch (error) {
    console.error(`Error al obtener pedido ${orderId}:`, error);
    throw error;
  }
}; 