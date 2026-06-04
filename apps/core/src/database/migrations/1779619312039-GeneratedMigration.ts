import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeneratedMigration1779619312039 implements MigrationInterface {
  name = 'GeneratedMigration1779619312039';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "main"."follow_request" ADD CONSTRAINT "FK_8912746f893f7b7acd8e7491093" FOREIGN KEY ("follower_profile_id") REFERENCES "main"."profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."follow_request" ADD CONSTRAINT "FK_c513260c3ee336a6e0eea4f2dee" FOREIGN KEY ("following_profile_id") REFERENCES "main"."profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "main"."follow_request" DROP CONSTRAINT "FK_c513260c3ee336a6e0eea4f2dee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."follow_request" DROP CONSTRAINT "FK_8912746f893f7b7acd8e7491093"`,
    );
  }
}
