import { z } from "zod";

export const presenceParamsSchema = z.object({
  userId: z.string().min(5).max(64)
});

export const socketPresenceStatusSchema = z.object({
  status: z.enum(["ONLINE", "OFFLINE", "online", "offline"]).transform((value) => value.toUpperCase())
});
