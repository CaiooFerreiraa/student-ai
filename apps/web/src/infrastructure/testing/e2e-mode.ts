import { getServerEnv } from "@/infrastructure/config/env";

export function isE2ETestMode(): boolean {
  return getServerEnv().E2E_TEST_MODE ?? false;
}
