import { findAllSubjects } from "@/infrastructure/repositories/prisma-subject-repository";
import { isE2ETestMode } from "@/infrastructure/testing/e2e-mode";
import { e2eSubjects } from "@/infrastructure/testing/mock-data";

export async function listSubjects() {
  if (isE2ETestMode()) {
    return e2eSubjects;
  }

  return findAllSubjects();
}
