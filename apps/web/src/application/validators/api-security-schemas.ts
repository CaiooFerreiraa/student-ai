import { z } from "zod";
import { signUpSchema } from "@/application/validators/auth-schemas";

const verboseQueryValueSchema = z
  .union([z.literal("true"), z.literal("false")])
  .optional()
  .transform((value: "true" | "false" | undefined) => value === "true");

export const healthQuerySchema = z.object({
  verbose: verboseQueryValueSchema,
});

export const registerApiBodySchema = signUpSchema;
