import { AppError } from "@/core/errors/AppError";
import { ConsultationDto } from "@/data/dtos/consultation.dto";
import {
  consultationMockSeed,
  createMockConsultationDto,
  hydrateConsultationDto
} from "@/data/mocks/consultation.mock";
import {
  ConsultationListParams,
  ConsultationRatingPayload,
  CreateConsultationPayload
} from "@/domain/entities/Consultation";

const cloneValue = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export class ConsultationMockDataSource {
  private consultations = cloneValue(consultationMockSeed);

  async listMy(params?: ConsultationListParams) {
    const source =
      params?.includeArchived === false
        ? this.consultations.filter((consultation) => !consultation.archivedAt)
        : this.consultations;

    return cloneValue(
      [...source]
        .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
        .slice(0, params?.limit ?? source.length)
    );
  }

  async getById(id: string) {
    return cloneValue(this.getOrThrow(id));
  }

  async create(payload: CreateConsultationPayload) {
    const nextConsultation = createMockConsultationDto(payload);
    this.consultations = [nextConsultation, ...this.consultations];
    return cloneValue(nextConsultation);
  }

  async markAsPaid(id: string) {
    const now = new Date().toISOString();

    return cloneValue(
      this.update(id, (consultation) =>
        hydrateConsultationDto({
          ...consultation,
          status: "ACCEPTED",
          paymentStatus: "PAID",
          paidAt: now,
          updatedAt: now,
          conversation: consultation.conversation ?? {
            id: `conversation-${id}`,
            createdAt: now,
            updatedAt: now,
            unreadCount: 0,
            lastMessage: {
              preview: "تم تأكيد الدفع وبدء الشات الطبي.",
              type: "TEXT",
              status: "SENT",
              senderId: "system",
              createdAt: now
            },
            lastMessageAt: now,
            messages: [
              {
                id: `message-paid-${Date.now()}`,
                conversationId: `conversation-${id}`,
                body: "تم تأكيد الدفع وبدء الشات الطبي.",
                type: "TEXT",
                status: "SENT",
                createdAt: now,
                isOwnMessage: false,
                sender: {
                  id: "system",
                  fullName: "النظام",
                  role: "SYSTEM",
                  profileImageUrl: null
                },
                attachments: []
              }
            ]
          },
          notifications: []
        })
      )
    );
  }

  async archive(id: string) {
    const now = new Date().toISOString();

    return cloneValue(
      this.update(id, (consultation) =>
        hydrateConsultationDto({
          ...consultation,
          archivedAt: now,
          updatedAt: now
        })
      )
    );
  }

  async reopen(id: string) {
    const now = new Date().toISOString();

    return cloneValue(
      this.update(id, (consultation) =>
        hydrateConsultationDto({
          ...consultation,
          status: "ACCEPTED",
          archivedAt: null,
          completedAt: null,
          updatedAt: now,
          notifications: [
            {
              id: `notification-reopen-${Date.now()}`,
              type: "CHAT_MESSAGE",
              title: "تمت إعادة فتح الاستشارة",
              message: "يمكنك متابعة التواصل ضمن نفس الملف الطبي.",
              isRead: false,
              createdAt: now,
              conversationId: consultation.conversation?.id ?? null,
              entityType: "consultation",
              entityId: consultation.id,
              metadata: {
                consultationEvent: "accepted"
              }
            }
          ]
        })
      )
    );
  }

  async rate(id: string, payload: ConsultationRatingPayload) {
    const now = new Date().toISOString();

    return cloneValue(
      this.update(id, (consultation) =>
        hydrateConsultationDto({
          ...consultation,
          updatedAt: now,
          reviews: [
            {
              id: `review-${Date.now()}`,
              patientId: consultation.patientId ?? "patient-demo-001",
              doctorId: consultation.doctorId,
              consultationId: consultation.id,
              rating: payload.score,
              comment: payload.comment,
              createdAt: now
            }
          ]
        })
      )
    );
  }

  private update(id: string, updater: (consultation: ConsultationDto) => ConsultationDto) {
    const current = this.getOrThrow(id);
    const next = updater(current);

    this.consultations = this.consultations.map((consultation) =>
      consultation.id === id ? next : consultation
    );

    return next;
  }

  private getOrThrow(id: string) {
    const consultation = this.consultations.find((item) => item.id === id);

    if (!consultation) {
      throw new AppError("Consultation not found", {
        statusCode: 404,
        code: "CONSULTATION_NOT_FOUND"
      });
    }

    return consultation;
  }
}
