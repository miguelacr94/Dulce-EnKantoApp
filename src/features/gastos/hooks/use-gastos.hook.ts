import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gastosRepository } from '../api/gastos.repository';
import { CrearGastoDTO, EditarGastoDTO } from '../types/gasto.types';
import { Alert } from 'react-native';

const GASTOS_KEY = ['gastos'];

export const useGastos = () => {
  return useQuery({
    queryKey: GASTOS_KEY,
    queryFn: () => gastosRepository.getAll(),
  });
};

export const useTotalGastos = () => {
  return useQuery({
    queryKey: ['gastos', 'total'],
    queryFn: () => gastosRepository.getTotalSum(),
  });
};

export const useGastoById = (id: string) => {
  return useQuery({
    queryKey: ['gastos', id],
    queryFn: () => gastosRepository.getById(id),
    enabled: !!id,
  });
};

export const useCrearGasto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nuevoGasto: CrearGastoDTO) => gastosRepository.create(nuevoGasto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GASTOS_KEY });
      Alert.alert('¡Éxito!', 'Gasto registrado correctamente.');
    },
    onError: (error: any) => {
      Alert.alert('Error', 'No se pudo registrar el gasto: ' + error.message);
    }
  });
};

export const useActualizarGasto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gasto: EditarGastoDTO) => gastosRepository.update(gasto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: GASTOS_KEY });
      queryClient.invalidateQueries({ queryKey: ['gastos', data.id] });
      Alert.alert('¡Éxito!', 'Gasto actualizado correctamente.');
    },
    onError: (error: any) => {
      Alert.alert('Error', 'No se pudo actualizar el gasto: ' + error.message);
    }
  });
};

export const useEliminarGasto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => gastosRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GASTOS_KEY });
      Alert.alert('¡Éxito!', 'Gasto eliminado correctamente.');
    },
    onError: (error: any) => {
      Alert.alert('Error', 'No se pudo eliminar el gasto: ' + error.message);
    }
  });
};
