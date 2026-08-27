import { MigrationInterface, QueryRunner } from "typeorm";

export class Transactionmodel1787656745056 implements MigrationInterface {
    name = 'Transactionmodel1787656745056'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transactions_type_enum" AS ENUM('deposit', 'withdraw')`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_status_enum" AS ENUM('pending', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_pay_type_enum" AS ENUM('wallet', 'card_to_card')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "type" "public"."transactions_type_enum" NOT NULL, "status" "public"."transactions_status_enum" NOT NULL DEFAULT 'pending', "amount" numeric(18,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "pay_type" "public"."transactions_pay_type_enum" NOT NULL, "sender_id" integer, "receiver_id" integer, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_5007c936fb75048f7697ecb7eb0" FOREIGN KEY ("sender_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_8dcd153bcbf943ac96288702e6f" FOREIGN KEY ("receiver_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_8dcd153bcbf943ac96288702e6f"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_5007c936fb75048f7697ecb7eb0"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_pay_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
    }

}
