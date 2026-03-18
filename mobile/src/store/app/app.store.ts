import { create } from "zustand";

type AppState = {
  language: "ar" | "en";
  setLanguage: (language: "ar" | "en") => void;
};

export const useAppStore = create<AppState>((set) => ({
  language: "ar",
  setLanguage: (language) => set({ language })
}));

