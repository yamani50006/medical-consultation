import { PostDto } from "@/data/dtos/post.dto";
import { PostEntity } from "@/domain/entities/Post";

export const mapPostDtoToEntity = (dto: PostDto): PostEntity => ({
  id: dto.id,
  title: dto.title,
  content: dto.content,
  coverImageUrl: dto.coverImageUrl,
  createdAt: dto.createdAt,
  authorName: dto.author?.fullName ?? "فريق التحرير"
});

