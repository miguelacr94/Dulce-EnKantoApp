import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useClientes } from '../hooks/useClientes';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, VALIDACIONES } from '../utils/constants';
import { validarTelefono } from '../utils/format';
import { Cliente } from '../types';

type CrearClienteScreenRouteProp = RouteProp<RootStackParamList, 'CrearCliente'>;
type CrearClienteScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CrearCliente'>;

const CrearClienteScreen: React.FC = () => {
  const navigation = useNavigation<CrearClienteScreenNavigationProp>();
  const route = useRoute<CrearClienteScreenRouteProp>();
  const { createCliente, isCreating } = useClientes();

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.length < VALIDACIONES.nombre.minLength) {
      newErrors.nombre = `El nombre debe tener al menos ${VALIDACIONES.nombre.minLength} caracteres`;
    } else if (formData.nombre.length > VALIDACIONES.nombre.maxLength) {
      newErrors.nombre = `El nombre no puede tener más de ${VALIDACIONES.nombre.maxLength} caracteres`;
    }

    // Validar teléfono
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!validarTelefono(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos y comenzar con 3';
    }

    // Validar dirección (opcional)
    if (formData.direccion && formData.direccion.length > VALIDACIONES.direccion.maxLength) {
      newErrors.direccion = `La dirección no puede tener más de ${VALIDACIONES.direccion.maxLength} caracteres`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createCliente({
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.replace(/\s/g, ''), // Eliminar espacios
        direccion: formData.direccion.trim() || undefined,
      });

      Alert.alert(
        'Éxito',
        'Cliente creado correctamente',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el cliente. Inténtalo de nuevo.');
    }
  };

  const updateFormField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Crear Nuevo Cliente</Text>
          <Text style={styles.subtitle}>
            Ingresa los datos del cliente para registrarlo en el sistema
          </Text>

          {/* Campo Nombre */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={[
                styles.input,
                errors.nombre && styles.inputError
              ]}
              placeholder="Ej: María González"
              value={formData.nombre}
              onChangeText={(value) => updateFormField('nombre', value)}
              maxLength={VALIDACIONES.nombre.maxLength}
              autoCapitalize="words"
            />
            {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
          </View>

          {/* Campo Teléfono */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Teléfono *</Text>
            <TextInput
              style={[
                styles.input,
                errors.telefono && styles.inputError
              ]}
              placeholder="Ej: 3001234567"
              value={formData.telefono}
              onChangeText={(value) => updateFormField('telefono', value)}
              maxLength={10}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
            {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}
            <Text style={styles.helperText}>
              Formato: 10 dígitos comenzando con 3
            </Text>
          </View>

          {/* Campo Dirección */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Dirección (opcional)</Text>
            <TextInput
              style={[
                styles.input,
                errors.direccion && styles.inputError
              ]}
              placeholder="Ej: Calle 123 #45-67, Bogotá"
              value={formData.direccion}
              onChangeText={(value) => updateFormField('direccion', value)}
              maxLength={VALIDACIONES.direccion.maxLength}
              multiline
              numberOfLines={3}
              autoCapitalize="sentences"
            />
            {errors.direccion && <Text style={styles.errorText}>{errors.direccion}</Text>}
          </View>

          {/* Botones de acción */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={isCreating}
            >
              <Text style={styles.submitButtonText}>
                {isCreating ? 'Creando...' : 'Crear Cliente'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    fontSize: FONTS.title,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.medium,
    color: COLORS.textLight,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONTS.medium,
    color: COLORS.text,
    ...SHADOWS.small,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: FONTS.small,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  helperText: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  submitButtonText: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.textWhite,
  },
});

export default CrearClienteScreen;
