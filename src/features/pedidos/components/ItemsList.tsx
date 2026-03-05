import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { PedidoItem, Producto, Sabor } from '@/types';
import { formatCurrency } from '@/utils';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '@/utils';

interface ItemsListProps {
  items: Omit<PedidoItem, 'id' | 'pedido_id'>[];
  productos: Producto[];
  sabores: Sabor[];
  onEditItem: (index: number) => void;
  onRemoveItem: (index: number) => void;
  onAddItem: () => void;
}

export const ItemsList: React.FC<ItemsListProps> = ({
  items,
  productos,
  sabores,
  onEditItem,
  onRemoveItem,
  onAddItem,
}) => {
  const getItemInfo = (item: Omit<PedidoItem, 'id' | 'pedido_id'>) => {
    const product = productos.find(p => p.id === item.producto_id);
    const sabor = sabores.find(s => s.id === item.sabor_id);
    const relleno = sabores.find(s => s.id === item.relleno_id);
    return { product, sabor, relleno };
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>Items del Pedido</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddItem}>
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.itemsContainer} showsVerticalScrollIndicator={false}>
        {items.map((item, index) => {
          const { product, sabor, relleno } = getItemInfo(item);
          return (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.productName}>
                  {product?.nombre} (x{item.cantidad})
                </Text>
                <Text style={styles.saborName}>
                  Sabor: {sabor?.nombre || 'Sin sabor'}
                </Text>
                {item.relleno_id && (
                  <Text style={styles.saborName}>
                    Relleno: {relleno?.nombre}
                  </Text>
                )}
                <Text style={styles.itemTotal}>
                  {formatCurrency(item.precio_unitario * item.cantidad)}
                </Text>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => onEditItem(index)}>
                  <Text style={styles.actionButton}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onRemoveItem(index)}>
                  <Text style={styles.actionButton}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {items.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay items agregados</Text>
            <Text style={styles.emptySubtext}>
              Presiona "+ Agregar" para comenzar
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  headerRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONTS.large,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  itemsContainer: {
    maxHeight: 200,
  },
  itemRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemInfo: {
    flex: 1,
  },
  productName: {
    fontSize: FONTS.medium,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  saborName: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: FONTS.medium,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row' as const,
    gap: SPACING.sm,
  },
  actionButton: {
    fontSize: 18,
  },
  emptyState: {
    alignItems: 'center' as const,
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: FONTS.medium,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
  },
});
