import { hash } from "bcryptjs";
import { createUser, findUserByEmail } from "@/infrastructure/repositories/prisma-user-repository";

type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser({ name, email, password }: RegisterUserInput) {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new Error("Já existe uma conta com este e-mail.");
  }

  const passwordHash = await hash(password, 12);

  return createUser({
    name,
    email,
    passwordHash,
  });
}
