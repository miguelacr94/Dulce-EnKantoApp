import { supabase } from '@/services';
import { Abono } from '@/types';
import { formatDateForDB } from '@/utils';

export const abonosService = {
  // Obtener todos los abonos de un pedido
  async getAbonosPorPedido(pedidoId: string): Promise<Abono[]> {
    const { data, error } = await supabase
      .from('abonos')
      .select('*')
      .eq('pedido_id', pedidoId)
      .order('fecha', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Crear un nuevo abono
  async createAbono(abono: Omit<Abono, 'id' | 'created_at' | 'fecha'> & { fecha?: string }): Promise<Abono> {
    const abonoConFecha = {
      ...abono,
      fecha: abono.fecha ? formatDateForDB(abono.fecha) : formatDateForDB(new Date())
    };

    const { data, error } = await supabase
      .from('abonos')
      .insert(abonoConFecha)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Actualizar un abono
  async updateAbono(id: string, abono: Partial<Omit<Abono, 'id' | 'created_at'>>): Promise<Abono> {
    const { data, error } = await supabase
      .from('abonos')
      .update(abono)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar un abono
  async deleteAbono(id: string): Promise<void> {
    const { error } = await supabase
      .from('abonos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Validar que el total de abonos no exceda el precio del pedido
  async validarTotalAbonos(pedidoId: string, nuevoMonto: number, excluirAbonoId?: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('abonos')
      .select('id, monto')
      .eq('pedido_id', pedidoId);

    if (error) throw error;

    const totalActual = data?.reduce((sum, abono) => {
      // Si estamos editando, excluimos el abono actual del cálculo
      if (excluirAbonoId && abono.id === excluirAbonoId) {
        return sum;
      }
      return sum + abono.monto;
    }, 0) || 0;

    // Obtener el precio total del pedido
    const { data: pedido, error: errorPedido } = await supabase
      .from('pedidos')
      .select('precio_total')
      .eq('id', pedidoId)
      .single();

    if (errorPedido) throw errorPedido;

    return (totalActual + nuevoMonto) <= pedido.precio_total;
  }
};
