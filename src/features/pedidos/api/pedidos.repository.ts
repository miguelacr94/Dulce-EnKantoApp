/**
 * Repository Pattern para Pedidos
 * Implementa el principio de Dependency Inversion
 * @module features/pedidos/api
 */

import { supabase } from '@/app/core/database/supabase';
import type {
  Pedido,
  PedidoConDetalles,
  EstadoPedido,
  PedidoItem,
  CrearPedidoDTO,
  ActualizarPedidoDTO,
  CrearPedidoItemDTO,
  EstadisticasPedidos,
} from '../types/pedido.types';
import { formatDateTimeForDB } from '@/utils';

// Interfaz que define el contrato del repositorio
export interface IPedidosRepository {
  getAll(): Promise<PedidoConDetalles[]>;
  getById(id: string): Promise<PedidoConDetalles | null>;
  getByEstado(estado: EstadoPedido): Promise<PedidoConDetalles[]>;
  getByCliente(telefono: string): Promise<PedidoConDetalles[]>;
  create(pedido: CrearPedidoDTO, items: CrearPedidoItemDTO[]): Promise<Pedido>;
  update(id: string, pedido: ActualizarPedidoDTO, items?: CrearPedidoItemDTO[]): Promise<Pedido>;
  delete(id: string): Promise<void>;
  cambiarEstado(id: string, estado: EstadoPedido): Promise<Pedido>;
  getEstadisticas(): Promise<EstadisticasPedidos>;
}

/**
 * Implementación del repositorio de pedidos con Supabase
 * @implements {IPedidosRepository}
 */
export class PedidosRepository implements IPedidosRepository {
  private readonly tableName = 'pedidos';
  private readonly itemsTableName = 'pedidos_items';

  /**
   * Query completa con todas las relaciones
   */
  private get fullQuery() {
    return `
      *,
      abonos (
        id,
        monto,
        fecha
      ),
      items:${this.itemsTableName} (
        id,
        cantidad,
        precio_unitario,
        pedido_id,
        producto:productos (
          id,
          nombre,
          descripcion
        ),
        sabor:sabores!${this.itemsTableName}_sabor_id_fkey (
          id,
          nombre
        ),
        relleno:sabores!${this.itemsTableName}_relleno_id_fkey (
          id,
          nombre
        ),
        tamano:tamanos (
          id,
          nombre,
          tipo
        )
      )
    `;
  }

  /**
   * Obtener todos los pedidos con detalles
   */
  async getAll(): Promise<PedidoConDetalles[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(this.fullQuery)
      .order('fecha_entrega', { ascending: true });

    if (error) {
      throw new PedidoRepositoryError('Error al cargar pedidos', error);
    }

    return (data || []).map((pedido) => this.calcularTotales(pedido));
  }

