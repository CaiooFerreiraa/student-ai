import { getPrismaClient } from "@/infrastructure/database/prisma";

export async function findAllSubjects() {
  const prisma = getPrismaClient();

  return prisma.subject.findMany({
    orderBy: {
      name: "asc",
    },
  });
}
