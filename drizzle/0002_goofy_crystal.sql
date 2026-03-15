CREATE TABLE "item_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"party_id" uuid,
	"source" text NOT NULL,
	"srd_index" text,
	"name" text NOT NULL,
	"cost_qty" integer,
	"cost_unit" text,
	"weight" real,
	"category" text NOT NULL,
	"damage_dice" text,
	"damage_type" text,
	"two_handed_dice" text,
	"two_handed_type" text,
	"weapon_category" text,
	"weapon_range" text,
	"range_normal" integer,
	"range_long" integer,
	"properties" text[],
	"ac_base" integer,
	"ac_dex_bonus" boolean,
	"armor_category" text,
	"str_minimum" integer,
	"stealth_disadvantage" boolean,
	"speed_qty" integer,
	"speed_unit" text,
	"capacity" text,
	"vehicle_category" text,
	"description" text,
	"tool_category" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "item_catalog_srd_index_unique" UNIQUE("srd_index")
);
--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "catalog_item_id" uuid;--> statement-breakpoint
ALTER TABLE "item_catalog" ADD CONSTRAINT "item_catalog_party_id_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_catalog_item_id_item_catalog_id_fk" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."item_catalog"("id") ON DELETE set null ON UPDATE no action;