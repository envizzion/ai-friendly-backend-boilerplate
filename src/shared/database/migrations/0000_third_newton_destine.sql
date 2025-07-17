CREATE TYPE "public"."audit_action" AS ENUM('INSERT', 'UPDATE', 'DELETE');--> statement-breakpoint
CREATE TYPE "public"."body_style_category" AS ENUM('Car', 'Motorcycle', 'Truck', 'Commercial', 'Other');--> statement-breakpoint
CREATE TYPE "public"."body_style_code" AS ENUM('Sedan', 'Hatchback', 'SUV', 'Wagon', 'Coupe', 'Convertible', 'Pickup', 'Van', 'Minivan', 'Motorcycle', 'Scooter', 'ATV', 'UTV', 'Other');--> statement-breakpoint
CREATE TYPE "public"."drivetrain_type" AS ENUM('FWD', 'RWD', 'AWD', '4WD');--> statement-breakpoint
CREATE TYPE "public"."equipment_level" AS ENUM('Standard', 'Premium', 'Luxury', 'Sport', 'Performance', 'Other');--> statement-breakpoint
CREATE TYPE "public"."fuel_type" AS ENUM('ICE', 'Hybrid', 'PHEV', 'EV', 'FCEV', 'Other');--> statement-breakpoint
CREATE TYPE "public"."market_region" AS ENUM('NA', 'EU', 'APAC', 'LATAM', 'MEA', 'JP', 'CN', 'Global', 'Asia', 'Europe');--> statement-breakpoint
CREATE TYPE "public"."transmission_type" AS ENUM('MT', 'AT', 'CVT', 'DCT');--> statement-breakpoint
CREATE TYPE "public"."trim_level" AS ENUM('Base', 'S', 'SE', 'SEL', 'Sport', 'Limited', 'Premium', 'Luxury', 'Performance', 'Touring', 'Other');--> statement-breakpoint
CREATE TYPE "public"."vehicle_segment" AS ENUM('A', 'B', 'C', 'D', 'E', 'F', 'Motorcycle', 'Scooter', 'ATV', 'UTV', 'Commercial', 'Other');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('Active', 'Discontinued', 'Upcoming', 'Limited');--> statement-breakpoint
CREATE TYPE "public"."business_type" AS ENUM('retailer', 'wholesaler', 'manufacturer', 'distributor', 'recycler');--> statement-breakpoint
CREATE TYPE "public"."inventory_condition" AS ENUM('new', 'used', 'refurbished', 'core', 'damaged');--> statement-breakpoint
CREATE TYPE "public"."vendor_order_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'partial', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."vendor_status" AS ENUM('pending', 'active', 'suspended', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."address_type" AS ENUM('billing', 'shipping', 'both');--> statement-breakpoint
CREATE TYPE "public"."customer_order_status" AS ENUM('cart', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');--> statement-breakpoint
CREATE TYPE "public"."customer_payment_status" AS ENUM('pending', 'authorized', 'captured', 'failed', 'refunded', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."customer_status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."wishlist_privacy" AS ENUM('private', 'public', 'friends');--> statement-breakpoint
CREATE TABLE "body_style" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" "body_style_code" NOT NULL,
	"name" varchar(50) NOT NULL,
	"category" "body_style_category" NOT NULL,
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
	"drivetrain" "drivetrain_type",
	"market_region" "market_region" NOT NULL,
	"country_specific" char(2)[],
	"engine_code" varchar(50),
	"engine_displacement" integer,
	"trim_level" "trim_level",
	"equipment_level" "equipment_level",
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
	"segment" "vehicle_segment",
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
	"action" "audit_action" NOT NULL,
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
CREATE TABLE "vendor_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_id" integer NOT NULL,
	"period" varchar(20) NOT NULL,
	"period_date" timestamp NOT NULL,
	"total_sales" numeric(12, 2) DEFAULT '0.00',
	"total_orders" integer DEFAULT 0,
	"average_order_value" numeric(10, 2) DEFAULT '0.00',
	"total_inventory_items" integer DEFAULT 0,
	"total_inventory_value" numeric(15, 2) DEFAULT '0.00',
	"low_stock_items" integer DEFAULT 0,
	"new_customers" integer DEFAULT 0,
	"returning_customers" integer DEFAULT 0,
	"top_selling_part_public_id" uuid,
	"top_selling_part_quantity" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" integer NOT NULL,
	"core_part_public_id" uuid NOT NULL,
	"sku" varchar(100),
	"quantity" integer DEFAULT 0 NOT NULL,
	"reserved_quantity" integer DEFAULT 0 NOT NULL,
	"available_quantity" integer DEFAULT 0 NOT NULL,
	"cost" numeric(10, 2),
	"price" numeric(10, 2) NOT NULL,
	"msrp" numeric(10, 2),
	"condition" "inventory_condition" DEFAULT 'new' NOT NULL,
	"condition_notes" text,
	"warehouse_location" varchar(100),
	"bin_location" varchar(50),
	"reorder_level" integer DEFAULT 5 NOT NULL,
	"reorder_quantity" integer DEFAULT 10 NOT NULL,
	"last_restock_date" timestamp,
	"is_available" boolean DEFAULT true NOT NULL,
	"is_discontinued" boolean DEFAULT false NOT NULL,
	"available_from_date" timestamp,
	"available_until_date" timestamp,
	"weight" numeric(8, 2),
	"dimensions" varchar(50),
	"shipping_class" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "vendor_inventory_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "vendor_order_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"order_id" integer NOT NULL,
	"inventory_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vendor_order_item_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "vendor_order" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" integer NOT NULL,
	"customer_profile_public_id" uuid,
	"order_number" varchar(50) NOT NULL,
	"status" "vendor_order_status" DEFAULT 'pending' NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"tax_amount" numeric(12, 2) DEFAULT '0.00',
	"shipping_amount" numeric(12, 2) DEFAULT '0.00',
	"discount_amount" numeric(12, 2) DEFAULT '0.00',
	"total_amount" numeric(12, 2) NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"payment_method" varchar(50),
	"payment_reference" varchar(100),
	"shipping_method" varchar(100),
	"tracking_number" varchar(100),
	"estimated_delivery_date" timestamp,
	"actual_delivery_date" timestamp,
	"shipping_address_line1" varchar(255),
	"shipping_address_line2" varchar(255),
	"shipping_city" varchar(100),
	"shipping_state" varchar(100),
	"shipping_zip_code" varchar(20),
	"shipping_country" varchar(2) DEFAULT 'US',
	"customer_notes" text,
	"vendor_notes" text,
	"internal_notes" text,
	"order_date" timestamp DEFAULT now() NOT NULL,
	"confirmed_at" timestamp,
	"shipped_at" timestamp,
	"delivered_at" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "vendor_order_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "vendor_order_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "vendor_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"business_name" varchar(200) NOT NULL,
	"business_type" "business_type" NOT NULL,
	"tax_id" varchar(50),
	"business_license" varchar(100),
	"contact_email" varchar(255) NOT NULL,
	"contact_phone" varchar(50),
	"website" varchar(255),
	"address_line1" varchar(255),
	"address_line2" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"zip_code" varchar(20),
	"country" varchar(2) DEFAULT 'US',
	"business_description" text,
	"logo_image_id" uuid,
	"is_verified" boolean DEFAULT false NOT NULL,
	"status" "vendor_status" DEFAULT 'pending' NOT NULL,
	"verified_at" timestamp,
	"verified_by" uuid,
	"total_sales" numeric(12, 2) DEFAULT '0.00',
	"total_orders" integer DEFAULT 0,
	"average_rating" numeric(3, 2),
	"review_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "vendor_profile_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "customer_address" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" integer NOT NULL,
	"type" "address_type" NOT NULL,
	"label" varchar(100),
	"address_line1" varchar(255) NOT NULL,
	"address_line2" varchar(255),
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"zip_code" varchar(20) NOT NULL,
	"country" varchar(2) DEFAULT 'US' NOT NULL,
	"contact_name" varchar(200),
	"contact_phone" varchar(50),
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"delivery_instructions" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customer_address_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "customer_order_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"order_id" integer NOT NULL,
	"vendor_profile_public_id" uuid NOT NULL,
	"vendor_inventory_public_id" uuid NOT NULL,
	"core_part_public_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"part_number" varchar(100) NOT NULL,
	"part_name" varchar(200) NOT NULL,
	"vendor_sku" varchar(100),
	"condition" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"vendor_order_public_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customer_order_item_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "customer_order" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" integer NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"status" "customer_order_status" DEFAULT 'pending' NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"tax_amount" numeric(12, 2) DEFAULT '0.00',
	"shipping_amount" numeric(12, 2) DEFAULT '0.00',
	"discount_amount" numeric(12, 2) DEFAULT '0.00',
	"total_amount" numeric(12, 2) NOT NULL,
	"payment_status" "customer_payment_status" DEFAULT 'pending' NOT NULL,
	"payment_method" varchar(50),
	"payment_reference" varchar(100),
	"billing_address_line1" varchar(255),
	"billing_address_line2" varchar(255),
	"billing_city" varchar(100),
	"billing_state" varchar(100),
	"billing_zip_code" varchar(20),
	"billing_country" varchar(2) DEFAULT 'US',
	"shipping_address_line1" varchar(255),
	"shipping_address_line2" varchar(255),
	"shipping_city" varchar(100),
	"shipping_state" varchar(100),
	"shipping_zip_code" varchar(20),
	"shipping_country" varchar(2) DEFAULT 'US',
	"shipping_method" varchar(100),
	"tracking_number" varchar(100),
	"estimated_delivery_date" timestamp,
	"actual_delivery_date" timestamp,
	"customer_notes" text,
	"internal_notes" text,
	"order_date" timestamp DEFAULT now() NOT NULL,
	"confirmed_at" timestamp,
	"shipped_at" timestamp,
	"delivered_at" timestamp,
	"cancelled_at" timestamp,
	"source_cart_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customer_order_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "customer_order_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "customer_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"date_of_birth" timestamp,
	"status" "customer_status" DEFAULT 'active' NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"is_phone_verified" boolean DEFAULT false NOT NULL,
	"email_verified_at" timestamp,
	"preferred_language" varchar(10) DEFAULT 'en',
	"preferred_currency" varchar(3) DEFAULT 'USD',
	"timezone" varchar(50) DEFAULT 'UTC',
	"accepts_marketing_emails" boolean DEFAULT true NOT NULL,
	"accepts_sms_notifications" boolean DEFAULT false NOT NULL,
	"total_orders" integer DEFAULT 0,
	"total_spent" numeric(12, 2) DEFAULT '0.00',
	"average_order_value" numeric(10, 2) DEFAULT '0.00',
	"last_order_date" timestamp,
	"profile_image_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp,
	CONSTRAINT "customer_profile_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "customer_profile_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "customer_search_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer,
	"search_term" varchar(500) NOT NULL,
	"search_filters" text,
	"result_count" integer DEFAULT 0,
	"session_id" varchar(255),
	"user_agent" varchar(500),
	"clicked_results" integer DEFAULT 0,
	"added_to_cart" integer DEFAULT 0,
	"searched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_wishlist_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"wishlist_id" integer NOT NULL,
	"core_part_public_id" uuid NOT NULL,
	"notes" text,
	"priority" varchar(20) DEFAULT 'medium',
	"target_price" numeric(10, 2),
	"is_in_stock" boolean DEFAULT false NOT NULL,
	"lowest_price" numeric(10, 2),
	"last_price_check" timestamp,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customer_wishlist_item_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "customer_wishlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" integer NOT NULL,
	"name" varchar(200) DEFAULT 'My Wishlist' NOT NULL,
	"description" text,
	"privacy" "wishlist_privacy" DEFAULT 'private' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"item_count" integer DEFAULT 0 NOT NULL,
	"share_token" uuid DEFAULT gen_random_uuid(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customer_wishlist_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "customer_wishlist_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "shopping_cart_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" integer NOT NULL,
	"vendor_inventory_public_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"customer_notes" text,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shopping_cart_item_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "shopping_cart" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"item_count" integer DEFAULT 0 NOT NULL,
	"subtotal" numeric(12, 2) DEFAULT '0.00',
	"session_id" varchar(255),
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	"abandoned_at" timestamp,
	"converted_to_order_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shopping_cart_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
ALTER TABLE "category_part" ADD CONSTRAINT "category_part_model_variation_category_id_model_variation_category_id_fk" FOREIGN KEY ("model_variation_category_id") REFERENCES "public"."model_variation_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_part" ADD CONSTRAINT "category_part_part_id_part_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."part"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "color" ADD CONSTRAINT "color_manufacturer_id_manufacturer_id_fk" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."manufacturer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "vin_prefix" ADD CONSTRAINT "vin_prefix_variation_id_model_variation_id_fk" FOREIGN KEY ("variation_id") REFERENCES "public"."model_variation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_analytics" ADD CONSTRAINT "vendor_analytics_vendor_id_vendor_profile_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_inventory" ADD CONSTRAINT "vendor_inventory_vendor_id_vendor_profile_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_order_item" ADD CONSTRAINT "vendor_order_item_order_id_vendor_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."vendor_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_order_item" ADD CONSTRAINT "vendor_order_item_inventory_id_vendor_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."vendor_inventory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_order" ADD CONSTRAINT "vendor_order_vendor_id_vendor_profile_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_address" ADD CONSTRAINT "customer_address_customer_id_customer_profile_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_order_item" ADD CONSTRAINT "customer_order_item_order_id_customer_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."customer_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_order" ADD CONSTRAINT "customer_order_customer_id_customer_profile_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_order" ADD CONSTRAINT "customer_order_source_cart_id_shopping_cart_id_fk" FOREIGN KEY ("source_cart_id") REFERENCES "public"."shopping_cart"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_search_history" ADD CONSTRAINT "customer_search_history_customer_id_customer_profile_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_wishlist_item" ADD CONSTRAINT "customer_wishlist_item_wishlist_id_customer_wishlist_id_fk" FOREIGN KEY ("wishlist_id") REFERENCES "public"."customer_wishlist"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_wishlist" ADD CONSTRAINT "customer_wishlist_customer_id_customer_profile_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_cart_item" ADD CONSTRAINT "shopping_cart_item_cart_id_shopping_cart_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."shopping_cart"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_cart" ADD CONSTRAINT "shopping_cart_customer_id_customer_profile_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profile"("id") ON DELETE cascade ON UPDATE no action;