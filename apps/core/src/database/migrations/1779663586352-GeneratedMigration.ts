import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeneratedMigration1779663586352 implements MigrationInterface {
  name = 'GeneratedMigration1779663586352';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "main"."profile" ADD "user_id" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "main"."profile" DROP COLUMN "user_id"`);
  }
}
