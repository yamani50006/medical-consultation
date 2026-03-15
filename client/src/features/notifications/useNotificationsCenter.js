import { startTransition, useEffect, useState } from "react";
import {
  listMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from "./notifications.api";
import { useNotificationStore } from "./notifications.store";
import { getErrorMessage } from "../../utils/error";
import socketClient from "../realtime/socketClient";

const PAGE_SIZE = 20;

export function useNotificationsCenter() {
  const [filter, setFilter] = useState("all");
  const notifications = useNotificationStore((state) => state.items);
  const meta = useNotificationStore((state) => state.meta);
  const loading = useNotificationStore((state) => state.loading);
  const error = useNotificationStore((state) => state.error);

  const loadFirstPage = async (nextFilter = filter) => {
    useNotificationStore.getState().setLoading(true);
    useNotificationStore.getState().setError("");

    try {
      const response = await listMyNotifications({
        page: 1,
        limit: PAGE_SIZE,
        isRead: nextFilter === "unread" ? false : undefined
      });

      startTransition(() => {
        useNotificationStore.getState().setNotifications(response.data.data, response.data.meta);
      });
    } catch (error) {
      useNotificationStore.getState().setLoading(false);
      useNotificationStore
        .getState()
        .setError(getErrorMessage(error, "تعذر تحميل الإشعارات."));
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      useNotificationStore.getState().setLoading(true);
      useNotificationStore.getState().setError("");

      try {
        const response = await listMyNotifications({
          page: 1,
          limit: PAGE_SIZE,
          isRead: filter === "unread" ? false : undefined
        });

        if (!isMounted) {
          return;
        }

        startTransition(() => {
          useNotificationStore.getState().setNotifications(response.data.data, response.data.meta);
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        useNotificationStore.getState().setLoading(false);
        useNotificationStore
          .getState()
          .setError(getErrorMessage(error, "تعذر تحميل الإشعارات."));
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [filter]);

  const markAsRead = async (notificationId) => {
    try {
      const ack = await socketClient.markNotificationRead(notificationId);
      const notification = ack?.success
        ? ack.data
        : (await markNotificationAsRead(notificationId)).data.data;

      useNotificationStore.getState().updateNotification(notification);
      return notification;
    } catch (error) {
      useNotificationStore
        .getState()
        .setError(getErrorMessage(error, "تعذر تحديث الإشعار."));
      throw error;
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      useNotificationStore.getState().markAllRead();
    } catch (error) {
      useNotificationStore
        .getState()
        .setError(getErrorMessage(error, "تعذر تحديث الإشعارات."));
      throw error;
    }
  };

  const loadMore = async () => {
    if (!meta.hasNextPage || loading) {
      return;
    }

    useNotificationStore.getState().setLoading(true);

    try {
      const response = await listMyNotifications({
        page: (meta.page || 1) + 1,
        limit: meta.limit || PAGE_SIZE,
        isRead: filter === "unread" ? false : undefined
      });

      useNotificationStore
        .getState()
        .setNotifications(response.data.data, response.data.meta, { append: true });
    } catch (error) {
      useNotificationStore.getState().setLoading(false);
      useNotificationStore
        .getState()
        .setError(getErrorMessage(error, "تعذر تحميل المزيد من الإشعارات."));
    }
  };

  return {
    notifications,
    meta,
    loading,
    error,
    filter,
    setFilter,
    refresh: () => loadFirstPage(filter),
    markAsRead,
    markAllRead,
    loadMore
  };
}
