import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCrearGasto } from '../hooks/use-gastos.hook';
import { GastoForm } from '../components/GastoForm';
import { CrearGastoDTO } from '../types/gasto.types';

export const CrearGastoScreen = () => {
  const navigation = useNavigation();
  const { mutate: crearGasto, isPending } = useCrearGasto();

  const handleCreate = (data: CrearGastoDTO) => {
    crearGasto(data, {
      onSuccess: () => navigation.goBack(),
    });
  };

  return (
    <View style={styles.container}>
      <GastoForm onSubmit={handleCreate} isLoading={isPending} submitLabel="Registrar Gasto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
});
