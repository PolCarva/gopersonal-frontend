import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getOrderById } from '../services/orderApi';
import { getUserData } from '../services/authApi';
import { Order } from '../services/orderApi';
import { RootStackParamList } from '../types';

type OrderDetailScreenRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;
type OrderDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderDetail'>;

export function OrderDetailScreen() {
  const navigation = useNavigation<OrderDetailScreenNavigationProp>();
  const route = useRoute<OrderDetailScreenRouteProp>();
  const { orderId } = route.params;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const userData = await getUserData();
      if (userData) {
        setIsAuthenticated(true);
        loadOrder(true);
      } else {
        setIsAuthenticated(false);
        setLoading(false);
        setError('Necesitas iniciar sesión para ver el detalle del pedido');
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      setIsAuthenticated(false);
      setLoading(false);
      setError('Error al verificar la autenticación');
    }
  };

  const loadOrder = async (forceAuthenticated = false) => {
    if (!isAuthenticated && !forceAuthenticated) {
      console.log('No autenticado en OrderDetailScreen, mostrando error');
      setLoading(false);
      setError('Necesitas iniciar sesión para ver el detalle del pedido');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Cargando detalle del pedido: ${orderId}`);
      const data = await getOrderById(orderId);
      console.log('Pedido cargado con éxito:', data._id);
      setOrder(data);
    } catch (err) {
      console.error(`Error al cargar pedido ${orderId}:`, err);
      setError('Error al cargar el pedido. Por favor, intenta nuevamente.');
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

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'Tu pedido está pendiente de procesamiento';
      case 'procesando':
        return 'Estamos preparando tu pedido';
      case 'enviado':
        return 'Tu pedido ha sido enviado y está en camino';
      case 'entregado':
        return 'Tu pedido ha sido entregado correctamente';
      case 'cancelado':
        return 'Este pedido ha sido cancelado';
      default:
        return 'Estado desconocido';
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

  const handleShare = () => {
    if (!order) return;
    
    Alert.alert(
      'Compartir Pedido',
      '¿Quieres compartir los detalles de este pedido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Compartir', 
          onPress: () => {
            // Aquí iría la implementación para compartir (se implementaría con Share de react-native)
            Alert.alert('Función no disponible', 'La función de compartir será implementada próximamente');
          } 
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando detalles del pedido...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="lock-closed-outline" size={60} color="#e74c3c" />
        <Text style={styles.errorText}>Necesitas iniciar sesión para ver el detalle del pedido</Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => {
            console.log('Redirigiendo a login desde detalle de pedido - usuario no autenticado');
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
        <TouchableOpacity onPress={() => loadOrder()}>
          <Text style={styles.retryText}>Intentar nuevamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se encontró información del pedido</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
          <Text style={styles.retryText}>Volver a mis pedidos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Encabezado con información del pedido */}
      <View style={styles.header}>
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderId}>Pedido #{order._id.slice(-8)}</Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={22} color="#3498db" />
          </TouchableOpacity>
        </View>
        <Text style={styles.orderDate}>Realizado el {formatDate(order.createdAt)}</Text>
      </View>

      {/* Estado del pedido */}
      <View style={[styles.statusContainer, { backgroundColor: getStatusColor(order.status) + '15' }]}>
        <View style={[styles.statusIconContainer, { backgroundColor: getStatusColor(order.status) }]}>
          <Ionicons name={getStatusIcon(order.status)} size={24} color="white" />
        </View>
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusTitle}>Estado: {order.status}</Text>
          <Text style={styles.statusDescription}>{getStatusDescription(order.status)}</Text>
        </View>
      </View>

      {/* Progreso del pedido */}
      <View style={styles.progressContainer}>
        <Text style={styles.sectionTitle}>Seguimiento</Text>
        
        <View style={styles.timeline}>
          <View style={[
            styles.timelineItem, 
            styles.timelineItemActive, 
            (order.status === 'cancelado' && styles.timelineItemCancelled)
          ]}>
            <View style={[
              styles.timelineDot, 
              styles.timelineDotActive,
              (order.status === 'cancelado' && styles.timelineDotCancelled)
            ]}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Pedido recibido</Text>
              <Text style={styles.timelineDate}>{formatDate(order.createdAt)}</Text>
            </View>
          </View>
          
          <View style={[
            styles.timelineConnector, 
            (order.status !== 'pendiente' && order.status !== 'cancelado') ? styles.timelineConnectorActive : {},
            (order.status === 'cancelado' && styles.timelineConnectorCancelled)
          ]} />
          
          <View style={[
            styles.timelineItem, 
            (order.status !== 'pendiente' && order.status !== 'cancelado') ? styles.timelineItemActive : {},
            (order.status === 'cancelado' && styles.timelineItemCancelled)
          ]}>
            <View style={[
              styles.timelineDot,
              (order.status !== 'pendiente' && order.status !== 'cancelado') ? styles.timelineDotActive : {},
              (order.status === 'cancelado' && styles.timelineDotCancelled)
            ]}>
              {(order.status !== 'pendiente' && order.status !== 'cancelado') && <Ionicons name="checkmark" size={16} color="white" />}
              {order.status === 'cancelado' && <Ionicons name="close" size={16} color="white" />}
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Procesando</Text>
              <Text style={styles.timelineDate}>
                {order.status === 'pendiente' ? 'Pendiente' : 
                 order.status === 'cancelado' ? 'Cancelado' : 'Completado'}
              </Text>
            </View>
          </View>
          
          <View style={[
            styles.timelineConnector, 
            (order.status === 'enviado' || order.status === 'entregado') ? styles.timelineConnectorActive : {},
            (order.status === 'cancelado' && styles.timelineConnectorCancelled)
          ]} />
          
          <View style={[
            styles.timelineItem, 
            (order.status === 'enviado' || order.status === 'entregado') ? styles.timelineItemActive : {},
            (order.status === 'cancelado' && styles.timelineItemCancelled)
          ]}>
            <View style={[
              styles.timelineDot,
              (order.status === 'enviado' || order.status === 'entregado') ? styles.timelineDotActive : {},
              (order.status === 'cancelado' && styles.timelineDotCancelled)
            ]}>
              {(order.status === 'enviado' || order.status === 'entregado') && <Ionicons name="checkmark" size={16} color="white" />}
              {order.status === 'cancelado' && <Ionicons name="close" size={16} color="white" />}
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Enviado</Text>
              <Text style={styles.timelineDate}>
                {(order.status === 'pendiente' || order.status === 'procesando') ? 'Pendiente' : 
                 order.status === 'cancelado' ? 'Cancelado' : 'Completado'}
              </Text>
            </View>
          </View>
          
          <View style={[
            styles.timelineConnector, 
            order.status === 'entregado' ? styles.timelineConnectorActive : {},
            (order.status === 'cancelado' && styles.timelineConnectorCancelled)
          ]} />
          
          <View style={[
            styles.timelineItem, 
            order.status === 'entregado' ? styles.timelineItemActive : {},
            (order.status === 'cancelado' && styles.timelineItemCancelled)
          ]}>
            <View style={[
              styles.timelineDot,
              order.status === 'entregado' ? styles.timelineDotActive : {},
              (order.status === 'cancelado' && styles.timelineDotCancelled)
            ]}>
              {order.status === 'entregado' && <Ionicons name="checkmark" size={16} color="white" />}
              {order.status === 'cancelado' && <Ionicons name="close" size={16} color="white" />}
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Entregado</Text>
              <Text style={styles.timelineDate}>
                {order.status === 'entregado' ? 'Completado' : 
                 order.status === 'cancelado' ? 'Cancelado' : 'Pendiente'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Productos del pedido */}
      <View style={styles.productsContainer}>
        <Text style={styles.sectionTitle}>Productos ({order.items.length})</Text>
        
        {order.items.map((item, index) => (
          <View key={index} style={styles.productItem}>
            <Image 
              source={{ uri: item.image }} 
              style={styles.productImage}
              defaultSource={require('../../assets/placeholder.png')}
            />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productQuantity}>Cantidad: {item.quantity}</Text>
              <Text style={styles.productPrice}>${item.price.toFixed(2)} c/u</Text>
            </View>
            <Text style={styles.productTotal}>
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      {/* Resumen del pedido */}
      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Resumen</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${order.totalAmount.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Envío</Text>
          <Text style={styles.summaryValue}>Gratis</Text>
        </View>
        
        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${order.totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      {/* Información de envío */}
      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>Información de envío</Text>
        
        {order.shippingAddress ? (
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={20} color="#3498db" style={styles.addressIcon} />
            <View style={styles.addressDetails}>
              <Text style={styles.addressText}>
                {order.shippingAddress.street}, {order.shippingAddress.city}
              </Text>
              <Text style={styles.addressText}>
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noDataText}>Sin información de envío</Text>
        )}
      </View>

      {/* Información de pago */}
      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>Método de pago</Text>
        <View style={styles.paymentMethod}>
          <Ionicons 
            name={order.paymentMethod === 'tarjeta' ? 'card-outline' : 
                  order.paymentMethod === 'efectivo' ? 'cash-outline' : 'swap-horizontal-outline'} 
            size={20} 
            color="#3498db" 
            style={styles.paymentIcon} 
          />
          <Text style={styles.paymentText}>
            {order.paymentMethod === 'tarjeta' ? 'Tarjeta de crédito/débito' :
             order.paymentMethod === 'efectivo' ? 'Pago en efectivo' : 'Transferencia bancaria'}
          </Text>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            console.log('Navegando a la pantalla de pedidos desde detalle - con método directo');
            navigation.navigate('Orders');
          }}
        >
          <Ionicons name="arrow-back-outline" size={20} color="#3498db" />
          <Text style={styles.actionButtonText}>Volver a mis pedidos</Text>
        </TouchableOpacity>
        
        {order.status !== 'cancelado' && (
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonOutlined]}>
            <Ionicons name="help-circle-outline" size={20} color="#3498db" />
            <Text style={styles.actionButtonText}>Ayuda con mi pedido</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
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
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 8,
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  orderIdContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  shareButton: {
    padding: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
  },
  statusDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  progressContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  timelineItemActive: {
    opacity: 1,
  },
  timelineItemCancelled: {
    opacity: 0.7,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#bdc3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDotActive: {
    backgroundColor: '#2ecc71',
  },
  timelineDotCancelled: {
    backgroundColor: '#e74c3c',
  },
  timelineConnector: {
    width: 2,
    height: 32,
    backgroundColor: '#bdc3c7',
    marginLeft: 11,
    marginBottom: 8,
  },
  timelineConnectorActive: {
    backgroundColor: '#2ecc71',
  },
  timelineConnectorCancelled: {
    backgroundColor: '#e74c3c',
  },
  timelineContent: {
    flex: 1,
    marginBottom: 8,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  timelineDate: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  productsContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  productTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#f1f1f1',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  addressDetails: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  noDataText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    marginRight: 8,
  },
  paymentText: {
    fontSize: 14,
    color: '#333',
  },
  actionsContainer: {
    padding: 16,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3498db',
  },
  actionButtonOutlined: {
    backgroundColor: 'transparent',
  },
  actionButtonText: {
    color: '#3498db',
    fontWeight: '500',
    marginLeft: 8,
  },
  loginButton: {
    marginTop: 16,
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    width: 200,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 