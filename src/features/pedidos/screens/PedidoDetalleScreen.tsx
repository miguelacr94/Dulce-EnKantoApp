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
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { usePedidos, type PedidoConDetalles, type Abono, type EstadoPedido } from '@/features/pedidos';
import { useAbonos } from '@/features/pedidos/hooks';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '@/utils';
import { formatCurrency, formatDateTime, formatDateForDB, getEstadoColor, getProductoLabel } from '@/utils';

type PedidoDetalleScreenRouteProp = RouteProp<RootStackParamList, 'PedidoDetalle'>;
type PedidoDetalleScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PedidoDetalle'>;

const PedidoDetalleScreen: React.FC = () => {
  const route = useRoute<PedidoDetalleScreenRouteProp>();
  const navigation = useNavigation<PedidoDetalleScreenNavigationProp>();
  const { pedidoId } = route.params;

  const { getPedidoById, cambiarEstado, updatePedido, isChangingEstado, isUpdating } = usePedidos();
  const { abonos, createAbono, deleteAbono, isCreating, isDeleting } = useAbonos(pedidoId);

  const [showAbonoModal, setShowAbonoModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedEstado, setSelectedEstado] = useState<EstadoPedido | null>(null);
  const [nuevoAbono, setNuevoAbono] = useState('');
  const [pedidoActual, setPedidoActual] = useState<PedidoConDetalles | null>(null);

  // Cargar el pedido al montar el componente
  useEffect(() => {
    const loadPedido = async () => {
      const pedido = await getPedidoById(pedidoId);
      setPedidoActual(pedido);
    };
    loadPedido();
  }, [pedidoId, getPedidoById]);

  // Si no hay pedido actual, mostrar mensaje de carga
  if (!pedidoActual) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando pedido...</Text>
      </View>
    );
  }

  const handleConfirmarEstado = (nuevoEstado: EstadoPedido) => {
    setSelectedEstado(nuevoEstado);
    setShowConfirmModal(true);
  };

  const handleCambiarEstado = async () => {
    if (!selectedEstado || !pedidoActual) return;

    try {
      await cambiarEstado(pedidoActual.id, selectedEstado);
      const updatedPedido = await getPedidoById(pedidoId);
      setPedidoActual(updatedPedido);
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

    if (monto > pedidoActual.saldo_pendiente) {
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

          {selectedEstado === 'entregado' && pedidoActual.saldo_pendiente > 0 && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Nota: El pedido tiene un saldo pendiente de {formatCurrency(pedidoActual.saldo_pendiente)}.
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
              Saldo pendiente: {formatCurrency(pedidoActual.saldo_pendiente)}
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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isChangingEstado} onRefresh={() => { }} />
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

              {index < (pedidoActual.items?.length ?? 0) - 1 && (
                <View style={styles.itemSeparator} />
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noItemsText}>No hay detalles de productos</Text>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Descripción:</Text>
          <Text style={styles.detailValue}>{pedidoActual.descripcion || 'Sin descripción'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fecha y Hora de Entrega:</Text>
          <Text style={styles.detailValue}>{formatDateTime(pedidoActual.fecha_entrega)}</Text>
        </View>
      </View>

      {/* Información Financiera */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Información Financiera</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Precio Total:</Text>
          <Text style={[styles.detailValue, styles.priceTotal]}>
            {formatCurrency(pedidoActual.precio_total)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Abonado:</Text>
          <Text style={[styles.detailValue, styles.totalAbonado]}>
            {formatCurrency(pedidoActual.total_abonado)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Saldo Pendiente:</Text>
          <Text style={[
            styles.detailValue,
            pedidoActual.saldo_pendiente > 0 ? styles.saldoPendiente : styles.saldoCero
          ]}>
            {formatCurrency(pedidoActual.saldo_pendiente)}
          </Text>
        </View>
      </View>

      {/* Abonos */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Abonos</Text>
          {pedidoActual.estado !== 'cancelado' && pedidoActual.saldo_pendiente > 0 && (
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
                disabled={isDeleting}
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
        {/* Edit button - only for pending orders */}
        {pedidoActual.estado === 'pendiente' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.editarButton]}
            onPress={handleEditarPedido}
            disabled={isUpdating}
          >
            <Text style={styles.actionButtonText}>
              ✏️ Editar Pedido
            </Text>
          </TouchableOpacity>
        )}

        {pedidoActual.estado === 'pendiente' && (
          <>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.entregarButton,
                pedidoActual.saldo_pendiente > 0 && styles.buttonDisabled
              ]}
              onPress={() => handleConfirmarEstado('entregado')}
              disabled={pedidoActual.saldo_pendiente > 0}
            >
              <Text style={styles.actionButtonText}>
                {pedidoActual.saldo_pendiente > 0 ? '🔒 Saldo Pendiente' : '✅ Marcar como Entregado'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.cancelarButton]}
              onPress={() => handleConfirmarEstado('cancelado')}
            >
              <Text style={styles.actionButtonText}>❌ Cancelar Pedido</Text>
            </TouchableOpacity>
          </>
        )}

        {pedidoActual.estado === 'cancelado' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.reactivarButton]}
            onPress={() => handleConfirmarEstado('pendiente')}
          >
            <Text style={styles.actionButtonText}>🔄 Reactivar Pedido</Text>
          </TouchableOpacity>
        )}

        {pedidoActual.estado === 'entregado' && (
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
    </ScrollView>
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
  loadingText: {
    fontSize: FONTS.medium,
    color: COLORS.textLight,
  },
  headerCard: {
    backgroundColor: COLORS.cardBackground,
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
    borderRadius: BORDER_RADIUS.sm,
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
    backgroundColor: COLORS.cardBackground,
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
    borderRadius: BORDER_RADIUS.sm,
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
    borderRadius: BORDER_RADIUS.sm,
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
  actionButton: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  entregarButton: {
    backgroundColor: COLORS.success,
  },
  cancelarButton: {
    backgroundColor: COLORS.error,
  },
  reactivarButton: {
    backgroundColor: COLORS.warning,
  },
  editarButton: {
    backgroundColor: COLORS.primary,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textMuted,
    opacity: 0.6,
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
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xl,
    width: '90%',
    padding: SPACING.lg,
    ...SHADOWS.large,
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
});

export default PedidoDetalleScreen;
