import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 20,
  duration: "20s",
  thresholds: {
    checks: ["rate>0.99"],
  },
};

const targetUrl = __ENV.TARGET_URL || "http://127.0.0.1:3000/api/health";
const origin = __ENV.ORIGIN || "http://localhost:3000";

export default function rateLimitScenario() {
  const response = http.get(targetUrl, {
    headers: {
      Origin: origin,
    },
  });

  check(response, {
    "returns 200 or 429": (res) => res.status === 200 || res.status === 429,
    "adds retry-after when throttled": (res) =>
      res.status !== 429 || Boolean(res.headers["Retry-After"] || res.headers["retry-after"]),
  });

  sleep(0.2);
}
