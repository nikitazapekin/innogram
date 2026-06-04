import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeneratedMigration1779401864041 implements MigrationInterface {
  name = 'GeneratedMigration1779401864041';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "main"."profile" ADD "user_id" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."profile" ADD CONSTRAINT "UQ_d752442f45f258a8bdefeebb2f2" UNIQUE ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile" ADD CONSTRAINT "FK_d752442f45f258a8bdefeebb2f2" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "main"."profile" DROP CONSTRAINT "FK_d752442f45f258a8bdefeebb2f2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile" DROP CONSTRAINT "UQ_d752442f45f258a8bdefeebb2f2"`,
    );
    await queryRunner.query(`ALTER TABLE "main"."profile" DROP COLUMN "user_id"`);
  }
}
