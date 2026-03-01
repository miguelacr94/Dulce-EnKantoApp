import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientesService } from '../services/clientesService';
import { useAppStore } from '../store/appStore';
import { Cliente } from '../types';

export const useClientes = () => {
  const queryClient = useQueryClient();
  const { setError } = useAppStore();

  // Query para obtener todos los clientes
  const {
    data: clientes = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['clientes'],
    queryFn: clientesService.getClientes
  });

  // Efecto para manejar errores (sin bucle infinito)
  React.useEffect(() => {
    if (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar clientes');
    }
  }, [error, setError]);

  // Mutation para crear cliente
  const createClienteMutation = useMutation({
    mutationFn: clientesService.createCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setError(null);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Error al crear cliente');
    }
  });

  // Mutation para actualizar cliente
  const updateClienteMutation = useMutation({
    mutationFn: ({ id, cliente }: { id: string; cliente: Partial<Omit<Cliente, 'id' | 'created_at'>> }) =>
      clientesService.updateCliente(id, cliente),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setError(null);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Error al actualizar cliente');
    }
  });

  // Mutation para eliminar cliente
  const deleteClienteMutation = useMutation({
    mutationFn: clientesService.deleteCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setError(null);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Error al eliminar cliente');
    }
  });

  // Mutation para buscar clientes
  const buscarClientesMutation = useMutation({
    mutationFn: clientesService.buscarClientes,
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Error al buscar clientes');
    }
  });

  // Funciones helper
  const createCliente = (cliente: Omit<Cliente, 'id' | 'created_at'>) => {
    return createClienteMutation.mutateAsync(cliente);
  };

  const updateClienteById = (id: string, cliente: Partial<Omit<Cliente, 'id' | 'created_at'>>) => {
    return updateClienteMutation.mutateAsync({ id, cliente });
  };

  const deleteClienteById = (id: string) => {
    return deleteClienteMutation.mutateAsync(id);
  };

  const buscarClientes = (query: string) => {
    return buscarClientesMutation.mutateAsync(query);
  };

  return {
    clientes,
    isLoading,
    error,
    refetch,
    createCliente,
    updateCliente: updateClienteById,
    deleteCliente: deleteClienteById,
    buscarClientes,
    isCreating: createClienteMutation.isPending,
    isUpdating: updateClienteMutation.isPending,
    isDeleting: deleteClienteMutation.isPending,
    isSearching: buscarClientesMutation.isPending
  };
};
