import { MigrationInterface, QueryRunner } from "typeorm";

export class EssentialTableSetup1744066413816 implements MigrationInterface {
    name = 'EssentialTableSetup1744066413816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."wallet-balances_currency_enum" AS ENUM('NGN', 'USD', 'GBP', 'EUR')`);
        await queryRunner.query(`CREATE TABLE "wallet-balances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "currency" "public"."wallet-balances_currency_enum" NOT NULL, "balance" numeric(18,2) NOT NULL DEFAULT '0', "locked_balance" numeric(18,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "wallet_id" uuid, CONSTRAINT "UQ_3801ede19db57adf6368a9a1144" UNIQUE ("wallet_id", "currency"), CONSTRAINT "PK_0c99116db889e22b8d66451dfcc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_default_currency_enum" AS ENUM('NGN', 'USD', 'GBP', 'EUR')`);
        await queryRunner.query(`CREATE TABLE "wallet" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "default_currency" "public"."wallet_default_currency_enum" NOT NULL DEFAULT 'NGN', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "REL_72548a47ac4a996cd254b08252" UNIQUE ("user_id"), CONSTRAINT "PK_bec464dd8d54c39c54fd32e2334" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_status_enum" AS ENUM('success', 'failed', 'reversed', 'pending')`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_type_enum" AS ENUM('funding', 'withdrawal', 'purchase', 'transfer', 'reversal', 'convert', 'trade', 'credit', 'debit')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reference" character varying NOT NULL, "description" character varying, "amount" numeric(10,2) NOT NULL, "status" "public"."transactions_status_enum" NOT NULL DEFAULT 'pending', "type" "public"."transactions_type_enum" NOT NULL, "rate_used" numeric(18,6), "currency" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "wallet_id" uuid, "user_id" uuid, CONSTRAINT "UQ_dd85cc865e0c3d5d4be095d3f3f" UNIQUE ("reference"), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_two_factor_method_enum" AS ENUM('email', 'totp', 'sms')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstname" character varying NOT NULL, "lastname" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "username" character varying NOT NULL, "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "is_suspended" boolean NOT NULL DEFAULT false, "suspended_at" TIMESTAMP, "password" character varying NOT NULL, "email_verified" boolean NOT NULL DEFAULT false, "email_verified_at" TIMESTAMP, "two_factor_secret" character varying, "two_factor_backup_codes" text, "two_factor_method" "public"."users_two_factor_method_enum", "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "api_logs" ("id" SERIAL NOT NULL, "uri" text NOT NULL, "method" character varying(255), "application" character varying(255), "headers" text, "query_params" text, "request_body" text, "originating_ip" character varying(255), "agent" character varying(255), "response" text, "status_code" integer NOT NULL, "latency" double precision, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ea3f2ad34a2921407593ff4425b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "wallet-balances" ADD CONSTRAINT "FK_aa0020fc95eb4ade2ef6646e42b" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "FK_72548a47ac4a996cd254b082522" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_0b171330be0cb621f8d73b87a9e" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_0b171330be0cb621f8d73b87a9e"`);
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "FK_72548a47ac4a996cd254b082522"`);
        await queryRunner.query(`ALTER TABLE "wallet-balances" DROP CONSTRAINT "FK_aa0020fc95eb4ade2ef6646e42b"`);
        await queryRunner.query(`DROP TABLE "api_logs"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_two_factor_method_enum"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_status_enum"`);
        await queryRunner.query(`DROP TABLE "wallet"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_default_currency_enum"`);
        await queryRunner.query(`DROP TABLE "wallet-balances"`);
        await queryRunner.query(`DROP TYPE "public"."wallet-balances_currency_enum"`);
    }

}
