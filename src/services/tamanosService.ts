import { supabase } from './supabase';

export interface Tamano {
  id: string;
  nombre: string;
  tipo: 'peso' | 'tamano';
}

export const tamanosService = {
  // Obtener todos los tamaños
  async getTamanos(): Promise<Tamano[]> {
    const { data, error } = await supabase
      .from('tamanos')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error cargando tamaños:', error);
      throw error;
    }

    return data || [];
  },

  // Obtener tamaños por tipo
  async getTamanosPorTipo(tipo: 'peso' | 'tamano'): Promise<Tamano[]> {
    const { data, error } = await supabase
      .from('tamanos')
      .select('*')
      .eq('tipo', tipo)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error cargando tamaños por tipo:', error);
      throw error;
    }

    return data || [];
  },
};
