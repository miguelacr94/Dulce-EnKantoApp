import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { metadataService } from '@/services';
import { Producto, Sabor, Tamano } from '@/types';
import { useAppStore } from '@/app/store/appStore';

export const useMetadata = () => {
  const queryClient = useQueryClient();
  const { setError } = useAppStore();

  // --- Queries ---
  const { data: productos = [], isLoading: isLoadingProductos, error: productosError } = useQuery({
    queryKey: ['productos'],
    queryFn: metadataService.getProductos,
  });

  // Manejar errores de productos
  React.useEffect(() => {
    if (productosError) {
      console.error('Error cargando productos:', productosError);
      setError('Error al cargar productos: ' + (productosError as Error).message);
    }
  }, [productosError, setError]);


  const { data: sabores = [], isLoading: isLoadingSabores } = useQuery({
    queryKey: ['sabores'],
    queryFn: metadataService.getSabores,
  });

  const { data: tamanos = [], isLoading: isLoadingTamanos } = useQuery({
    queryKey: ['tamanos'],
    queryFn: metadataService.getTamanos,
  });

  // --- Mutations (Productos) ---
  const createProductoMutation = useMutation({
    mutationFn: metadataService.createProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      setError(null);
    },
    onError: (error: any) => setError(error.message),
  });

  const updateProductoMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Producto> }) =>
      metadataService.updateProducto(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      setError(null);
    },
    onError: (error: any) => setError(error.message),
  });

  const deleteProductoMutation = useMutation({
    mutationFn: metadataService.deleteProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      setError(null);
    },
    onError: (error: any) => setError(error.message),
  });

  // --- Mutations (Sabores) ---
  const createSaborMutation = useMutation({
    mutationFn: metadataService.createSabor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sabores'] });
      setError(null);
    },
    onError: (error: any) => setError(error.message),
  });

  const updateSaborMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Sabor> }) =>
      metadataService.updateSabor(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sabores'] });
      setError(null);
    },
    onError: (error: any) => setError(error.message),
  });

  const deleteSaborMutation = useMutation({
    mutationFn: metadataService.deleteSabor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sabores'] });
      setError(null);
    },
    onError: (error: any) => setError(error.message),
  });

  // --- Mutations (Tamaños) ---
  const createTamanoMutation = useMutation({
    mutationFn: metadataService.createTamano,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tamanos'] });
      setError(null);
    },
    onError: (error: any) => setError(error.message),
  });

  const updateTamanoMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Tamano> }) =>
      metadataService.updateTamano(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tamanos'] });
      setError(null);
    },
    onError: (error: any) => setError(error.message),
  });

  const deleteTamanoMutation = useMutation({
    mutationFn: metadataService.deleteTamano,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tamanos'] });
      setError(null);
    },
    onError: (error: any) => setError(error.message),
  });

  return {
    productos,
    sabores,
    tamanos,
    isLoading: isLoadingProductos || isLoadingSabores || isLoadingTamanos,
    createProducto: createProductoMutation.mutateAsync,
    updateProducto: updateProductoMutation.mutateAsync,
    deleteProducto: deleteProductoMutation.mutateAsync,
    createSabor: createSaborMutation.mutateAsync,
    updateSabor: updateSaborMutation.mutateAsync,
    deleteSabor: deleteSaborMutation.mutateAsync,
    createTamano: createTamanoMutation.mutateAsync,
    updateTamano: updateTamanoMutation.mutateAsync,
    deleteTamano: deleteTamanoMutation.mutateAsync,
    refreshMetadata: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['sabores'] });
      queryClient.invalidateQueries({ queryKey: ['tamanos'] });
    }
  };
};
