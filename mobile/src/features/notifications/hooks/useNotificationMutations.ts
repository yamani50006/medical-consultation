import { useMutation } from "@tanstack/react-query";

import { appContainer } from "@/app/di/container";
import { appQueryKeys } from "@/app/di/query-keys";
import { NotificationEntity } from "@/domain/entities/Notification";
import { queryClient } from "@/shared/utils/query-client";

function updateNotificationLists(
  updater: (items: NotificationEntity[] | undefined) => NotificationEntity[] | undefined
) {
  queryClient.setQueriesData<NotificationEntity[]>(
    { queryKey: appQueryKeys.notificationsRoot() },
    updater
  );
}

export function useMarkNotificationAsReadMutation() {
  return useMutation({
    mutationFn: (id: string) => appContainer.useCases.markNotificationAsRead.execute(id),
    onSuccess: (notification) => {
      updateNotificationLists((items) =>
        items?.map((item) => (item.id === notification.id ? notification : item))
      );
    }
  });
}

export function useMarkAllNotificationsAsReadMutation() {
  return useMutation({
    mutationFn: () => appContainer.useCases.markAllNotificationsAsRead.execute(),
    onSuccess: () => {
      updateNotificationLists((items) =>
        items?.map((item) => ({
          ...item,
          isRead: true
        }))
      );
    }
  });
}
