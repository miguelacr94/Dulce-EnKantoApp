import { View, Text, StyleSheet } from 'react-native';
import { Cliente } from '@/types';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '@/utils';

interface ClienteSimpleProps {
  cliente: Cliente | null;
}

export const ClienteSimple: React.FC<ClienteSimpleProps> = ({ cliente }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Cliente</Text>
      {cliente ? (
        <View style={styles.clienteInfo}>
          <Text style={styles.nombre}>{cliente.nombre}</Text>
          <Text style={styles.telefono}>{cliente.telefono}</Text>
        </View>
      ) : (
        <Text style={styles.placeholder}>No se ha seleccionado un cliente</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  clienteInfo: {
    marginTop: SPACING.xs,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  telefono: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  placeholder: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});
