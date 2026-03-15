import { create } from "zustand";

function mergeNotifications(currentItems, nextItems) {
  const map = new Map();

  [...currentItems, ...nextItems].forEach((notification) => {
    if (notification?.id) {
      map.set(notification.id, {
        ...(map.get(notification.id) || {}),
        ...notification
      });
    }
  });

  return [...map.values()].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function countUnread(items) {
  return items.filter((item) => !item.isRead).length;
}

const defaultMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  unreadCount: 0
};

export const useNotificationStore = create((set) => ({
  items: [],
  meta: defaultMeta,
  loading: false,
  error: "",
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setNotifications: (items, meta = {}, options = {}) =>
    set((state) => {
      const nextItems = options.append ? mergeNotifications(state.items, items) : mergeNotifications([], items);
      return {
        items: nextItems,
        meta: {
          ...state.meta,
          ...meta,
          unreadCount: meta.unreadCount ?? countUnread(nextItems)
        },
        loading: false,
        error: ""
      };
    }),
  prependNotification: (notification) =>
    set((state) => {
      const items = mergeNotifications([notification], state.items);
      return {
        items,
        meta: {
          ...state.meta,
          unreadCount: countUnread(items)
        }
      };
    }),
  updateNotification: (notification) =>
    set((state) => {
      const items = mergeNotifications(state.items, [notification]);
      return {
        items,
        meta: {
          ...state.meta,
          unreadCount: countUnread(items)
        }
      };
    }),
  markAllRead: () =>
    set((state) => ({
      items: state.items.map((notification) => ({
        ...notification,
        isRead: true,
        readAt: notification.readAt || new Date().toISOString()
      })),
      meta: {
        ...state.meta,
        unreadCount: 0
      }
    })),
  reset: () =>
    set({
      items: [],
      meta: defaultMeta,
      loading: false,
      error: ""
    })
}));
