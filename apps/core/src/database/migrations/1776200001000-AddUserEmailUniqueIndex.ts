import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserEmailUniqueIndex1776200001000 implements MigrationInterface {
  name = 'AddUserEmailUniqueIndex1776200001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_auth_user_email" ON "auth"."user" ("email")`); // как сделать чище?    пересмотреть как лучше ."user" ("email")
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //просмотреть
    await queryRunner.query(`DROP INDEX "auth"."UQ_auth_user_email"`);
  }
}
