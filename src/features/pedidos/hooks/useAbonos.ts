import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { abonosService } from '@/services';
import { useAppStore } from '@/app/store/appStore';
import { Abono } from '@/types';

export const useAbonos = (pedidoId?: string) => {
  const queryClient = useQueryClient();
  const { setError } = useAppStore();

  // Query para obtener abonos de un pedido específico
  const {
    data: abonos = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['abonos', pedidoId],
    queryFn: () => pedidoId ? abonosService.getAbonosPorPedido(pedidoId) : [],
    enabled: !!pedidoId
  });

  // Mutation para crear abono
  const createAbonoMutation = useMutation({
    mutationFn: (abono: Omit<Abono, 'id' | 'created_at' | 'fecha'> & { fecha?: string }) =>
      abonosService.createAbono(abono),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abonos', pedidoId] });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticas'] });
      setError(null);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Error al crear abono');
    }
  });

  // Mutation para actualizar abono
  const updateAbonoMutation = useMutation({
    mutationFn: ({ id, abono }: { id: string; abono: Partial<Omit<Abono, 'id' | 'created_at'>> }) =>
      abonosService.updateAbono(id, abono),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abonos', pedidoId] });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      setError(null);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Error al actualizar abono');
    }
  });

  // Mutation para eliminar abono
  const deleteAbonoMutation = useMutation({
    mutationFn: abonosService.deleteAbono,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abonos', pedidoId] });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticas'] });
      setError(null);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Error al eliminar abono');
    }
  });

  // Funciones helper
  const createAbono = (abono: Omit<Abono, 'id' | 'created_at' | 'fecha'> & { fecha?: string }) => {
    return createAbonoMutation.mutateAsync(abono);
  };

  const updateAbono = (id: string, abono: Partial<Omit<Abono, 'id' | 'created_at'>>) => {
    return updateAbonoMutation.mutateAsync({ id, abono });
  };

  const deleteAbono = (id: string) => {
    return deleteAbonoMutation.mutateAsync(id);
  };

  const validarTotalAbonos = async (pedidoId: string, nuevoMonto: number, excluirAbonoId?: string): Promise<boolean> => {
    try {
      return await abonosService.validarTotalAbonos(pedidoId, nuevoMonto, excluirAbonoId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al validar total de abonos');
      return false;
    }
  };

  return {
    abonos,
    isLoading,
    error,
    refetch,
    createAbono,
    updateAbono,
    deleteAbono,
    validarTotalAbonos,
    isCreating: createAbonoMutation.isPending,
    isUpdating: updateAbonoMutation.isPending,
    isDeleting: deleteAbonoMutation.isPending
  };
};

export const useTotalAbonos = () => {
  return useQuery({
    queryKey: ['abonos', 'total'],
    queryFn: () => abonosService.getTotalSum(),
  });
};
