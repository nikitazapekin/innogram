import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeneratedMigration1779390256879 implements MigrationInterface {
  name = 'GeneratedMigration1779390256879';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "main"."message" DROP CONSTRAINT "FK_33e2f86a56c2f6cc113affdfb66"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile" DROP CONSTRAINT "FK_d752442f45f258a8bdefeebb2f2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile" DROP CONSTRAINT "UQ_d752442f45f258a8bdefeebb2f2"`,
    );
    await queryRunner.query(`ALTER TABLE "main"."profile" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "main"."comment" DROP COLUMN "author_profile_id"`);
    await queryRunner.query(
      `ALTER TABLE "main"."comment" ADD "author_profile_id" integer NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "main"."message" DROP COLUMN "author_profile_id"`);
    await queryRunner.query(`ALTER TABLE "main"."message" ADD "author_profile_id" uuid NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "main"."message" DROP COLUMN "author_profile_id"`);
    await queryRunner.query(
      `ALTER TABLE "main"."message" ADD "author_profile_id" integer NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "main"."comment" DROP COLUMN "author_profile_id"`);
    await queryRunner.query(`ALTER TABLE "main"."comment" ADD "author_profile_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "main"."profile" ADD "user_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "main"."profile" ADD CONSTRAINT "UQ_d752442f45f258a8bdefeebb2f2" UNIQUE ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile" ADD CONSTRAINT "FK_d752442f45f258a8bdefeebb2f2" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message" ADD CONSTRAINT "FK_33e2f86a56c2f6cc113affdfb66" FOREIGN KEY ("author_profile_id") REFERENCES "main"."profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
