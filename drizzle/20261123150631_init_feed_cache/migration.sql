CREATE TABLE "feeds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"site_url" text,
	"title" text,
	"description" text,
	"icon_url" text,
	"format" text,
	"etag" text,
	"last_modified" text,
	"last_fetched_at" timestamp with time zone,
	"last_success_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feeds_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feed_id" uuid NOT NULL,
	"guid" text NOT NULL,
	"url" text,
	"title" text NOT NULL,
	"author" text,
	"published_at" timestamp with time zone,
	"content_html" text,
	"plain_text" text,
	"excerpt" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_feed_id_feeds_id_fk" FOREIGN KEY ("feed_id") REFERENCES "public"."feeds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feeds_last_fetched_at_idx" ON "feeds" USING btree ("last_fetched_at");--> statement-breakpoint
CREATE UNIQUE INDEX "items_feed_guid_idx" ON "items" USING btree ("feed_id","guid");--> statement-breakpoint
CREATE INDEX "items_feed_published_idx" ON "items" USING btree ("feed_id","published_at");--> statement-breakpoint
CREATE INDEX "items_published_at_idx" ON "items" USING btree ("published_at");