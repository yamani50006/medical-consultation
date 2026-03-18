export type ConversationEntity = {
  id: string;
  counterpartName: string;
  counterpartRole?: string | null;
  counterpartSpecialization?: string | null;
  counterpartLocation?: string | null;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  consultationSubject?: string | null;
};