  /**
   * Obtener un pedido por ID
   */
  async getById(id: string): Promise<PedidoConDetalles | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(this.fullQuery)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new PedidoRepositoryError(`Error al obtener pedido ${id}`, error);
    }

    return this.calcularTotales(data);
  }

  /**
   * Obtener pedidos por estado
   */
  async getByEstado(estado: EstadoPedido): Promise<PedidoConDetalles[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(this.fullQuery)
      .eq('estado', estado)
      .order('fecha_entrega', { ascending: true });

    if (error) {
      throw new PedidoRepositoryError(`Error al obtener pedidos por estado ${estado}`, error);
    }

    return (data || []).map((pedido) => this.calcularTotales(pedido));
  }

  /**
   * Obtener pedidos por teléfono de cliente
   */
  async getByCliente(telefono: string): Promise<PedidoConDetalles[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(this.fullQuery)
      .eq('cliente_telefono', telefono)
      .order('fecha_entrega', { ascending: false });

    if (error) {
      throw new PedidoRepositoryError(`Error al obtener pedidos del cliente ${telefono}`, error);
    }

    return (data || []).map((pedido) => this.calcularTotales(pedido));
  }

  /**
   * Crear un nuevo pedido con items
   */
  async create(
    pedido: CrearPedidoDTO,
    items: CrearPedidoItemDTO[]
  ): Promise<Pedido> {
    const pedidoConFormato = {
      ...pedido,
      estado: 'pendiente' as EstadoPedido,
      fecha_entrega: formatDateTimeForDB(pedido.fecha_entrega),
    };

    const { data: nuevoPedido, error: errorPedido } = await supabase
      .from(this.tableName)
      .insert(pedidoConFormato)
      .select()
      .single();

    if (errorPedido) {
      throw new PedidoRepositoryError('Error al crear pedido', errorPedido);
    }

    if (items.length > 0) {
      const itemsConPedidoId = items.map((item) => ({
        ...item,
        pedido_id: nuevoPedido.id,
        // Convertir strings vacíos a null para UUID fields
        sabor_id: item.sabor_id === '' ? null : item.sabor_id,
        relleno_id: item.relleno_id === '' ? null : item.relleno_id,
        tamano_id: item.tamano_id === '' ? null : item.tamano_id,
      }));

      const { error: errorItems } = await supabase
        .from(this.itemsTableName)
        .insert(itemsConPedidoId);

      if (errorItems) {
        console.error('Error al insertar items:', errorItems);
      }
    }

    return nuevoPedido;
  }

  /**
   * Actualizar un pedido
   */
  async update(
    id: string,
    pedido: ActualizarPedidoDTO,
    items?: CrearPedidoItemDTO[]
  ): Promise<Pedido> {
    const pedidoUpdates = { ...pedido };
    if (pedidoUpdates.fecha_entrega) {
      pedidoUpdates.fecha_entrega = formatDateTimeForDB(pedidoUpdates.fecha_entrega);
    }

    const { data: updatedPedido, error: errorPedido } = await supabase
      .from(this.tableName)
      .update(pedidoUpdates)
      .eq('id', id)
      .select()
      .single();

    if (errorPedido) {
      throw new PedidoRepositoryError(`Error al actualizar pedido ${id}`, errorPedido);
    }

    if (items && items.length > 0) {
      await this.actualizarItems(id, items);
    }

    return updatedPedido;
  }

  /**
   * Eliminar un pedido
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new PedidoRepositoryError(`Error al eliminar pedido ${id}`, error);
    }
  }

  /**
   * Cambiar estado de un pedido
   */
  async cambiarEstado(id: string, estado: EstadoPedido): Promise<Pedido> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ estado })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new PedidoRepositoryError(`Error al cambiar estado del pedido ${id}`, error);
    }

    return data;
  }

  /**
   * Obtener estadísticas de pedidos
   */
  async getEstadisticas(): Promise<EstadisticasPedidos> {
    const { data: pedidos, error } = await supabase
      .from(this.tableName)
      .select(`
        id,
        estado,
        precio_total,
        abonos(monto)
      `);

    if (error) {
      throw new PedidoRepositoryError('Error al obtener estadísticas', error);
    }

    return (pedidos || []).reduce(
      (acc, pedido) => {
        switch (pedido.estado) {
          case 'pendiente':
            acc.pendientes++;
            break;
          case 'entregado':
            acc.entregados++;
            break;
          case 'cancelado':
            acc.cancelados++;
            break;
        }

        if (pedido.estado === 'pendiente') {
          const totalAbonado =
            pedido.abonos?.reduce((sum, abono) => sum + abono.monto, 0) || 0;
          acc.totalPendienteCobrar += pedido.precio_total - totalAbonado;
        }

        return acc;
      },
      {
        pendientes: 0,
        entregados: 0,
        cancelados: 0,
        totalPendienteCobrar: 0,
      }
    );
  }

  /**
   * Método privado para actualizar items de un pedido
   */
  private async actualizarItems(
    pedidoId: string,
    items: CrearPedidoItemDTO[]
  ): Promise<void> {
    try {
      const { error: errorDelete } = await supabase
        .from(this.itemsTableName)
        .delete()
        .eq('pedido_id', pedidoId);

      if (errorDelete) {
        throw new PedidoRepositoryError('Error al eliminar items existentes', errorDelete);
      }

      const validItems = items.filter(
        (item) => item.producto_id && item.producto_id.trim() !== ''
      );

      if (validItems.length === 0) return;

      const itemsConPedidoId = validItems.map((item) => ({
        ...item,
        pedido_id: pedidoId,
        // Convertir strings vacíos a null para UUID fields
        sabor_id: item.sabor_id === '' ? null : item.sabor_id,
        relleno_id: item.relleno_id === '' ? null : item.relleno_id,
        tamano_id: item.tamano_id === '' ? null : item.tamano_id,
      }));

      console.log('=== INSERTANDO ITEMS EN PEDIDOS_ITEMS ===');
      console.log('Items a insertar:', JSON.stringify(itemsConPedidoId, null, 2));

      const { error: errorItems } = await supabase
        .from(this.itemsTableName)
        .insert(itemsConPedidoId);

      if (errorItems) {
        console.error('Error detallado al insertar items:', errorItems);
        throw new PedidoRepositoryError('Error al insertar nuevos items', errorItems);
      } else {
        console.log('✅ Items insertados correctamente');
      }
    } catch (error) {
      console.error('Error en actualización de items:', error);
    }
  }

  /**
   * Calcular totales de abonos y saldo pendiente
   */
  private calcularTotales(pedido: any): PedidoConDetalles {
    const totalAbonado =
      pedido.abonos?.reduce(
        (sum: number, abono: any) => sum + abono.monto,
        0
      ) || 0;
    const saldoPendiente = pedido.precio_total - totalAbonado;

    return {
      ...pedido,
      total_abonado: totalAbonado,
      saldo_pendiente: saldoPendiente,
    };
  }
}

/**
 * Error específico del repositorio de pedidos
 */
export class PedidoRepositoryError extends Error {
  constructor(
    message: string,
    public readonly originalError?: any
  ) {
    super(message);
    this.name = 'PedidoRepositoryError';
  }
}

// Instancia singleton del repositorio
export const pedidosRepository = new PedidosRepository();
