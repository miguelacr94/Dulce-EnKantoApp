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
import { useRoute, RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

import { usePedidos } from '../hooks/usePedidos';
import { useAbonos } from '../hooks/useAbonos';
import { useMetadata } from '../hooks/useMetadata';
import { metadataService } from '../services/metadataService';
import { Producto, Sabor, Tamano, PedidoItem, PedidoConDetalles } from '../types';
import { formatDateForDB, formatDateTimeForDB } from '../utils/format';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/constants';

// Componentes de pedidos reutilizables
import {
  ItemModal,
  ItemsList,
  OrderSummary,
  ClienteForm,
  usePedidoForm
} from '../components/pedidos';

type EditarPedidoScreenRouteProp = RouteProp<RootStackParamList, 'EditarPedido'>;
type EditarPedidoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditarPedido'>;

const EditarPedidoScreen: React.FC = () => {
  const route = useRoute<EditarPedidoScreenRouteProp>();
  const navigation = useNavigation<EditarPedidoScreenNavigationProp>();
  const { pedidoId } = route.params;

  const { updatePedido, getPedidoById, isUpdating } = usePedidos();
  const { productos, sabores, tamanos, isLoading: isLoadingMetadata } = useMetadata();

  // Estado para el pedido actual
  const [pedidoActual, setPedidoActual] = useState<PedidoConDetalles | null>(null);
  const [isLoadingPedido, setIsLoadingPedido] = useState(true);

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
    setItems,
    setFechaEntrega,
    setAbonoInicial,
    setPrecioDomicilio,
    setEsDomicilio,
    setDireccionEnvio,
    setShowItemModal,
    setEditingItemIndex,
    setTempItem,
    handleAddItem,
    handleEditItem,
    handleRemoveItem,
    handleDescripcionChange,
    loadFilteredOptions,
    validateForm,
    setDescripcion,
  } = usePedidoForm();

  // Estado para modales
  const [showProductoSelector, setShowProductoSelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isItemsLoading, setIsItemsLoading] = useState(true);

  // Cargar datos del pedido al montar
  useEffect(() => {
    const loadPedido = async () => {
      try {
        console.log('Cargando pedido con ID:', pedidoId);
        const pedido = await getPedidoById(pedidoId);
        console.log('Pedido cargado:', pedido);
        
        if (pedido) {
          setPedidoActual(pedido);
          
          // Cargar el formulario con los datos del pedido
          setClienteNombre(pedido.cliente_nombre || '');
          setClienteTelefono(pedido.cliente_telefono || '');
          setDescripcion(pedido.descripcion || '');
          setFechaEntrega(pedido.fecha_entrega || '');
          setPrecioDomicilio(pedido.precio_domicilio || 0);
          setEsDomicilio(pedido.es_domicilio || false);
          setDireccionEnvio(pedido.direccion_envio || '');
          
          // Inicializar selectedDate con la fecha del pedido
          if (pedido.fecha_entrega) {
            const orderDate = new Date(pedido.fecha_entrega);
            setSelectedDate(orderDate);
          }
          
          // Cargar los items del pedido
          if (pedido.items && pedido.items.length > 0) {
            console.log('Items del pedido:', pedido.items);
            
            // Filtrar items que tengan productos válidos y datos completos
            const validOrderItems = pedido.items.filter(item => {
              const hasProduct = item.producto && item.producto.id && item.producto.id.trim() !== '';
              const hasValidQuantity = item.cantidad && item.cantidad > 0;
              const hasValidPrice = item.precio_unitario && item.precio_unitario >= 0;
              
              console.log(`Validando item ${item.id}:`, {
                hasProduct,
                hasValidQuantity,
                hasValidPrice,
                producto_id: item.producto?.id,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario
              });
              
              return hasProduct && hasValidQuantity && hasValidPrice;
            });
            
            console.log('Items válidos del pedido:', validOrderItems);
            
            if (validOrderItems.length === 0) {
              console.warn('No hay items válidos en el pedido');
              setTimeout(() => {
                setItems([]);
                setIsItemsLoading(false);
              }, 100);
              return;
            }
            
            const formattedItems = validOrderItems.map(item => ({
              producto_id: item.producto.id, // No usar || '', ya validamos que existe
              sabor_id: item.sabor?.id || null,
              tamano_id: item.tamano?.id || null,
              cantidad: item.cantidad,
              precio_unitario: item.precio_unitario,
            }));
            
            console.log('Items formateados:', formattedItems);
            
            // Establecer los items directamente con un pequeño retraso
            setTimeout(() => {
              setItems(formattedItems);
              setIsItemsLoading(false);
            }, 100);
          } else {
            console.log('No hay items en el pedido');
            setTimeout(() => {
              setItems([]);
              setIsItemsLoading(false);
            }, 100);
          }
        } else {
          console.log('No se encontró el pedido');
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

  const handleSubmit = async () => {
    if (isItemsLoading) {
      Alert.alert('Espere', 'Los productos están cargando...');
      return;
    }
    if (!validateForm()) return;
    if (!pedidoActual) return;

    try {
      // Determinamos el tipo de producto general basado en el primer item
      const firstProduct = productos.find(p => p.id === items[0].producto_id);

      await updatePedido(pedidoActual.id, {
        cliente_nombre: clienteNombre,
        cliente_telefono: clienteTelefono,
        tipo_producto: firstProduct?.tipo_producto || 'torta',
        peso: 0, // Legacy
        cantidad: items.length, // Legacy
        sabor: '', // Legacy
        descripcion: descripcion.trim(),
        precio_total: precioTotal,
        precio_domicilio: precioDomicilio,
        es_domicilio: esDomicilio,
        direccion_envio: esDomicilio ? direccionEnvio : undefined,
        fecha_entrega: fechaEntrega,
      }, items);

      Alert.alert('Éxito', 'Pedido actualizado correctamente', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el pedido');
    }
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
    setTempItem({
      producto_id: '',
      sabor_id: '',
      tamano_id: '',
      cantidad: 1,
      precio_unitario: 0,
    });
    setFilteredOptions({ sabores: [], tamanos: [] });
    setEditingItemIndex(null);
    setShowItemModal(true);
  };

  const handleSelectProducto = (producto: Producto) => {
    setTempItem(prev => ({
      ...prev,
      producto_id: producto.id,
      precio_unitario: producto.precio || 0
    }));
    loadFilteredOptions(producto.id);
    setShowProductoSelector(false);
  };

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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container}>
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
            items={items}
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
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isUpdating}>
              <Text style={{ color: 'white' }}>{isUpdating ? 'Actualizando...' : 'Actualizar Pedido'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal para agregar/editar items */}
      <ItemModal
        visible={showItemModal}
        editingItem={editingItemIndex !== null}
        tempItem={tempItem}
        productos={productos}
        sabores={sabores}
        tamanos={tamanos}
        filteredOptions={filteredOptions}
        showProductoSelector={showProductoSelector}
        onTempItemChange={setTempItem}
        onClose={() => setShowItemModal(false)}
        onSubmit={handleAddItem}
        onShowProductoSelector={setShowProductoSelector}
        onSelectProducto={handleSelectProducto}
      />

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
});

export default EditarPedidoScreen;
