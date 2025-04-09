ALTER TABLE "loans" DROP CONSTRAINT "loans_customer_id_fkey";
ALTER TABLE "sms" DROP CONSTRAINT "sms_customer_id_fkey";

DROP TABLE "customers";
DROP TABLE "users";
DROP TABLE "loans";
DROP TABLE "sms";
DROP TABLE "payments";