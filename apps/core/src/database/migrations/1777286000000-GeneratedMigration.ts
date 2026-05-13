import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeneratedMigration1777286000000 implements MigrationInterface {
  name = 'GeneratedMigration1777286000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth"."user" ADD CONSTRAINT "UQ_auth_user_email" UNIQUE ("email")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auth"."user" DROP CONSTRAINT "UQ_auth_user_email"`);
  }
}
