import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getUserOrders } from '../services/orderApi';
import { getUserData } from '../services/authApi';
import { Order } from '../services/orderApi';
import { RootStackParamList } from '../types';

type OrdersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Orders'>;

type StatusFilter = 'todos' | 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';

export function OrdersScreen() {
  const navigation = useNavigation<OrdersScreenNavigationProp>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');

  useEffect(() => {
    checkAuthentication();
  }, []);

  // Recargar órdenes cada vez que la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        loadOrders();
      }
    }, [isAuthenticated])
  );

  useEffect(() => {
    if (statusFilter === 'todos') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  }, [statusFilter, orders]);

  const checkAuthentication = async () => {
    try {
      const userData = await getUserData();
      if (userData) {
        setIsAuthenticated(true);
        loadOrders(false, true);
      } else {
        setIsAuthenticated(false);
        setLoading(false);
        setError('Necesitas iniciar sesión para ver tus pedidos');
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      setIsAuthenticated(false);
      setLoading(false);
      setError('Error al verificar la autenticación');
    }
  };

  const loadOrders = async (showRefreshing = false, forceAuthenticated = false) => {
    if (!isAuthenticated && !forceAuthenticated) {
      console.log('No autenticado, intentando redireccionar al login');
      setLoading(false);
      setError('Necesitas iniciar sesión para ver tus pedidos');
      return;
    }

    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      console.log('Cargando pedidos del usuario...');
      const data = await getUserOrders();
      console.log(`Obtenidos ${data.length} pedidos`);
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Error al cargar los pedidos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadOrders(true);
  };

  const handleOrderPress = (orderId: string) => {
    console.log(`Navegando al detalle del pedido: ${orderId}`);
    try {
      navigation.navigate('OrderDetail', { orderId });
    } catch (error) {
      console.error('Error al navegar al detalle del pedido:', error);
      Alert.alert('Error', 'No se pudo abrir el detalle del pedido. Intenta nuevamente.');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'time-outline';
      case 'procesando':
        return 'refresh-outline';
      case 'enviado':
        return 'car-outline';
      case 'entregado':
        return 'checkmark-circle-outline';
      case 'cancelado':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
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

  const renderFilterButton = (filter: StatusFilter, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        statusFilter === filter && styles.filterButtonActive
      ]}
      onPress={() => setStatusFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          statusFilter === filter && styles.filterButtonTextActive
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando pedidos...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="lock-closed-outline" size={60} color="#e74c3c" />
        <Text style={styles.errorText}>Necesitas iniciar sesión para ver tus pedidos</Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => {
            console.log('Navegando al login desde órdenes - usuario no autenticado');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }}
        >
          <Text style={styles.loginButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>
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
      <Text style={styles.title}>Mis Pedidos</Text>
      
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterButton('todos', 'Todos')}
          {renderFilterButton('pendiente', 'Pendientes')}
          {renderFilterButton('procesando', 'En Proceso')}
          {renderFilterButton('enviado', 'Enviados')}
          {renderFilterButton('entregado', 'Entregados')}
          {renderFilterButton('cancelado', 'Cancelados')}
        </ScrollView>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => handleOrderPress(item._id)}
          >
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Pedido #{item._id.slice(-6)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Ionicons name={getStatusIcon(item.status)} size={12} color="#fff" style={styles.statusIcon} />
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            
            <View style={styles.orderInfo}>
              <Text style={styles.orderDate}>
                <Ionicons name="calendar-outline" size={14} color="#7f8c8d" /> {formatDate(item.createdAt)}
              </Text>
              <Text style={styles.orderItems}>
                <Ionicons name="cube-outline" size={14} color="#7f8c8d" /> {item.items.length} {item.items.length === 1 ? 'producto' : 'productos'}
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
            <Text style={styles.emptyText}>
              {statusFilter === 'todos' 
                ? 'No tienes pedidos' 
                : `No tienes pedidos con estado "${statusFilter}"`}
            </Text>
            <Text style={styles.emptySubtext}>
              {statusFilter === 'todos'
                ? 'Tus pedidos aparecerán aquí cuando realices una compra'
                : 'Intenta seleccionar otro filtro o realiza más compras'}
            </Text>
          </View>
        }
        contentContainerStyle={filteredOrders.length === 0 ? styles.emptyList : styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    marginHorizontal: 16,
    color: '#333',
  },
  filtersContainer: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
    paddingTop: 0,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
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
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryText: {
    fontSize: 14,
    color: '#3498db',
    textDecorationLine: 'underline',
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 8,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#3498db',
    width: 200,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
}); 