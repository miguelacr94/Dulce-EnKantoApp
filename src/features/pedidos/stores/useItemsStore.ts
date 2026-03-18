import { create } from 'zustand';
import { CrearPedidoItemDTO } from '../types';

interface ItemsStore {
  // Items para el formulario de creación
  crearItems: CrearPedidoItemDTO[];
  // Items para el formulario de edición
  editarItems: CrearPedidoItemDTO[];
  
  // Acciones para items de creación
  setCrearItems: (items: CrearPedidoItemDTO[]) => void;
  addCrearItem: (item: CrearPedidoItemDTO) => void;
  updateCrearItem: (index: number, item: CrearPedidoItemDTO) => void;
  removeCrearItem: (index: number) => void;
  clearCrearItems: () => void;
  
  // Acciones para items de edición
  setEditarItems: (items: CrearPedidoItemDTO[]) => void;
  addEditarItem: (item: CrearPedidoItemDTO) => void;
  updateEditarItem: (index: number, item: CrearPedidoItemDTO) => void;
  removeEditarItem: (index: number) => void;
  clearEditarItems: () => void;
}

export const useItemsStore = create<ItemsStore>((set, get) => ({
  // Estado inicial
  crearItems: [],
  editarItems: [],
  
  // Acciones para items de creación
  setCrearItems: (items) => set({ crearItems: items }),
  addCrearItem: (item) => set((state) => ({ crearItems: [...state.crearItems, item] })),
  updateCrearItem: (index, item) => set((state) => {
    const newItems = [...state.crearItems];
    newItems[index] = item;
    return { crearItems: newItems };
  }),
  removeCrearItem: (index) => set((state) => ({
    crearItems: state.crearItems.filter((_, i) => i !== index)
  })),
  clearCrearItems: () => set({ crearItems: [] }),
  
  // Acciones para items de edición
  setEditarItems: (items) => set({ editarItems: items }),
  addEditarItem: (item) => set((state) => ({ editarItems: [...state.editarItems, item] })),
  updateEditarItem: (index, item) => set((state) => {
    const newItems = [...state.editarItems];
    newItems[index] = item;
    return { editarItems: newItems };
  }),
  removeEditarItem: (index) => set((state) => ({
    editarItems: state.editarItems.filter((_, i) => i !== index)
  })),
  clearEditarItems: () => set({ editarItems: [] }),
}));
