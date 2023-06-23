import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initiate Redis instance by connecting to REST URL
export const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL || "",
	token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Create a new ratelimiter, that allows 1 requests per 10 seconds
export const ratelimit =
	process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
		? new Ratelimit({
				redis: Redis.fromEnv(),
				limiter: Ratelimit.slidingWindow(1, "10 s"),
				analytics: true,
		  })
		: null;
