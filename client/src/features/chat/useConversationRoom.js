import { useEffect, useMemo, useRef, useState } from "react";
import { getConversation, listConversationMessages, markMessageSeen, sendConversationMessage } from "./chat.api";
import { uploadChatAttachment } from "../uploads/uploads.api";
import { useConversationStore } from "./conversation.store";
import { useMessageStore } from "./message.store";
import { getErrorMessage } from "../../utils/error";
import socketClient from "../realtime/socketClient";
import { CHAT_MAX_ATTACHMENTS, CHAT_PAGE_SIZE } from "./chat.constants";

export function useConversationRoom(conversationId) {
  const conversation = useConversationStore((state) =>
    state.items.find((item) => item.id === conversationId) || null
  );
  const messages = useMessageStore((state) => state.messagesByConversation[conversationId] || []);
  const meta = useMessageStore((state) => state.metaByConversation[conversationId] || {});
  const loading = useMessageStore((state) => state.loadingByConversation[conversationId] || false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const lastSeenRequestRef = useRef("");

  useEffect(() => {
    if (!conversationId) {
      return undefined;
    }

    let isMounted = true;

    const loadConversationRoom = async () => {
      useMessageStore.getState().setConversationLoading(conversationId, true);
      setError("");

      try {
        const [conversationResponse, messagesResponse] = await Promise.all([
          getConversation(conversationId),
          listConversationMessages(conversationId, {
            page: 1,
            limit: CHAT_PAGE_SIZE
          })
        ]);

        if (!isMounted) {
          return;
        }

        useConversationStore.getState().upsertConversation(conversationResponse.data.data);
        useConversationStore.getState().setActiveConversationId(conversationId);
        useMessageStore
          .getState()
          .setMessages(conversationId, messagesResponse.data.data, messagesResponse.data.meta);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        useMessageStore.getState().setConversationLoading(conversationId, false);
        setError(getErrorMessage(error, "تعذر تحميل المحادثة."));
      }
    };

    loadConversationRoom();

    return () => {
      isMounted = false;
      useConversationStore.getState().setActiveConversationId(null);
    };
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      return undefined;
    }

    socketClient.joinConversation(conversationId).then((response) => {
      if (response?.success && response.data) {
        useConversationStore.getState().upsertConversation(response.data);
      }
    });

    return () => {
      socketClient.leaveConversation(conversationId).catch(() => {});
    };
  }, [conversationId]);

  const latestUnseenIncomingMessage = useMemo(
    () =>
      [...messages]
        .reverse()
        .find((message) => !message.isOwnMessage && message.status !== "SEEN"),
    [messages]
  );

  useEffect(() => {
    if (!conversationId || !latestUnseenIncomingMessage?.id) {
      return;
    }

    if (lastSeenRequestRef.current === latestUnseenIncomingMessage.id) {
      return;
    }

    lastSeenRequestRef.current = latestUnseenIncomingMessage.id;

    const markSeenRequest = async () => {
      try {
        const ack = await socketClient.markMessageSeen(latestUnseenIncomingMessage.id);
        const result = ack?.success
          ? ack.data
          : (await markMessageSeen(latestUnseenIncomingMessage.id)).data.data;

        useMessageStore.getState().updateMessageStatuses(conversationId, result.messageIds || [], {
          status: "SEEN",
          seenAt: result.seenAt,
          deliveredAt: result.seenAt
        });
      } catch (error) {
        lastSeenRequestRef.current = "";
      }
    };

    markSeenRequest();
  }, [conversationId, latestUnseenIncomingMessage]);

  const sendMessage = async ({ body, files }) => {
    const normalizedFiles = (files || []).filter(Boolean).slice(0, CHAT_MAX_ATTACHMENTS);
    setSending(true);
    setError("");

    try {
      const attachmentTokens = [];

      for (const file of normalizedFiles) {
        const uploadResponse = await uploadChatAttachment(file);
        attachmentTokens.push(uploadResponse.data.data.token);
      }

      const payload = {
        body: body?.trim() || undefined,
        attachmentTokens
      };

      const ack = await socketClient.sendMessage({
        conversationId,
        ...payload
      });
      const message = ack?.success
        ? ack.data
        : (await sendConversationMessage(conversationId, payload)).data.data;

      useMessageStore.getState().upsertMessage(conversationId, message);
      return message;
    } catch (error) {
      const nextError = getErrorMessage(error, "تعذر إرسال الرسالة.");
      setError(nextError);
      throw new Error(nextError);
    } finally {
      setSending(false);
    }
  };

  const loadOlderMessages = async () => {
    if (loadingMore || !meta.hasMore) {
      return;
    }

    setLoadingMore(true);

    try {
      const response = await listConversationMessages(conversationId, {
        page: (meta.page || 1) + 1,
        limit: meta.limit || CHAT_PAGE_SIZE
      });

      useMessageStore
        .getState()
        .setMessages(conversationId, response.data.data, response.data.meta, { append: true });
    } catch (error) {
      setError(getErrorMessage(error, "تعذر تحميل الرسائل الأقدم."));
    } finally {
      setLoadingMore(false);
    }
  };

  return {
    conversation,
    messages,
    meta,
    loading,
    loadingMore,
    sending,
    error,
    sendMessage,
    loadOlderMessages
  };
}
