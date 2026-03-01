import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Cliente } from '@/types';
import { COLORS, SPACING, BORDER_RADIUS } from '@/utils';

interface ClienteSelectorProps {
  visible: boolean;
  clientes: Cliente[];
  selectedClienteId: string;
  onSelect: (clienteId: string) => void;
  onClose: () => void;
  onOpen: () => void;
}

export const ClienteSelector: React.FC<ClienteSelectorProps> = ({
  visible,
  clientes,
  selectedClienteId,
  onSelect,
  onClose,
  onOpen,
}) => {
  const selectedCliente = clientes.find(c => c.id === selectedClienteId);

  return (
    <>
      <TouchableOpacity style={styles.fieldContainer} onPress={onOpen}>
        <Text style={styles.label}>Cliente *</Text>
        <View style={styles.selectorButton}>
          <Text style={styles.selectorText}>
            {selectedCliente?.nombre || 'Seleccionar cliente...'}
          </Text>
          <Text>▼</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Cliente</Text>
            <ScrollView>
              {clientes.map(cliente => (
                <TouchableOpacity
                  key={cliente.id}
                  style={styles.modalItem}
                  onPress={() => {
                    onSelect(cliente.id);
                    onClose();
                  }}
                >
                  <Text style={styles.modalItemText}>{cliente.nombre}</Text>
                  <Text style={styles.modalItemSubtext}>{cliente.telefono}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
              <Text>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
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
  modalItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  modalItemSubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  modalCancelButton: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center' as const,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
