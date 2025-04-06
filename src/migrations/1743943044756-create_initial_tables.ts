import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1743943044756 implements MigrationInterface {
    name = 'CreateInitialTables1743943044756'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "wallet" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "naira" numeric(18,2) NOT NULL DEFAULT '0', "dollar" numeric(18,2) NOT NULL DEFAULT '0', "pound" numeric(18,2) NOT NULL DEFAULT '0', "euro" numeric(18,2) NOT NULL DEFAULT '0', "default_currency" character varying NOT NULL DEFAULT 'naira', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "REL_72548a47ac4a996cd254b08252" UNIQUE ("user_id"), CONSTRAINT "PK_bec464dd8d54c39c54fd32e2334" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstname" character varying NOT NULL, "lastname" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "username" character varying NOT NULL, "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "is_suspended" boolean NOT NULL DEFAULT false, "suspended_at" TIMESTAMP, "password" character varying NOT NULL, "email_verified" boolean NOT NULL DEFAULT false, "email_verified_at" TIMESTAMP, "two_factor_secret" character varying, "two_factor_backup_codes" text, "two_factor_method" "public"."users_two_factor_method_enum", "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "FK_72548a47ac4a996cd254b082522" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "FK_72548a47ac4a996cd254b082522"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "wallet"`);
    }

}
