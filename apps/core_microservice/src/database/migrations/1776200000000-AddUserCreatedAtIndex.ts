import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserCreatedAtIndex1776200000000 implements MigrationInterface {
  name = 'AddUserCreatedAtIndex1776200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const exists = await queryRunner.query(`
      SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_auth_user_created_at'
    `);
    if (!exists.length) {
      await queryRunner.query(
        `CREATE INDEX "IDX_auth_user_created_at" ON "auth"."user" ("created_at")`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "auth"."IDX_auth_user_created_at"`);
  }
}
