/**
 * Repository Pattern para Productos, Sabores y Tamaños
 * @module features/productos/api
 */

import { supabase } from '@/app/core/database/supabase';
import type {
  Producto,
  Sabor,
  Tamano,
  CrearProductoDTO,
  ActualizarProductoDTO,
  CrearSaborDTO,
  CrearTamanoDTO,
} from '../types/producto.types';

export interface IProductosRepository {
  getAll(): Promise<Producto[]>;
  getById(id: string): Promise<Producto | null>;
  create(producto: CrearProductoDTO): Promise<Producto>;
  update(id: string, producto: ActualizarProductoDTO): Promise<Producto>;
  delete(id: string): Promise<void>;
  getSabores(): Promise<Sabor[]>;
  createSabor(sabor: CrearSaborDTO): Promise<Sabor>;
  updateSabor(id: string, sabor: Partial<Sabor>): Promise<Sabor>;
  deleteSabor(id: string): Promise<void>;
  getTamanos(): Promise<Tamano[]>;
  createTamano(tamano: CrearTamanoDTO): Promise<Tamano>;
  updateTamano(id: string, tamano: Partial<Tamano>): Promise<Tamano>;
  deleteTamano(id: string): Promise<void>;
  getSaboresPorProducto(productoId: string): Promise<Sabor[]>;
  getTamanosPorProducto(productoId: string): Promise<Tamano[]>;
  addSaborAProducto(productoId: string, saborId: string): Promise<void>;
  removeSaborDeProducto(productoId: string, saborId: string): Promise<void>;
  addTamanoAProducto(productoId: string, tamanoId: string): Promise<void>;
  removeTamanoDeProducto(productoId: string, tamanoId: string): Promise<void>;
}

export class ProductosRepository implements IProductosRepository {
  private readonly productosTable = 'productos';
  private readonly saboresTable = 'sabores';
  private readonly tamanosTable = 'tamanos';
  private readonly productosSaboresTable = 'productos_sabores';
  private readonly productosTamanosTable = 'productos_tamanos';

  // ===== PRODUCTOS =====

  async getAll(): Promise<Producto[]> {
    const { data, error } = await supabase
      .from(this.productosTable)
      .select('id, nombre, descripcion, tipo_medida, created_at')
      .order('nombre', { ascending: true });

    if (error) {
      throw new ProductoRepositoryError('Error al cargar productos', error);
    }

    return data || [];
  }

  async getById(id: string): Promise<Producto | null> {
    const { data, error } = await supabase
      .from(this.productosTable)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new ProductoRepositoryError(`Error al obtener producto ${id}`, error);
    }

