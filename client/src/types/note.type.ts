import { z } from "zod";

export const expiryOptions = ["5m", "1h", "24h", "7d"] as const;


export const createNoteSchema = z.object({
  secret: z
    .string()
    .trim()
    .min(1, "Secret is required"),

  expiry: z.enum(["5m", "1h", "24h", "7d"]),

  passphrase: z
    .string()
    .optional(),
});

export type ExpiryOption = (typeof expiryOptions)[number];


export type CreateNoteFormData =
  z.infer<typeof createNoteSchema>;