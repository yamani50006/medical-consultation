import { create } from "zustand";

function sortConversations(items) {
  return [...items].sort((left, right) => {
    const leftDate = left.lastMessageAt || left.updatedAt || left.createdAt;
    const rightDate = right.lastMessageAt || right.updatedAt || right.createdAt;
    return new Date(rightDate || 0).getTime() - new Date(leftDate || 0).getTime();
  });
}

function mergeConversations(currentItems, nextItems) {
  const map = new Map();
  currentItems.forEach(item => map.set(item.id, item));

  let changed = false;
  nextItems.forEach((conversation) => {
    if (conversation?.id) {
      const existing = map.get(conversation.id);
      const updated = {
        ...(existing || {}),
        ...conversation
      };
      
      if (!existing || JSON.stringify(existing) !== JSON.stringify(updated)) {
        map.set(conversation.id, updated);
        changed = true;
      }
    }
  });

  return changed ? sortConversations([...map.values()]) : currentItems;
}


function calculateUnreadCount(items) {
  return items.reduce((sum, item) => sum + (item.unreadCount || 0), 0);
}

const defaultMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  unreadCount: 0
};

export const useConversationStore = create((set) => ({
  items: [],
  meta: defaultMeta,
  activeConversationId: null,
  loading: false,
  error: "",
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setConversationList: (items, meta = {}, options = {}) =>
    set((state) => {
      const nextItems = options.append ? mergeConversations(state.items, items) : sortConversations(items);
      return {
        items: nextItems,
        meta: {
          ...state.meta,
          ...meta,
          unreadCount: meta.unreadCount ?? calculateUnreadCount(nextItems)
        },
        loading: false,
        error: ""
      };
    }),
  upsertConversation: (conversation) =>
    set((state) => {
      const items = mergeConversations(state.items, [conversation]);
      return {
        items,
        meta: {
          ...state.meta,
          unreadCount: calculateUnreadCount(items)
        }
      };
    }),
  patchPresence: (userId, presence) =>
    set((state) => ({
      items: state.items.map((conversation) =>
        conversation.counterpart?.id === userId
          ? {
              ...conversation,
              counterpart: {
                ...conversation.counterpart,
                presence: {
                  ...(conversation.counterpart.presence || {}),
                  ...presence
                }
              }
            }
          : conversation
      )
    })),
  setActiveConversationId: (activeConversationId) => set({ activeConversationId }),
  reset: () =>
    set({
      items: [],
      meta: defaultMeta,
      activeConversationId: null,
      loading: false,
      error: ""
    })
}));
