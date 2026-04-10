import { getPrismaClient } from "@/infrastructure/database/prisma";

export async function findUserByEmail(email: string) {
  const prisma = getPrismaClient();

  return prisma.user.findUnique({
    where: { email },
  });
}

type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
};

export async function createUser({ name, email, passwordHash }: CreateUserInput) {
  const prisma = getPrismaClient();

  return prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
  });
}

type UpsertOAuthUserInput = {
  email: string;
  name: string | null;
  image: string | null;
};

export async function upsertOAuthUser({ email, name, image }: UpsertOAuthUserInput) {
  const prisma = getPrismaClient();

  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      image,
    },
    create: {
      email,
      name,
      image,
    },
  });
}
