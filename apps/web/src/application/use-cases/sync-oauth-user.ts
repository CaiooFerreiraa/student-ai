import { upsertOAuthUser } from "@/infrastructure/repositories/prisma-user-repository";

type SyncOAuthUserInput = {
  email: string;
  name: string | null;
  image: string | null;
};

export async function syncOAuthUser(input: SyncOAuthUserInput) {
  return upsertOAuthUser(input);
}
