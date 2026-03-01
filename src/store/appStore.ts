import { create } from 'zustand';
import { Cliente, Pedido, PedidoConDetalles, Abono, EstadoPedido } from '../types';

interface AppStore {
  // Estado
  clientes: Cliente[];
  pedidos: PedidoConDetalles[];
  pedidoActual: PedidoConDetalles | null;
  loading: boolean;
  error: string | null;
  filtroEstado: EstadoPedido | 'todos';

  // Acciones de Clientes
  setClientes: (clientes: Cliente[]) => void;
  addCliente: (cliente: Cliente) => void;
  updateCliente: (cliente: Cliente) => void;
  removeCliente: (id: string) => void;

  // Acciones de Pedidos
  setPedidos: (pedidos: PedidoConDetalles[]) => void;
  addPedido: (pedido: PedidoConDetalles) => void;
  updatePedido: (pedido: PedidoConDetalles) => void;
  removePedido: (id: string) => void;
  setPedidoActual: (pedido: PedidoConDetalles | null) => void;

  // Acciones de Abonos
  addAbono: (pedidoId: string, abono: Abono) => void;
  removeAbono: (pedidoId: string, abonoId: string) => void;

  // Acciones de UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFiltroEstado: (estado: EstadoPedido | 'todos') => void;

  // Utilidades
  reset: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Estado inicial
  clientes: [],
  pedidos: [],
  pedidoActual: null,
  loading: false,
  error: null,
  filtroEstado: 'todos',

  // Acciones de Clientes
  setClientes: (clientes) => set({ clientes }),
  
  addCliente: (cliente) => set((state) => ({
    clientes: [...state.clientes, cliente]
  })),

  updateCliente: (clienteActualizado) => set((state) => ({
    clientes: state.clientes.map(cliente =>
      cliente.id === clienteActualizado.id ? clienteActualizado : cliente
    )
  })),

  removeCliente: (id) => set((state) => ({
    clientes: state.clientes.filter(cliente => cliente.id !== id)
  })),

  // Acciones de Pedidos
  setPedidos: (pedidos) => set({ pedidos }),

  addPedido: (pedido) => set((state) => ({
    pedidos: [...state.pedidos, pedido]
  })),

  updatePedido: (pedidoActualizado) => set((state) => ({
    pedidos: state.pedidos.map(pedido =>
      pedido.id === pedidoActualizado.id ? pedidoActualizado : pedido
    ),
    pedidoActual: state.pedidoActual?.id === pedidoActualizado.id 
      ? pedidoActualizado 
      : state.pedidoActual
  })),

  removePedido: (id) => set((state) => ({
    pedidos: state.pedidos.filter(pedido => pedido.id !== id),
    pedidoActual: state.pedidoActual?.id === id ? null : state.pedidoActual
  })),

  setPedidoActual: (pedido) => set({ pedidoActual: pedido }),

  // Acciones de Abonos
  addAbono: (pedidoId, abono) => set((state) => ({
    pedidos: state.pedidos.map(pedido => {
      if (pedido.id === pedidoId) {
        const abonosActualizados = [...(pedido.abonos || []), abono];
        const totalAbonado = abonosActualizados.reduce((sum, a) => sum + a.monto, 0);
        const saldoPendiente = pedido.precio_total - totalAbonado;
        
        return {
          ...pedido,
          abonos: abonosActualizados,
          total_abonado: totalAbonado,
          saldo_pendiente: saldoPendiente
        };
      }
      return pedido;
    }),
    pedidoActual: state.pedidoActual?.id === pedidoId 
      ? {
          ...state.pedidoActual,
          abonos: [...(state.pedidoActual.abonos || []), abono],
          total_abonado: (state.pedidoActual.total_abonado || 0) + abono.monto,
          saldo_pendiente: state.pedidoActual.saldo_pendiente - abono.monto
        }
      : state.pedidoActual
  })),

  removeAbono: (pedidoId, abonoId) => set((state) => ({
    pedidos: state.pedidos.map(pedido => {
      if (pedido.id === pedidoId) {
        const abonoEliminado = pedido.abonos?.find(a => a.id === abonoId);
        if (!abonoEliminado) return pedido;
        
        const abonosActualizados = pedido.abonos?.filter(a => a.id !== abonoId) || [];
        const totalAbonado = abonosActualizados.reduce((sum, a) => sum + a.monto, 0);
        const saldoPendiente = pedido.precio_total - totalAbonado;
        
        return {
          ...pedido,
          abonos: abonosActualizados,
          total_abonado: totalAbonado,
          saldo_pendiente: saldoPendiente
        };
      }
      return pedido;
    }),
    pedidoActual: state.pedidoActual?.id === pedidoId 
      ? (() => {
          const abonoEliminado = state.pedidoActual.abonos?.find(a => a.id === abonoId);
          if (!abonoEliminado) return state.pedidoActual;
          
          const abonosActualizados = state.pedidoActual.abonos?.filter(a => a.id !== abonoId) || [];
          const totalAbonado = abonosActualizados.reduce((sum, a) => sum + a.monto, 0);
          const saldoPendiente = state.pedidoActual.precio_total - totalAbonado;
          
          return {
            ...state.pedidoActual,
            abonos: abonosActualizados,
            total_abonado: totalAbonado,
            saldo_pendiente: saldoPendiente
          };
        })()
      : state.pedidoActual
  })),

  // Acciones de UI
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFiltroEstado: (estado) => set({ filtroEstado: estado }),

  // Reset
  reset: () => set({
    clientes: [],
    pedidos: [],
    pedidoActual: null,
    loading: false,
    error: null,
    filtroEstado: 'todos'
  })
}));
