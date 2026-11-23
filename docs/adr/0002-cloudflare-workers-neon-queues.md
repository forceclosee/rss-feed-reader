# Cloudflare Workers, Queues, and Neon

The app deploys as a TanStack Start Worker on Cloudflare. A Cron trigger enqueues due Feeds into Cloudflare Queues, and a consumer fetches and parses each Feed with a 10-second timeout, retries, and per-feed backoff. Application data lives in Neon Postgres through Drizzle; because Workers cannot hold long-lived TCP connections, the app uses the Neon HTTP driver.

This buys global deployment and isolated, retryable feed refreshes at the cost of split infrastructure and provider lock-in. Fetching every due Feed directly inside the Cron invocation was rejected because one slow or broken source could consume the whole run.
