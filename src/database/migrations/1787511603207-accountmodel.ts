import { MigrationInterface, QueryRunner } from "typeorm";

export class Accountmodel1787511603207 implements MigrationInterface {
    name = 'Accountmodel1787511603207'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "accounts" ("id" SERIAL NOT NULL, "account_number" character varying NOT NULL, "account_name" character varying NOT NULL, "account_pin" character varying NOT NULL, "account_type" character varying NOT NULL DEFAULT 'current', "currency" character varying NOT NULL DEFAULT 'AFN', "balance" numeric(15,2) NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT false, "user_id" integer NOT NULL, "two_factor_enabled" boolean NOT NULL DEFAULT false, "two_factor_code_expires_at" TIMESTAMP, "two_factor_code" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ffd1ae96513bfb2c6eada0f7d31" UNIQUE ("account_number"), CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD CONSTRAINT "FK_3000dad1da61b29953f07476324" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" DROP CONSTRAINT "FK_3000dad1da61b29953f07476324"`);
        await queryRunner.query(`DROP TABLE "accounts"`);
    }

}
