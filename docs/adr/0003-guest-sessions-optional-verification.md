# Client-only Guest Sessions and optional email verification

Guest subscriptions, categories, Read State, Bookmarks, layout, theme, and accessibility preferences live in `sessionStorage`, while feed content comes from the shared server cache. Signing up can migrate that state into the new account. Accounts are usable without email verification, which is optional and prompted by a banner; only changing email and deleting an account require verified ownership.

This keeps guest mode instant and avoids anonymous database Users, but a Guest Session is lost when the tab closes if it is not migrated. Anonymous Better Auth accounts were rejected because the spec calls for session-scoped guest data, not a persistent shadow account.
