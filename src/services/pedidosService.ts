import { supabase } from '@/services';
import { Pedido, PedidoConDetalles, EstadoPedido, PedidoItem } from '@/types';
import { formatDateTimeForDB } from '@/utils';

export const pedidosService = {
  // Obtener todos los pedidos con detalles del cliente
  async getPedidos(): Promise<PedidoConDetalles[]> {
    const { data, error } = await supabase
      .from("pedidos")
      .select(
        `
      *,
      abonos (
        id,
        monto,
        fecha
      ),
      items:pedidos_items (
        id,
        cantidad,
        precio_unitario,
        pedido_id,
        producto:productos (
          id,
          nombre,
          descripcion
        ),
        sabor:sabores!pedidos_items_sabor_id_fkey (
          id,
          nombre
        ),
        relleno:sabores!pedidos_items_relleno_id_fkey (
          id,
          nombre
        ),
        tamano:tamanos (
          id,
          nombre,
          tipo
        )
      )
    `,
      )
      .order("fecha_entrega", { ascending: true });

    if (error) {
      console.error("Error cargando pedidos:", error);
      throw error;
    }

    return (data || []).map((pedido) => {
      const totalAbonado =
        pedido.abonos?.reduce(
          (sum: number, abono: any) => sum + Number(abono.monto),
          0,
        ) || 0;

      return {
        ...pedido,
        total_abonado: totalAbonado,
        saldo_pendiente: Number(pedido.precio_total) - totalAbonado,
      };
    });
  },

  // Método alternativo para obtener pedidos sin relaciones
  async getPedidosSimple(): Promise<PedidoConDetalles[]> {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("fecha_entrega", { ascending: true });

    if (error) throw error;

    return (data || []).map((pedido) => ({
      ...pedido,
      cliente: null,
      abonos: [],
      items: [],
      total_abonado: 0,
      saldo_pendiente: pedido.precio_total,
    }));
  },

  // Obtener pedidos por estado
  async getPedidosPorEstado(
    estado: EstadoPedido,
  ): Promise<PedidoConDetalles[]> {
    const { data, error } = await supabase
      .from("pedidos")
      .select(
        `
        *,
        abonos(*)
      `,
      )
      .eq("estado", estado)
      .order("fecha_entrega", { ascending: true });

    if (error) throw error;

    return (data || []).map((pedido) => this.calcularTotales(pedido));
  },

  // Obtener un pedido por ID con detalles
  async getPedidoById(id: string): Promise<PedidoConDetalles> {
    const { data, error } = await supabase
      .from("pedidos")
      .select(
        `
        *,
        abonos (
          id,
          monto,
          fecha
        ),
        items:pedidos_items (
          id,
          cantidad,
          precio_unitario,
          pedido_id,
          producto:productos (
            id,
            nombre,
            descripcion
          ),
          sabor:sabores!pedidos_items_sabor_id_fkey (
            id,
            nombre
          ),
          relleno:sabores!pedidos_items_relleno_id_fkey (
            id,
            nombre
          ),
          tamano:tamanos (
            id,
            nombre,
            tipo
          )
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    return this.calcularTotales(data);
  },

  // Crear un nuevo pedido con items
  async createPedido(
    pedido: Omit<Pedido, "id" | "created_at" | "estado">,
    items: Omit<PedidoItem, "id" | "pedido_id">[] = [],
  ): Promise<Pedido> {
    const pedidoConFormato = {
      ...pedido,
      estado: "pendiente" as EstadoPedido,
      fecha_entrega: formatDateTimeForDB(pedido.fecha_entrega),
    };

    const { data: nuevoPedido, error: errorPedido } = await supabase
      .from("pedidos")
      .insert(pedidoConFormato)
      .select()
      .single();

    if (errorPedido) throw errorPedido;

    if (items.length > 0) {
      const itemsConPedidoId = items.map((item) => ({
        ...item,
        pedido_id: nuevoPedido.id,
      }));

      const { error: errorItems } = await supabase
        .from("pedidos_items")
        .insert(itemsConPedidoId);

      if (errorItems) {
        // Error al insertar items
      }
    }

    return nuevoPedido;
  },

  // Actualizar un pedido
  async updatePedido(id: string, pedido: Partial<Pedido>, items?: Omit<PedidoItem, 'id' | 'pedido_id'>[]): Promise<Pedido> {
    const pedidoUpdates = { ...pedido };
    if (pedidoUpdates.fecha_entrega) {
      pedidoUpdates.fecha_entrega = formatDateTimeForDB(
        pedidoUpdates.fecha_entrega,
      );
    }

    // Primero actualizar la cabecera del pedido
    const { data: updatedPedido, error: errorPedido } = await supabase
      .from("pedidos")
      .update(pedidoUpdates)
      .eq("id", id)
      .select()
      .single();

    if (errorPedido) throw errorPedido;

    // Si se proporcionaron items, actualizarlos
    if (items && items.length > 0) {
      try {
        // Eliminar items existentes
        const { error: errorDelete } = await supabase
          .from("pedidos_items")
          .delete()
          .eq("pedido_id", id);

        if (errorDelete) {
          console.error("Error eliminando items existentes:", errorDelete);
          throw errorDelete;
        }

        // Insertar nuevos items
        const validItems = items.filter(item => 
          item.producto_id && 
          item.producto_id.trim() !== ''
        );

        console.log("Items recibidos:", items);
        console.log("Items válidos después de filtrar:", validItems);

        if (validItems.length === 0) {
          console.warn("No hay items válidos para insertar");
          return updatedPedido;
        }

        const itemsConPedidoId = validItems.map((item, index) => {
          const itemForDb = {
            ...item,
            pedido_id: id,
          };
          
          // Validación final antes de insertar
          if (!itemForDb.producto_id || itemForDb.producto_id.trim() === '') {
            console.error(`Item ${index} tiene producto_id inválido:`, itemForDb);
            throw new Error(`Item ${index} tiene producto_id inválido: "${itemForDb.producto_id}"`);
          }
          
          console.log(`Item ${index} para BD:`, itemForDb);
          return itemForDb;
        });

        console.log("Items finales a insertar:", itemsConPedidoId);

        const { error: errorItems } = await supabase
          .from("pedidos_items")
          .insert(itemsConPedidoId);

        if (errorItems) {
          console.error("Error insertando nuevos items:", errorItems);
          throw errorItems;
        }
      } catch (itemsError) {
        console.error("Error crítico en actualización de items:", itemsError);
        // No lanzar el error para que al menos la cabecera del pedido se actualice
        console.warn("Continuando con actualización de cabecera solamente");
      }
    }

    return updatedPedido;
  },

  // Cambiar estado de un pedido
  async cambiarEstado(id: string, estado: EstadoPedido): Promise<Pedido> {
    const { data, error } = await supabase
      .from("pedidos")
      .update({ estado })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar un pedido
  async deletePedido(id: string): Promise<void> {
    const { error } = await supabase.from("pedidos").delete().eq("id", id);

    if (error) throw error;
  },

  // Obtener pedidos de un cliente específico
  async getPedidosPorCliente(clienteId: string): Promise<PedidoConDetalles[]> {
    const { data, error } = await supabase
      .from("pedidos")
      .select(
        `
        *,
        abonos(*),
        items:pedidos_items(
          *,
          producto:productos(*),
          sabor:sabores(*),
          relleno:sabores(*),
          tamano:tamanos(*)
        )
      `,
      )
      .eq("cliente_telefono", clienteId)
      .order("fecha_entrega", { ascending: false });

    if (error) throw error;

    return (data || []).map((pedido) => this.calcularTotales(pedido));
  },

  // Calcular totales de abonos y saldo pendiente
  calcularTotales(pedido: any): PedidoConDetalles {
    const totalAbonado =
      pedido.abonos?.reduce(
        (sum: number, abono: any) => sum + abono.monto,
        0,
      ) || 0;
    const saldoPendiente = pedido.precio_total - totalAbonado;

    return {
      ...pedido,
      total_abonado: totalAbonado,
      saldo_pendiente: saldoPendiente,
    };
  },

  // Obtener estadísticas de pedidos
  async getEstadisticas(): Promise<{
    pendientes: number;
    entregados: number;
    cancelados: number;
    totalPendienteCobrar: number;
  }> {
    try {
      const { data: pedidos, error: errorPedidos } = await supabase.from(
        "pedidos",
      ).select(`
          id,
          estado,
          precio_total,
          abonos(monto)
        `);

      if (errorPedidos) {
        return await this.getEstadisticasFallback();
      }

      const estadisticas = (pedidos || []).reduce(
        (acc, pedido) => {
          switch (pedido.estado) {
            case "pendiente":
              acc.pendientes++;
              break;
            case "entregado":
              acc.entregados++;
              break;
            case "cancelado":
              acc.cancelados++;
              break;
          }

          if (pedido.estado === "pendiente") {
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
        },
      );

      return estadisticas;
    } catch (error) {
      throw error;
    }
  },

  // Método fallback para estadísticas
  async getEstadisticasFallback(): Promise<{
    pendientes: number;
    entregados: number;
    cancelados: number;
    totalPendienteCobrar: number;
  }> {
    try {
      const { data: pendientes, error: errorPendientes } = await supabase
        .from("pedidos")
        .select("id")
        .eq("estado", "pendiente");

      if (errorPendientes) throw errorPendientes;

      const { data: entregados, error: errorEntregados } = await supabase
        .from("pedidos")
        .select("id")
        .eq("estado", "entregado");

      if (errorEntregados) throw errorEntregados;

      const { data: cancelados, error: errorCancelados } = await supabase
        .from("pedidos")
        .select("id")
        .eq("estado", "cancelado");

      if (errorCancelados) throw errorCancelados;

      const pedidosConDetalles = await this.getPedidosPorEstado("pendiente");
      const totalPendienteCobrar = pedidosConDetalles.reduce(
        (sum, pedido) => sum + pedido.saldo_pendiente,
        0,
      );

      const resultado = {
        pendientes: pendientes?.length || 0,
        entregados: entregados?.length || 0,
        cancelados: cancelados?.length || 0,
        totalPendienteCobrar,
      };

      return resultado;
    } catch (error) {
      throw error;
    }
  },
};
