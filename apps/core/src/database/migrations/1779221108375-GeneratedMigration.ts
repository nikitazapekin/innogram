import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeneratedMigration1779221108375 implements MigrationInterface {
  name = 'GeneratedMigration1779221108375';

  public async up(_queryRunner: QueryRunner): Promise<void> {
    // No-op: post is created in GeneratedMigration1776957156166 and converted to
    // integer id in GeneratedMigration1779392799643. This migration was generated
    // incorrectly with a duplicate CREATE TABLE "main"."post".
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Intentionally empty — see up().
  }
}
