import prisma from "../../config/db.js";

const participantUserSelect = {
  id: true,
  fullName: true,
  email: true,
  profileImageUrl: true,
  role: true,
  status: true,
  presence: {
    select: {
      status: true,
      lastSeenAt: true,
      lastActiveAt: true
    }
  },
  doctorProfile: {
    select: {
      id: true,
      specialization: true,
      city: true,
      region: true
    }
  },
  patientProfile: {
    select: {
      id: true,
      city: true,
      region: true
    }
  }
};

const conversationInclude = {
  consultation: {
    select: {
      id: true,
      subject: true,
      status: true,
      createdAt: true,
      updatedAt: true
    }
  },
  participants: {
    include: {
      user: {
        select: participantUserSelect
      }
    }
  }
};

const messageInclude = {
  sender: {
    select: {
      id: true,
      fullName: true,
      profileImageUrl: true,
      role: true
    }
  },
  attachments: {
    orderBy: {
      createdAt: "asc"
    }
  }
};

export default class ChatRepository {
  findConsultationForConversation(consultationId) {
    return prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                role: true,
                fullName: true
              }
            }
          }
        },
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                role: true,
                fullName: true
              }
            }
          }
        }
      }
    });
  }

  findConversationByConsultationId(consultationId) {
    return prisma.conversation.findUnique({
      where: { consultationId },
      include: conversationInclude
    });
  }

  findConversationForUser(conversationId, userId) {
    return prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId
          }
        }
      },
      include: conversationInclude
    });
  }

  async listUserConversations(userId, query, { skip, limit }) {
    const where = {
      participants: {
        some: {
          userId
        }
      }
    };

    if (query.search) {
      where.OR = [
        {
          consultation: {
            subject: {
              contains: query.search,
              mode: "insensitive"
            }
          }
        },
        {
          participants: {
            some: {
              userId: {
                not: userId
              },
              user: {
                fullName: {
                  contains: query.search,
                  mode: "insensitive"
                }
              }
            }
          }
        }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          {
            lastMessageAt: "desc"
          },
          {
            updatedAt: "desc"
          }
        ],
        include: conversationInclude
      }),
      prisma.conversation.count({ where })
    ]);

    return { items, total };
  }

  getUnreadConversationCount(userId) {
    return prisma.conversationParticipant.aggregate({
      where: { userId },
      _sum: {
        unreadCount: true
      }
    });
  }

  createConversationWithParticipants(tx, conversationData, participantRows) {
    return tx.conversation.create({
      data: {
        ...conversationData,
        participants: {
          create: participantRows
        }
      },
      include: conversationInclude
    });
  }

  updateConversation(tx, conversationId, data) {
    return tx.conversation.update({
      where: { id: conversationId },
      data,
      include: conversationInclude
    });
  }

  listMessages(conversationId, { skip, limit }) {
    return prisma.message.findMany({
      where: { conversationId },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: messageInclude
    });
  }

  countMessages(conversationId) {
    return prisma.message.count({
      where: { conversationId }
    });
  }

  createMessage(tx, data) {
    return tx.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        body: data.body,
        type: data.type,
        status: data.status,
        attachments: data.attachments?.length
          ? {
              create: data.attachments
            }
          : undefined
      },
      include: messageInclude
    });
  }

  incrementUnreadForRecipients(tx, conversationId, senderId) {
    return tx.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: {
          not: senderId
        }
      },
      data: {
        unreadCount: {
          increment: 1
        }
      }
    });
  }

  resetUnreadForUser(tx, conversationId, userId, lastReadAt) {
    return tx.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      },
      data: {
        unreadCount: 0,
        lastReadAt
      }
    });
  }

  findMessageForUser(messageId, userId) {
    return prisma.message.findFirst({
      where: {
        id: messageId,
        conversation: {
          participants: {
            some: {
              userId
            }
          }
        }
      },
      include: {
        ...messageInclude,
        conversation: {
          include: conversationInclude
        }
      }
    });
  }

  findPendingIncomingMessages(conversationId, userId) {
    return prisma.message.findMany({
      where: {
        conversationId,
        senderId: {
          not: userId
        },
        status: "SENT"
      },
      orderBy: {
        createdAt: "asc"
      }
    });
  }

  findUnreadIncomingMessagesUpTo(conversationId, userId, createdAt) {
    return prisma.message.findMany({
      where: {
        conversationId,
        senderId: {
          not: userId
        },
        createdAt: {
          lte: createdAt
        },
        status: {
          not: "SEEN"
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });
  }

  updateMessageStatusesByIds(tx, messageIds, data) {
    return tx.message.updateMany({
      where: {
        id: {
          in: messageIds
        }
      },
      data
    });
  }
}
