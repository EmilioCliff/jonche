CREATE TABLE "customers" (
  "id" bigserial PRIMARY KEY,
  "name" varchar(255) UNIQUE NOT NULL,
  "phone_number" varchar(255) UNIQUE NOT NULL,
  "status" bool NOT NULL DEFAULT true,
  "loaned" numeric(12,2) NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "users" (
  "id" bigserial PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "email" varchar(255) UNIQUE NOT NULL,
  "password" varchar(255) NOT NULL,
  "refresh_token" text NOT NULL
);

CREATE TABLE "loans" (
  "id" bigserial PRIMARY KEY,
  "customer_id" bigint NOT NULL,
  "description" text NOT NULL,
  "amount" numeric(12,2) NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),

  CONSTRAINT "loans_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id")
);

CREATE TABLE "sms" (
  "id" bigserial PRIMARY KEY,
  "customer_id" bigint NOT NULL,
  "message" text NOT NULL,
  "type" varchar(255) NOT NULL,
  "status" varchar(255) NOT NULL DEFAULT 'undelivered',
  "created_at" timestamptz NOT NULL DEFAULT (now()),

  CONSTRAINT "sms_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id")
);

CREATE TABLE "payments" (
  "id" bigserial PRIMARY KEY,
  "transaction_number" varchar(255) NOT NULL,
  "transaction_source" varchar(255) NOT NULL,
  "paying_name" varchar(255) NOT NULL,
  "amount" numeric(12,2) NOT NULL,
  "assigned" bool NOT NULL DEFAULT false,
  "assigned_to" bigint,
  "paid_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE INDEX ON "customers" ("name");

CREATE INDEX ON "customers" ("phone_number");

CREATE INDEX ON "users" ("email");

CREATE INDEX ON "loans" ("customer_id");

CREATE INDEX ON "sms" ("customer_id");

CREATE INDEX ON "payments" ("assigned_to");

CREATE INDEX ON "payments" ("assigned");

COMMENT ON COLUMN "sms"."type" IS 'automated or manual';

COMMENT ON COLUMN "sms"."status" IS 'delivered or undelivered';
