import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { usePedidos, usePedido, type PedidoConDetalles, type Abono, type EstadoPedido } from '@/features/pedidos';
import { useAbonos } from '@/features/pedidos/hooks';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '@/utils';
import { formatCurrency, formatDateTime, formatDateForDB, getEstadoColor, getProductoLabel } from '@/utils';
import { useInsumos } from '@/features/insumos/hooks/useInsumos';
import { insumosService } from '@/services/insumosService';

type PedidoDetalleScreenRouteProp = RouteProp<RootStackParamList, 'PedidoDetalle'>;
type PedidoDetalleScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PedidoDetalle'>;

const PedidoDetalleScreen: React.FC = () => {
  const route = useRoute<PedidoDetalleScreenRouteProp>();
  const navigation = useNavigation<PedidoDetalleScreenNavigationProp>();
  const isFocused = useIsFocused();
  const { pedidoId } = route.params;

  const { cambiarEstado, updatePedido, deletePedido, isChangingEstado, isUpdating, isDeleting: isDeletingPedido } = usePedidos();
  const { data: pedidoActual, isLoading: isLoadingPedido, refetch: refetchPedido } = usePedido(pedidoId);
  const { abonos, createAbono, deleteAbono, isCreating, isDeleting: isDeletingAbono } = useAbonos(pedidoId);
  const { insumos, loadInsumos } = useInsumos();

  const [showAbonoModal, setShowAbonoModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEstado, setSelectedEstado] = useState<EstadoPedido | null>(null);
  const [nuevoAbono, setNuevoAbono] = useState('');
  const [checkedInsumos, setCheckedInsumos] = useState<Record<string, boolean>>({});
  const [seleccionInsumos, setSeleccionInsumos] = useState<Record<string, any[]>>({});
  const [showInsumoSelectorModal, setShowInsumoSelectorModal] = useState(false);
  const [activeItemForInsumo, setActiveItemForInsumo] = useState<string | null>(null);
  const [estadoPedidoLocal, setEstadoPedidoLocal] = useState<EstadoPedido | null>(null);

  // Cargar insumos al montar
  useEffect(() => {
    loadInsumos();
  }, [loadInsumos]);

  // Refrescar datos cuando la pantalla gane el foco (al volver de editar)
  useEffect(() => {
    if (isFocused) {
      refetchPedido();
    }
  }, [isFocused]);

  // Sincronizar estado local con el del servidor
  useEffect(() => {
    if (pedidoActual?.estado) {
      setEstadoPedidoLocal(pedidoActual.estado);
    }
  }, [pedidoActual?.estado]);

  // Sincronizar selección de insumos con los items del pedido
  useEffect(() => {
    if (pedidoActual && insumos.length > 0) {
      setSeleccionInsumos(prev => {
        const nuevaSeleccion = { ...prev };
        let huboCambios = false;

        // 1. Eliminar entradas de items que ya no existen en el pedido
        const itemIdsActuales = pedidoActual.items?.map(i => i.id) || [];
        Object.keys(nuevaSeleccion).forEach(itemId => {
          if (!itemIdsActuales.includes(itemId)) {
            delete nuevaSeleccion[itemId];
            huboCambios = true;
          }
        });

        // 2. Inicializar sugeridos para items nuevos
        pedidoActual.items?.forEach(item => {
          if (!nuevaSeleccion[item.id]) {
            const sugeridos = getInsumosParaItem(item);
            nuevaSeleccion[item.id] = sugeridos.map(s => ({
              id: s.id,
              insumo_id: s.insumoId,
              nombre: s.nombre,
              tamano: s.tamanoNombre || '',
              cantidad: 1
            }));
            huboCambios = true;
          }
        });

        return huboCambios ? nuevaSeleccion : prev;
      });
    }
  }, [pedidoActual, insumos]);

  // Helper local para cruzar datos de inventario
  const getInsumosParaItem = (item: any) => {
    const tId = item.tamano_id || item.tamano?.id;
    if (!tId) return [];
    
    return insumos.flatMap(insumo => 
      (insumo.insumo_tamanos || [])
        .filter(it => it.tamano_id === tId)
        .map(it => ({
          id: it.id,
          insumoId: insumo.id,
          nombre: insumo.nombre,
          tamanoNombre: it.tamano?.nombre,
          cantidadStock: it.cantidad
        }))
    );
  };

  const handleAddInsumoManual = (itemId: string, insumoTamano: any) => {
    setSeleccionInsumos(prev => {
      const current = prev[itemId] || [];
      // Si ya existe, podríamos sumar, pero mejor permitir líneas duplicadas si el usuario quiere
      return {
        ...prev,
        [itemId]: [...current, {
          id: insumoTamano.id,
          insumo_id: insumoTamano.insumo_id,
          nombre: insumoTamano.insumoNombre,
          tamano: insumoTamano.tamanoNombre,
          cantidad: 1
        }]
      };
    });
    setShowInsumoSelectorModal(false);
  };

  const handleRemoveInsumoManual = (itemId: string, index: number) => {
    setSeleccionInsumos(prev => ({
      ...prev,
      [itemId]: prev[itemId].filter((_, i) => i !== index)
    }));
  };

  const handleUpdateInsumoCantidad = (itemId: string, index: number, delta: number) => {
    setSeleccionInsumos(prev => ({
      ...prev,
      [itemId]: prev[itemId].map((ins, i) => 
        i === index ? { ...ins, cantidad: Math.max(1, ins.cantidad + delta) } : ins
      )
    }));
  };

  const toggleInsumo = (itemId: string | number, insumoId: string | number) => {
    const key = `${itemId}_${insumoId}`;
    setCheckedInsumos(prev => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key]
    }));
  };

  // Si no hay pedido actual o está cargando, mostrar mensaje de carga
  if (isLoadingPedido || !pedidoActual) {
    return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.loadingText}>Cargando pedido...</Text>
      </ScrollView>
    </SafeAreaView>
    );
  }

  // Cálculos dinámicos de abonos y saldo (fuente de verdad: hook de abonos)
  const totalAbonadoCalculado = abonos.reduce((sum, abono) => sum + abono.monto, 0);
  const saldoPendienteCalculado = pedidoActual.precio_total - totalAbonadoCalculado;
  const esPedidoPagado = saldoPendienteCalculado <= 0;

  const handleConfirmarEstado = (nuevoEstado: EstadoPedido) => {
    setSelectedEstado(nuevoEstado);
    setShowConfirmModal(true);
  };

  const handleCambiarEstado = async () => {
    if (!selectedEstado || !pedidoActual) return;

    try {
      // Si el estado cambia a entregado, descontamos el stock dinámico
      if (selectedEstado === 'entregado') {
        const descuentos: { insumo_tamano_id: string, cantidadADescontar: number }[] = [];
        
        Object.values(seleccionInsumos).forEach(itemInsumos => {
          itemInsumos.forEach(ins => {
            descuentos.push({
              insumo_tamano_id: ins.id,
              cantidadADescontar: ins.cantidad
            });
          });
        });

        if (descuentos.length > 0) {
          try {
            await insumosService.descontarStockManual(descuentos);
          } catch (stockError) {
            console.error('Error descontando stock:', stockError);
            Alert.alert('Advertencia', 'El pedido se actualizará pero hubo un error al descontar el inventario.');
          }
        }
      }

      // Si el estado cambia de entregado a pendiente, devolvemos el stock
      if (selectedEstado === 'pendiente' && pedidoActual.estado === 'entregado') {
        const devoluciones: { insumo_tamano_id: string, cantidadADevolver: number }[] = [];
        
        Object.values(seleccionInsumos).forEach(itemInsumos => {
          itemInsumos.forEach(ins => {
            devoluciones.push({
              insumo_tamano_id: ins.id,
              cantidadADevolver: ins.cantidad
            });
          });
        });

        if (devoluciones.length > 0) {
          try {
            await insumosService.devolverStockManual(devoluciones);
          } catch (stockError) {
            console.error('Error devolviendo stock:', stockError);
            Alert.alert('Advertencia', 'El pedido se actualizará pero hubo un error al devolver el inventario.');
          }
        }
      }

      await cambiarEstado(pedidoActual.id, selectedEstado);
      
      // Actualizar estado local inmediatamente para feedback visual
      setEstadoPedidoLocal(selectedEstado);
      
      // Forzar refresco de datos en segundo plano
      await refetchPedido();
      
      setShowConfirmModal(false);
      setSelectedEstado(null);
      Alert.alert('Éxito', `Pedido ${selectedEstado === 'entregado' ? 'entregado' : selectedEstado === 'cancelado' ? 'cancelado' : 'actualizado'} correctamente`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado');
    }
  };

  const handleAgregarAbono = async () => {
    const monto = parseFloat(nuevoAbono);

    if (!monto || monto <= 0) {
      Alert.alert('Error', 'El monto del abono debe ser mayor a 0');
      return;
    }

    if (monto > saldoPendienteCalculado) {
      Alert.alert('Error', 'El abono no puede superar el saldo pendiente');
      return;
    }

    try {
      await createAbono({
        pedido_id: pedidoId,
        monto,
      });

      setNuevoAbono('');
      setShowAbonoModal(false);
      Alert.alert('Éxito', 'Abono agregado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el abono');
    }
  };

  const handleEliminarAbono = (abono: Abono) => {
    Alert.alert(
      'Eliminar Abono',
      `¿Estás seguro de que quieres eliminar este abono de ${formatCurrency(abono.monto)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAbono(abono.id);
              Alert.alert('Éxito', 'Abono eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el abono');
            }
          }
        }
      ]
    );
  };

  const handleEditarPedido = () => {
    if (!pedidoActual) return;

    // Solo permitir editar pedidos pendientes
    if (pedidoActual.estado !== 'pendiente') {
      Alert.alert('No se puede editar', 'Solo se pueden editar pedidos en estado "pendiente"');
      return;
    }

    navigation.navigate('EditarPedido', { pedidoId: pedidoActual.id });
  };

  const handleEliminarPedido = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmarEliminacion = async () => {
    try {
      await deletePedido(pedidoId);
      setShowDeleteModal(false);
      Alert.alert('Éxito', 'Pedido eliminado correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el pedido');
    }
  };


  const renderDeleteModal = () => (
    <Modal
      visible={showDeleteModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowDeleteModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.deleteModalContent}>
          {/* Icono de advertencia */}
          <View style={styles.deleteIconContainer}>
            <Text style={styles.deleteIcon}>⚠️</Text>
          </View>

          <Text style={styles.deleteModalTitle}>Eliminar Pedido</Text>

          <Text style={styles.deleteModalText}>
            ¿Estás seguro de que quieres eliminar este pedido?
          </Text>

          {/* Detalles del pedido a eliminar */}
          <View style={styles.deletePedidoDetails}>
            <Text style={styles.deleteDetailLabel}>Cliente:</Text>
            <Text style={styles.deleteDetailValue}>{pedidoActual?.cliente_nombre || 'Sin nombre'}</Text>

            <Text style={styles.deleteDetailLabel}>Valor Total:</Text>
            <Text style={styles.deleteDetailValue}>{formatCurrency(pedidoActual?.precio_total || 0)}</Text>

            <Text style={styles.deleteDetailLabel}>Estado:</Text>
            <Text style={styles.deleteDetailValue}>{pedidoActual?.estado || 'Sin estado'}</Text>
          </View>

          <View style={styles.deleteWarningBox}>
            <Text style={styles.deleteWarningText}>
              Esta acción no se puede deshacer y eliminará permanentemente el pedido y toda su información asociada.
            </Text>
          </View>

          {/* Botones de acción */}
          <View style={styles.deleteModalActions}>
            <TouchableOpacity
              style={[styles.deleteModalButton, styles.deleteCancelButton]}
              onPress={() => setShowDeleteModal(false)}
              disabled={isDeletingPedido}
            >
              <Text style={styles.deleteCancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteModalButton, styles.deleteConfirmButton]}
              onPress={handleConfirmarEliminacion}
              disabled={isDeletingPedido}
            >
              {isDeletingPedido ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.deleteConfirmText}>Eliminando...</Text>
                </View>
              ) : (
                <Text style={styles.deleteConfirmText}>Eliminar Pedido</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderConfirmModal = () => (
    <Modal
      visible={showConfirmModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowConfirmModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirmar Acción</Text>
          <Text style={styles.modalText}>
            ¿Estás seguro de que quieres marcar este pedido como{' '}
            <Text style={{ fontWeight: 'bold', color: selectedEstado === 'cancelado' ? COLORS.error : COLORS.success }}>
              {selectedEstado === 'entregado' ? 'ENTREGADO' : selectedEstado === 'cancelado' ? 'CANCELADO' : 'PENDIENTE'}
            </Text>?
          </Text>

          {selectedEstado === 'entregado' && saldoPendienteCalculado > 0 && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Nota: El pedido tiene un saldo pendiente de {formatCurrency(saldoPendienteCalculado)}.
              </Text>
            </View>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => {
                setShowConfirmModal(false);
                setSelectedEstado(null);
              }}
            >
              <Text style={styles.modalCancelText}>No, Volver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalButton,
                selectedEstado === 'cancelado' ? styles.modalDeleteButton : styles.modalSubmitButton
              ]}
              onPress={handleCambiarEstado}
              disabled={isChangingEstado}
            >
              <Text style={styles.modalSubmitText}>
                {isChangingEstado ? 'Procesando...' : 'Sí, Confirmar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );


  const renderAbonoModal = () => (
    <Modal
      visible={showAbonoModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowAbonoModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Agregar Abono</Text>

          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>Monto del Abono</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="0"
              value={nuevoAbono}
              onChangeText={setNuevoAbono}
              keyboardType="numeric"
            />
            <Text style={styles.modalHelper}>
              Saldo pendiente: {formatCurrency(saldoPendienteCalculado)}
            </Text>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => setShowAbonoModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalSubmitButton]}
              onPress={handleAgregarAbono}
              disabled={isCreating}
            >
              <Text style={styles.modalSubmitText}>
                {isCreating ? 'Agregando...' : 'Agregar Abono'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isLoadingPedido || isChangingEstado} onRefresh={refetchPedido} />
        }
      >
      {/* Header del Pedido */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.clienteNombre}>{pedidoActual.cliente_nombre || 'Sin nombre'}</Text>
          <View style={[
            styles.estadoBadge,
            { backgroundColor: getEstadoColor(pedidoActual.estado) + '20' }
          ]}>
            <Text style={[
              styles.estadoText,
              { color: getEstadoColor(pedidoActual.estado) }
            ]}>
              {pedidoActual.estado ? pedidoActual.estado.charAt(0).toUpperCase() + pedidoActual.estado.slice(1) : 'Sin estado'}
            </Text>
          </View>
        </View>

        <Text style={styles.clienteTelefono}>{pedidoActual.cliente_telefono || 'Sin teléfono'}</Text>
      </View>

      {/* Detalles del Producto */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Detalles del Producto</Text>

        {pedidoActual.items && pedidoActual.items.length > 0 ? (
          pedidoActual.items.map((item, index) => (
            <View key={item.id} style={styles.productItem}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Producto:</Text>
                <Text style={styles.detailValue}>{item.producto?.nombre || 'Sin nombre'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Cantidad:</Text>
                <Text style={styles.detailValue}>{item.cantidad}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Precio Unitario:</Text>
                <Text style={styles.detailValue}>{formatCurrency(item.precio_unitario)}</Text>
              </View>

              {item.sabor && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Sabor:</Text>
                  <Text style={styles.detailValue}>{item.sabor.nombre}</Text>
                </View>
              )}

              {item.relleno && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Relleno:</Text>
                  <Text style={styles.detailValue}>{item.relleno.nombre}</Text>
                </View>
              )}

              {item.tamano && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tamaño:</Text>
                  <Text style={styles.detailValue}>{item.tamano.nombre}</Text>
                </View>
              )}

              {/* Gestión Dinámica de Insumos (Empaque) */}
              <View style={styles.inventoryCheckContainer}>
                <View style={styles.inventoryHeader}>
                  <Text style={styles.inventoryCheckTitle}>Empaque / Insumos a descontar:</Text>
                  {estadoPedidoLocal !== 'entregado' && (
                    <TouchableOpacity 
                      style={styles.addInsumoBadge}
                      onPress={() => {
                        setActiveItemForInsumo(item.id);
                        setShowInsumoSelectorModal(true);
                      }}
                    >
                      <Text style={styles.addInsumoBadgeText}>+ Agregar</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {estadoPedidoLocal === 'entregado' && (
                  <View style={styles.lockedBadge}>
                    <Text style={styles.lockedBadgeText}>🔒 Configuración de empaque entregada</Text>
                  </View>
                )}

                <View style={styles.inventorySelectedList}>
                  {seleccionInsumos[item.id]?.length > 0 ? (
                    seleccionInsumos[item.id].map((insSelect, idx) => (
                      <View key={`${item.id}_${idx}`} style={styles.inventorySelectItem}>
                        <View style={styles.inventorySelectInfo}>
                          <Text style={styles.inventorySelectName}>{insSelect.nombre}</Text>
                          <Text style={styles.inventorySelectSize}>{insSelect.tamano}</Text>
                        </View>
                        
                        <View style={styles.inventoryQtyControl}>
                          <TouchableOpacity 
                            onPress={() => estadoPedidoLocal !== 'entregado' && handleUpdateInsumoCantidad(item.id, idx, -1)}
                            style={estadoPedidoLocal === 'entregado' && { opacity: 0.3 }}
                          >
                            <Text style={styles.qtyBtn}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.qtyText}>{insSelect.cantidad}</Text>
                          <TouchableOpacity 
                            onPress={() => estadoPedidoLocal !== 'entregado' && handleUpdateInsumoCantidad(item.id, idx, 1)}
                            style={estadoPedidoLocal === 'entregado' && { opacity: 0.3 }}
                          >
                            <Text style={styles.qtyBtn}>+</Text>
                          </TouchableOpacity>
                        </View>

                        {estadoPedidoLocal !== 'entregado' && (
                          <TouchableOpacity 
                            style={styles.removeInsumoBtn}
                            onPress={() => handleRemoveInsumoManual(item.id, idx)}
                          >
                            <Text style={styles.removeInsumoIcon}>✕</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noInsumosText}>No se descontará empaque para este item</Text>
                  )}
                </View>
              </View>

              {index < (pedidoActual.items?.length ?? 0) - 1 && (
                <View style={styles.itemSeparator} />
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noItemsText}>No hay detalles de productos</Text>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fecha y Hora de Entrega:</Text>
          <Text style={styles.detailValue}>{formatDateTime(pedidoActual.fecha_entrega)}</Text>
        </View>
      </View>

      {/* Notas del Pedido */}
      {pedidoActual.descripcion ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notas de Preparación</Text>
          <Text style={styles.descripcionTexto}>{pedidoActual.descripcion}</Text>
        </View>
      ) : null}

      {/* Información Financiera */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Información Financiera</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Subtotal Productos:</Text>
          <Text style={styles.detailValue}>
            {formatCurrency(pedidoActual.precio_total - (pedidoActual.precio_domicilio || 0))}
          </Text>
        </View>

        {pedidoActual.es_domicilio && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Costo Domicilio:</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(pedidoActual.precio_domicilio || 0)}
            </Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total a Pagar:</Text>
          <Text style={[styles.detailValue, styles.priceTotal]}>
            {formatCurrency(pedidoActual.precio_total)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Abonado:</Text>
          <Text style={[styles.detailValue, styles.totalAbonado]}>
            {formatCurrency(totalAbonadoCalculado)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Saldo Pendiente:</Text>
          <Text style={[
            styles.detailValue,
            saldoPendienteCalculado > 0 ? styles.saldoPendiente : styles.saldoCero
          ]}>
            {formatCurrency(saldoPendienteCalculado)}
          </Text>
        </View>
      </View>

      {/* Abonos */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Abonos</Text>
          {pedidoActual.estado !== 'cancelado' && !esPedidoPagado && (
            <TouchableOpacity
              style={styles.addAbonoButton}
              onPress={() => setShowAbonoModal(true)}
            >
              <Text style={styles.addAbonoText}>+ Agregar Abono</Text>
            </TouchableOpacity>
          )}
        </View>

        {abonos.length > 0 ? (
          abonos.map((abono: Abono) => (
            <View key={abono.id} style={styles.abonoItem}>
              <View style={styles.abonoInfo}>
                <Text style={styles.abonoMonto}>{formatCurrency(abono.monto)}</Text>
                <Text style={styles.abonoFecha}>{formatDateTime(abono.fecha)}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteAbonoButton}
                onPress={() => handleEliminarAbono(abono)}
                disabled={isDeletingAbono}
              >
                <Text style={styles.deleteAbonoText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noAbonosText}>No hay abonos registrados</Text>
        )}
      </View>

      {/* Acciones */}
      <View style={styles.actionsContainer}>
        {/* Botones para pedidos pendientes */}
        {estadoPedidoLocal === 'pendiente' && (
          <>
            {/* Fila 1: Editar y Eliminar */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editarButton, styles.actionButtonHalf]}
                onPress={handleEditarPedido}
                disabled={isUpdating}
              >
                <Text style={styles.actionButtonText}>
                  ✏️ Editar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.eliminarButton, styles.actionButtonHalf]}
                onPress={handleEliminarPedido}
                disabled={isDeletingPedido}
              >
                <Text style={styles.actionButtonText}>
                  {isDeletingPedido ? '🗑️ Eliminando...' : '🗑️ Eliminar'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Fila 2: Entregar */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.entregarButton,
                  styles.actionButtonFull,
                  !esPedidoPagado && styles.buttonDisabled
                ]}
                onPress={() => handleConfirmarEstado('entregado')}
                disabled={!esPedidoPagado}
              >
                <Text style={styles.actionButtonText}>
                  {!esPedidoPagado ? '🔒 Saldo Pendiente' : '✅ Entregar'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Botón para pedidos cancelados */}
        {estadoPedidoLocal === 'cancelado' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.reactivarButton]}
            onPress={() => handleConfirmarEstado('pendiente')}
          >
            <Text style={styles.actionButtonText}>🔄 Reactivar Pedido</Text>
          </TouchableOpacity>
        )}

        {/* Botón para pedidos entregados */}
        {estadoPedidoLocal === 'entregado' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.reactivarButton]}
            onPress={() => handleConfirmarEstado('pendiente')}
          >
            <Text style={styles.actionButtonText}>🔄 Volver a Pendiente</Text>
          </TouchableOpacity>
        )}
      </View>

      {renderConfirmModal()}
      {renderAbonoModal()}
      {renderDeleteModal()}

      {/* Selector de Insumos Dinámico */}
      <Modal
        visible={showInsumoSelectorModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInsumoSelectorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectorModalContent}>
            <Text style={styles.modalTitle}>Seleccionar Insumo</Text>
            <ScrollView style={styles.selectorList}>
              {insumos.flatMap(ins => 
                (ins.insumo_tamanos || []).map(it => ({
                  id: it.id,
                  insumo_id: ins.id,
                  insumoNombre: ins.nombre,
                  tamanoNombre: it.tamano?.nombre,
                  stockActual: it.cantidad
                }))
              ).map((opt) => (
                <TouchableOpacity 
                  key={opt.id} 
                  style={styles.selectorItem}
                  onPress={() => activeItemForInsumo && handleAddInsumoManual(activeItemForInsumo, opt)}
                >
                  <View>
                    <Text style={styles.selectorItemName}>{opt.insumoNombre}</Text>
                    <Text style={styles.selectorItemSize}>{opt.tamanoNombre}</Text>
                  </View>
                  <Text style={[
                    styles.selectorItemStock,
                    opt.stockActual <= 0 && { color: COLORS.error }
                  ]}>
                    Stock: {opt.stockActual}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeSelectorBtn}
              onPress={() => setShowInsumoSelectorModal(false)}
            >
              <Text style={styles.closeSelectorText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.medium,
    color: COLORS.textLight,
  },
  headerCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  clienteNombre: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  estadoBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  estadoText: {
    fontSize: FONTS.small,
    fontWeight: 'bold',
  },
  clienteTelefono: {
    fontSize: FONTS.medium,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  headerDescription: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  headerDescriptionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerDescriptionText: {
    fontSize: FONTS.medium,
    color: COLORS.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  clienteDireccion: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
  },
  productItem: {
    marginBottom: SPACING.md,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  noItemsText: {
    fontSize: FONTS.medium,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  descripcionTexto: {
    fontSize: FONTS.medium,
    color: COLORS.text,
    lineHeight: 22,
    fontStyle: 'italic',
    backgroundColor: '#F9FAFB',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailLabel: {
    fontSize: FONTS.medium,
    color: COLORS.textLight,
  },
  detailValue: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.text,
  },
  priceTotal: {
    color: COLORS.primary,
  },
  totalAbonado: {
    color: COLORS.success,
  },
  saldoPendiente: {
    color: COLORS.error,
  },
  saldoCero: {
    color: COLORS.success,
  },
  addAbonoButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + '20',
  },
  addAbonoText: {
    fontSize: FONTS.small,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  abonoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  abonoInfo: {
    flex: 1,
  },
  abonoMonto: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  abonoFecha: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
  },
  deleteAbonoButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#FFE4E1',
  },
  deleteAbonoText: {
    fontSize: 16,
  },
  noAbonosText: {
    fontSize: FONTS.medium,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionsContainer: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  actionButton: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  actionButtonHalf: {
    flex: 1,
  },
  actionButtonFull: {
    flex: 1,
  },
  entregarButton: {
    backgroundColor: COLORS.success,
  },
  cancelarButton: {
    backgroundColor: COLORS.error,
  },
  eliminarButton: {
    backgroundColor: '#DC143C', // Rojo más intenso para eliminar
  },
  reactivarButton: {
    backgroundColor: COLORS.warning,
  },
  editarButton: {
    backgroundColor: COLORS.primary,
  },
  buttonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.6,
  },
  // Nuevos estilos para inventario dinámico
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  addInsumoBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  addInsumoBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inventorySelectedList: {
    gap: SPACING.xs,
  },
  inventorySelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inventorySelectInfo: {
    flex: 1,
  },
  inventorySelectName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  inventorySelectSize: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  inventoryQtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  qtyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  qtyText: {
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    minWidth: 25,
    textAlign: 'center',
  },
  removeInsumoBtn: {
    padding: 4,
  },
  removeInsumoIcon: {
    fontSize: 16,
    color: COLORS.error,
  },
  selectorModalContent: {
    backgroundColor: COLORS.surface,
    width: '90%',
    maxHeight: '80%',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.large,
  },
  selectorList: {
    marginVertical: SPACING.md,
  },
  selectorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectorItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectorItemSize: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  selectorItemStock: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  closeSelectorBtn: {
    backgroundColor: COLORS.border,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  closeSelectorText: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  lockedBadge: {
    backgroundColor: COLORS.surface,
    padding: 8,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  lockedBadgeText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontWeight: '600',
  },
  noInsumosText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: SPACING.md,
  },
  actionButtonText: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    width: '90%',
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  modalTitle: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  modalField: {
    marginBottom: SPACING.lg,
  },
  modalLabel: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONTS.medium,
    color: COLORS.text,
  },
  modalInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  inventoryCheckContainer: {
    marginTop: 10,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inventoryCheckTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: 6,
  },
  inventoryBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  inventorySwitchList: {
    gap: 8,
  },
  inventorySwitchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  inventorySwitchLabel: {
    flex: 1,
  },
  inventoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  noStockText: {
    color: COLORS.error,
    fontWeight: 'bold',
  },
  hasStockBadge: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  lowStockBadge: {
    backgroundColor: '#FFFDE7',
    borderColor: '#FFF59D',
  },
  noStockBadge: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  inventoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalHelper: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  modalText: {
    fontSize: FONTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  warningText: {
    fontSize: FONTS.small,
    color: '#856404',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalDeleteButton: {
    backgroundColor: COLORS.error,
  },
  modalSubmitButton: {
    backgroundColor: COLORS.success,
  },
  modalCancelText: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalSubmitText: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.textWhite,
  },
  // Estilos para el modal de eliminar pedido
  deleteModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    width: '90%',
    maxWidth: 400,
    padding: SPACING.xl,
    ...SHADOWS.medium,
  },
  deleteIconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  deleteIcon: {
    fontSize: 48,
  },
  deleteModalTitle: {
    fontSize: FONTS.xlarge,
    fontWeight: 'bold',
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  deleteModalText: {
    fontSize: FONTS.medium,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  deletePedidoDetails: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  deleteDetailLabel: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  deleteDetailValue: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  deleteWarningBox: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  deleteWarningText: {
    fontSize: FONTS.small,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 18,
  },
  deleteModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  deleteModalButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  deleteCancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  deleteCancelText: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.text,
  },
  deleteConfirmButton: {
    backgroundColor: COLORS.error,
    ...SHADOWS.medium,
  },
  deleteConfirmText: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
});

export default PedidoDetalleScreen;
