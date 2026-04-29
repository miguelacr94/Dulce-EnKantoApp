import { supabase } from './supabase';
import { Insumo, InsumoCreate, InsumoUpdate, InsumoTamano } from '@/features/insumos/types';

export const insumosService = {
  // Query principal: Obtiene insumos y sus stocks relacionados por tamaño/peso
  async getInsumosConStock(): Promise<Insumo[]> {
    const { data, error } = await supabase
      .from('insumo')
      .select(`
        *,
        insumo_tamanos (
          id,
          insumo_id,
          tamano_id,
          cantidad,
          tamano:tamanos (
            id,
            nombre,
            tipo
          )
        )
      `)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error fetching insumos with stock:', error);
      throw error;
    }

    return (data || []).map((insumo: any) => ({
      ...insumo,
      insumo_tamanos: insumo.insumo_tamanos?.map((it: any) => ({
        ...it,
        tamano: Array.isArray(it.tamano) ? it.tamano[0] : it.tamano
      }))
    }));
  },

  // 1️⃣ Crear Insumo
  async createInsumo(newInsumo: InsumoCreate): Promise<Insumo> {
    const { data, error } = await supabase
      .from('insumo')
      .insert(newInsumo)
      .select()
      .single();

    if (error) {
      console.error('Error creating insumo:', error);
      throw error;
    }

    return data;
  },

  // 1️⃣️⃣ Actualizar Insumo
  async updateInsumo(id: number, updates: InsumoUpdate): Promise<Insumo> {
    const { data, error } = await supabase
      .from('insumo')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating insumo:', error);
      throw error;
    }

    return data;
  },

  // 2️⃣ Obtener stock actual de un insumo
  async getStockByInsumoId(insumoId: number): Promise<InsumoTamano[]> {
    const { data, error } = await supabase
      .from('insumo_tamanos')
      .select(`
        id,
        insumo_id,
        tamano_id,
        cantidad,
        tamano:tamanos (
          id,
          nombre,
          tipo
        )
      `)
      .eq('insumo_id', insumoId);

    if (error) {
      console.error('Error fetching stock by insumo:', error);
      throw error;
    }

    return (data || []).map((it: any) => ({
      ...it,
      tamano: Array.isArray(it.tamano) ? it.tamano[0] : it.tamano
    }));
  },

  // 3️⃣ Guardar Stock (Upsert - Actualiza si existe, inserta si no)
  // Nota: Para que upsert funcione sin ID, la tabla debería tener un constraint de unicidad (insumo_id, tamano_id)
  async upsertStock(stocks: { id?: string, insumo_id: number, tamano_id: string, cantidad: number }[]): Promise<void> {
    // IMPORTANTE: Para evitar el error "null value in column id violates not-null constraint",
    // debemos omitir la propiedad 'id' en los objetos que no lo tengan para que la DB use el DEFAULT.
    const cleanStocks = stocks.map(stock => {
      const { id, ...rest } = stock;
      return id ? { id, ...rest } : rest;
    });

    const { error } = await supabase
      .from('insumo_tamanos')
      .upsert(cleanStocks, { onConflict: 'insumo_id, tamano_id' });

    if (error) {
      console.error('Error upserting stock:', error);
      
      // Fallback manual si el upsert masivo falla
      for (const stock of cleanStocks) {
        if ('id' in stock) {
          await supabase.from('insumo_tamanos').update({ cantidad: stock.cantidad }).eq('id', stock.id);
        } else {
          await supabase.from('insumo_tamanos').insert(stock);
        }
      }
    }
  },

  // Obtener todos los tamaños posibles por tipo
  async getTamanosPorTipo(tipo: 'peso' | 'tamano'): Promise<any[]> {
    const { data, error } = await supabase
      .from('tamanos')
      .select('*')
      .eq('tipo', tipo)
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async deleteInsumo(id: number): Promise<void> {
    const { error } = await supabase.from('insumo').delete().eq('id', id);
    if (error) throw error;
  },
  // Descontar stock basado en un pedido entregado y sus switches seleccionados (Legacy - Mantener por compatibilidad)
  async descontarStockPorPedido(items: any[], checkedInsumos: Record<string, boolean>): Promise<void> {
    try {
      for (const item of items) {
        const tamanoId = item.tamano_id || item.tamano?.id;
        if (!tamanoId) continue;

        const { data: stockRecords, error: fetchError } = await supabase
          .from('insumo_tamanos')
          .select('id, insumo_id, cantidad')
          .eq('tamano_id', tamanoId);

        if (fetchError) throw fetchError;
        if (!stockRecords || stockRecords.length === 0) continue;

        for (const record of stockRecords) {
          const key = `${item.id}_${record.insumo_id}`;
          const isChecked = checkedInsumos[key] !== false;

          if (isChecked) {
            const nuevaCantidad = Math.max(0, record.cantidad - (item.cantidad || 1));
            await supabase.from('insumo_tamanos').update({ cantidad: nuevaCantidad }).eq('id', record.id);
          }
        }
      }
    } catch (error) {
      console.error('Error descontando stock:', error);
      throw error;
    }
  },

  // 4️⃣ Descontar stock de forma manual y dinámica (NUEVO)
  async descontarStockManual(descuentos: { insumo_tamano_id: string, cantidadADescontar: number }[]): Promise<void> {
    try {
      for (const desc of descuentos) {
        // 1. Obtener stock actual
        const { data, error: fetchError } = await supabase
          .from('insumo_tamanos')
          .select('cantidad')
          .eq('id', desc.insumo_tamano_id)
          .single();

        if (fetchError) throw fetchError;

        // 2. Calcular y actualizar
        const nuevaCantidad = Math.max(0, (data?.cantidad || 0) - desc.cantidadADescontar);
        
        const { error: updateError } = await supabase
          .from('insumo_tamanos')
          .update({ cantidad: nuevaCantidad })
          .eq('id', desc.insumo_tamano_id);

        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Error en descontarStockManual:', error);
      throw error;
    }
  },

  // 5️⃣ Devolver stock al inventario (Sumar)
  async devolverStockManual(devoluciones: { insumo_tamano_id: string, cantidadADevolver: number }[]): Promise<void> {
    try {
      for (const dev of devoluciones) {
        // 1. Obtener stock actual
        const { data, error: fetchError } = await supabase
          .from('insumo_tamanos')
          .select('cantidad')
          .eq('id', dev.insumo_tamano_id)
          .single();

        if (fetchError) throw fetchError;

        // 2. Calcular y sumar
        const nuevaCantidad = (data?.cantidad || 0) + dev.cantidadADevolver;
        
        const { error: updateError } = await supabase
          .from('insumo_tamanos')
          .update({ cantidad: nuevaCantidad })
          .eq('id', dev.insumo_tamano_id);

        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Error en devolverStockManual:', error);
      throw error;
    }
  }
};
