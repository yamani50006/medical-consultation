import { create } from "zustand";

export const usePresenceStore = create((set) => ({
  presenceByUserId: {},
  setPresence: (presence) =>
    set((state) => ({
      presenceByUserId: {
        ...state.presenceByUserId,
        [presence.userId]: {
          ...(state.presenceByUserId[presence.userId] || {}),
          ...presence
        }
      }
    })),
  reset: () =>
    set({
      presenceByUserId: {}
    })
}));
