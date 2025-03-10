import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getUserOrders } from '../services/orderApi';
import { Order } from '../services/orderApi';
import { RootStackParamList } from '../types';

type OrdersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Orders'>;

export function OrdersScreen() {
  const navigation = useNavigation<OrdersScreenNavigationProp>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      const data = await getUserOrders();
      setOrders(data);
    } catch (err) {
      setError('Error al cargar los pedidos. Por favor, intenta nuevamente.');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleRefresh = () => {
    loadOrders(true);
  };

  const handleOrderPress = (orderId: string) => {
    navigation.navigate('OrderDetail', { orderId });
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
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando pedidos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => loadOrders()}>
          <Text style={styles.retryText}>Intentar nuevamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => handleOrderPress(item._id)}
          >
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Pedido #{item._id.slice(-6)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            
            <View style={styles.orderInfo}>
              <Text style={styles.orderDate}>
                <Ionicons name="calendar-outline" size={14} color="#7f8c8d" /> {formatDate(item.createdAt)}
              </Text>
              <Text style={styles.orderItems}>
                <Ionicons name="cube-outline" size={14} color="#7f8c8d" /> {item.items.length} productos
              </Text>
              <Text style={styles.orderTotal}>
                <Ionicons name="cash-outline" size={14} color="#7f8c8d" /> ${item.totalAmount.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.viewDetailsContainer}>
              <Text style={styles.viewDetailsText}>Ver detalles</Text>
              <Ionicons name="chevron-forward" size={16} color="#3498db" />
            </View>
          </TouchableOpacity>
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color="#bdc3c7" />
            <Text style={styles.emptyText}>No tienes pedidos</Text>
            <Text style={styles.emptySubtext}>
              Tus pedidos aparecerán aquí cuando realices una compra
            </Text>
          </View>
        }
        contentContainerStyle={orders.length === 0 ? styles.emptyList : styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  orderInfo: {
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
    paddingTop: 12,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#3498db',
    marginRight: 4,
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
  emptyContainer: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
}); 