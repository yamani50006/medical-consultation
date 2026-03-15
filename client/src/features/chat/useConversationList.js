import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { listConversations } from "./chat.api";
import { useConversationStore } from "./conversation.store";
import { getErrorMessage } from "../../utils/error";
import { CHAT_PAGE_SIZE } from "./chat.constants";

export function useConversationList() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const conversations = useConversationStore((state) => state.items);
  const meta = useConversationStore((state) => state.meta);
  const loading = useConversationStore((state) => state.loading);
  const error = useConversationStore((state) => state.error);

  useEffect(() => {
    let isMounted = true;

    const loadConversations = async () => {
      useConversationStore.getState().setLoading(true);
      useConversationStore.getState().setError("");

      try {
        const response = await listConversations({
          page: 1,
          limit: CHAT_PAGE_SIZE,
          search: deferredSearch || undefined
        });

        if (!isMounted) {
          return;
        }

        startTransition(() => {
          useConversationStore.getState().setConversationList(response.data.data, response.data.meta);
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        useConversationStore.getState().setLoading(false);
        useConversationStore
          .getState()
          .setError(getErrorMessage(error, "تعذر تحميل المحادثات."));
      }
    };

    loadConversations();

    return () => {
      isMounted = false;
    };
  }, [deferredSearch]);

  const refresh = async () => {
    useConversationStore.getState().setLoading(true);

    try {
      const response = await listConversations({
        page: 1,
        limit: CHAT_PAGE_SIZE,
        search: deferredSearch || undefined
      });
      useConversationStore.getState().setConversationList(response.data.data, response.data.meta);
    } catch (error) {
      useConversationStore.getState().setLoading(false);
      useConversationStore
        .getState()
        .setError(getErrorMessage(error, "تعذر تحميل المحادثات."));
    }
  };

  const loadMore = async () => {
    if (!meta.hasNextPage || loading) {
      return;
    }

    useConversationStore.getState().setLoading(true);

    try {
      const response = await listConversations({
        page: (meta.page || 1) + 1,
        limit: meta.limit || CHAT_PAGE_SIZE,
        search: deferredSearch || undefined
      });
      useConversationStore
        .getState()
        .setConversationList(response.data.data, response.data.meta, { append: true });
    } catch (error) {
      useConversationStore.getState().setLoading(false);
      useConversationStore
        .getState()
        .setError(getErrorMessage(error, "تعذر تحميل المزيد من المحادثات."));
    }
  };

  return {
    conversations,
    meta,
    loading,
    error,
    search,
    setSearch,
    refresh,
    loadMore
  };
}
