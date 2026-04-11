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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { RouteProp } from '@react-navigation/native';
import { usePedidos, type CrearPedidoItemDTO } from '@/features/pedidos';
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

type CrearPedidoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CrearPedido'>;

const CrearPedidoScreen: React.FC = () => {
  const navigation = useNavigation<CrearPedidoScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'CrearPedido'>>();
  const { createPedido, isCreating } = usePedidos();
  const { createAbono } = useAbonos();
  const { productos, sabores, tamanos, isLoading: isLoadingMetadata } = useMetadata();
  
  // Store global de items para creación
  const { 
    crearItems, 
    setCrearItems, 
    addCrearItem, 
    updateCrearItem, 
    removeCrearItem 
  } = useItemsStore();

  // Hook personalizado para manejar el formulario
  const {
    clienteNombre,
    clienteTelefono,
    items,
    precioTotal,
    precioDomicilio,
    esDomicilio,
    direccionEnvio,
    fechaEntrega,
    abonoInicial,
    descripcion,
    descripcionHeight,
    showItemModal,
    editingItemIndex,
    tempItem,
    filteredOptions,
    setFilteredOptions,
    setClienteNombre,
    setClienteTelefono,
    setFechaEntrega,
    setAbonoInicial,
    setPrecioDomicilio,
    setEsDomicilio,
    setDireccionEnvio,
    setShowItemModal,
    setEditingItemIndex,
    setItems,
    setTempItem,
    handleRemoveItem: handleRemoveItemFromForm,
    handleDescripcionChange,
    loadFilteredOptions,
    validateForm,
    resetForm,
  } = usePedidoForm();

  // Estado para modales
  const [showProductoSelector, setShowProductoSelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función debounced para prevenir múltiples ejecuciones
  const debouncedSubmit = debounce(async () => {
    if (isSubmitting || isCreating) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Determinamos el tipo de producto general basado en el primer item (legacy support en la cabecera)
      const firstProduct = productos.find(p => p.id === crearItems[0]?.producto_id);

      const newPedido = await createPedido({
        cliente_nombre: clienteNombre,
        cliente_telefono: clienteTelefono,
        tipo_producto: 'torta', // Valor por defecto ya que no existe en Producto
        peso: 0, // Legacy
        cantidad: crearItems.length, // Legacy
        sabor: '', // Legacy
        descripcion: descripcion.trim(),
        precio_total: precioTotal,
        precio_domicilio: precioDomicilio,
        es_domicilio: esDomicilio,
        direccion_envio: esDomicilio ? direccionEnvio : undefined,
        fecha_entrega: fechaEntrega,
      }, crearItems);

      if (abonoInicial > 0) {
        await createAbono({
          pedido_id: newPedido.id,
          monto: abonoInicial,
          fecha: formatDateForDB(new Date()),
        });
      }

      Alert.alert('Éxito', 'Pedido creado correctamente', [{ text: 'OK', onPress: () => {
        resetForm(); // Limpiar el formulario después de crear el pedido
        navigation.goBack();
      }}]);
    } catch (error) {
      // Error al crear pedido
      Alert.alert('Error', 'No se pudo crear el pedido');
    } finally {
      setIsSubmitting(false);
    }
  }, 300);

  const handleSubmit = () => {
    debouncedSubmit();
  };

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

  const handleOpenDatePicker = (mode: 'date' | 'time') => {
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };

  const handleOpenItemModal = () => {
    navigation.navigate('AddItem', { returnTo: 'CrearPedido' });
  };

  const handleEditItem = (index: number) => {
    navigation.navigate('AddItem', {
      initialItem: crearItems[index],
      editingIndex: index,
      returnTo: 'CrearPedido'
    });
  };

  const handleRemoveItem = (index: number) => {
    removeCrearItem(index);
  };

  // El store de Zustand (useItemsStore) ahora se actualiza directamente desde AddItemScreen
  // por lo que no es necesario escuchar parámetros de la ruta aquí.

  const handleSelectProducto = (producto: Producto) => {
    setTempItem((prev: CrearPedidoItemDTO) => ({
      ...prev,
      producto_id: producto.id,
      precio_unitario: 0 // Precio por defecto ya que no existe en Producto
    }));
    loadFilteredOptions(producto.id);
    setShowProductoSelector(false);
  };

  if (isLoadingMetadata) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Nuevo Pedido</Text>

          {/* Cliente */}
          <ClienteForm
            nombre={clienteNombre}
            telefono={clienteTelefono}
            onNombreChange={setClienteNombre}
            onTelefonoChange={setClienteTelefono}
          />

          {/* Carrito de Items */}
          <ItemsList
            items={crearItems}
            productos={productos}
            sabores={sabores}
            onEditItem={handleEditItem}
            onRemoveItem={handleRemoveItem}
            onAddItem={handleOpenItemModal}
          />

          {/* Resumen del Pedido */}
          <OrderSummary
            precioTotal={precioTotal}
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
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isCreating || isSubmitting}>
              <Text style={{ color: 'white' }}>{isCreating || isSubmitting ? 'Creando...' : 'Crear Pedido'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal para agregar/editar items eliminado ya que ahora es una screen */}

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
  );
};

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
  actionsContainer: {
    flexDirection: 'row' as const,
    gap: SPACING.sm,
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
    flex: 2,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center' as const,
    ...SHADOWS.small,
  },
});

export default CrearPedidoScreen;
