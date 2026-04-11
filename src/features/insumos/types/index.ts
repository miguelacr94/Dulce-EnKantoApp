export interface Tamano {
  id: string; // UUID according to SQL
  nombre: string;
  tipo: 'peso' | 'tamano';
}

export interface Insumo {
  id: number; // Integer according to SQL
  nombre: string;
  medida: 'peso' | 'tamano';
  insumo_tamanos?: InsumoTamano[];
}

export interface InsumoTamano {
  id: string; // UUID according to SQL
  insumo_id: number;
  tamano_id: string;
  cantidad: number;
  tamano?: Tamano; // Joined data
}

export interface InsumoCreate {
  nombre: string;
  medida: 'peso' | 'tamano';
}

export interface InsumoUpdate {
  nombre?: string;
  medida?: 'peso' | 'tamano';
}
