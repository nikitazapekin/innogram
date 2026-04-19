import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserPasswordHashToText1776379247771 implements MigrationInterface {
  name = 'AlterUserPasswordHashToText1776379247771';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auth"."user" ALTER COLUMN "password_hash" TYPE text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth"."user" ALTER COLUMN "password_hash" TYPE character varying(255)`,
    );
  }
}
