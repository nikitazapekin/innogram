import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeProfileUserNullable1776200002000 implements MigrationInterface {
  name = 'MakeProfileUserNullable1776200002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "main"."profile" ALTER COLUMN "user_id" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "main"."profile" ALTER COLUMN "user_id" SET NOT NULL`);
  }
}
