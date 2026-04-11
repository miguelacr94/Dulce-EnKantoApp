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
import { usePedidos, type EstadoPedido } from '@/features/pedidos';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '@/utils';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, TabParamList } from '@/app/navigation/AppNavigator';
import { PedidoCard } from '@/features/pedidos/components';

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
  let pedidosFiltrados = pedidos.filter(pedido => {
    const coincideEstado = filtro === 'todos' || pedido.estado === filtro;
    const coincideBusqueda = busqueda === '' ||
      (pedido.cliente_nombre && pedido.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
      pedido.sabor.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.descripcion.toLowerCase().includes(busqueda.toLowerCase());

    return coincideEstado && coincideBusqueda;
  });

  // Ordenar por fecha de entrega solo cuando el filtro es 'entregado'
  if (filtro === 'entregado') {
    pedidosFiltrados = [...pedidosFiltrados].sort((a, b) => 
      new Date(b.fecha_entrega).getTime() - new Date(a.fecha_entrega).getTime()
    );
  }

  const getCount = (estado: EstadoPedido | 'todos') => {
    if (estado === 'todos') return pedidos.length;
    return pedidos.filter(p => p.estado === estado).length;
  };

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
        {label} ({getCount(estado)})
      </Text>
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFiltroButton('todos', 'Todos')}
          {renderFiltroButton('pendiente', 'Pendientes')}
          {renderFiltroButton('entregado', 'Entregados')}
          {renderFiltroButton('cancelado', 'Cancelados')}
        </ScrollView>
      </View>

      {/* Lista de pedidos */}
      <ScrollView
        style={styles.listaContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
      >
        {pedidosFiltrados.length > 0 ? (
          pedidosFiltrados.map((pedido) => (
            <PedidoCard key={pedido.id} pedido={pedido} />
          ))
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