    return data;
  }

  async create(producto: CrearProductoDTO): Promise<Producto> {
    const { data, error } = await supabase
      .from(this.productosTable)
      .insert(producto)
      .select()
      .single();

    if (error) {
      throw new ProductoRepositoryError('Error al crear producto', error);
    }

    return data;
  }

  async update(id: string, producto: ActualizarProductoDTO): Promise<Producto> {
    const { data, error } = await supabase
      .from(this.productosTable)
      .update(producto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new ProductoRepositoryError(`Error al actualizar producto ${id}`, error);
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.productosTable)
      .delete()
      .eq('id', id);

    if (error) {
      throw new ProductoRepositoryError(`Error al eliminar producto ${id}`, error);
    }
  }

  // ===== SABORES =====

  async getSabores(): Promise<Sabor[]> {
    const { data, error } = await supabase
      .from(this.saboresTable)
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      throw new ProductoRepositoryError('Error al cargar sabores', error);
    }

    return data || [];
  }

  async createSabor(sabor: CrearSaborDTO): Promise<Sabor> {
    const { data, error } = await supabase
      .from(this.saboresTable)
      .insert(sabor)
      .select()
      .single();

    if (error) {
      throw new ProductoRepositoryError('Error al crear sabor', error);
    }

    return data;
  }

  async updateSabor(id: string, sabor: Partial<Sabor>): Promise<Sabor> {
    const { data, error } = await supabase
      .from(this.saboresTable)
      .update(sabor)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new ProductoRepositoryError(`Error al actualizar sabor ${id}`, error);
    }

    return data;
  }

  async deleteSabor(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.saboresTable)
      .delete()
      .eq('id', id);

    if (error) {
      throw new ProductoRepositoryError(`Error al eliminar sabor ${id}`, error);
    }
  }

  // ===== TAMAÑOS =====

  async getTamanos(): Promise<Tamano[]> {
    const { data, error } = await supabase
      .from(this.tamanosTable)
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      throw new ProductoRepositoryError('Error al cargar tamaños', error);
    }

    return data || [];
  }

  async createTamano(tamano: CrearTamanoDTO): Promise<Tamano> {
    const { data, error } = await supabase
      .from(this.tamanosTable)
      .insert(tamano)
      .select()
      .single();

    if (error) {
      throw new ProductoRepositoryError('Error al crear tamaño', error);
    }

    return data;
  }

  async updateTamano(id: string, tamano: Partial<Tamano>): Promise<Tamano> {
    const { data, error } = await supabase
      .from(this.tamanosTable)
      .update(tamano)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new ProductoRepositoryError(`Error al actualizar tamaño ${id}`, error);
    }

    return data;
  }

  async deleteTamano(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tamanosTable)
      .delete()
      .eq('id', id);

    if (error) {
      throw new ProductoRepositoryError(`Error al eliminar tamaño ${id}`, error);
    }
  }

  // ===== RELACIONES =====

  async getSaboresPorProducto(productoId: string): Promise<Sabor[]> {
    const { data, error } = await supabase
      .from(this.productosSaboresTable)
      .select('sabores(*)')
      .eq('producto_id', productoId);

    if (error) {
      throw new ProductoRepositoryError(
        `Error al obtener sabores del producto ${productoId}`,
        error
      );
    }

    return (data || []).map((item: any) => item.sabores);
  }

  async getTamanosPorProducto(productoId: string): Promise<Tamano[]> {
    const { data: producto, error: errorProducto } = await supabase
      .from(this.productosTable)
      .select('tipo_medida')
      .eq('id', productoId)
      .single();

    if (errorProducto) {
      throw new ProductoRepositoryError(
        `Error al obtener producto ${productoId}`,
        errorProducto
      );
    }

    const { data, error } = await supabase
      .from(this.productosTamanosTable)
      .select('tamanos(*)')
      .eq('producto_id', productoId);

    if (error) {
      throw new ProductoRepositoryError(
        `Error al obtener tamaños del producto ${productoId}`,
        error
      );
    }

    const allTamanos = (data || []).map((item: any) => item.tamanos);

    if (producto?.tipo_medida) {
      return allTamanos.filter((tamano: Tamano) => tamano.tipo === producto.tipo_medida);
    }

    return allTamanos;
  }

  async addSaborAProducto(productoId: string, saborId: string): Promise<void> {
    const { error } = await supabase
      .from(this.productosSaboresTable)
      .insert({ producto_id: productoId, sabor_id: saborId });

    if (error) {
      throw new ProductoRepositoryError('Error al agregar sabor al producto', error);
    }
  }

  async removeSaborDeProducto(productoId: string, saborId: string): Promise<void> {
    const { error } = await supabase
      .from(this.productosSaboresTable)
      .delete()
      .match({ producto_id: productoId, sabor_id: saborId });

    if (error) {
      throw new ProductoRepositoryError('Error al remover sabor del producto', error);
    }
  }

  async addTamanoAProducto(productoId: string, tamanoId: string): Promise<void> {
    const { error } = await supabase
      .from(this.productosTamanosTable)
      .insert({ producto_id: productoId, tamano_id: tamanoId });

    if (error) {
      throw new ProductoRepositoryError('Error al agregar tamaño al producto', error);
    }
  }

  async removeTamanoDeProducto(productoId: string, tamanoId: string): Promise<void> {
    const { error } = await supabase
      .from(this.productosTamanosTable)
      .delete()
      .match({ producto_id: productoId, tamano_id: tamanoId });

    if (error) {
      throw new ProductoRepositoryError('Error al remover tamaño del producto', error);
    }
  }
}

export class ProductoRepositoryError extends Error {
  constructor(
    message: string,
    public readonly originalError?: any
  ) {
    super(message);
    this.name = 'ProductoRepositoryError';
  }
}

export const productosRepository = new ProductosRepository();
