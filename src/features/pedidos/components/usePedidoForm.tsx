import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { Producto, Sabor, Tamano } from '@/types';
import { CrearPedidoItemDTO } from '@/features/pedidos/types';
import { metadataService } from '@/services';
import { formatDateTimeForDB } from '@/utils';
import { create } from 'zustand';
import { useItemsStore } from '../stores/useItemsStore';

// Interfaz para el estado del formulario
interface PedidoFormState {
  clienteNombre: string;
  clienteTelefono: string;
  items: CrearPedidoItemDTO[];
  precioTotal: number;
  precioDomicilio: number;
  esDomicilio: boolean;
  direccionEnvio: string;
  fechaEntrega: string;
  abonoInicial: number;
  descripcion: string;
  descripcionHeight: number;
  setFormState: (state: Partial<PedidoFormState>) => void;
  resetFormState: () => void;
}

// Store de Zustand para el estado del formulario de CREACIÓN
const useCrearPedidoFormStore = create<PedidoFormState>((set) => ({
  clienteNombre: '',
  clienteTelefono: '',
  items: [],
  precioTotal: 0,
  precioDomicilio: 0,
  esDomicilio: false,
  direccionEnvio: '',
  fechaEntrega: formatDateTimeForDB(new Date()),
  abonoInicial: 0,
  descripcion: '',
  descripcionHeight: 80,
  
  setFormState: (state) => set((prev) => ({ ...prev, ...state })),
  resetFormState: () => ({
    clienteNombre: '',
    clienteTelefono: '',
    items: [],
    precioTotal: 0,
    precioDomicilio: 0,
    esDomicilio: false,
    direccionEnvio: '',
    fechaEntrega: formatDateTimeForDB(new Date()),
    abonoInicial: 0,
    descripcion: '',
    descripcionHeight: 80,
  }),
}));

// Store de Zustand para el estado del formulario de EDICIÓN
const useEditarPedidoFormStore = create<PedidoFormState>((set) => ({
  clienteNombre: '',
  clienteTelefono: '',
  items: [],
  precioTotal: 0,
  precioDomicilio: 0,
  esDomicilio: false,
  direccionEnvio: '',
  fechaEntrega: formatDateTimeForDB(new Date()),
  abonoInicial: 0,
  descripcion: '',
  descripcionHeight: 80,
  
  setFormState: (state) => set((prev) => ({ ...prev, ...state })),
  resetFormState: () => ({
    clienteNombre: '',
    clienteTelefono: '',
    items: [],
    precioTotal: 0,
    precioDomicilio: 0,
    esDomicilio: false,
    direccionEnvio: '',
    fechaEntrega: formatDateTimeForDB(new Date()),
    abonoInicial: 0,
    descripcion: '',
    descripcionHeight: 80,
  }),
}));

