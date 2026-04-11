import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useGastoById, useActualizarGasto } from '../hooks/use-gastos.hook';
import { GastoForm } from '../components/GastoForm';
import { CrearGastoDTO } from '../types/gasto.types';

type RouteProps = RouteProp<RootStackParamList, 'EditarGasto'>;

export const EditarGastoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { gastoId } = route.params;

  const { data: gasto, isLoading } = useGastoById(gastoId);
  const { mutate: actualizarGasto, isPending } = useActualizarGasto();

  const handleUpdate = (data: CrearGastoDTO) => {
    actualizarGasto({ ...data, id: gastoId }, {
      onSuccess: () => navigation.goBack(),
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  if (!gasto) {
    return (
      <View style={styles.centered}>
        <Text>Gasto no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GastoForm 
        initialValues={gasto} 
        onSubmit={handleUpdate} 
        isLoading={isPending} 
        submitLabel="Actualizar Gasto" 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
