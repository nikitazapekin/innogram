import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeneratedMigration1779393010463 implements MigrationInterface {
  name = 'GeneratedMigration1779393010463';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "main"."post" DROP COLUMN "author_profile_id"`);
    await queryRunner.query(`ALTER TABLE "main"."post" ADD "author_profile_id" integer NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "main"."post" DROP COLUMN "author_profile_id"`);
    await queryRunner.query(`ALTER TABLE "main"."post" ADD "author_profile_id" uuid NOT NULL`);
  }
}
