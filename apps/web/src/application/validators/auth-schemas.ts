import { z } from "zod";
import { sanitizeString } from "@/infrastructure/security/sanitize";

const SAFE_DISPLAY_NAME_REGEX: RegExp = /^[\p{L}\p{M}\p{N} .'-]+$/u;
const EMAIL_MAX_LENGTH: number = 254;
const NAME_MAX_LENGTH: number = 80;
const PASSWORD_MIN_LENGTH: number = 8;
const PASSWORD_MAX_LENGTH: number = 100;

export const signInSchema = z.object({
  email: z.string().transform(sanitizeString).pipe(z.string().max(EMAIL_MAX_LENGTH).email()),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
});

export const signUpSchema = z.object({
  name: z
    .string()
    .transform(sanitizeString)
    .pipe(
      z
        .string()
        .min(2)
        .max(NAME_MAX_LENGTH)
        .regex(SAFE_DISPLAY_NAME_REGEX, "Nome contém caracteres inválidos."),
    ),
  email: z.string().transform(sanitizeString).pipe(z.string().max(EMAIL_MAX_LENGTH).email()),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
});
