export interface Gasto {
  id: string;
  categoria: string;
  descripcion: string | null;
  fecha: string; // Formato YYYY-MM-DD
  monto: number;
  created_at: string;
}

export type CrearGastoDTO = Omit<Gasto, 'id' | 'created_at'>;
export type EditarGastoDTO = Partial<CrearGastoDTO> & { id: string };
