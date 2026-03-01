import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto Supabase
const supabaseUrl = 'https://yfxbkllulqelscvzjbyp.supabase.co';
const supabaseAnonKey = 'sb_publishable_qjLz2aeoZGwAAx-rE28NgQ_yCAQoFqJ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos de datos para las tablas
export interface Database {
  public: {
    Tables: {
      clientes: {
        Row: {
          id: string;
          nombre: string;
          telefono: string;
          direccion?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          telefono: string;
          direccion?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          telefono?: string;
          direccion?: string;
          created_at?: string;
        };
      };
      pedidos: {
        Row: {
          id: string;
          cliente_nombre: string;
          cliente_telefono: string;
          tipo_producto: 'torta' | 'cupcake' | 'combo' | 'galletas' | 'postres';
          peso: number | string;
          cantidad: number;
          sabor: string;
          descripcion: string;
          precio_total: number;
          es_domicilio: boolean;
          precio_domicilio: number;
          direccion_envio?: string;
          estado: 'pendiente' | 'entregado' | 'cancelado';
          fecha_entrega: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          cliente_nombre: string;
          cliente_telefono: string;
          tipo_producto: 'torta' | 'cupcake' | 'combo' | 'galletas' | 'postres';
          peso: number | string;
          cantidad: number;
          sabor: string;
          descripcion: string;
          precio_total: number;
          es_domicilio?: boolean;
          precio_domicilio?: number;
          direccion_envio?: string;
          estado?: 'pendiente' | 'entregado' | 'cancelado';
          fecha_entrega: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          cliente_nombre?: string;
          cliente_telefono?: string;
          tipo_producto?: 'torta' | 'cupcake' | 'combo' | 'galletas' | 'postres';
          peso?: number | string;
          cantidad?: number;
          sabor?: string;
          descripcion?: string;
          precio_total?: number;
          es_domicilio?: boolean;
          precio_domicilio?: number;
          direccion_envio?: string;
          estado?: 'pendiente' | 'entregado' | 'cancelado';
          fecha_entrega?: string;
          created_at?: string;
        };
      };
      productos: {
        Row: {
          id: string;
          nombre: string;
          tipo_producto?: 'torta' | 'cupcake' | 'combo' | 'galletas' | 'postres';
          precio?: number;
          descripcion?: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          tipo_producto?: 'torta' | 'cupcake' | 'combo' | 'galletas' | 'postres';
          precio?: number;
          descripcion?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          tipo_producto?: 'torta' | 'cupcake' | 'combo' | 'galletas' | 'postres';
          precio?: number;
          descripcion?: string;
          created_at?: string;
        };
      };
      sabores: {
        Row: {
          id: string;
          nombre: string;
          descripcion?: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          descripcion?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          descripcion?: string;
          created_at?: string;
        };
      };
      tamanos: {
        Row: {
          id: string;
          nombre: string;
          tipo: 'peso' | 'tamano';
          created_at?: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          tipo: 'peso' | 'tamano';
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          tipo?: 'peso' | 'tamano';
          created_at?: string;
        };
      };
      pedidos_items: {
        Row: {
          id: string;
          pedido_id: string;
          producto_id: string;
          sabor_id?: string | null;
          relleno_id?: string | null;
          tamano_id?: string | null;
          cantidad: number;
          precio_unitario: number;
          created_at?: string;
        };
        Insert: {
          id?: string;
          pedido_id: string;
          producto_id: string;
          sabor_id?: string | null;
          relleno_id?: string | null;
          tamano_id?: string | null;
          cantidad: number;
          precio_unitario: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          pedido_id?: string;
          producto_id?: string;
          sabor_id?: string | null;
          relleno_id?: string | null;
          tamano_id?: string | null;
          cantidad?: number;
          precio_unitario?: number;
          created_at?: string;
        };
      };
      abonos: {
        Row: {
          id: string;
          pedido_id: string;
          monto: number;
          fecha: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          pedido_id: string;
          monto: number;
          fecha: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          pedido_id?: string;
          monto?: number;
          fecha?: string;
          created_at?: string;
        };
      };
    };
  };
}
