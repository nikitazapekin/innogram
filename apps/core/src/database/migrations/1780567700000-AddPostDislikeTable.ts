import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPostDislikeTable1780567700000 implements MigrationInterface {
  name = 'AddPostDislikeTable1780567700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "main"."post_dislike" ("post_id" integer NOT NULL, "profile_id" integer NOT NULL, CONSTRAINT "PK_post_dislike" PRIMARY KEY ("post_id", "profile_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_post_dislike_post_id" ON "main"."post_dislike" ("post_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_post_dislike_profile_id" ON "main"."post_dislike" ("profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_dislike" ADD CONSTRAINT "FK_post_dislike_post" FOREIGN KEY ("post_id") REFERENCES "main"."post"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_dislike" ADD CONSTRAINT "FK_post_dislike_profile" FOREIGN KEY ("profile_id") REFERENCES "main"."profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "main"."post_dislike" DROP CONSTRAINT "FK_post_dislike_profile"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_dislike" DROP CONSTRAINT "FK_post_dislike_post"`,
    );
    await queryRunner.query(`DROP INDEX "main"."IDX_post_dislike_profile_id"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_post_dislike_post_id"`);
    await queryRunner.query(`DROP TABLE "main"."post_dislike"`);
  }
}
