import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeneratedMigration1776102764805 implements MigrationInterface {
  name = 'GeneratedMigration1776102764805';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auth"."account" DROP COLUMN "provider"`);
    await queryRunner.query(`ALTER TABLE "auth"."account" DROP COLUMN "provider_account_id"`);
    await queryRunner.query(
      `ALTER TABLE "main"."asset" ADD "file_name" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."asset" ADD "mime_type" character varying(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "main"."asset" DROP COLUMN "mime_type"`);
    await queryRunner.query(`ALTER TABLE "main"."asset" DROP COLUMN "file_name"`);
    await queryRunner.query(
      `ALTER TABLE "auth"."account" ADD "provider_account_id" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth"."account" ADD "provider" character varying(50) NOT NULL`,
    );
  }
}
