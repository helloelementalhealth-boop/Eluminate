CREATE TABLE "sleep_tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tool_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"content" text NOT NULL,
	"duration_minutes" integer,
	"is_premium" boolean DEFAULT false,
	"audio_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
