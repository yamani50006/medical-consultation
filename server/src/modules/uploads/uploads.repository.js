import prisma from "../../config/db.js";

export default class UploadsRepository {
  findAttachmentById(id) {
    return prisma.messageAttachment.findUnique({
      where: { id },
      include: {
        message: {
          include: {
            conversation: {
              select: {
                id: true,
                participants: {
                  select: {
                    userId: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }
}
