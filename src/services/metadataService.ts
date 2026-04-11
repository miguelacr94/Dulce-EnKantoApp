import { supabase } from './supabase';
import { Producto, Sabor, Tamano } from '@/types';

export const metadataService = {
  // --- PRODUCTOS ---
  async getProductos(): Promise<Producto[]> {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('id, nombre, descripcion, tipo_medida, created_at')
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error en consulta de productos:', error);
        throw error;
      }
      
      const productos = data || [];
      
      return productos;
    } catch (error) {
      console.error('Error completo en getProductos:', error);
      throw error;
    }
  },

  async createProducto(producto: Omit<Producto, 'id' | 'created_at'>): Promise<Producto> {
    const { data, error } = await supabase
      .from('productos')
      .insert(producto)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProducto(id: string, updates: Partial<Producto>): Promise<Producto> {
    const { data, error } = await supabase
      .from('productos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProducto(id: string): Promise<void> {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // --- SABORES ---
  async getSabores(): Promise<Sabor[]> {
    const { data, error } = await supabase
      .from('sabores')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createSabor(sabor: Omit<Sabor, 'id' | 'created_at'>): Promise<Sabor> {
    const { data, error } = await supabase
      .from('sabores')
      .insert(sabor)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSabor(id: string, updates: Partial<Sabor>): Promise<Sabor> {
    const { data, error } = await supabase
      .from('sabores')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSabor(id: string): Promise<void> {
    const { error } = await supabase
      .from('sabores')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // --- TAMAÑOS ---
  async getTamanos(): Promise<Tamano[]> {
    const { data, error } = await supabase
      .from('tamanos')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createTamano(tamano: Omit<Tamano, 'id' | 'created_at'>): Promise<Tamano> {
    const { data, error } = await supabase
      .from('tamanos')
      .insert(tamano)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTamano(id: string, updates: Partial<Tamano>): Promise<Tamano> {
    const { data, error } = await supabase
      .from('tamanos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTamano(id: string): Promise<void> {
    const { error } = await supabase
      .from('tamanos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // --- RELACIONES ---
  async getSaboresPorProducto(productoId: string): Promise<Sabor[]> {
    const { data, error } = await supabase
      .from('productos_sabores')
      .select('sabores(*)')
      .eq('producto_id', productoId);

    if (error) throw error;
    return (data || []).map((item: any) => item.sabores);
  },

  async getTamanosPorProducto(productoId: string): Promise<Tamano[]> {
    try {
      // Primero obtener el producto para saber su tipo_medida
      const { data: producto, error: errorProducto } = await supabase
        .from('productos')
        .select('tipo_medida, nombre')
        .eq('id', productoId)
        .single();

      if (errorProducto) throw errorProducto;

      // Obtener los tamaños del producto
      const { data, error } = await supabase
        .from('productos_tamanos')
        .select('tamanos(*)')
        .eq('producto_id', productoId);

      if (error) throw error;

      // Filtrar los tamaños por el tipo_medida del producto
      const allTamanos = (data || []).map((item: any) => item.tamanos);
      let filteredTamanos = allTamanos;
      
      if (producto?.tipo_medida) {
        filteredTamanos = allTamanos.filter((tamano: Tamano) => {
          return tamano.tipo === producto.tipo_medida;
        });
      }
      
      return filteredTamanos;
    } catch (error) {
      console.error('Error en getTamanosPorProducto:', error);
      throw error;
    }
  },

  async addSaborAProducto(productoId: string, saborId: string): Promise<void> {
    const { error } = await supabase
      .from('productos_sabores')
      .insert({ producto_id: productoId, sabor_id: saborId });

    if (error) throw error;
  },

  async removeSaborDeProducto(productoId: string, saborId: string): Promise<void> {
    const { error } = await supabase
      .from('productos_sabores')
      .delete()
      .match({ producto_id: productoId, sabor_id: saborId });

    if (error) throw error;
  },

  async addTamanoAProducto(productoId: string, tamanoId: string): Promise<void> {
    const { error } = await supabase
      .from('productos_tamanos')
      .insert({ producto_id: productoId, tamano_id: tamanoId });

    if (error) throw error;
  },

  async removeTamanoDeProducto(productoId: string, tamanoId: string): Promise<void> {
    const { error } = await supabase
      .from('productos_tamanos')
      .delete()
      .match({ producto_id: productoId, tamano_id: tamanoId });

    if (error) throw error;
  }
};
