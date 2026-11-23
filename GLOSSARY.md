# Frontpage

A personalized front page for tech content. Users subscribe to RSS and Atom feeds, organize them into categories, and read items in one place.

## Language

**User**:
A person with an authenticated identity who owns Subscriptions, Categories, Read States, Bookmarks, and preferences.
_Avoid_: Member, customer

**Verified User**:
A User who has confirmed ownership of their email address.
_Avoid_: Confirmed account, active user

**Feed**:
A published RSS, Atom, or RDF source at a URL.
_Avoid_: Source, channel, blog

**Subscription**:
A user's relationship to a Feed, including its custom title, Category, and refresh preference.
_Avoid_: Feed, follow

**Item**:
A single entry published by a Feed.
_Avoid_: Article, post, entry

**Category**:
A user-defined grouping of Subscriptions. A Subscription belongs to at most one Category.
_Avoid_: Folder, tag, label

**Read State**:
Whether a user has read a particular Item.
_Avoid_: Seen status, unread flag

**Bookmark**:
A user's saved reference to an Item for later reading.
_Avoid_: Save, favorite

**Starter Pack**:
The 19 curated Feeds across five Categories offered to guests and new users.
_Avoid_: Sample feeds, demo feed set

**Guest Session**:
A browser-scoped, non-account workspace seeded with curated Feeds and not persisted across visits.
_Avoid_: Anonymous user, demo mode

**Feed Health**:
The status of a Feed's last fetch: active, stale, or error.
_Avoid_: Status, feed state
