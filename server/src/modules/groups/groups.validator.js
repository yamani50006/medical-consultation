import { z } from "zod";

const groupVisibilityEnum = z.enum(["public", "private"]);

export const createGroupSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().min(10).max(3000),
  category: z.string().min(2).max(120),
  visibility: groupVisibilityEnum
});

export const updateGroupSchema = z
  .object({
    name: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(3000).optional(),
    category: z.string().min(2).max(120).optional(),
    visibility: groupVisibilityEnum.optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one group field is required"
  });

export const createGroupPostSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10).max(5000)
});

export const updateGroupPostSchema = z
  .object({
    title: z.string().min(3).max(200).optional(),
    content: z.string().min(10).max(5000).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one post field is required"
  });

export const listGroupsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().min(1).max(200).optional(),
  category: z.string().min(1).max(120).optional(),
  visibility: groupVisibilityEnum.optional()
});
