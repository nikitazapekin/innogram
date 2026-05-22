import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeneratedMigration1779392799643 implements MigrationInterface {
  name = 'GeneratedMigration1779392799643';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "main"."comment" DROP CONSTRAINT "FK_8aa21186314ce53c5b61a0e8c93"`,
    );
    await queryRunner.query(`ALTER TABLE "main"."comment" DROP COLUMN "post_id"`);
    await queryRunner.query(`ALTER TABLE "main"."comment" ADD "post_id" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" DROP CONSTRAINT "FK_a69a0ad8c79aa83c8f774941f6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" DROP CONSTRAINT "FK_a7ec6ac3dc7a05a9648c418f1ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post" DROP CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee"`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "main"."post" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."post" ADD CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" DROP CONSTRAINT "PK_348e3a53179b9663801a35cd83a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" ADD CONSTRAINT "PK_fe6fde31c2a839d2cb1c4d807a8" PRIMARY KEY ("asset_id")`,
    );
    await queryRunner.query(`DROP INDEX "main"."IDX_a69a0ad8c79aa83c8f774941f6"`);
    await queryRunner.query(`ALTER TABLE "main"."post_asset" DROP COLUMN "post_id"`);
    await queryRunner.query(`ALTER TABLE "main"."post_asset" ADD "post_id" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" DROP CONSTRAINT "PK_fe6fde31c2a839d2cb1c4d807a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" ADD CONSTRAINT "PK_348e3a53179b9663801a35cd83a" PRIMARY KEY ("asset_id", "post_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" DROP CONSTRAINT "PK_fe7a91a35a831eb09a2b228e139"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" ADD CONSTRAINT "PK_c235ebdea8e587bdc02e5ef8bc3" PRIMARY KEY ("profile_id")`,
    );
    await queryRunner.query(`DROP INDEX "main"."IDX_a7ec6ac3dc7a05a9648c418f1a"`);
    await queryRunner.query(`ALTER TABLE "main"."post_like" DROP COLUMN "post_id"`);
    await queryRunner.query(`ALTER TABLE "main"."post_like" ADD "post_id" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" DROP CONSTRAINT "PK_c235ebdea8e587bdc02e5ef8bc3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" ADD CONSTRAINT "PK_fe7a91a35a831eb09a2b228e139" PRIMARY KEY ("profile_id", "post_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a69a0ad8c79aa83c8f774941f6" ON "main"."post_asset" ("post_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a7ec6ac3dc7a05a9648c418f1a" ON "main"."post_like" ("post_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment" ADD CONSTRAINT "FK_8aa21186314ce53c5b61a0e8c93" FOREIGN KEY ("post_id") REFERENCES "main"."post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" ADD CONSTRAINT "FK_a69a0ad8c79aa83c8f774941f6b" FOREIGN KEY ("post_id") REFERENCES "main"."post"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" ADD CONSTRAINT "FK_a7ec6ac3dc7a05a9648c418f1ad" FOREIGN KEY ("post_id") REFERENCES "main"."post"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" DROP CONSTRAINT "FK_a7ec6ac3dc7a05a9648c418f1ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" DROP CONSTRAINT "FK_a69a0ad8c79aa83c8f774941f6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment" DROP CONSTRAINT "FK_8aa21186314ce53c5b61a0e8c93"`,
    );
    await queryRunner.query(`DROP INDEX "main"."IDX_a7ec6ac3dc7a05a9648c418f1a"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_a69a0ad8c79aa83c8f774941f6"`);
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" DROP CONSTRAINT "PK_fe7a91a35a831eb09a2b228e139"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" ADD CONSTRAINT "PK_c235ebdea8e587bdc02e5ef8bc3" PRIMARY KEY ("profile_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post_like" DROP COLUMN "post_id"`);
    await queryRunner.query(`ALTER TABLE "main"."post_like" ADD "post_id" uuid NOT NULL`);
    await queryRunner.query(
      `CREATE INDEX "IDX_a7ec6ac3dc7a05a9648c418f1a" ON "main"."post_like" ("post_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" DROP CONSTRAINT "PK_c235ebdea8e587bdc02e5ef8bc3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" ADD CONSTRAINT "PK_fe7a91a35a831eb09a2b228e139" PRIMARY KEY ("profile_id", "post_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" DROP CONSTRAINT "PK_348e3a53179b9663801a35cd83a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" ADD CONSTRAINT "PK_fe6fde31c2a839d2cb1c4d807a8" PRIMARY KEY ("asset_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post_asset" DROP COLUMN "post_id"`);
    await queryRunner.query(`ALTER TABLE "main"."post_asset" ADD "post_id" uuid NOT NULL`);
    await queryRunner.query(
      `CREATE INDEX "IDX_a69a0ad8c79aa83c8f774941f6" ON "main"."post_asset" ("post_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" DROP CONSTRAINT "PK_fe6fde31c2a839d2cb1c4d807a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" ADD CONSTRAINT "PK_348e3a53179b9663801a35cd83a" PRIMARY KEY ("asset_id", "post_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post" DROP CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee"`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "main"."post" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post" ADD CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" ADD CONSTRAINT "FK_a7ec6ac3dc7a05a9648c418f1ad" FOREIGN KEY ("post_id") REFERENCES "main"."post"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" ADD CONSTRAINT "FK_a69a0ad8c79aa83c8f774941f6b" FOREIGN KEY ("post_id") REFERENCES "main"."post"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(`ALTER TABLE "main"."comment" DROP COLUMN "post_id"`);
    await queryRunner.query(`ALTER TABLE "main"."comment" ADD "post_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."comment" ADD CONSTRAINT "FK_8aa21186314ce53c5b61a0e8c93" FOREIGN KEY ("post_id") REFERENCES "main"."post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
