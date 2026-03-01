import { z } from 'zod';

// Enums
export const EstadoPedidoSchema = z.enum(['pendiente', 'entregado', 'cancelado']);
export const TipoProductoSchema = z.enum(['torta', 'cupcake']);
export const TipoMedidaSchema = z.enum(['peso', 'tamano']);

// Cliente Schemas
export const ClienteSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  telefono: z.string().regex(/^\d{10}$/, 'El teléfono debe tener 10 dígitos'),
  direccion: z.string().max(200).optional(),
  created_at: z.string().datetime(),
});

export const CreateClienteSchema = ClienteSchema.omit({ id: true, created_at: true });
export const UpdateClienteSchema = CreateClienteSchema.partial();

// Producto, Sabor, Tamano Schemas
export const ProductoSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(2).max(100),
  descripcion: z.string().max(500).optional(),
  tipo_medida: z.enum(['peso', 'tamano']).optional(),
  created_at: z.string().datetime().optional(),
});

export const SaborSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(2).max(50),
  created_at: z.string().datetime().optional(),
});

export const TamanoSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(2).max(50),
  tipo: TipoMedidaSchema,
  created_at: z.string().datetime().optional(),
});

// PedidoItem Schema
export const PedidoItemSchema = z.object({
  id: z.string().uuid(),
  pedido_id: z.string().uuid(),
  producto_id: z.string().uuid(),
  sabor_id: z.string().uuid().optional().nullable(),
  relleno_id: z.string().uuid().optional().nullable(),
  tamano_id: z.string().uuid().optional().nullable(),
  cantidad: z.number().min(1, 'La cantidad debe ser al menos 1'),
  precio_unitario: z.number().min(0, 'El precio no puede ser negativo'),
  created_at: z.string().datetime().optional(),
  // Relaciones
  producto: ProductoSchema.optional(),
  sabor: SaborSchema.optional(),
  relleno: SaborSchema.optional(),
  tamano: TamanoSchema.optional(),
});

export const CreatePedidoItemSchema = PedidoItemSchema.omit({
  id: true,
  pedido_id: true,
  created_at: true,
  producto: true,
  sabor: true,
  relleno: true,
  tamano: true,
});

// Abono Schema
export const AbonoSchema = z.object({
  id: z.string().uuid(),
  pedido_id: z.string().uuid(),
  monto: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  created_at: z.string().datetime(),
});

export const CreateAbonoSchema = AbonoSchema.omit({ id: true, created_at: true });

// Pedido Schema
export const PedidoSchema = z.object({
  id: z.string().uuid(),
  cliente_nombre: z.string().min(2, 'El nombre del cliente es requerido').max(100),
  cliente_telefono: z.string().regex(/^\d{10}$/, 'El teléfono debe tener 10 dígitos'),
  tipo_producto: TipoProductoSchema,
  peso: z.number().min(0),
  cantidad: z.number().min(1),
  sabor: z.string().min(1),
  descripcion: z.string(),
  precio_total: z.number().min(0),
  estado: EstadoPedidoSchema,
  fecha_entrega: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
  created_at: z.string().datetime(),
  es_domicilio: z.boolean(),
  precio_domicilio: z.number().min(0),
  direccion_envio: z.string().optional(),
  // Relaciones
  cliente: ClienteSchema.optional(),
  abonos: z.array(AbonoSchema).optional(),
  items: z.array(PedidoItemSchema).optional(),
});

export const CreatePedidoSchema = PedidoSchema.omit({
  id: true,
  created_at: true,
  cliente: true,
  abonos: true,
  items: true,
}).extend({
  items: z.array(CreatePedidoItemSchema).min(1, 'Debe incluir al menos un item'),
});

export const UpdatePedidoSchema = CreatePedidoSchema.partial();

// Pedido con detalles calculados
export const PedidoConDetallesSchema = PedidoSchema.extend({
  total_abonado: z.number().min(0),
  saldo_pendiente: z.number(),
});

// Tipos inferidos
export type Cliente = z.infer<typeof ClienteSchema>;
export type CreateCliente = z.infer<typeof CreateClienteSchema>;
export type UpdateCliente = z.infer<typeof UpdateClienteSchema>;

export type Producto = z.infer<typeof ProductoSchema>;
export type Sabor = z.infer<typeof SaborSchema>;
export type Tamano = z.infer<typeof TamanoSchema>;

export type PedidoItem = z.infer<typeof PedidoItemSchema>;
export type CreatePedidoItem = z.infer<typeof CreatePedidoItemSchema>;

export type Abono = z.infer<typeof AbonoSchema>;
export type CreateAbono = z.infer<typeof CreateAbonoSchema>;

export type Pedido = z.infer<typeof PedidoSchema>;
export type CreatePedido = z.infer<typeof CreatePedidoSchema>;
export type UpdatePedido = z.infer<typeof UpdatePedidoSchema>;
export type PedidoConDetalles = z.infer<typeof PedidoConDetallesSchema>;

export type EstadoPedido = z.infer<typeof EstadoPedidoSchema>;
export type TipoProducto = z.infer<typeof TipoProductoSchema>;
export type TipoMedida = z.infer<typeof TipoMedidaSchema>;
