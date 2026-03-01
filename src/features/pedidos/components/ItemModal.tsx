import { Modal, View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Producto, Sabor, Tamano, PedidoItem } from '@/types';
import { CrearPedidoItemDTO } from '@/features/pedidos/types';
import { formatCurrency } from '@/utils';
import { COLORS, SPACING, BORDER_RADIUS } from '@/utils';

interface ItemModalProps {
  visible: boolean;
  editingItem: boolean;
  tempItem: CrearPedidoItemDTO;
  productos: Producto[];
  sabores: Sabor[];
  tamanos: Tamano[];
  filteredOptions: { sabores: Sabor[]; tamanos: Tamano[] };
  showProductoSelector: boolean;
  onTempItemChange: (item: CrearPedidoItemDTO) => void;
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
  const updateTempItem = (field: keyof CrearPedidoItemDTO, value: any) => {
    onTempItemChange({ ...tempItem, [field]: value });
  };

  // Validar formulario antes de enviar
  const validateForm = (): boolean => {
    // Validar producto
    if (!tempItem.producto_id) {
      Alert.alert('Error', 'Debe seleccionar un producto');
      return false;
    }

    // Validar cantidad
    if (!tempItem.cantidad || tempItem.cantidad <= 0) {
      Alert.alert('Error', 'La cantidad debe ser mayor a 0');
      return false;
    }

    // Validar precio unitario
    if (!tempItem.precio_unitario || tempItem.precio_unitario <= 0) {
      Alert.alert('Error', 'El precio unitario debe ser mayor a 0');
      return false;
    }

    // Validar tamaño/peso si el producto lo requiere
    if (selectedProduct?.tipo_medida && !tempItem.tamano_id) {
      const tipoTexto = selectedProduct.tipo_medida === 'peso' ? 'peso' : 'tamaño';
      Alert.alert('Error', `Debe seleccionar un ${tipoTexto} para este producto`);
      return false;
    }

    return true;
  };

  console.log('productos', productos);
  
  // Obtener el producto seleccionado
  const selectedProduct = productos.find(p => p.id === tempItem.producto_id);
  console.log('Producto seleccionado:', selectedProduct?.nombre, 'tipo_medida:', selectedProduct?.tipo_medida);

  // Filtrar tamaños según el tipo de producto
  const tamanosFiltrados = selectedProduct?.tipo_medida 
    ? tamanos.filter(t => t.tipo === selectedProduct.tipo_medida)
    : tamanos;
  
  console.log(`Tamaños disponibles (${tamanos.length}):`, tamanos);
  console.log(`Tamaños filtrados para ${selectedProduct?.nombre} (${selectedProduct?.tipo_medida}):`, tamanosFiltrados);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Editar Item' : 'Agregar Item'}
            </Text>

            <ScrollView 
              style={styles.scrollView}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
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
                  {selectedProduct?.tipo_medida && (
                    <Text style={styles.tipoMedidaText}>
                      {' '}({selectedProduct.tipo_medida === 'peso' ? 'Por peso' : 'Por tamaño'})
                    </Text>
                  )}
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
                  onPress={() => updateTempItem('sabor_id', null)}
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
                  onPress={() => updateTempItem('relleno_id', null)}
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
              <Text style={styles.label}>
                {selectedProduct?.tipo_medida === 'peso' ? 'Peso' : 'Tamaño'}
                {selectedProduct?.tipo_medida && ' *'}
              </Text>
              {tamanosFiltrados.length > 0 && (
                <Text style={styles.filterInfo}>
                  Mostrando {tamanosFiltrados.length} {selectedProduct?.tipo_medida === 'peso' ? 'pesos' : 'tamaños'} disponibles
                </Text>
              )}
              <View style={styles.chipRow}>
                {tamanosFiltrados.length > 0 ? (
                  tamanosFiltrados.map(t => (
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
                        <Text style={styles.tipoMedidaText}>
                          {' '}({t.tipo === 'peso' ? 'Peso' : 'Tamaño'})
                        </Text>
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyText}>
                    No hay {selectedProduct?.tipo_medida === 'peso' ? 'pesos' : 'tamaños'} configurados
                  </Text>
                )}
                {/* Solo mostrar "Ninguno" si el producto no requiere tamaño/peso */}
                {!selectedProduct?.tipo_medida && (
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      !tempItem.tamano_id && styles.chipActive
                    ]}
                    onPress={() => updateTempItem('tamano_id', null)}
                  >
                    <Text style={[
                      styles.chipText,
                      !tempItem.tamano_id && styles.chipTextActive
                    ]}>
                      Ninguno
                    </Text>
                  </TouchableOpacity>
                )}
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
                blurOnSubmit={false}
                returnKeyType="next"
                onSubmitEditing={() => {
                  // Enfocar el siguiente campo (precio)
                }}
              />
            </View>

            {/* Precio Unitario */}
            <View style={[styles.fieldContainer, styles.lastField]}>
              <Text style={styles.label}>Precio Unitario *</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={tempItem.precio_unitario.toString()}
                onChangeText={(val) => updateTempItem('precio_unitario', parseFloat(val) || 0)}
                blurOnSubmit={true}
                returnKeyType="done"
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
              <Text>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSubmitButton} onPress={() => {
              if (validateForm()) {
                onSubmit();
              }
            }}>
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
                        {p.tipo_medida && (
                          <Text style={styles.tipoMedidaText}>
                            {' '}({p.tipo_medida === 'peso' ? 'Por peso' : 'Por tamaño'})
                          </Text>
                        )}
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
        </KeyboardAvoidingView>
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
    paddingHorizontal: SPACING.lg,
  },
  keyboardAvoidingView: {
    width: '100%',
    maxHeight: '85%',
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    width: '100%',
    maxHeight: '85%',
  },
  scrollView: {
    maxHeight: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  fieldContainer: {
    marginBottom: SPACING.sm,
  },
  lastField: {
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
  tipoMedidaText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
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
