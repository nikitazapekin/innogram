import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDatabaseSchemas1775563921060 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS "auth"');
    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS "main"');
    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS "notification"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP SCHEMA IF EXISTS "notification" CASCADE');
    await queryRunner.query('DROP SCHEMA IF EXISTS "main" CASCADE');
    await queryRunner.query('DROP SCHEMA IF EXISTS "auth" CASCADE');
  }
}
