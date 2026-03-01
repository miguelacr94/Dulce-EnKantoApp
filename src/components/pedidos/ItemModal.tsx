import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { Producto, Sabor, Tamano, PedidoItem } from '../../types';
import { formatCurrency } from '../../utils/format';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

interface ItemModalProps {
  visible: boolean;
  editingItem: boolean;
  tempItem: Omit<PedidoItem, 'id' | 'pedido_id'>;
  productos: Producto[];
  sabores: Sabor[];
  tamanos: Tamano[];
  filteredOptions: { sabores: Sabor[]; tamanos: Tamano[] };
  showProductoSelector: boolean;
  onTempItemChange: (item: Omit<PedidoItem, 'id' | 'pedido_id'>) => void;
  onClose: () => void;
  onSubmit: () => void;
  onShowProductoSelector: (show: boolean) => void;
  onSelectProducto: (producto: Producto) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  visible,
  editingItem,
  tempItem,
  productos,
  sabores,
  tamanos,
  filteredOptions,
  showProductoSelector,
  onTempItemChange,
  onClose,
  onSubmit,
  onShowProductoSelector,
  onSelectProducto,
}) => {
  const updateTempItem = (field: keyof Omit<PedidoItem, 'id' | 'pedido_id'>, value: any) => {
    onTempItemChange({ ...tempItem, [field]: value });
  };

  console.log('productos', productos);
  
  // Obtener el producto seleccionado para mostrar su tipo_medida
  const selectedProduct = productos.find(p => p.id === tempItem.producto_id);
  console.log('Producto seleccionado:', selectedProduct?.nombre, 'tipo_medida:', selectedProduct?.tipo_medida);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingItem ? 'Editar Item' : 'Agregar Item'}
          </Text>

          <ScrollView>
            {/* Prodsucto */}
            <TouchableOpacity
              style={styles.fieldContainer}
              onPress={() => onShowProductoSelector(true)}
            >
              <Text style={styles.label}>Producto *</Text>
              <View style={styles.selectorButton}>
                <Text style={styles.selectorText}>
                  {productos.find(p => p.id === tempItem.producto_id)?.nombre ||
                    'Seleccionar producto...'}
                </Text>
                <Text>▼</Text>
              </View>
            </TouchableOpacity>

            {/* Sabor */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Sabor</Text>
              <View style={styles.chipRow}>
                {sabores.length > 0 ? (
                  sabores.map(s => (
                    <TouchableOpacity
                      key={s.id}
                      style={[
                        styles.chip,
                        tempItem.sabor_id === s.id && styles.chipActive
                      ]}
                      onPress={() => updateTempItem('sabor_id', s.id)}
                    >
                      <Text style={[
                        styles.chipText,
                        tempItem.sabor_id === s.id && styles.chipTextActive
                      ]}>
                        {s.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No hay sabores configurados</Text>
                )}
                <TouchableOpacity
                  style={[
                    styles.chip,
                    !tempItem.sabor_id && styles.chipActive
                  ]}
                  onPress={() => updateTempItem('sabor_id', '')}
                >
                  <Text style={[
                    styles.chipText,
                    !tempItem.sabor_id && styles.chipTextActive
                  ]}>
                    Ninguno
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Relleno */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Relleno</Text>
              <View style={styles.chipRow}>
                {sabores.length > 0 ? (
                  sabores.map(s => (
                    <TouchableOpacity
                      key={s.id}
                      style={[
                        styles.chip,
                        tempItem.relleno_id === s.id && styles.chipActive
                      ]}
                      onPress={() => updateTempItem('relleno_id', s.id)}
                    >
                      <Text style={[
                        styles.chipText,
                        tempItem.relleno_id === s.id && styles.chipTextActive
                      ]}>
                        {s.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No hay sabores configurados</Text>
                )}
                <TouchableOpacity
                  style={[
                    styles.chip,
                    !tempItem.relleno_id && styles.chipActive
                  ]}
                  onPress={() => updateTempItem('relleno_id', '')}
                >
                  <Text style={[
                    styles.chipText,
                    !tempItem.relleno_id && styles.chipTextActive
                  ]}>
                    Ninguno
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tamaño */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Tamaño/Peso</Text>
              {tamanos.length > 0 && selectedProduct?.tipo_medida && (
                <Text style={styles.filterInfo}>
                  Mostrando {tamanos.length} opciones de {selectedProduct.tipo_medida === 'peso' ? 'peso' : 'tamaño'}
                </Text>
              )}
              <View style={styles.chipRow}>
                {tamanos.length > 0 ? (
                  tamanos.map(t => (
                    <TouchableOpacity
                      key={t.id}
                      style={[
                        styles.chip,
                        tempItem.tamano_id === t.id && styles.chipActive
                      ]}
                      onPress={() => updateTempItem('tamano_id', t.id)}
                    >
                      <Text style={[
                        styles.chipText,
                        tempItem.tamano_id === t.id && styles.chipTextActive
                      ]}>
                        {t.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No hay tamaños configurados</Text>
                )}
                <TouchableOpacity
                  style={[
                    styles.chip,
                    !tempItem.tamano_id && styles.chipActive
                  ]}
                  onPress={() => updateTempItem('tamano_id', '')}
                >
                  <Text style={[
                    styles.chipText,
                    !tempItem.tamano_id && styles.chipTextActive
                  ]}>
                    Ninguno
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Cantidad */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Cantidad *</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={tempItem.cantidad.toString()}
                onChangeText={(val) => updateTempItem('cantidad', parseInt(val) || 0)}
              />
            </View>

            {/* Precio Unitario */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Precio Unitario *</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={tempItem.precio_unitario.toString()}
                onChangeText={(val) => updateTempItem('precio_unitario', parseFloat(val) || 0)}
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
              <Text>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSubmitButton} onPress={onSubmit}>
              <Text style={{ color: 'white' }}>
                {editingItem ? 'Guardar' : 'Agregar'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sub-modales de selección */}
          <Modal visible={showProductoSelector} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Seleccionar Producto</Text>
                <ScrollView>
                  {productos.map(p => (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.modalItem}
                      onPress={() => onSelectProducto(p)}
                    >
                      <Text>
                        {p.nombre}
                        {p.precio ? ` (${formatCurrency(p.precio)})` : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => onShowProductoSelector(false)}
                >
                  <Text>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  fieldContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  selectorButton: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  selectorText: {
    fontSize: 16,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
  },
  modalActions: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  modalCancelButton: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    minWidth: 100,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalSubmitButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    minWidth: 100,
    alignItems: 'center' as const,
  },
  modalItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  chipActive: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.primary,
  },
  chipTextActive: {
    color: 'white',
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textMuted || '#666',
    fontStyle: 'italic',
  },
  filterInfo: {
    fontSize: 11,
    color: COLORS.textMuted || '#666',
    fontStyle: 'italic',
    marginBottom: 5,
  }
});
