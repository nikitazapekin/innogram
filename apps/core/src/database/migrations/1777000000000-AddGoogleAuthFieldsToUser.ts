import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGoogleAuthFieldsToUser1777000000000 implements MigrationInterface {
  name = 'AddGoogleAuthFieldsToUser1777000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth"."user" ADD "provider" character varying(20) NOT NULL DEFAULT 'local'`,
    );
    await queryRunner.query(`ALTER TABLE "auth"."user" ADD "google_id" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "auth"."user" ALTER COLUMN "password_hash" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "auth"."user" ADD CONSTRAINT "UQ_auth_user_google_id" UNIQUE ("google_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auth"."user" DROP CONSTRAINT "UQ_auth_user_google_id"`);
    await queryRunner.query(
      `UPDATE "auth"."user" SET "password_hash" = '' WHERE "password_hash" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "auth"."user" SET "provider" = 'local' WHERE "provider" IS NULL`,
    );
    await queryRunner.query(`ALTER TABLE "auth"."user" ALTER COLUMN "password_hash" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "auth"."user" DROP COLUMN "google_id"`);
    await queryRunner.query(`ALTER TABLE "auth"."user" DROP COLUMN "provider"`);
  }
}
