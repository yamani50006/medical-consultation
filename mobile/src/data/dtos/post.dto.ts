export type PostDto = {
  id: string;
  title: string;
  content: string;
  coverImageUrl?: string | null;
  createdAt: string;
  author?: {
    fullName?: string;
  };
};

