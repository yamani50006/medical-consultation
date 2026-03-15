import { startTransition, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import { listConversations } from "../chat/chat.api";
import { useConversationStore } from "../chat/conversation.store";
import { useMessageStore } from "../chat/message.store";
import { listMyNotifications } from "../notifications/notifications.api";
import { useNotificationStore } from "../notifications/notifications.store";
import { usePresenceStore } from "../presence/presence.store";
import socketClient from "./socketClient";
import { SOCKET_EVENTS } from "./socket-events";

function resetRealtimeState() {
  useConversationStore.getState().reset();
  useMessageStore.getState().reset();
  useNotificationStore.getState().reset();
  usePresenceStore.getState().reset();
}

export function RealtimeProvider({ children }) {
  const { token, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !token || !user?.id) {
      socketClient.disconnect();
      resetRealtimeState();
      return undefined;
    }

    socketClient.connect(token);

    const unsubscribeConnectionReady = socketClient.on(SOCKET_EVENTS.connectionReady, (payload) => {
      if (payload?.data?.presence) {
        usePresenceStore.getState().setPresence(payload.data.presence);
      }
    });

    const unsubscribeConversationUpdated = socketClient.on(SOCKET_EVENTS.conversation.updated, (payload) => {
      if (payload?.conversation) {
        useConversationStore.getState().upsertConversation(payload.conversation);
      }
    });

    const unsubscribeNewMessage = socketClient.on(SOCKET_EVENTS.chat.newMessage, (payload) => {
      if (payload?.conversationId && payload?.message) {
        useMessageStore.getState().upsertMessage(payload.conversationId, payload.message);
      }
    });

    const unsubscribeDelivered = socketClient.on(SOCKET_EVENTS.chat.messageDelivered, (payload) => {
      if (payload?.conversationId && payload?.messageIds?.length) {
        useMessageStore.getState().updateMessageStatuses(payload.conversationId, payload.messageIds, {
          status: "DELIVERED",
          deliveredAt: payload.deliveredAt
        });
      }
    });

    const unsubscribeSeen = socketClient.on(SOCKET_EVENTS.chat.messageSeen, (payload) => {
      if (payload?.conversationId && payload?.messageIds?.length) {
        useMessageStore.getState().updateMessageStatuses(payload.conversationId, payload.messageIds, {
          status: "SEEN",
          seenAt: payload.seenAt,
          deliveredAt: payload.seenAt
        });
      }
    });

    const unsubscribeNotificationNew = socketClient.on(SOCKET_EVENTS.notification.new, (payload) => {
      if (payload?.notification) {
        useNotificationStore.getState().prependNotification(payload.notification);
      }
    });

    const unsubscribeNotificationUpdated = socketClient.on(SOCKET_EVENTS.notification.updated, (payload) => {
      if (payload?.allRead) {
        useNotificationStore.getState().markAllRead();
        return;
      }

      if (payload?.notification) {
        useNotificationStore.getState().updateNotification(payload.notification);
      }
    });

    const unsubscribePresenceChanged = socketClient.on(SOCKET_EVENTS.presence.changed, (payload) => {
      if (!payload?.userId) {
        return;
      }

      usePresenceStore.getState().setPresence(payload);
      useConversationStore.getState().patchPresence(payload.userId, payload);
    });

    const bootstrapRealtimeData = async () => {
      try {
        const [conversationsResponse, notificationsResponse] = await Promise.all([
          listConversations({ page: 1, limit: 10 }),
          listMyNotifications({ page: 1, limit: 10 })
        ]);

        startTransition(() => {
          useConversationStore
            .getState()
            .setConversationList(conversationsResponse.data.data, conversationsResponse.data.meta);
          useNotificationStore
            .getState()
            .setNotifications(notificationsResponse.data.data, notificationsResponse.data.meta);
        });
      } catch (error) {
        // Keep bootstrapping silent to avoid blocking the UI.
      }
    };

    bootstrapRealtimeData();

    return () => {
      unsubscribeConnectionReady();
      unsubscribeConversationUpdated();
      unsubscribeNewMessage();
      unsubscribeDelivered();
      unsubscribeSeen();
      unsubscribeNotificationNew();
      unsubscribeNotificationUpdated();
      unsubscribePresenceChanged();
      socketClient.disconnect();
    };
  }, [isAuthenticated, token, user?.id]);

  return children;
}
