import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeneratedMigration1779443747867 implements MigrationInterface {
  name = 'GeneratedMigration1779443747867';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "main"."archived_post" ("id" SERIAL NOT NULL, "post_id" integer NOT NULL, "is_archived" boolean NOT NULL DEFAULT false, "archived_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_5fcad4a613085636ed860e7d20" UNIQUE ("post_id"), CONSTRAINT "PK_381d94fae5c3085176455958eae" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post" DROP COLUMN "is_archived"`);
    await queryRunner.query(`ALTER TABLE "main"."post" DROP COLUMN "archived_at"`);
    await queryRunner.query(
      `ALTER TABLE "main"."archived_post" ADD CONSTRAINT "FK_5fcad4a613085636ed860e7d200" FOREIGN KEY ("post_id") REFERENCES "main"."post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "main"."archived_post" DROP CONSTRAINT "FK_5fcad4a613085636ed860e7d200"`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post" ADD "archived_at" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(
      `ALTER TABLE "main"."post" ADD "is_archived" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`DROP TABLE "main"."archived_post"`);
  }
}
