"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { registerUser } from "@/application/use-cases/register-user";
import { signUpSchema } from "@/application/validators/auth-schemas";

export type RegisterActionState = {
  error?: string;
};

export async function registerWithCredentials(
  _previousState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Revise nome, e-mail e senha antes de continuar." };
  }

  try {
    await registerUser(parsed.data);
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "A conta foi criada, mas o login automático falhou." };
    }

    if (error instanceof Error) {
      return { error: error.message };
    }

    throw error;
  }

  return {};
}
