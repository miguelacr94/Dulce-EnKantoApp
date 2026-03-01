import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { clientesService } from '../services/clientesService';
import { pedidosService } from '../services/pedidosService';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/constants';
import { formatCurrency, formatDate, formatTelefono } from '../utils/format';
import { Cliente, PedidoConDetalles } from '../types';

type ClienteDetalleScreenRouteProp = RouteProp<RootStackParamList, 'ClienteDetalle'>;
type ClienteDetalleScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ClienteDetalle'>;

const ClienteDetalleScreen: React.FC = () => {
  const route = useRoute<ClienteDetalleScreenRouteProp>();
  const navigation = useNavigation<ClienteDetalleScreenNavigationProp>();
  const { clienteId } = route.params;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [pedidos, setPedidos] = useState<PedidoConDetalles[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos del cliente y sus pedidos
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Cargar cliente
        const clienteData = await clientesService.getClienteById(clienteId);
        setCliente(clienteData);
        
        // Cargar pedidos del cliente
        const pedidosData = await pedidosService.getPedidosPorCliente(clienteId);
        setPedidos(pedidosData);
      } catch (error) {
        Alert.alert('Error', 'No se pudo cargar la información del cliente');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [clienteId]);

  // Calcular estadísticas del cliente
  const estadisticas = {
    totalPedidos: pedidos.length,
    pedidosPendientes: pedidos.filter(p => p.estado === 'pendiente').length,
    pedidosEntregados: pedidos.filter(p => p.estado === 'entregado').length,
    pedidosCancelados: pedidos.filter(p => p.estado === 'cancelado').length,
    totalComprado: pedidos.reduce((sum, p) => sum + p.precio_total, 0),
    saldoPendiente: pedidos
      .filter(p => p.estado === 'pendiente')
      .reduce((sum, p) => sum + p.saldo_pendiente, 0),
  };

  const renderPedidoCard = (pedido: PedidoConDetalles) => (
    <TouchableOpacity
      key={pedido.id}
      style={styles.pedidoCard}
      onPress={() => navigation.navigate('PedidoDetalle', { pedidoId: pedido.id })}
    >
      <View style={styles.pedidoHeader}>
        <View style={styles.pedidoInfo}>
          <Text style={styles.productoInfo}>
            {pedido.tipo_producto === 'torta' ? `Torta ${pedido.peso} lb` : `${pedido.peso} cupcakes`}
          </Text>
          <Text style={styles.sabor}>{pedido.sabor}</Text>
        </View>
        <View style={styles.pedidoPrecio}>
          <Text style={styles.precio}>{formatCurrency(pedido.precio_total)}</Text>
          {pedido.saldo_pendiente > 0 && (
            <Text style={styles.saldo}>Saldo: {formatCurrency(pedido.saldo_pendiente)}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.pedidoFooter}>
        <Text style={styles.fecha}>Entrega: {formatDate(pedido.fecha_entrega)}</Text>
        <View style={[
          styles.estadoBadge,
          { backgroundColor: pedido.estado === 'pendiente' ? '#FFF8DC' : 
                         pedido.estado === 'entregado' ? '#F0FFF0' : '#FFE4E1' }
        ]}>
          <Text style={[
            styles.estadoText,
            { color: pedido.estado === 'pendiente' ? '#FFA500' : 
                   pedido.estado === 'entregado' ? '#32CD32' : '#FF6B6B' }
          ]}>
            {pedido.estado ? pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1) : 'Sin estado'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  if (!cliente) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Cliente no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => {}} />}
    >
      {/* Información del Cliente */}
      <View style={styles.clienteCard}>
        <View style={styles.clienteHeader}>
          <Text style={styles.clienteNombre}>{cliente.nombre}</Text>
          <Text style={styles.clienteDesde}>
            Cliente desde: {formatDate(cliente.created_at)}
          </Text>
        </View>
        
        <View style={styles.clienteInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teléfono:</Text>
            <Text style={styles.infoValue}>{formatTelefono(cliente.telefono)}</Text>
          </View>
          
          {cliente.direccion && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dirección:</Text>
              <Text style={styles.infoValue}>{cliente.direccion}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Estadísticas del Cliente */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Estadísticas</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{estadisticas.totalPedidos}</Text>
            <Text style={styles.statLabel}>Total Pedidos</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{estadisticas.pedidosPendientes}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{estadisticas.pedidosEntregados}</Text>
            <Text style={styles.statLabel}>Entregados</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{estadisticas.pedidosCancelados}</Text>
            <Text style={styles.statLabel}>Cancelados</Text>
          </View>
        </View>
        
        <View style={styles.financialStats}>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Total Comprado:</Text>
            <Text style={styles.financialValue}>{formatCurrency(estadisticas.totalComprado)}</Text>
          </View>
          
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Saldo Pendiente:</Text>
            <Text style={[
              styles.financialValue,
              estadisticas.saldoPendiente > 0 ? styles.saldoPendiente : styles.saldoCero
            ]}>
              {formatCurrency(estadisticas.saldoPendiente)}
            </Text>
          </View>
        </View>
      </View>

      {/* Historial de Pedidos */}
      <View style={styles.pedidosCard}>
        <Text style={styles.cardTitle}>Historial de Pedidos</Text>
        
        {pedidos.length > 0 ? (
          pedidos.map(renderPedidoCard)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Este cliente no tiene pedidos registrados</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.medium,
    color: COLORS.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FONTS.medium,
    color: COLORS.error,
  },
  clienteCard: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.lg,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  clienteHeader: {
    marginBottom: SPACING.md,
  },
  clienteNombre: {
    fontSize: FONTS.title,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  clienteDesde: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
  },
  clienteInfo: {
    gap: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: FONTS.medium,
    color: COLORS.textLight,
  },
  infoValue: {
    fontSize: FONTS.medium,
    color: COLORS.text,
    fontWeight: '500',
  },
  statsCard: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.lg,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  cardTitle: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONTS.xlarge,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  financialStats: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  financialLabel: {
    fontSize: FONTS.medium,
    color: COLORS.textLight,
  },
  financialValue: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  saldoPendiente: {
    color: COLORS.error,
  },
  saldoCero: {
    color: COLORS.success,
  },
  pedidosCard: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.lg,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  pedidoCard: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  pedidoInfo: {
    flex: 1,
  },
  productoInfo: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sabor: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  pedidoPrecio: {
    alignItems: 'flex-end',
  },
  precio: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  saldo: {
    fontSize: FONTS.small,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  pedidoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fecha: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
  },
  estadoBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  estadoText: {
    fontSize: FONTS.tiny,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONTS.medium,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default ClienteDetalleScreen;
