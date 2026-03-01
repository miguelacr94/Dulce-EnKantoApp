import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '../../utils/constants';

interface ClienteFormProps {
  nombre: string;
  telefono: string;
  onNombreChange: (text: string) => void;
  onTelefonoChange: (text: string) => void;
}

export const ClienteForm: React.FC<ClienteFormProps> = ({
  nombre,
  telefono,
  onNombreChange,
  onTelefonoChange,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Datos del Cliente</Text>
      
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingrese el nombre del cliente"
          value={nombre}
          onChangeText={onNombreChange}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Teléfono *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingrese el teléfono del cliente"
          value={telefono}
          onChangeText={onTelefonoChange}
          keyboardType="phone-pad"
        />
      </View>
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
  title: {
    fontSize: FONTS.large,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  fieldContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.medium,
    fontWeight: '600' as const,
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONTS.medium,
    color: COLORS.text,
  },
});
