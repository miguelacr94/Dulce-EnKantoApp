import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, RouteProp, useIsFocused } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { usePedidos, type CrearPedidoItemDTO, type PedidoConDetalles, type PedidoItem } from '@/features/pedidos';
import { useAbonos } from '@/features/pedidos/hooks';
import { useMetadata, type Producto } from '@/features/productos';
import { formatCurrency, formatDateForDB, formatDateTimeForDB } from '@/utils';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '@/utils';
import { debounce } from '@/utils/debounce';
import { useItemsStore } from '../stores/useItemsStore';

// Componentes de pedidos reutilizables
import {
  ItemsList,
  OrderSummary,
  ClienteForm,
  usePedidoForm
} from '../components';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  formContainer: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONTS.heading,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.xl,
    textAlign: 'center' as const,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  warningContainer: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  warningText: {
    fontSize: FONTS.medium,
    color: '#856404',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  warningSubtext: {
    fontSize: FONTS.small,
    color: '#856404',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center' as const,
    ...SHADOWS.small,
  },
  backButtonText: {
    color: COLORS.textWhite,
    fontSize: FONTS.medium,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row' as const,
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center' as const,
    ...SHADOWS.small,
  },
  // Estilos para el modal bottom sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end' as const,
  },
  bottomSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '95%',
    ...SHADOWS.large,
  },
  modalTitle: {
    fontSize: FONTS.heading,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center' as const,
  },
  modalContent: {
    maxHeight: 500,
  },
  modalActions: {
    flexDirection: 'row' as const,
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  fieldContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  selectorButton: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  selectorText: {
    fontSize: 16,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    ...SHADOWS.small,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Estilos para chips
  chipRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  chipActive: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  chipTextActive: {
    color: 'white',
  },
  emptyText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  tipoMedidaText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  // Estilos adicionales para el modal de productos
  modalItem: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  modalCloseButton: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCloseButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  // Estilos para lista de productos directa
  productosListContainer: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 200,
  },
  productosListTitle: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  productosListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  productoSeleccionadoText: {
    fontSize: FONTS.small,
    color: COLORS.primary,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  productosScrollView: {
    maxHeight: 150,
  },
  productoItem: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productoItemSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  productoItemText: {
    fontSize: FONTS.medium,
    color: COLORS.text,
  },
  productoItemTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  productosEmpty: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  productosEmptyText: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});

type EditarPedidoScreenRouteProp = RouteProp<RootStackParamList, 'EditarPedido'>;
type EditarPedidoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditarPedido'>;

