import { supabase } from '@/app/core/database/supabase';
import { Gasto, CrearGastoDTO, EditarGastoDTO } from '../types/gasto.types';

export const gastosRepository = {
  async getAll(): Promise<Gasto[]> {
    const { data, error } = await supabase
      .from('gasto')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(gasto: CrearGastoDTO): Promise<Gasto> {
    const { data, error } = await supabase
      .from('gasto')
      .insert(gasto)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(gasto: EditarGastoDTO): Promise<Gasto> {
    const { id, ...updates } = gasto;
    const { data, error } = await supabase
      .from('gasto')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('gasto')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getById(id: string): Promise<Gasto> {
    const { data, error } = await supabase
      .from('gasto')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getTotalSum(): Promise<number> {
    const { data, error } = await supabase
      .from('gasto')
      .select('monto');

    if (error) throw error;
    return (data || []).reduce((sum, item) => sum + Number(item.monto), 0);
  }
};