export const usePedidoForm = (isEditing: boolean = false) => {
  // Seleccionar el store apropiado según si estamos editando o creando
  const store = isEditing ? useEditarPedidoFormStore() : useCrearPedidoFormStore();
  
  // Store global de items
  const { 
    clearCrearItems, 
    clearEditarItems 
  } = useItemsStore();
  
  // Obtener estado y acciones del store de Zustand
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
    setFormState,
    resetFormState,
  } = store;

  // Estados que aún podrían necesitarse para la transición o por otros componentes
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [tempItem, setTempItem] = useState<CrearPedidoItemDTO>({
    producto_id: '',
    sabor_id: null,
    relleno_id: null,
    tamano_id: null,
    cantidad: 1,
    precio_unitario: 0,
  });

  const [filteredOptions, setFilteredOptions] = useState<{
    sabores: Sabor[];
    tamanos: Tamano[];
  }>({
    sabores: [],
    tamanos: [],
  });

  // Calcular precio total automáticamente al cambiar items o domicilio
  useEffect(() => {
    const itemsTotal = items.reduce((sum: number, item: CrearPedidoItemDTO) => sum + (item.precio_unitario * item.cantidad), 0);
    const domicilioCost = esDomicilio ? precioDomicilio : 0;
    const newTotal = itemsTotal + domicilioCost;
    if (newTotal !== precioTotal) {
      setFormState({ precioTotal: newTotal });
    }
  }, [items, esDomicilio, precioDomicilio, precioTotal, setFormState]);

  const loadFilteredOptions = async (productoId: string) => {
    try {
      const [fSabores, fTamanos] = await Promise.all([
        metadataService.getSaboresPorProducto(productoId),
        metadataService.getTamanosPorProducto(productoId),
      ]);

      setFilteredOptions({
        sabores: fSabores.length > 0 ? fSabores : [],
        tamanos: fTamanos.length > 0 ? fTamanos : [],
      });
    } catch (error) {
      console.error('Error filtrando opciones:', error);
      setFilteredOptions({
        sabores: [],
        tamanos: [],
      });
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_: any, i: number) => i !== index);
    setFormState({ items: newItems });
  };

  const handleDescripcionChange = (text: string) => {
    setFormState({ descripcion: text });

    const lineHeight = 20;
    const minLines = 3;
    const maxLines = 8;

    const lines = text.split('\n').length;
    const estimatedLines = Math.max(minLines, Math.min(lines, maxLines));
    const newHeight = estimatedLines * lineHeight + 20;

    setFormState({ descripcionHeight: newHeight });
  };

  const validateForm = () => {
    if (!clienteNombre.trim()) {
      Alert.alert('Error', 'Debes ingresar el nombre del cliente');
      return false;
    }
    if (!clienteTelefono.trim()) {
      Alert.alert('Error', 'Debes ingresar el teléfono del cliente');
      return false;
    }
    if (items.length === 0) {
      Alert.alert('Error', 'El carrito está vacío');
      return false;
    }

    // Verificar que todos los items tengan productos válidos
    const invalidItems = items.filter((item: CrearPedidoItemDTO) => !item.producto_id || item.producto_id.trim() === '');
    if (invalidItems.length > 0) {
      Alert.alert('Error', 'Hay productos inválidos en el carrito');
      return false;
    }

    if (esDomicilio && !direccionEnvio.trim()) {
      Alert.alert('Error', 'Debes ingresar la dirección de envío');
      return false;
    }
    if (abonoInicial > precioTotal) {
      Alert.alert('Error', 'El abono inicial no puede superar el precio total');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    resetFormState();
    // Limpiar también los items del store global correspondiente
    if (isEditing) {
      clearEditarItems();
    } else {
      clearCrearItems();
    }
  };

  return {
    // Estado
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

    // Acciones
    setClienteNombre: (value: string) => setFormState({ clienteNombre: value }),
    setClienteTelefono: (value: string) => setFormState({ clienteTelefono: value }),
    setItems: (value: CrearPedidoItemDTO[] | ((prev: CrearPedidoItemDTO[]) => CrearPedidoItemDTO[])) => {
      if (typeof value === 'function') {
        // Si es un callback, obtener el estado actual y aplicar la función
        const currentItems = store.items;
        const newItems = value(currentItems);
        setFormState({ items: newItems });
      } else {
        // Si es un valor directo, establecerlo directamente
        setFormState({ items: value });
      }
    },
    setFechaEntrega: (value: string) => setFormState({ fechaEntrega: value }),
    setAbonoInicial: (value: number) => setFormState({ abonoInicial: value }),
    setPrecioDomicilio: (value: number) => setFormState({ precioDomicilio: value }),
    setEsDomicilio: (value: boolean) => setFormState({ esDomicilio: value }),
    setDireccionEnvio: (value: string) => setFormState({ direccionEnvio: value }),
    setShowItemModal,
    setEditingItemIndex,
    setTempItem,
    handleRemoveItem,
    handleDescripcionChange,
    loadFilteredOptions,
    validateForm,
    setDescripcion: (value: string) => setFormState({ descripcion: value }),
    resetForm,
  };
};
