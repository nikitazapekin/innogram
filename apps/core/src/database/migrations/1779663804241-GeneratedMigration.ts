import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeneratedMigration1779663804241 implements MigrationInterface {
  name = 'GeneratedMigration1779663804241';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "main"."message" DROP COLUMN "author_profile_id"`);
    await queryRunner.query(
      `ALTER TABLE "main"."message" ADD "author_profile_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" DROP COLUMN "recipient_profile_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" ADD "recipient_profile_id" integer NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" DROP COLUMN "recipient_profile_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" ADD "recipient_profile_id" uuid NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "main"."message" DROP COLUMN "author_profile_id"`);
    await queryRunner.query(`ALTER TABLE "main"."message" ADD "author_profile_id" uuid NOT NULL`);
  }
}
