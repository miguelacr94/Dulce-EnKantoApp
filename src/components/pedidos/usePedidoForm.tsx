import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { PedidoItem, Producto, Sabor, Tamano } from '../../types';
import { metadataService } from '../../services/metadataService';
import { formatDateForDB, formatDateTimeForDB } from '../../utils/format';

export const usePedidoForm = () => {
  // Estado del pedido (cabecera y carrito)
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [items, setItems] = useState<Omit<PedidoItem, 'id' | 'pedido_id'>[]>([]);
  const [precioTotal, setPrecioTotal] = useState(0);
  const [precioDomicilio, setPrecioDomicilio] = useState(0);
  const [esDomicilio, setEsDomicilio] = useState(false);
  const [direccionEnvio, setDireccionEnvio] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState(formatDateTimeForDB(new Date()));
  const [abonoInicial, setAbonoInicial] = useState(0);
  const [descripcion, setDescripcion] = useState('');

  // Estado para el modal de agregar item
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [tempItem, setTempItem] = useState<Omit<PedidoItem, 'id' | 'pedido_id'>>({
    producto_id: '',
    sabor_id: '',
    relleno_id: '',
    tamano_id: '',
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

  const [descripcionHeight, setDescripcionHeight] = useState(80);

  // Calcular precio total automáticamente al cambiar items o domicilio
  useEffect(() => {
    const itemsTotal = items.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
    const domicilioCost = esDomicilio ? precioDomicilio : 0;
    setPrecioTotal(itemsTotal + domicilioCost);
  }, [items, esDomicilio, precioDomicilio]);

  const loadFilteredOptions = async (productoId: string) => {
    try {
      console.log(`Cargando opciones para producto: ${productoId}`);
      
      const [fSabores, fTamanos] = await Promise.all([
        metadataService.getSaboresPorProducto(productoId),
        metadataService.getTamanosPorProducto(productoId),
      ]);

      console.log(`Sabores encontrados: ${fSabores.length}`);
      console.log(`Tamaños encontrados: ${fTamanos.length}`, fTamanos);

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

  const validateItem = () => {
    if (!tempItem.producto_id) return 'Selecciona un producto';
    if (tempItem.cantidad <= 0) return 'La cantidad debe ser mayor a 0';
    if (tempItem.precio_unitario < 0) return 'El precio no puede ser negativo';
    return null;
  };

  const handleAddItem = () => {
    const error = validateItem();
    if (error) {
      Alert.alert('Error', error);
      return;
    }

    if (editingItemIndex !== null) {
      const newItems = [...items];
      newItems[editingItemIndex] = tempItem;
      setItems(newItems);
    } else {
      setItems([...items, tempItem]);
    }

    setShowItemModal(false);
    setEditingItemIndex(null);
    setTempItem({
      producto_id: '',
      sabor_id: '',
      relleno_id: '',
      tamano_id: '',
      cantidad: 1,
      precio_unitario: 0,
    });
  };

  const handleEditItem = (index: number) => {
    const item = items[index];
    setTempItem(item);
    setEditingItemIndex(index);
    loadFilteredOptions(item.producto_id);
    setShowItemModal(true);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleDescripcionChange = (text: string) => {
    setDescripcion(text);

    // Calcular la altura necesaria basada en el contenido
    const lineHeight = 20;
    const minLines = 3;
    const maxLines = 8;

    const lines = text.split('\n').length;
    const estimatedLines = Math.max(minLines, Math.min(lines, maxLines));
    const newHeight = estimatedLines * lineHeight + 20;

    setDescripcionHeight(newHeight);
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
    const invalidItems = items.filter(item => !item.producto_id || item.producto_id.trim() === '');
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
    setClienteNombre('');
    setClienteTelefono('');
    setItems([]);
    setPrecioTotal(0);
    setFechaEntrega(formatDateTimeForDB(new Date()));
    setAbonoInicial(0);
    setDescripcion('');
    setDescripcionHeight(80);
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
    resetForm,
  };
};
