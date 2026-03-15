import { create } from "zustand";

function sortMessages(items) {
  return [...items].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
}

function mergeMessages(currentItems, nextItems) {
  const map = new Map();

  [...currentItems, ...nextItems].forEach((message) => {
    if (message?.id) {
      map.set(message.id, {
        ...(map.get(message.id) || {}),
        ...message
      });
    }
  });

  return sortMessages([...map.values()]);
}

export const useMessageStore = create((set) => ({
  messagesByConversation: {},
  metaByConversation: {},
  loadingByConversation: {},
  setConversationLoading: (conversationId, loading) =>
    set((state) => ({
      loadingByConversation: {
        ...state.loadingByConversation,
        [conversationId]: loading
      }
    })),
  setMessages: (conversationId, items, meta = {}, options = {}) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: options.append
          ? mergeMessages(state.messagesByConversation[conversationId] || [], items)
          : sortMessages(items)
      },
      metaByConversation: {
        ...state.metaByConversation,
        [conversationId]: {
          ...(state.metaByConversation[conversationId] || {}),
          ...meta
        }
      },
      loadingByConversation: {
        ...state.loadingByConversation,
        [conversationId]: false
      }
    })),
  upsertMessage: (conversationId, message) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: mergeMessages(state.messagesByConversation[conversationId] || [], [message])
      }
    })),
  updateMessageStatuses: (conversationId, messageIds, patch) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: (state.messagesByConversation[conversationId] || []).map((message) =>
          messageIds.includes(message.id)
            ? {
                ...message,
                ...patch,
                status: patch.status || message.status
              }
            : message
        )
      }
    })),
  resetConversation: (conversationId) =>
    set((state) => {
      const nextMessages = { ...state.messagesByConversation };
      const nextMeta = { ...state.metaByConversation };
      const nextLoading = { ...state.loadingByConversation };
      delete nextMessages[conversationId];
      delete nextMeta[conversationId];
      delete nextLoading[conversationId];
      return {
        messagesByConversation: nextMessages,
        metaByConversation: nextMeta,
        loadingByConversation: nextLoading
      };
    }),
  reset: () =>
    set({
      messagesByConversation: {},
      metaByConversation: {},
      loadingByConversation: {}
    })
}));
