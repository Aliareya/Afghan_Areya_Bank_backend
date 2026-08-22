import { MigrationInterface, QueryRunner } from "typeorm";

export class Usermodel1787372001568 implements MigrationInterface {
    name = 'Usermodel1787372001568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "full_name" character varying NOT NULL, "email" character varying NOT NULL, "email_verified" boolean NOT NULL DEFAULT false, "phone" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'customer', "email_verification_token" character varying, "email_verification_expires" TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