const EditarPedidoScreen: React.FC = () => {
  const route = useRoute<EditarPedidoScreenRouteProp>();
  const navigation = useNavigation<EditarPedidoScreenNavigationProp>();
  const isFocused = useIsFocused();
  const { pedidoId } = route.params;

  const { updatePedido, getPedidoById, isUpdating } = usePedidos();
  const { productos, sabores, tamanos, isLoading: isLoadingMetadata } = useMetadata();


  const [productosListExpanded, setProductosListExpanded] = useState(true);

  // Store global de items para edición
  const {
    editarItems,
    setEditarItems,
    removeEditarItem
  } = useItemsStore();

  // Estado local para forzar re-render
  const [refreshKey, setRefreshKey] = useState(0);

  // Estado para el pedido actual
  const [pedidoActual, setPedidoActual] = useState<PedidoConDetalles | null>(null);
  const [isLoadingPedido, setIsLoadingPedido] = useState(true);

  // Hook personalizado para manejar el formulario
  const {
    clienteNombre,
    clienteTelefono,
    items: hookItems,
    precioTotal,
    precioDomicilio,
    esDomicilio,
    direccionEnvio,
    fechaEntrega,
    abonoInicial,
    descripcion,
    descripcionHeight,
    filteredOptions,
    setFilteredOptions,
    setClienteNombre,
    setClienteTelefono,
    setItems: setHookItems,
    setFechaEntrega,
    setAbonoInicial,
    setPrecioDomicilio,
    setEsDomicilio,
    setDireccionEnvio,
    setEditingItemIndex,
    handleRemoveItem,
    handleDescripcionChange,
    loadFilteredOptions,
    validateForm,
    setDescripcion,
  } = usePedidoForm(true); // true porque estamos editando

  // Estado para modales
  const [showProductoSelector, setShowProductoSelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isItemsLoading, setIsItemsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // La edición de items ahora se maneja en AddItemScreen

  // Función debounced para prevenir múltiples ejecuciones
  const debouncedSubmit = debounce(async () => {

    if (isSubmitting || isUpdating || isItemsLoading) {
      if (isItemsLoading) {
        Alert.alert('Espere', 'Los productos están cargando...');
      }
      return;
    }
    if (!validateFormLocal()) {
      return;
    }
    if (!pedidoActual) {
      return;
    }


    setIsSubmitting(true);
    try {
      // Debug: Mostrar estado actual de items

      // Validar que haya items
      // Validar que haya items
      if (editarItems.length === 0) {
        setIsSubmitting(false);
        Alert.alert('Error', 'El carrito está vacío. Agregue items antes de guardar.');
        return;
      }

      // Determinamos el tipo de producto general basado en el primer item
      const firstProduct = productos.find(p => p.id === editarItems[0]?.producto_id);



      await updatePedido(pedidoActual.id, {
        cliente_nombre: clienteNombre,
        cliente_telefono: clienteTelefono,
        tipo_producto: 'torta', // Valor por defecto ya que no existe en Producto
        peso: 0, // Legacy
        cantidad: editarItems.length, // Legacy
        sabor: '', // Legacy
        descripcion: descripcion.trim(),
        precio_total: calcularTotalItems(),
        precio_domicilio: precioDomicilio,
        es_domicilio: esDomicilio,
        direccion_envio: esDomicilio ? direccionEnvio : undefined,
        fecha_entrega: fechaEntrega,
      }, editarItems);

      Alert.alert('Éxito', 'Pedido actualizado correctamente', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  }, 300);

  const handleSubmit = () => {
    debouncedSubmit();
  };


  // Efecto para monitorear los items

  // Cargar datos del pedido al montar
  useEffect(() => {
    const loadPedido = async () => {
      try {
        const pedido = await getPedidoById(pedidoId);

        if (pedido) {
          setPedidoActual(pedido);

          // Cargar el formulario con los datos del pedido
          setClienteNombre(pedido.cliente_nombre || '');
          setClienteTelefono(pedido.cliente_telefono || '');
          setDescripcion(pedido.descripcion || '');
          setFechaEntrega(pedido.fecha_entrega ? formatDateTimeForDB(new Date(pedido.fecha_entrega)) : formatDateTimeForDB(new Date()));
          setPrecioDomicilio(pedido.precio_domicilio || 0);
          setEsDomicilio(pedido.es_domicilio || false);
          setDireccionEnvio(pedido.direccion_envio || '');

          // Inicializar selectedDate con la fecha del pedido
          if (pedido.fecha_entrega) {
            const orderDate = new Date(pedido.fecha_entrega);
            setSelectedDate(orderDate);
          }

          // Cargar items del pedido al montar
          if (pedido.items && pedido.items.length > 0) {

            // Filtrar items que tengan productos válidos y datos completos
            const validOrderItems = pedido.items.filter(item => {
              const hasProduct = item.producto && item.producto.id && item.producto.id.trim() !== '';
              const hasValidQuantity = item.cantidad && item.cantidad > 0;
              const hasValidPrice = item.precio_unitario && item.precio_unitario >= 0;


              return hasProduct && hasValidQuantity && hasValidPrice;
            });


            if (validOrderItems.length === 0) {
              console.warn('No hay items válidos en el pedido');
              setEditarItems([]);
              setIsItemsLoading(false);
              return;
            }

            const formattedItems = validOrderItems.map(item => ({
              producto_id: item.producto?.id || '',
              sabor_id: item.sabor?.id || null,
              relleno_id: item.relleno?.id || null,
              tamano_id: item.tamano?.id || null,
              cantidad: item.cantidad,
              precio_unitario: item.precio_unitario,
            }));


            // Establecer los items en el store global
            setEditarItems(formattedItems);
            setIsItemsLoading(false);
          } else {
            setEditarItems([]);
            setIsItemsLoading(false);
          }
        } else {
        }
      } catch (error) {
        console.error('Error cargando pedido:', error);
        Alert.alert('Error', `No se pudo cargar el pedido: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        navigation.goBack();
      } finally {
        setIsLoadingPedido(false);
        setIsItemsLoading(false);
      }
    };

    loadPedido();
  }, [pedidoId]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);

    if (event.type === 'dismissed') {
      setDatePickerMode('date');
      return;
    }

    if (date) {
      // Si estamos en modo fecha, mantener la hora actual de selectedDate
      if (datePickerMode === 'date') {
        const currentDate = selectedDate || new Date();
        const newDate = new Date(date);
        newDate.setHours(currentDate.getHours());
        newDate.setMinutes(currentDate.getMinutes());
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
        setSelectedDate(newDate);
        setFechaEntrega(formatDateTimeForDB(newDate));
      } else {
        // Si estamos en modo hora, actualizar la fecha actual con la nueva hora
        const newDate = new Date(selectedDate);
        newDate.setHours(date.getHours());
        newDate.setMinutes(date.getMinutes());
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
        setSelectedDate(newDate);
        setFechaEntrega(formatDateTimeForDB(newDate));
      }
    }
  };

  // Validación local para el EditarPedidoScreen
  const validateFormLocal = () => {
    if (!clienteNombre.trim()) {
      Alert.alert('Error', 'Debes ingresar el nombre del cliente');
      return false;
    }
    if (!clienteTelefono.trim()) {
      Alert.alert('Error', 'Debes ingresar el teléfono del cliente');
      return false;
    }
    if (editarItems.length === 0) {
      Alert.alert('Error', 'El carrito está vacío');
      return false;
    }

    // Verificar que todos los items tengan productos válidos
    const invalidItems = editarItems.filter((item: CrearPedidoItemDTO) => !item.producto_id || item.producto_id.trim() === '');
    if (invalidItems.length > 0) {
      Alert.alert('Error', 'Hay productos inválidos en el carrito');
      return false;
    }

    if (esDomicilio && !direccionEnvio.trim()) {
      Alert.alert('Error', 'Debes ingresar la dirección de envío');
      return false;
    }
    if (abonoInicial > calcularTotalItems()) {
      Alert.alert('Error', 'El abono inicial no puede superar el precio total');
      return false;
    }

    return true;
  };

  // Calcular precio total de los items globales
  const calcularTotalItems = () => {
    return editarItems.reduce((total, item) => {
      return total + (item.cantidad * item.precio_unitario);
    }, 0);
  };

  const handleOpenDatePicker = (mode: 'date' | 'time') => {
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };

  const handleEditItemLocal = (index: number) => {
    navigation.navigate('AddItem', {
      initialItem: editarItems[index],
      editingIndex: index,
      returnTo: 'EditarPedido'
    });
  };

  const handleAddItemLocal = () => {
    navigation.navigate('AddItem', { returnTo: 'EditarPedido' });
  };

  const handleRemoveItemLocal = (index: number) => {
    const newItems = editarItems.filter((_, i) => i !== index);
    setEditarItems(newItems);
  };

  // El selector de productos ahora se maneja dentro de AddItemScreen

  if (isLoadingPedido || isLoadingMetadata || isItemsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  // Solo permitir editar pedidos pendientes
  if (pedidoActual && pedidoActual.estado !== 'pendiente') {
    return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Editar Pedido</Text>
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              Solo se pueden editar pedidos en estado "pendiente".
            </Text>
            <Text style={styles.warningSubtext}>
              Estado actual: {pedidoActual.estado}
            </Text>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Editar Pedido</Text>

            {/* Cliente */}
            <ClienteForm
              nombre={clienteNombre}
              telefono={clienteTelefono}
              onNombreChange={setClienteNombre}
              onTelefonoChange={setClienteTelefono}
            />

            {/* Carrito de Items */}
            <ItemsList
              items={editarItems}
              productos={productos}
              sabores={sabores}
              onEditItem={handleEditItemLocal}
              onRemoveItem={handleRemoveItemLocal}
              onAddItem={handleAddItemLocal}
            />


            {/* Resumen del Pedido */}
            <OrderSummary
              precioTotal={calcularTotalItems()}
              precioDomicilio={precioDomicilio}
              esDomicilio={esDomicilio}
              direccionEnvio={direccionEnvio}
              abonoInicial={abonoInicial}
              onAbonoChange={setAbonoInicial}
              onPrecioDomicilioChange={setPrecioDomicilio}
              onEsDomicilioChange={setEsDomicilio}
              onDireccionEnvioChange={setDireccionEnvio}
              fechaEntrega={fechaEntrega}
              onFechaChange={() => handleOpenDatePicker('date')}
              onHoraChange={() => handleOpenDatePicker('time')}
              descripcion={descripcion}
              onDescripcionChange={handleDescripcionChange}
              descripcionHeight={descripcionHeight}
            />

            {/* Botones de acción */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isUpdating || isSubmitting}>
                <Text style={{ color: 'white' }}>{isUpdating || isSubmitting ? 'Actualizando...' : 'Actualizar Pedido'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* DateTimePicker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode={datePickerMode}
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </KeyboardAvoidingView>
    </>
  );
};

export default EditarPedidoScreen;
