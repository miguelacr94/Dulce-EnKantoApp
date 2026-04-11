import { useState, useCallback, useEffect } from 'react';
import { insumosService } from '@/services/insumosService';
import { Insumo, InsumoCreate, InsumoUpdate, InsumoTamano, Tamano } from '@/features/insumos/types';

export const useInsumos = () => {
    const [insumos, setInsumos] = useState<Insumo[]>([]);
    const [tamanosDisponibles, setTamanosDisponibles] = useState<Tamano[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar todos los insumos con su stock
    const loadInsumos = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await insumosService.getInsumosConStock();
            setInsumos(data);
        } catch (err) {
            setError('No se pudo cargar el inventario');
            console.error('Error loadInsumos', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 1️⃣ Cargar Tamaños por Tipo de Medida
    const loadTamanosPorTipo = async (tipo: 'peso' | 'tamano') => {
        setIsLoading(true);
        try {
            const data = await insumosService.getTamanosPorTipo(tipo);
            setTamanosDisponibles(data);
            return data;
        } catch (err) {
            console.error('Error loading tamanos', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // 2️⃣ Cargar Stock Actual de un Insumo
    const loadStockPropio = async (insumoId: number) => {
        try {
            return await insumosService.getStockByInsumoId(insumoId);
        } catch (err) {
            console.error('Error loading current stock', err);
            throw err;
        }
    };

    // 3️⃣ Guardar Todo el Stock de un Insumo (Insert/Update)
    const saveStockBulk = async (stocksToUpsert: { id?: string, insumo_id: number, tamano_id: string, cantidad: number }[]) => {
        setIsLoading(true);
        setError(null);
        try {
            await insumosService.upsertStock(stocksToUpsert);
            // Actualizar el estado local para reflejar los cambios
            await loadInsumos();
        } catch (err) {
            setError('Error al guardar el stock');
            console.error('Error saveStockBulk', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Crear Insumo
    const createInsumo = async (newInsumo: InsumoCreate) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await insumosService.createInsumo(newInsumo);
            await loadInsumos();
            return data;
        } catch (err) {
            setError('Error al crear el insumo');
            console.error('Error createInsumo', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Actualizar Insumo
    const updateInsumo = async ({ id, updates }: { id: number; updates: InsumoUpdate }) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await insumosService.updateInsumo(id, updates);
            await loadInsumos();
            return data;
        } catch (err) {
            setError('Error al actualizar el insumo');
            console.error('Error updateInsumo', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Eliminar Insumo
    const deleteInsumo = async (id: number) => {
        setIsLoading(true);
        try {
            await insumosService.deleteInsumo(id);
            setInsumos(prev => prev.filter(insumo => insumo.id !== id));
        } catch (err) {
            setError('Error al eliminar');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        insumos,
        tamanosDisponibles,
        isLoading,
        error,
        loadInsumos,
        loadTamanosPorTipo,
        loadStockPropio,
        saveStockBulk,
        createInsumo,
        updateInsumo,
        deleteInsumo
    };
};
