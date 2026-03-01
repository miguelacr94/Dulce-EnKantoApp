import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { usePedidos } from '../hooks/usePedidos';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/constants';
import { formatCurrency, getTextoDiasRestantes, diasHastaEntrega, getProductoLabel, formatTime, formatPedidoItems } from '../utils/format';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, TabParamList } from '../navigation/AppNavigator';

type DashboardScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Dashboard'>,
  StackNavigationProp<RootStackParamList>
>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { pedidos, estadisticas, isLoading, isLoadingEstadisticas, refetch } = usePedidos();

  // Obtener próximos pedidos a entregar (próximos 2 días)
  const proximosPedidos = pedidos
    .filter(pedido => pedido.estado === 'pendiente')
    .filter(pedido => {
      const dias = diasHastaEntrega(pedido.fecha_entrega);
      // Mostramos pedidos de hoy, mañana y el día siguiente (próximos 2 días desde hoy)
      return dias >= 0 && dias <= 2;
    });


  const onRefresh = () => {
    refetch();
  };

  const renderEstadisticaCard = (
    title: string,
    value: string | number,
    color: string,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: color }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
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
          {
            backgroundColor: pedido.estado === 'pendiente' ? '#FFF8DC' :
              pedido.estado === 'entregado' ? '#F0FFF0' : '#FFE4E1'
          }
        ]}>
          <Text style={[
            styles.estadoText,
            {
              color: pedido.estado === 'pendiente' ? '#FFA500' :
                pedido.estado === 'entregado' ? '#32CD32' : '#FF6B6B'
            }
          ]}>
            {pedido.estado ? pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1) : 'Sin estado'}
          </Text>
        </View>
      </View>

    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dulce Enkanto</Text>
        <Text style={styles.subtitle}>Panel de Control</Text>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        {renderEstadisticaCard(
          'Pedidos Pendientes',
          estadisticas?.pendientes || 0,
          '#FFA500',
          () => (navigation as any).navigate('Pedidos')
        )}
        {renderEstadisticaCard(
          'Entregados',
          estadisticas?.entregados || 0,
          '#32CD32',
          () => (navigation as any).navigate('Pedidos')
        )}
        {renderEstadisticaCard(
          'Cancelados',
          estadisticas?.cancelados || 0,
          '#FF6B6B',
          () => (navigation as any).navigate('Pedidos')
        )}
        {renderEstadisticaCard(
          'Por Cobrar',
          formatCurrency(estadisticas?.totalPendienteCobrar || 0),
          '#87CEEB'
        )}
      </View>

      {/* Próximos pedidos a entregar */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximas Entregas urgentes</Text>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Pedidos')}>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {proximosPedidos.length > 0 ? (
          proximosPedidos.map(renderPedidoCard)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay entregas próximas urgentes</Text>
          </View>
        )}
      </View>

      {/* Acciones rápidas */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
          onPress={() => navigation.navigate('CrearPedido')}
        >
          <Text style={styles.actionButtonText}>Nuevo Pedido</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: COLORS.secondary }]}
          onPress={() => navigation.navigate('CrearCliente')}
        >
          <Text style={styles.actionButtonText}>Nuevo Cliente</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: FONTS.title,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.medium,
    color: COLORS.textLight,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: '48%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  statTitle: {
    fontSize: FONTS.small,
    color: COLORS.textWhite,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONTS.xlarge,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: FONTS.small,
    color: COLORS.primary,
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
  },
  descripcion: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  pedidoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
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
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONTS.medium,
    color: COLORS.textMuted,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  actionButton: {
    width: '48%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  actionButtonText: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
});

export default DashboardScreen;
