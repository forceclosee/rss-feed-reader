# Shared Feed cache with per-user Subscriptions

Feed sources and their Items are stored once in Neon and shared across all Users; a Subscription records a User's relationship to a Feed, including its custom title, Category, and refresh preference. This avoids duplicating Items and fetches, keeps deduplication and cron work bounded, and leaves Read State and Bookmarks as per-User joins.

The main consequence is that deleting a Feed from the product removes a Subscription, not the shared Feed or its Items. Per-User feed copies were rejected because they would multiply fetching, storage, and deduplication work for no user-visible gain.
