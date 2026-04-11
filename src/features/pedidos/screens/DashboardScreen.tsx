import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePedidos } from '@/features/pedidos';
import { useTotalGastos } from '@/features/gastos/hooks/use-gastos.hook';
import { PedidoCard } from '@/features/pedidos/components';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, formatCurrency, diasHastaEntrega } from '@/utils';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useInsumos } from '@/features/insumos/hooks/useInsumos';
import { useTotalAbonos } from '@/features/pedidos/hooks/useAbonos';

const DashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { pedidos, estadisticas, isLoading: isLoadingPedidos, refetch: refetchPedidos } = usePedidos();
  const { data: totalIngresos, isLoading: isLoadingIngresos, refetch: refetchIngresos } = useTotalAbonos();
  const { data: totalGastos, isLoading: isLoadingGastos, refetch: refetchGastos } = useTotalGastos();
  const { insumos, loadInsumos, isLoading: isLoadingInsumos } = useInsumos();
 
  // Balance Contable Directo: Tabla Abonos - Tabla Gastos
  const ingresos = totalIngresos || 0;
  const gastos = totalGastos || 0;
  const balance = ingresos - gastos;

  // Cálculos de Inventario
  const totalInsumosUnidades = insumos.reduce((acc, insumo) => {
    return acc + (insumo.insumo_tamanos?.reduce((sum, it) => sum + it.cantidad, 0) || 0);
  }, 0);

  // Específico para Cajas/Bases (filtramos por nombre)
  const stockCajasBases = insumos
    .filter(i => i.nombre.toLowerCase().includes('caja') || i.nombre.toLowerCase().includes('base'))
    .reduce((acc, insumo) => {
      return acc + (insumo.insumo_tamanos?.reduce((sum, it) => sum + it.cantidad, 0) || 0);
    }, 0);

  const proximosPedidos = pedidos
    .filter(pedido => pedido.estado === 'pendiente')
    .filter(pedido => {
      const dias = diasHastaEntrega(pedido.fecha_entrega);
      return dias >= 0 && dias <= 2;
    });

  // Refrescar al entrar a la pantalla
  useFocusEffect(
    React.useCallback(() => {
      refetchPedidos();
      refetchGastos();
      refetchIngresos();
      loadInsumos();
    }, [])
  );

  const onRefresh = () => {
    refetchPedidos();
    refetchGastos();
    refetchIngresos();
    loadInsumos();
  };

  const renderEstadisticaCard = (title: string, value: string | number, color: string, icon: string, onPress?: () => void) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.statInfo}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
      <Text style={{ fontSize: 24 }}>{icon}</Text>
    </TouchableOpacity>
  );

  if (isLoadingPedidos || isLoadingGastos || isLoadingInsumos) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        refreshControl={<RefreshControl refreshing={isLoadingPedidos} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
          <Text style={styles.title}>Dulce Enkanto 🍰</Text>
          <Text style={styles.subtitle}>Panel de Control</Text>
        </View>

        {/* Balance simple y directo */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Balance Actual</Text>
          <Text style={[styles.balanceValue, balance < 0 && { color: COLORS.error }]}>
            {formatCurrency(balance)}
          </Text>
          <View style={styles.balanceDetails}>
            <Text style={styles.detailText}>
              <Text style={{ color: COLORS.success, fontWeight: 'bold' }}>↑</Text> {formatCurrency(ingresos)}
            </Text>
            <Text style={styles.detailText}>
              <Text style={{ color: COLORS.error, fontWeight: 'bold' }}>↓</Text> {formatCurrency(gastos)}
            </Text>
          </View>
        </View>

        {/* Estadísticas en lista limpia */}
        <View style={styles.statsContainer}>
          {renderEstadisticaCard('Por Cobrar', formatCurrency(estadisticas?.totalPendienteCobrar || 0), COLORS.info, '💰')}
          {renderEstadisticaCard('Pendientes', estadisticas?.pendientes || 0, COLORS.warning, '⏳', () => (navigation as any).navigate('Pedidos'))}
          {renderEstadisticaCard('Entregados', estadisticas?.entregados || 0, COLORS.success, '✅', () => (navigation as any).navigate('Pedidos'))}
          {renderEstadisticaCard('Gastos', 'Ver Detalle', COLORS.error, '📈', () => (navigation as any).navigate('Gastos'))}
        </View>

        {/* Detalle de Inventario Específicos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Insumos Críticos / Stock</Text>
            <TouchableOpacity onPress={() => (navigation as any).navigate('GestionInsumos')}>
              <Text style={styles.viewMoreText}>Gestionar todo</Text>
            </TouchableOpacity>
          </View>

          {insumos.length > 0 ? (
            insumos.map((insumo) => (
              <View key={insumo.id} style={styles.insumoStockRow}>
                <Text style={styles.insumoNameText}>{insumo.nombre}</Text>
                <View style={styles.badgesRow}>
                  {insumo.insumo_tamanos && insumo.insumo_tamanos.length > 0 ? (
                    insumo.insumo_tamanos.map((it) => (
                      <View 
                        key={it.id} 
                        style={[
                          styles.stockItemBadge, 
                          it.cantidad <= 2 && { backgroundColor: '#FFE4E1', borderColor: COLORS.error }
                        ]}
                      >
                        <Text style={[styles.badgeText, it.cantidad <= 2 && { color: COLORS.error }]}>
                          {it.tamano?.nombre}: <Text style={{ fontWeight: '800' }}>{it.cantidad}</Text>
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noStockText}>Sin stock asignado</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No has registrado insumos aún</Text>
            </View>
          )}
        </View>

        {/* Entregas urgentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Entregas próximas</Text>
          </View>

          {proximosPedidos.length > 0 ? (
            proximosPedidos.map((pedido) => (
              <View key={pedido.id} style={{ marginBottom: SPACING.sm }}>
                <PedidoCard pedido={pedido} />
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hay entregas pendientes urgentes</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => (navigation as any).navigate('CrearPedido')}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: FONTS.title,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: FONTS.medium,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  balanceLabel: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: SPACING.xs,
  },
  balanceDetails: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 4,
  },
  detailText: {
    fontSize: FONTS.medium,
    color: COLORS.textLight,
  },
  statsContainer: {
    padding: SPACING.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: COLORS.surface,
    width: '48%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
  },
  viewMoreText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  insumoStockRow: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  insumoNameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  stockItemBadge: {
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  badgeText: {
    fontSize: 11,
    color: COLORS.text,
  },
  noStockText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: COLORS.textLight,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  fabText: {
    fontSize: 24,
    color: COLORS.textWhite,
  },
});

export default DashboardScreen;
