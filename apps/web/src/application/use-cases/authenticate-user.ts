import { compare } from "bcryptjs";
import { findUserByEmail } from "@/infrastructure/repositories/prisma-user-repository";
import { isE2ETestMode } from "@/infrastructure/testing/e2e-mode";
import { e2eUser } from "@/infrastructure/testing/mock-data";

type AuthenticateUserInput = {
  email: string;
  password: string;
};

export async function authenticateUser({ email, password }: AuthenticateUserInput) {
  if (isE2ETestMode() && email === e2eUser.email && password === "e2e-password") {
    return e2eUser;
  }

  const user = await findUserByEmail(email);

  if (!user?.passwordHash) {
    return null;
  }

  const passwordMatches = await compare(password, user.passwordHash);

  if (!passwordMatches) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
  };
}
