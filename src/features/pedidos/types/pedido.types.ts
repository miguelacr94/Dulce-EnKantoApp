/**
 * Tipos de dominio para la feature Pedidos
 * @module features/pedidos/types
 */

export type EstadoPedido = 'pendiente' | 'entregado' | 'cancelado';

export interface Pedido {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  tipo_producto: 'torta' | 'cupcake';
  peso: number;
  sabor: string;
  descripcion: string;
  precio_total: number;
  estado: EstadoPedido;
  fecha_entrega: string;
  created_at: string;
  cantidad: number;
  es_domicilio: boolean;
  precio_domicilio: number;
  direccion_envio?: string;
}

export interface Abono {
  id: string;
  pedido_id: string;
  monto: number;
  fecha: string;
  created_at: string;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  created_at?: string;
}

export interface Sabor {
  id: string;
  nombre: string;
  tipo: 'Sabor' | 'Relleno' | 'Todos';
  created_at?: string;
}

export interface Tamano {
  id: string;
  nombre: string;
  tipo: 'peso' | 'tamano';
  created_at?: string;
  insumos_relacionados?: {
    cantidad: number;
    insumo: {
      id: string;
      nombre: string;
      medida: string;
    };
  }[];
}

export interface PedidoItem {
  id: string;
  pedido_id: string;
  producto_id: string;
  sabor_id?: string | null;
  relleno_id?: string | null;
  tamano_id?: string | null;
  cantidad: number;
  precio_unitario: number;
  created_at?: string;
  producto?: Producto;
  sabor?: Sabor;
  relleno?: Sabor;
  tamano?: Tamano;
}

export interface PedidoConDetalles extends Pedido {
  total_abonado: number;
  saldo_pendiente: number;
  abonos?: Abono[];
  items?: PedidoItem[];
}

export interface CrearPedidoDTO {
  cliente_nombre: string;
  cliente_telefono: string;
  tipo_producto: 'torta' | 'cupcake';
  peso: number;
  cantidad: number;
  sabor: string;
  descripcion: string;
  precio_total: number;
  precio_domicilio: number;
  es_domicilio: boolean;
  direccion_envio?: string;
  fecha_entrega: string;
}

export interface ActualizarPedidoDTO {
  cliente_nombre?: string;
  cliente_telefono?: string;
  tipo_producto?: 'torta' | 'cupcake';
  peso?: number;
  cantidad?: number;
  sabor?: string;
  descripcion?: string;
  precio_total?: number;
  precio_domicilio?: number;
  es_domicilio?: boolean;
  direccion_envio?: string;
  fecha_entrega?: string;
  estado?: EstadoPedido;
}

export interface CrearPedidoItemDTO {
  producto_id: string;
  sabor_id: string | null;
  relleno_id: string | null;
  tamano_id: string | null; // Puede ser null si el producto no tiene tipo_medida
  cantidad: number;
  precio_unitario: number;
}

export interface EstadisticasPedidos {
  pendientes: number;
  entregados: number;
  cancelados: number;
  totalPendienteCobrar: number;
  totalIngresosReal: number;
}
