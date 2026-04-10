import * as Sentry from "@sentry/nextjs";
import { isFeatureEnabled } from "@/infrastructure/config/feature-flags";

type ErrorContext = Record<string, unknown>;

export function reportServerError(error: unknown, context?: ErrorContext): void {
  if (!isFeatureEnabled("sentry")) {
    console.error(error, context);
    return;
  }

  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });

    return;
  }

  Sentry.captureException(error);
}
