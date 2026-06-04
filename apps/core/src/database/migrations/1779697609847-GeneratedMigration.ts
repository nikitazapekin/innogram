import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeneratedMigration1779697609847 implements MigrationInterface {
  name = 'GeneratedMigration1779697609847';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "main"."message_asset" DROP CONSTRAINT "FK_1704939b5304472a1476edc484f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message" DROP CONSTRAINT "FK_859ffc7f95098efb4d84d50c632"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message" DROP CONSTRAINT "PK_ba01f0a3e0123651915008bc578"`,
    );
    await queryRunner.query(`ALTER TABLE "main"."message" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "main"."message" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."message" ADD CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."message" DROP COLUMN "chat_id"`);
    await queryRunner.query(`ALTER TABLE "main"."message" ADD "chat_id" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" DROP CONSTRAINT "FK_a7d2e79a6837a8b97246034a954"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat" DROP CONSTRAINT "PK_9d0b2ba74336710fd31154738a5"`,
    );
    await queryRunner.query(`ALTER TABLE "main"."chat" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "main"."chat" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."chat" ADD CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message_asset" DROP CONSTRAINT "PK_e35f0b633ebfbc79d14c064a390"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message_asset" ADD CONSTRAINT "PK_69fd2e009a557aa529ace0a0eef" PRIMARY KEY ("asset_id")`,
    );
    await queryRunner.query(`DROP INDEX "main"."IDX_1704939b5304472a1476edc484"`);
    await queryRunner.query(`ALTER TABLE "main"."message_asset" DROP COLUMN "message_id"`);
    await queryRunner.query(`ALTER TABLE "main"."message_asset" ADD "message_id" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."message_asset" DROP CONSTRAINT "PK_69fd2e009a557aa529ace0a0eef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message_asset" ADD CONSTRAINT "PK_e35f0b633ebfbc79d14c064a390" PRIMARY KEY ("asset_id", "message_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" DROP CONSTRAINT "PK_f138c00c9d0d1e0c3190a594757"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" ADD CONSTRAINT "PK_20528642fcbcb8c7686c87907af" PRIMARY KEY ("profile_id")`,
    );
    await queryRunner.query(`DROP INDEX "main"."IDX_a7d2e79a6837a8b97246034a95"`);
    await queryRunner.query(`ALTER TABLE "main"."chat_participant" DROP COLUMN "chat_id"`);
    await queryRunner.query(`ALTER TABLE "main"."chat_participant" ADD "chat_id" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" DROP CONSTRAINT "PK_20528642fcbcb8c7686c87907af"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" ADD CONSTRAINT "PK_f138c00c9d0d1e0c3190a594757" PRIMARY KEY ("profile_id", "chat_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1704939b5304472a1476edc484" ON "main"."message_asset" ("message_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a7d2e79a6837a8b97246034a95" ON "main"."chat_participant" ("chat_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message" ADD CONSTRAINT "FK_859ffc7f95098efb4d84d50c632" FOREIGN KEY ("chat_id") REFERENCES "main"."chat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message_asset" ADD CONSTRAINT "FK_1704939b5304472a1476edc484f" FOREIGN KEY ("message_id") REFERENCES "main"."message"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" ADD CONSTRAINT "FK_a7d2e79a6837a8b97246034a954" FOREIGN KEY ("chat_id") REFERENCES "main"."chat"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" DROP CONSTRAINT "FK_a7d2e79a6837a8b97246034a954"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message_asset" DROP CONSTRAINT "FK_1704939b5304472a1476edc484f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message" DROP CONSTRAINT "FK_859ffc7f95098efb4d84d50c632"`,
    );
    await queryRunner.query(`DROP INDEX "main"."IDX_a7d2e79a6837a8b97246034a95"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_1704939b5304472a1476edc484"`);
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" DROP CONSTRAINT "PK_f138c00c9d0d1e0c3190a594757"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" ADD CONSTRAINT "PK_20528642fcbcb8c7686c87907af" PRIMARY KEY ("profile_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."chat_participant" DROP COLUMN "chat_id"`);
    await queryRunner.query(`ALTER TABLE "main"."chat_participant" ADD "chat_id" uuid NOT NULL`);
    await queryRunner.query(
      `CREATE INDEX "IDX_a7d2e79a6837a8b97246034a95" ON "main"."chat_participant" ("chat_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" DROP CONSTRAINT "PK_20528642fcbcb8c7686c87907af"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" ADD CONSTRAINT "PK_f138c00c9d0d1e0c3190a594757" PRIMARY KEY ("chat_id", "profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message_asset" DROP CONSTRAINT "PK_e35f0b633ebfbc79d14c064a390"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message_asset" ADD CONSTRAINT "PK_69fd2e009a557aa529ace0a0eef" PRIMARY KEY ("asset_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."message_asset" DROP COLUMN "message_id"`);
    await queryRunner.query(`ALTER TABLE "main"."message_asset" ADD "message_id" uuid NOT NULL`);
    await queryRunner.query(
      `CREATE INDEX "IDX_1704939b5304472a1476edc484" ON "main"."message_asset" ("message_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message_asset" DROP CONSTRAINT "PK_69fd2e009a557aa529ace0a0eef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message_asset" ADD CONSTRAINT "PK_e35f0b633ebfbc79d14c064a390" PRIMARY KEY ("message_id", "asset_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat" DROP CONSTRAINT "PK_9d0b2ba74336710fd31154738a5"`,
    );
    await queryRunner.query(`ALTER TABLE "main"."chat" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "main"."chat" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat" ADD CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" ADD CONSTRAINT "FK_a7d2e79a6837a8b97246034a954" FOREIGN KEY ("chat_id") REFERENCES "main"."chat"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(`ALTER TABLE "main"."message" DROP COLUMN "chat_id"`);
    await queryRunner.query(`ALTER TABLE "main"."message" ADD "chat_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."message" DROP CONSTRAINT "PK_ba01f0a3e0123651915008bc578"`,
    );
    await queryRunner.query(`ALTER TABLE "main"."message" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "main"."message" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message" ADD CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message" ADD CONSTRAINT "FK_859ffc7f95098efb4d84d50c632" FOREIGN KEY ("chat_id") REFERENCES "main"."chat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message_asset" ADD CONSTRAINT "FK_1704939b5304472a1476edc484f" FOREIGN KEY ("message_id") REFERENCES "main"."message"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
