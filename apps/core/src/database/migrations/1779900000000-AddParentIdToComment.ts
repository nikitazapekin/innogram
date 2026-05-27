import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddParentIdToComment1779900000000 implements MigrationInterface {
  name = 'AddParentIdToComment1779900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "main"."comment" ADD "parent_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "main"."comment" ADD CONSTRAINT "FK_comment_parent" FOREIGN KEY ("parent_id") REFERENCES "main"."comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "main"."comment" DROP CONSTRAINT "FK_comment_parent"`);
    await queryRunner.query(`ALTER TABLE "main"."comment" DROP COLUMN "parent_id"`);
  }
}
