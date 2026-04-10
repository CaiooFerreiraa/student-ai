"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { signInSchema } from "@/application/validators/auth-schemas";

export type AuthActionState = {
  error?: string;
};

export async function loginWithCredentials(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Informe um e-mail válido e uma senha com pelo menos 8 caracteres." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Credenciais inválidas." };
    }

    throw error;
  }

  return {};
}

export async function loginWithOAuth(provider: "google" | "github") {
  await signIn(provider, { redirectTo: "/dashboard" });
}
