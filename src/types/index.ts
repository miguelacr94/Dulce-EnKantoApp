export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  direccion?: string;
  created_at: string;
}

export interface Producto {
  id: string;
  nombre: string;
  tipo_producto?: TipoProducto;
  precio?: number;
  descripcion?: string;
  tipo_medida?: 'peso' | 'tamano';
  created_at?: string;
}

export interface Sabor {
  id: string;
  nombre: string;
  created_at?: string;
}

export interface Tamano {
  id: string;
  nombre: string;
  tipo: 'peso' | 'tamano';
  created_at?: string;
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

export interface Pedido {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  tipo_producto: TipoProducto;
  peso: number | string;
  cantidad: number;
  sabor: string;
  descripcion: string;
  precio_total: number;
  precio_domicilio: number;
  es_domicilio: boolean;
  direccion_envio?: string;
  estado: EstadoPedido;
  fecha_entrega: string;
  created_at: string;
  cliente?: Cliente;
  abonos?: Abono[];
  items?: PedidoItem[];
}

export interface Abono {
  id: string;
  pedido_id: string;
  monto: number;
  fecha: string;
  created_at: string;
}

export interface PedidoConDetalles extends Pedido {
  total_abonado: number;
  saldo_pendiente: number;
}

export type EstadoPedido = 'pendiente' | 'entregado' | 'cancelado';
export type TipoProducto = 'torta' | 'cupcake' | 'combo' | 'galletas' | 'postres';
