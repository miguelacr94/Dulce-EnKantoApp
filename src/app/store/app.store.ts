import { create } from 'zustand';
import { EstadoPedido } from '@/app/core/validation';

interface AppState {
  // UI State
  filtroEstado: EstadoPedido | 'todos';
  isOffline: boolean;
  
  // Actions
  setFiltroEstado: (estado: EstadoPedido | 'todos') => void;
  setIsOffline: (isOffline: boolean) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  filtroEstado: 'todos' as EstadoPedido | 'todos',
  isOffline: false,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  
  setFiltroEstado: (filtroEstado) => set({ filtroEstado }),
  setIsOffline: (isOffline) => set({ isOffline }),
  
  reset: () => set(initialState),
}));
