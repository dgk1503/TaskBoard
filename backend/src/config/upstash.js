import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

// Diagnostic logging
console.log(
  "[Upstash Debug] UPSTASH_REDIS_REST_URL:",
  process.env.UPSTASH_REDIS_REST_URL ? "✓ SET" : "✗ MISSING",
);
console.log(
  "[Upstash Debug] UPSTASH_REDIS_REST_TOKEN:",
  process.env.UPSTASH_REDIS_REST_TOKEN ? "✓ SET" : "✗ MISSING",
);
if (process.env.UPSTASH_REDIS_REST_URL) {
  try {
    const url = new URL(process.env.UPSTASH_REDIS_REST_URL);
    console.log("[Upstash Debug] Hostname:", url.hostname);
  } catch (e) {
    console.log("[Upstash Debug] Invalid URL format:", e.message);
  }
}

//create a rate limiter that allows 10 req per 20 sec
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "60 s"),
});

export default ratelimit;
