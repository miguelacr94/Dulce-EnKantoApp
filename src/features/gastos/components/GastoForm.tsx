import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CrearGastoDTO } from '../types/gasto.types';
import DateTimePicker from '@react-native-community/datetimepicker';

const CATEGORIAS = [
  { nombre: 'Insumo', icono: '📦' },
  { nombre: 'Transporte', icono: '🚗' },
  { nombre: 'Empleado', icono: '👥' },
  { nombre: 'Servicio', icono: '⚡' },
  { nombre: 'Devolución', icono: '🔄' },
  { nombre: 'Ocio', icono: '🥤' }
];

const schema = z.object({
  categoria: z.string().min(1, 'Debes seleccionar una categoría'),
  monto: z.coerce.number().min(0, 'El monto debe ser mayor o igual a 0'),
  descripcion: z.string().optional(),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
});

interface Props {
  initialValues?: Partial<CrearGastoDTO>;
  onSubmit: (data: CrearGastoDTO) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export const GastoForm = ({ initialValues, onSubmit, isLoading, submitLabel = 'Guardar' }: Props) => {
  const { control, handleSubmit, setValue, formState: { errors }, watch } = useForm<CrearGastoDTO>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoria: initialValues?.categoria || '',
      monto: initialValues?.monto || 0,
      descripcion: initialValues?.descripcion || '',
      fecha: initialValues?.fecha || new Date().toISOString().split('T')[0],
    },
  });

  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const categoriaSeleccionada = watch('categoria');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Categoría *</Text>
        <View style={styles.categoriasContainer}>
          {CATEGORIAS.map((cat) => (
            <TouchableOpacity
              key={cat.nombre}
              onPress={() => setValue('categoria', cat.nombre)}
              style={[
                styles.chip,
                categoriaSeleccionada === cat.nombre && styles.chipSelected
              ]}
            >
              <Text style={styles.chipIcon}>{cat.icono}</Text>
              <Text 
                numberOfLines={1} 
                style={[
                  styles.chipText,
                  categoriaSeleccionada === cat.nombre && styles.chipTextSelected
                ]}
              >
                {cat.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.categoria && <Text style={styles.errorText}>{errors.categoria.message}</Text>}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Monto *</Text>
        <Controller
          control={control}
          name="monto"
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="0"
              keyboardType="numeric"
              style={[styles.input, errors.monto && styles.inputError]}
              value={value?.toString()}
              onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ''))}
            />
          )}
        />
        {errors.monto && <Text style={styles.errorText}>{errors.monto.message}</Text>}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Fecha *</Text>
        <Controller
          control={control}
          name="fecha"
          render={({ field: { value } }) => (
            <TouchableOpacity 
              onPress={() => setShowDatePicker(true)}
              style={styles.datePickerButton}
            >
              <Text style={styles.dateText}>{value}</Text>
            </TouchableOpacity>
          )}
        />
        {showDatePicker && (
          <DateTimePicker
            value={new Date(control._formValues.fecha + 'T12:00:00')}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setValue('fecha', selectedDate.toISOString().split('T')[0]);
              }
            }}
          />
        )}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Descripción (Opcional)</Text>
        <Controller
          control={control}
          name="descripcion"
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="Detalles adicionales..."
              multiline
              numberOfLines={3}
              style={[styles.input, styles.textArea]}
              value={value || ''}
              onChangeText={onChange}
            />
          )}
        />
      </View>

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
        style={[styles.submitButton, isLoading && styles.buttonDisabled]}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? 'Cargando...' : submitLabel}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  content: {
    padding: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#374151',
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  categoriasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12, // Espacio vertical entre filas
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%', // Fuerza 2 columnas (48% cada una + espacio en medio)
  },
  chipSelected: {
    backgroundColor: '#FCE7F3',
    borderColor: '#EC4899',
  },
  chipIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  chipText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#DB2777',
  },
  input: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#1F2937',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#F87171',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateText: {
    color: '#1F2937',
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#EC4899',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
