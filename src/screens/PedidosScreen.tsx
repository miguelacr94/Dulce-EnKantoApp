import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { usePedidos } from '../hooks/usePedidos';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ESTADOS_PEDIDO } from '../utils/constants';
import { formatCurrency, getTextoDiasRestantes, getEstadoColor, getProductoLabel, formatTime, formatPedidoItems } from '../utils/format';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, TabParamList } from '../navigation/AppNavigator';
import { EstadoPedido } from '../types';

type PedidosScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Pedidos'>,
  StackNavigationProp<RootStackParamList>
>;

const PedidosScreen: React.FC = () => {
  const navigation = useNavigation<PedidosScreenNavigationProp>();
  const { pedidos, isLoading, refetch } = usePedidos();
  const [filtro, setFiltro] = useState<EstadoPedido | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');

  // Filtrar pedidos según el estado y búsqueda
  const pedidosFiltrados = pedidos.filter(pedido => {
    const coincideEstado = filtro === 'todos' || pedido.estado === filtro;
    const coincideBusqueda = busqueda === '' || 
      (pedido.cliente_nombre && pedido.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
      pedido.sabor.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    
    return coincideEstado && coincideBusqueda;
  });

  const renderFiltroButton = (estado: EstadoPedido | 'todos', label: string) => (
    <TouchableOpacity
      key={estado}
      style={[
        styles.filtroButton,
        filtro === estado && styles.filtroButtonActive
      ]}
      onPress={() => setFiltro(estado)}
    >
      <Text style={[
        styles.filtroButtonText,
        filtro === estado && styles.filtroButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderPedidoCard = (pedido: any) => (
    <TouchableOpacity
      key={pedido.id}
      style={styles.pedidoCard}
      onPress={() => navigation.navigate('PedidoDetalle', { pedidoId: pedido.id })}
    >
      <View style={styles.pedidoHeader}>
        <View style={styles.clienteInfo}>
          <Text style={styles.clienteNombre}>{pedido.cliente_nombre || 'Sin nombre'}</Text>
          <Text style={styles.clienteTelefono}>{pedido.cliente_telefono || 'Sin teléfono'}</Text>
        </View>
        <View style={styles.precioContainer}>
          <Text style={styles.precio}>{formatCurrency(pedido.precio_total)}</Text>
          {pedido.saldo_pendiente > 0 && (
            <Text style={styles.saldoPendiente}>
              Restante: {formatCurrency(pedido.saldo_pendiente)}
            </Text>
            
          )}
          {pedido.total_abonado > 0 && (
            <Text style={styles.saldoAbonado}>
             Abonado: {formatCurrency(pedido.total_abonado)}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.pedidoInfo}>
        <Text style={styles.productoInfo}>
          {formatPedidoItems(pedido)}
        </Text>
        {pedido.descripcion && (
          <Text style={styles.descripcion} numberOfLines={2}>
            {pedido.descripcion}
          </Text>
        )}
      </View>
      
      <View style={styles.pedidoFooter}>
        <View style={styles.fechaContainer}>
          <Text style={styles.fechaEntrega}>
            {getTextoDiasRestantes(pedido.fecha_entrega)}
          </Text>
          <Text style={styles.horaEntrega}>
            {formatTime(pedido.fecha_entrega)}
          </Text>
        </View>
        <View style={[
          styles.estadoBadge,
          { backgroundColor: getEstadoColor(pedido.estado) + '20' }
        ]}>
          <Text style={[
            styles.estadoText,
            { color: getEstadoColor(pedido.estado) }
          ]}>
            {pedido.estado ? pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1) : 'Sin estado'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );


  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por cliente, sabor o descripción..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {/* Filtros de estado */}
      <View style={styles.filtrosContainer}>
        {renderFiltroButton('todos', 'Todos')}
        {renderFiltroButton('pendiente', 'Pendientes')}
        {renderFiltroButton('entregado', 'Entregados')}
        {renderFiltroButton('cancelado', 'Cancelados')}
      </View>

      {/* Lista de pedidos */}
      <ScrollView
        style={styles.listaContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {pedidosFiltrados.length > 0 ? (
          pedidosFiltrados.map(renderPedidoCard)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {busqueda ? 'No se encontraron pedidos' : 'No hay pedidos'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Botón flotante para crear pedido */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CrearPedido')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.cardBackground,
  },
  searchInput: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    fontSize: FONTS.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filtrosContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filtroButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filtroButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filtroButtonText: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  filtroButtonTextActive: {
    color: COLORS.textWhite,
  },
  listaContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  pedidoCard: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.medium,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNombre: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  clienteTelefono: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
  },
  precioContainer: {
    alignItems: 'flex-end',
  },
  precio: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  saldoPendiente: {
    fontSize: FONTS.small,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  saldoAbonado: {
    fontSize: FONTS.small,
    color: COLORS.success,
    marginTop: SPACING.xs,
  },
  pedidoInfo: {
    marginBottom: SPACING.sm,
  },
  productoInfo: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  sabor: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginBottom: SPACING.xs,
  },
  descripcion: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
  },
  pedidoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fechaContainer: {
    flex: 1,
  },
  fechaEntrega: {
    fontSize: FONTS.small,
    color: COLORS.warning,
    fontWeight: '500',
  },
  horaEntrega: {
    fontSize: FONTS.tiny,
    color: COLORS.textLight,
    marginTop: 2,
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
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
  fabText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
});

export default PedidosScreen;
