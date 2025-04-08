import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEssentialTables1744121811953 implements MigrationInterface {
    name = 'CreateEssentialTables1744121811953'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`transactions\` (\`id\` varchar(36) NOT NULL, \`reference\` varchar(255) NOT NULL, \`description\` text NULL, \`amount\` decimal(18,2) NOT NULL, \`status\` enum ('success', 'failed', 'reversed', 'pending') NOT NULL DEFAULT 'pending', \`type\` enum ('funding', 'withdrawal', 'purchase', 'transfer', 'reversal', 'convert', 'trade', 'credit', 'debit') NOT NULL, \`rate_used\` decimal(18,6) NULL, \`currency\` varchar(10) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`wallet_id\` varchar(36) NULL, \`user_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_dd85cc865e0c3d5d4be095d3f3\` (\`reference\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`firstname\` varchar(255) NOT NULL, \`lastname\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`phone\` varchar(255) NOT NULL, \`username\` varchar(255) NOT NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`deleted_at\` datetime NULL, \`is_suspended\` tinyint NOT NULL DEFAULT 0, \`suspended_at\` datetime NULL, \`password\` varchar(255) NOT NULL, \`email_verified\` tinyint NOT NULL DEFAULT 0, \`email_verified_at\` datetime NULL, \`two_factor_secret\` varchar(255) NULL, \`two_factor_backup_codes\` text NULL, \`two_factor_method\` enum ('email', 'totp', 'sms') NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), UNIQUE INDEX \`IDX_a000cca60bcf04454e72769949\` (\`phone\`), UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`wallets\` (\`id\` varchar(36) NOT NULL, \`default_currency\` enum ('NGN', 'USD', 'GBP', 'EUR') NOT NULL DEFAULT 'NGN', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` varchar(36) NULL, UNIQUE INDEX \`REL_92558c08091598f7a4439586cd\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`wallet_balances\` (\`id\` varchar(36) NOT NULL, \`currency\` enum ('NGN', 'USD', 'GBP', 'EUR') NOT NULL DEFAULT 'NGN', \`balance\` decimal(18,2) NOT NULL DEFAULT '0.00', \`locked_balance\` decimal(18,2) NOT NULL DEFAULT '0.00', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`wallet_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_1b60b0d14369f9d839beb925a5\` (\`wallet_id\`, \`currency\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`api_logs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`uri\` text NOT NULL, \`method\` varchar(255) NULL, \`application\` varchar(255) NULL, \`headers\` text NULL, \`query_params\` text NULL, \`request_body\` text NULL, \`originating_ip\` varchar(255) NULL, \`agent\` varchar(255) NULL, \`response\` text NULL, \`status_code\` int NOT NULL, \`latency\` double NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_0b171330be0cb621f8d73b87a9e\` FOREIGN KEY (\`wallet_id\`) REFERENCES \`wallets\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_e9acc6efa76de013e8c1553ed2b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`wallets\` ADD CONSTRAINT \`FK_92558c08091598f7a4439586cda\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`wallet_balances\` ADD CONSTRAINT \`FK_df71d0f9058318ebc25302aa365\` FOREIGN KEY (\`wallet_id\`) REFERENCES \`wallets\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`wallet_balances\` DROP FOREIGN KEY \`FK_df71d0f9058318ebc25302aa365\``);
        await queryRunner.query(`ALTER TABLE \`wallets\` DROP FOREIGN KEY \`FK_92558c08091598f7a4439586cda\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_e9acc6efa76de013e8c1553ed2b\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_0b171330be0cb621f8d73b87a9e\``);
        await queryRunner.query(`DROP TABLE \`api_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_1b60b0d14369f9d839beb925a5\` ON \`wallet_balances\``);
        await queryRunner.query(`DROP TABLE \`wallet_balances\``);
        await queryRunner.query(`DROP INDEX \`REL_92558c08091598f7a4439586cd\` ON \`wallets\``);
        await queryRunner.query(`DROP TABLE \`wallets\``);
        await queryRunner.query(`DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_a000cca60bcf04454e72769949\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_dd85cc865e0c3d5d4be095d3f3\` ON \`transactions\``);
        await queryRunner.query(`DROP TABLE \`transactions\``);
    }

}
