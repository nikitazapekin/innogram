import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeneratedMigration1779390946951 implements MigrationInterface {
  name = 'GeneratedMigration1779390946951';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" DROP CONSTRAINT "FK_4a0c128374ff87d4641cab920f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment" DROP CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2"`,
    );
    await queryRunner.query(`ALTER TABLE "main"."comment" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "main"."comment" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."comment" ADD CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" DROP CONSTRAINT "PK_6cc18c1013184bdf1f3ad1b88b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" ADD CONSTRAINT "PK_a2484dc2075243541aa19894146" PRIMARY KEY ("profile_id")`,
    );
    await queryRunner.query(`DROP INDEX "main"."IDX_4a0c128374ff87d4641cab920f"`);
    await queryRunner.query(`ALTER TABLE "main"."comment_like" DROP COLUMN "comment_id"`);
    await queryRunner.query(`ALTER TABLE "main"."comment_like" ADD "comment_id" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" DROP CONSTRAINT "PK_a2484dc2075243541aa19894146"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" ADD CONSTRAINT "PK_6cc18c1013184bdf1f3ad1b88b7" PRIMARY KEY ("profile_id", "comment_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4a0c128374ff87d4641cab920f" ON "main"."comment_like" ("comment_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" ADD CONSTRAINT "FK_4a0c128374ff87d4641cab920f0" FOREIGN KEY ("comment_id") REFERENCES "main"."comment"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" DROP CONSTRAINT "FK_4a0c128374ff87d4641cab920f0"`,
    );
    await queryRunner.query(`DROP INDEX "main"."IDX_4a0c128374ff87d4641cab920f"`);
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" DROP CONSTRAINT "PK_6cc18c1013184bdf1f3ad1b88b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" ADD CONSTRAINT "PK_a2484dc2075243541aa19894146" PRIMARY KEY ("profile_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."comment_like" DROP COLUMN "comment_id"`);
    await queryRunner.query(`ALTER TABLE "main"."comment_like" ADD "comment_id" uuid NOT NULL`);
    await queryRunner.query(
      `CREATE INDEX "IDX_4a0c128374ff87d4641cab920f" ON "main"."comment_like" ("comment_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" DROP CONSTRAINT "PK_a2484dc2075243541aa19894146"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" ADD CONSTRAINT "PK_6cc18c1013184bdf1f3ad1b88b7" PRIMARY KEY ("comment_id", "profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment" DROP CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2"`,
    );
    await queryRunner.query(`ALTER TABLE "main"."comment" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "main"."comment" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment" ADD CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" ADD CONSTRAINT "FK_4a0c128374ff87d4641cab920f0" FOREIGN KEY ("comment_id") REFERENCES "main"."comment"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
