-- Create "user_accounts" table
CREATE TABLE "public"."user_accounts" (
  "id" uuid NOT NULL,
  "name" character varying(255) NOT NULL,
  "display_name" character varying(255) NULL DEFAULT NULL::character varying,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "user_accounts_name_key" UNIQUE ("name")
);
