import { create } from 'zustand';

export type OverlayType = 
  | 'command'
  | 'health'
  | 'notifications'
  | 'user'
  | `drawer:${string}`
  | `modal:${string}`
  | null;

interface OverlayState {
  active: OverlayType;
  payload: any;
  // Support stack depth 2: modal opening over a drawer
  modalActive: OverlayType;
  modalPayload: any;

  openOverlay: (type: OverlayType, payload?: any) => void;
  closeOverlay: () => void;
  openModalOverDrawer: (type: OverlayType, payload?: any) => void;
  closeModalOverDrawer: () => void;
  resetOverlays: () => void;
}

export const useOverlay = create<OverlayState>((set) => ({
  active: null,
  payload: null,
  modalActive: null,
  modalPayload: null,

  openOverlay: (type, payload = null) => {
    set({
      active: type,
      payload,
      modalActive: null,
      modalPayload: null,
    });
  },

  closeOverlay: () => {
    set({
      active: null,
      payload: null,
      modalActive: null,
      modalPayload: null,
    });
  },

  openModalOverDrawer: (type, payload = null) => {
    set({
      modalActive: type,
      modalPayload: payload,
    });
  },

  closeModalOverDrawer: () => {
    set({
      modalActive: null,
      modalPayload: null,
    });
  },

  resetOverlays: () => {
    set({
      active: null,
      payload: null,
      modalActive: null,
      modalPayload: null,
    });
  },
}));
