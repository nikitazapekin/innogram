import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceIndexes1781000000000 implements MigrationInterface {
  name = 'AddPerformanceIndexes1781000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX "IDX_comment_post_id" ON "main"."comment" ("post_id")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_comment_parent_id" ON "main"."comment" ("parent_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_message_chat_id_created_at" ON "main"."message" ("chat_id", "created_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_post_author_profile_id" ON "main"."post" ("author_profile_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "main"."IDX_post_author_profile_id"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_message_chat_id_created_at"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_comment_parent_id"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_comment_post_id"`);
  }
}
