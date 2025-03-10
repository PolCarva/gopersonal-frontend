import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getOrderById } from '../services/orderApi';
import { Order } from '../services/orderApi';
import { RootStackParamList } from '../types';

type OrderDetailScreenRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;

export function OrderDetailScreen() {
  const route = useRoute<OrderDetailScreenRouteProp>();
  const { orderId } = route.params;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      setError('Error al cargar el pedido. Por favor, intenta nuevamente.');
      console.error(`Error loading order ${orderId}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return '#f39c12';
      case 'procesando':
        return '#3498db';
      case 'enviado':
        return '#2ecc71';
      case 'entregado':
        return '#27ae60';
      case 'cancelado':
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando detalles del pedido...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || 'No se pudo encontrar el pedido solicitado.'}
        </Text>
        <TouchableOpacity onPress={loadOrder}>
          <Text style={styles.retryText}>Intentar nuevamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Pedido #{order._id.slice(-6)}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Productos</Text>
        
        {order.items.map((item, index) => (
          <View key={`${item.productId}-${index}`} style={styles.productItem}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>${item.price.toFixed(2)} x {item.quantity}</Text>
            </View>
            
            <Text style={styles.productTotal}>
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
      
      {order.shippingAddress && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dirección de Envío</Text>
          
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={20} color="#7f8c8d" style={styles.addressIcon} />
            
            <View style={styles.addressInfo}>
              <Text style={styles.addressText}>
                {order.shippingAddress.street}
              </Text>
              <Text style={styles.addressText}>
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </Text>
              <Text style={styles.addressText}>
                {order.shippingAddress.country}
              </Text>
            </View>
          </View>
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Método de Pago</Text>
        
        <View style={styles.paymentMethod}>
          <Ionicons 
            name={
              order.paymentMethod === 'tarjeta' 
                ? 'card-outline' 
                : order.paymentMethod === 'efectivo' 
                  ? 'cash-outline' 
                  : 'wallet-outline'
            } 
            size={20} 
            color="#7f8c8d" 
          />
          <Text style={styles.paymentMethodText}>
            {order.paymentMethod === 'tarjeta' 
              ? 'Tarjeta de crédito/débito' 
              : order.paymentMethod === 'efectivo' 
                ? 'Efectivo' 
                : 'Transferencia bancaria'}
          </Text>
        </View>
      </View>
      
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${order.totalAmount.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Envío</Text>
          <Text style={styles.summaryValue}>$0.00</Text>
        </View>
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${order.totalAmount.toFixed(2)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 16,
    borderRadius: 10,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  productTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  addressInfo: {
    flex: 1,
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  summary: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 10,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3498db',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#e74c3c',
  },
  retryText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 