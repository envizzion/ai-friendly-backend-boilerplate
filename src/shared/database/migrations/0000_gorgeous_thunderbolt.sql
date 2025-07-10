CREATE TYPE "public"."body_style_code" AS ENUM('Sedan', 'Hatchback', 'SUV', 'Wagon', 'Coupe', 'Convertible', 'Pickup', 'Van', 'Minivan', 'Motorcycle', 'Scooter', 'ATV', 'UTV', 'Other');--> statement-breakpoint
CREATE TYPE "public"."fuel_type" AS ENUM('ICE', 'Hybrid', 'PHEV', 'EV', 'FCEV', 'Other');--> statement-breakpoint
CREATE TYPE "public"."market_region" AS ENUM('NA', 'EU', 'APAC', 'LATAM', 'MEA', 'JP', 'CN', 'Global', 'Asia', 'Europe');--> statement-breakpoint
CREATE TYPE "public"."transmission_type" AS ENUM('MT', 'AT', 'CVT', 'DCT');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('Active', 'Discontinued', 'Upcoming', 'Limited');--> statement-breakpoint
CREATE TABLE "body_style" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" "body_style_code" NOT NULL,
	"name" varchar(50) NOT NULL,
	"category" varchar(30) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "body_style_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "category_part" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_variation_category_id" integer NOT NULL,
	"part_id" integer NOT NULL,
	"reference_number" integer NOT NULL,
	"reference_label" varchar(50) NOT NULL,
	"coordinates" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "color" (
	"id" serial PRIMARY KEY NOT NULL,
	"oem_code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"hex_value" char(7),
	"rgb_values" integer[],
	"manufacturer_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"file_size" integer NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"bucket" varchar(100) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"uploaded_by" integer,
	"tags" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "file_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_id" integer NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"price" varchar(10) NOT NULL,
	"cost" varchar(10),
	"supplier_id" integer,
	"reorder_level" integer DEFAULT 5 NOT NULL,
	"location" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manufacturer" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"logo_image_id" integer,
	"country_code" char(2),
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "manufacturer_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "manufacturer_name_unique" UNIQUE("name"),
	CONSTRAINT "manufacturer_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "model_variation_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"major_group_id" varchar(50),
	"file_id" integer,
	"part_list_image_id" integer,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"display_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "model_variation_category_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "model_variation_to_category" (
	"model_variation_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model_variation" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"model_id" integer NOT NULL,
	"name" varchar(300) NOT NULL,
	"variant_code" varchar(100),
	"model_year" integer NOT NULL,
	"fuel_type" "fuel_type" NOT NULL,
	"body_style_id" integer,
	"transmission_type" "transmission_type",
	"drivetrain" varchar(10),
	"market_region" "market_region" NOT NULL,
	"country_specific" char(2)[],
	"engine_code" varchar(50),
	"engine_displacement" integer,
	"trim_level" varchar(100),
	"equipment_level" varchar(50),
	"vin_pattern" varchar(17),
	"wmi_code" varchar(3),
	"default_color_id" integer,
	"status" "vehicle_status" DEFAULT 'Active' NOT NULL,
	"is_special_edition" boolean DEFAULT false NOT NULL,
	"limited_production" boolean DEFAULT false NOT NULL,
	"production_number" integer,
	"parts_catalog_code" varchar(100),
	"has_unique_parts" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"revision" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	CONSTRAINT "model_variation_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "model" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"manufacturer_id" integer NOT NULL,
	"name" varchar(200) NOT NULL,
	"display_name" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"model_code" varchar(50),
	"vehicle_type" "body_style_code" NOT NULL,
	"segment" varchar(20),
	"generation" varchar(50),
	"platform" varchar(50),
	"production_start" integer,
	"production_end" integer,
	"primary_markets" "market_region"[] DEFAULT ARRAY[]::market_region[] NOT NULL,
	"status" "vehicle_status" DEFAULT 'Active' NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "model_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "part_alternative" (
	"original_part_id" integer NOT NULL,
	"alternative_part_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "part_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"description" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "part_category_name_unique" UNIQUE("name"),
	CONSTRAINT "part_category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "part_name" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "part_name_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "part_name_name_unique" UNIQUE("name"),
	CONSTRAINT "part_name_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "part_tag" (
	"part_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "part" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"part_name_id" integer NOT NULL,
	"part_number" varchar(100) NOT NULL,
	"description" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "part_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "part_part_number_unique" UNIQUE("part_number")
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"color" varchar(7),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tag_name_unique" UNIQUE("name"),
	CONSTRAINT "tag_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"reset_token" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vehicle_hierarchy_audit" (
	"id" serial PRIMARY KEY NOT NULL,
	"table_name" varchar(50) NOT NULL,
	"record_id" integer NOT NULL,
	"action" varchar(10) NOT NULL,
	"changed_data" jsonb NOT NULL,
	"changed_by" uuid NOT NULL,
	"changed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vin_prefix" (
	"id" serial PRIMARY KEY NOT NULL,
	"variation_id" integer NOT NULL,
	"prefix" varchar(11) NOT NULL,
	"prefix_length" integer,
	"description" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vin_prefix_prefix_unique" UNIQUE("prefix")
);
--> statement-breakpoint
ALTER TABLE "category_part" ADD CONSTRAINT "category_part_model_variation_category_id_model_variation_category_id_fk" FOREIGN KEY ("model_variation_category_id") REFERENCES "public"."model_variation_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_part" ADD CONSTRAINT "category_part_part_id_part_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."part"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "color" ADD CONSTRAINT "color_manufacturer_id_manufacturer_id_fk" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."manufacturer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_part_id_part_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."part"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manufacturer" ADD CONSTRAINT "manufacturer_logo_image_id_file_id_fk" FOREIGN KEY ("logo_image_id") REFERENCES "public"."file"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_variation_category" ADD CONSTRAINT "model_variation_category_category_id_part_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."part_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_variation_category" ADD CONSTRAINT "model_variation_category_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_variation_category" ADD CONSTRAINT "model_variation_category_part_list_image_id_file_id_fk" FOREIGN KEY ("part_list_image_id") REFERENCES "public"."file"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_variation_to_category" ADD CONSTRAINT "model_variation_to_category_model_variation_id_model_variation_id_fk" FOREIGN KEY ("model_variation_id") REFERENCES "public"."model_variation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_variation_to_category" ADD CONSTRAINT "model_variation_to_category_category_id_model_variation_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."model_variation_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_variation" ADD CONSTRAINT "model_variation_model_id_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."model"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_variation" ADD CONSTRAINT "model_variation_body_style_id_body_style_id_fk" FOREIGN KEY ("body_style_id") REFERENCES "public"."body_style"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_variation" ADD CONSTRAINT "model_variation_default_color_id_color_id_fk" FOREIGN KEY ("default_color_id") REFERENCES "public"."color"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model" ADD CONSTRAINT "model_manufacturer_id_manufacturer_id_fk" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."manufacturer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_alternative" ADD CONSTRAINT "part_alternative_original_part_id_part_id_fk" FOREIGN KEY ("original_part_id") REFERENCES "public"."part"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_alternative" ADD CONSTRAINT "part_alternative_alternative_part_id_part_id_fk" FOREIGN KEY ("alternative_part_id") REFERENCES "public"."part"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_tag" ADD CONSTRAINT "part_tag_part_id_part_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."part"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_tag" ADD CONSTRAINT "part_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part" ADD CONSTRAINT "part_part_name_id_part_name_id_fk" FOREIGN KEY ("part_name_id") REFERENCES "public"."part_name"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vin_prefix" ADD CONSTRAINT "vin_prefix_variation_id_model_variation_id_fk" FOREIGN KEY ("variation_id") REFERENCES "public"."model_variation"("id") ON DELETE cascade ON UPDATE no action;