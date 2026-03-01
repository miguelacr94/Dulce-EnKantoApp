/**
 * Tipos de dominio para la feature Productos
 * @module features/productos/types
 */

export type TipoProducto = 'torta' | 'cupcake';
export type TipoMedida = 'peso' | 'tamano';
export type TipoTamano = 'peso' | 'tamano';

export interface Producto {
  id: string;
  nombre: string;
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
  tipo: TipoTamano;
  created_at?: string;
}

export interface ProductoSabor {
  producto_id: string;
  sabor_id: string;
  sabores?: Sabor;
}

export interface ProductoTamano {
  producto_id: string;
  tamano_id: string;
  tamanos?: Tamano;
}

export interface ProductoConRelaciones extends Producto {
  sabores: Sabor[];
  tamanos: Tamano[];
}

export interface CrearProductoDTO {
  nombre: string;
  descripcion?: string;
  tipo_medida?: 'peso' | 'tamano';
}

export interface ActualizarProductoDTO {
  nombre?: string;
  descripcion?: string;
  tipo_medida?: 'peso' | 'tamano';
}

export interface CrearSaborDTO {
  nombre: string;
}

export interface CrearTamanoDTO {
  nombre: string;
  tipo: TipoTamano;
}
