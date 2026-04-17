import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserEmailUniqueIndex1776200001000 implements MigrationInterface {
  name = 'AddUserEmailUniqueIndex1776200001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const exists = await queryRunner.query(`
      SELECT 1 FROM pg_indexes WHERE indexname = 'UQ_auth_user_email'
    `);
    if (!exists.length) {
      await queryRunner.query(
        `CREATE UNIQUE INDEX "UQ_auth_user_email" ON "auth"."user" ("email")`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "auth"."UQ_auth_user_email"`);
  }
}
