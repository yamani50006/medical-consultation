export type ConversationDto = {
  id: string;
  counterpart?: {
    fullName?: string | null;
    role?: string | null;
    specialization?: string | null;
    location?: string | null;
  } | null;
  unreadCount?: number;
  consultation?: {
    subject?: string | null;
  } | null;
  lastMessage?: {
    preview?: string | null;
    createdAt?: string | null;
  } | null;
  lastMessageAt?: string | null;
};

