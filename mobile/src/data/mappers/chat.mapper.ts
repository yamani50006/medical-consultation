import { ConversationDto } from "@/data/dtos/chat.dto";
import { ConversationEntity } from "@/domain/entities/Conversation";

export const mapConversationDtoToEntity = (dto: ConversationDto): ConversationEntity => ({
  id: dto.id,
  counterpartName: dto.counterpart?.fullName ?? "محادثة طبية",
  counterpartRole: dto.counterpart?.role ?? null,
  counterpartSpecialization: dto.counterpart?.specialization ?? null,
  counterpartLocation: dto.counterpart?.location ?? null,
  lastMessagePreview: dto.lastMessage?.preview ?? null,
  lastMessageAt: dto.lastMessage?.createdAt ?? dto.lastMessageAt ?? null,
  unreadCount: dto.unreadCount ?? 0,
  consultationSubject: dto.consultation?.subject ?? null
});

