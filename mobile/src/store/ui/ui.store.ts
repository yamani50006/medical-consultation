import { create } from "zustand";

export type ToastPayload = {
  id: string;
  title: string;
  description?: string;
};

type UiState = {
  toast: ToastPayload | null;
  showToast: (payload: Omit<ToastPayload, "id">) => void;
  hideToast: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  toast: null,
  showToast: (payload) =>
    set({
      toast: {
        id: `${Date.now()}`,
        ...payload
      }
    }),
  hideToast: () => set({ toast: null })
}));

