import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getServerEnv } from "@/infrastructure/config/env";

type RateLimitScope = "api" | "auth";

export type RateLimitDecision = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  reason: "disabled" | "ok" | "limited";
};

type RateLimiterMap = {
  api: Ratelimit;
  auth: Ratelimit;
};

let cachedLimiters: RateLimiterMap | null = null;
const localBuckets = new Map<string, { count: number; reset: number }>();

function createRedisClient(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

function getRateLimiters(): RateLimiterMap | null {
  if (cachedLimiters) {
    return cachedLimiters;
  }

  const redis: Redis | null = createRedisClient();

  if (!redis) {
    return null;
  }

  cachedLimiters = {
    api: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      analytics: true,
      prefix: "student-ai:api",
    }),
    auth: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 m"),
      analytics: true,
      prefix: "student-ai:auth",
    }),
  };

  return cachedLimiters;
}

function getLocalRateLimitConfig(scope: RateLimitScope): { limit: number; windowMs: number } {
  if (scope === "auth") {
    return {
      limit: 10,
      windowMs: 10 * 60 * 1000,
    };
  }

  return {
    limit: 60,
    windowMs: 60 * 1000,
  };
}

function applyLocalRateLimit(identifier: string, scope: RateLimitScope): RateLimitDecision {
  const config = getLocalRateLimitConfig(scope);
  const key = `${scope}:${identifier}`;
  const now = Date.now();
  const current = localBuckets.get(key);

  if (!current || current.reset <= now) {
    localBuckets.set(key, {
      count: 1,
      reset: now + config.windowMs,
    });

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: now + config.windowMs,
      reason: "ok",
    };
  }

  current.count += 1;
  localBuckets.set(key, current);

  const success = current.count <= config.limit;

  return {
    success,
    limit: config.limit,
    remaining: Math.max(config.limit - current.count, 0),
    reset: current.reset,
    reason: success ? "ok" : "limited",
  };
}

export async function applyRateLimit(
  identifier: string,
  scope: RateLimitScope,
): Promise<RateLimitDecision> {
  const env = getServerEnv();

  if (env.LOCAL_RATE_LIMIT_MODE) {
    return applyLocalRateLimit(identifier, scope);
  }

  const limiters: RateLimiterMap | null = getRateLimiters();

  if (!limiters) {
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
      reason: "disabled",
    };
  }

  const result: {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  } = await limiters[scope].limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
    reason: result.success ? "ok" : "limited",
  };
}
