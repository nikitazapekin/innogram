import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeneratedMigration1777285347312 implements MigrationInterface {
  name = 'GeneratedMigration1777285347312';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" ADD "type" character varying(100) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notification"."notification" DROP COLUMN "type"`);
  }
}
