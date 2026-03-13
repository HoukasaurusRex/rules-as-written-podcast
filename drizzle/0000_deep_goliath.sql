CREATE TABLE "characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"party_id" uuid NOT NULL,
	"name" text NOT NULL,
	"class" text,
	"level" integer DEFAULT 1,
	"cp" integer DEFAULT 0,
	"sp" integer DEFAULT 0,
	"ep" integer DEFAULT 0,
	"gp" integer DEFAULT 0,
	"pp" integer DEFAULT 0,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"party_id" uuid NOT NULL,
	"character_id" uuid,
	"name" text NOT NULL,
	"quantity" integer DEFAULT 1,
	"weight" real,
	"srd_index" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "magic_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"party_id" uuid NOT NULL,
	"character_id" uuid,
	"name" text NOT NULL,
	"rarity" text,
	"description" text,
	"attuned" boolean DEFAULT false,
	"requires_attunement" boolean DEFAULT false,
	"srd_index" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"code_hash" text NOT NULL,
	"loot_active_by" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "parties_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"party_id" uuid NOT NULL,
	"character_id" uuid,
	"type" text NOT NULL,
	"cp" integer DEFAULT 0,
	"sp" integer DEFAULT 0,
	"ep" integer DEFAULT 0,
	"gp" integer DEFAULT 0,
	"pp" integer DEFAULT 0,
	"item_name" text,
	"note" text,
	"undone" boolean DEFAULT false,
	"undoes_id" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_party_id_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_party_id_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magic_items" ADD CONSTRAINT "magic_items_party_id_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magic_items" ADD CONSTRAINT "magic_items_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_party_id_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE set null ON UPDATE no action;