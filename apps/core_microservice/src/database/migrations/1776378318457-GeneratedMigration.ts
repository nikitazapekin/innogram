import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeneratedMigration1776378318457 implements MigrationInterface {
  name = 'GeneratedMigration1776378318457';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "auth"."account" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."chat" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."message" ("id" SERIAL NOT NULL, "chat_id" integer NOT NULL, "author_profile_id" integer NOT NULL, "content" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."asset" ("id" SERIAL NOT NULL, "owner_profile_id" integer, "file_name" character varying(255) NOT NULL, "mime_type" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1209d107fe21482beaea51b745e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."post" ("id" SERIAL NOT NULL, "author_profile_id" integer NOT NULL, "title" character varying(255) NOT NULL, "content" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."comment" ("id" SERIAL NOT NULL, "post_id" integer NOT NULL, "author_profile_id" integer NOT NULL, "content" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification"."notification" ("id" SERIAL NOT NULL, "recipient_profile_id" integer NOT NULL, "type" character varying(100) NOT NULL, "payload" jsonb, "read_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."profile" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "display_name" character varying(120) NOT NULL, "bio" text, "avatar_asset_id" integer, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "auth"."user" ("id" SERIAL NOT NULL, "email" character varying(320) NOT NULL, "password_hash" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."chat_participant" ("chat_id" integer NOT NULL, "profile_id" integer NOT NULL, CONSTRAINT "PK_f138c00c9d0d1e0c3190a594757" PRIMARY KEY ("chat_id", "profile_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a7d2e79a6837a8b97246034a95" ON "main"."chat_participant" ("chat_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_20528642fcbcb8c7686c87907a" ON "main"."chat_participant" ("profile_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."message_asset" ("message_id" integer NOT NULL, "asset_id" integer NOT NULL, CONSTRAINT "PK_e35f0b633ebfbc79d14c064a390" PRIMARY KEY ("message_id", "asset_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1704939b5304472a1476edc484" ON "main"."message_asset" ("message_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_69fd2e009a557aa529ace0a0ee" ON "main"."message_asset" ("asset_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."post_asset" ("post_id" integer NOT NULL, "asset_id" integer NOT NULL, CONSTRAINT "PK_348e3a53179b9663801a35cd83a" PRIMARY KEY ("post_id", "asset_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a69a0ad8c79aa83c8f774941f6" ON "main"."post_asset" ("post_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fe6fde31c2a839d2cb1c4d807a" ON "main"."post_asset" ("asset_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."post_like" ("post_id" integer NOT NULL, "profile_id" integer NOT NULL, CONSTRAINT "PK_fe7a91a35a831eb09a2b228e139" PRIMARY KEY ("post_id", "profile_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a7ec6ac3dc7a05a9648c418f1a" ON "main"."post_like" ("post_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c235ebdea8e587bdc02e5ef8bc" ON "main"."post_like" ("profile_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."comment_like" ("comment_id" integer NOT NULL, "profile_id" integer NOT NULL, CONSTRAINT "PK_6cc18c1013184bdf1f3ad1b88b7" PRIMARY KEY ("comment_id", "profile_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4a0c128374ff87d4641cab920f" ON "main"."comment_like" ("comment_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a2484dc2075243541aa1989414" ON "main"."comment_like" ("profile_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."profile_follow" ("follower_profile_id" integer NOT NULL, "following_profile_id" integer NOT NULL, CONSTRAINT "PK_3701cc1c94104fd2968bc50c6a9" PRIMARY KEY ("follower_profile_id", "following_profile_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6a5f9e7c1d551da804471e9c62" ON "main"."profile_follow" ("follower_profile_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5c2a1d5811b9b9611a90ce78fb" ON "main"."profile_follow" ("following_profile_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."profile_to_profile_configuration" ("source_profile_id" integer NOT NULL, "target_profile_id" integer NOT NULL, CONSTRAINT "PK_ad741672888ca43b310895d09f2" PRIMARY KEY ("source_profile_id", "target_profile_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_421a61f9161e13f03edef1e95a" ON "main"."profile_to_profile_configuration" ("source_profile_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6ac086446b4d4f9fb73c3a2561" ON "main"."profile_to_profile_configuration" ("target_profile_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "auth"."account" ADD CONSTRAINT "FK_efef1e5fdbe318a379c06678c51" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message" ADD CONSTRAINT "FK_859ffc7f95098efb4d84d50c632" FOREIGN KEY ("chat_id") REFERENCES "main"."chat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message" ADD CONSTRAINT "FK_33e2f86a56c2f6cc113affdfb66" FOREIGN KEY ("author_profile_id") REFERENCES "main"."profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."asset" ADD CONSTRAINT "FK_cf858fdc6181129c6dfcdbfb00b" FOREIGN KEY ("owner_profile_id") REFERENCES "main"."profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post" ADD CONSTRAINT "FK_d9266e126975114dee5bc1296e5" FOREIGN KEY ("author_profile_id") REFERENCES "main"."profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment" ADD CONSTRAINT "FK_8aa21186314ce53c5b61a0e8c93" FOREIGN KEY ("post_id") REFERENCES "main"."post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment" ADD CONSTRAINT "FK_852d2f711f6867348d28e762318" FOREIGN KEY ("author_profile_id") REFERENCES "main"."profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" ADD CONSTRAINT "FK_61097fd6d1bb5e17d16c700a464" FOREIGN KEY ("recipient_profile_id") REFERENCES "main"."profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile" ADD CONSTRAINT "FK_d752442f45f258a8bdefeebb2f2" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile" ADD CONSTRAINT "FK_6cc49b44cefecbb22b3e24f9948" FOREIGN KEY ("avatar_asset_id") REFERENCES "main"."asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" ADD CONSTRAINT "FK_a7d2e79a6837a8b97246034a954" FOREIGN KEY ("chat_id") REFERENCES "main"."chat"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" ADD CONSTRAINT "FK_20528642fcbcb8c7686c87907af" FOREIGN KEY ("profile_id") REFERENCES "main"."profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message_asset" ADD CONSTRAINT "FK_1704939b5304472a1476edc484f" FOREIGN KEY ("message_id") REFERENCES "main"."message"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message_asset" ADD CONSTRAINT "FK_69fd2e009a557aa529ace0a0eef" FOREIGN KEY ("asset_id") REFERENCES "main"."asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" ADD CONSTRAINT "FK_a69a0ad8c79aa83c8f774941f6b" FOREIGN KEY ("post_id") REFERENCES "main"."post"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" ADD CONSTRAINT "FK_fe6fde31c2a839d2cb1c4d807a8" FOREIGN KEY ("asset_id") REFERENCES "main"."asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" ADD CONSTRAINT "FK_a7ec6ac3dc7a05a9648c418f1ad" FOREIGN KEY ("post_id") REFERENCES "main"."post"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" ADD CONSTRAINT "FK_c235ebdea8e587bdc02e5ef8bc3" FOREIGN KEY ("profile_id") REFERENCES "main"."profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" ADD CONSTRAINT "FK_4a0c128374ff87d4641cab920f0" FOREIGN KEY ("comment_id") REFERENCES "main"."comment"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" ADD CONSTRAINT "FK_a2484dc2075243541aa19894146" FOREIGN KEY ("profile_id") REFERENCES "main"."profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" ADD CONSTRAINT "FK_6a5f9e7c1d551da804471e9c627" FOREIGN KEY ("follower_profile_id") REFERENCES "main"."profile"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" ADD CONSTRAINT "FK_5c2a1d5811b9b9611a90ce78fb5" FOREIGN KEY ("following_profile_id") REFERENCES "main"."profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" ADD CONSTRAINT "FK_421a61f9161e13f03edef1e95a8" FOREIGN KEY ("source_profile_id") REFERENCES "main"."profile"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" ADD CONSTRAINT "FK_6ac086446b4d4f9fb73c3a2561d" FOREIGN KEY ("target_profile_id") REFERENCES "main"."profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" DROP CONSTRAINT "FK_6ac086446b4d4f9fb73c3a2561d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" DROP CONSTRAINT "FK_421a61f9161e13f03edef1e95a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" DROP CONSTRAINT "FK_5c2a1d5811b9b9611a90ce78fb5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" DROP CONSTRAINT "FK_6a5f9e7c1d551da804471e9c627"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" DROP CONSTRAINT "FK_a2484dc2075243541aa19894146"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" DROP CONSTRAINT "FK_4a0c128374ff87d4641cab920f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" DROP CONSTRAINT "FK_c235ebdea8e587bdc02e5ef8bc3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" DROP CONSTRAINT "FK_a7ec6ac3dc7a05a9648c418f1ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" DROP CONSTRAINT "FK_fe6fde31c2a839d2cb1c4d807a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" DROP CONSTRAINT "FK_a69a0ad8c79aa83c8f774941f6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message_asset" DROP CONSTRAINT "FK_69fd2e009a557aa529ace0a0eef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message_asset" DROP CONSTRAINT "FK_1704939b5304472a1476edc484f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" DROP CONSTRAINT "FK_20528642fcbcb8c7686c87907af"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" DROP CONSTRAINT "FK_a7d2e79a6837a8b97246034a954"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile" DROP CONSTRAINT "FK_6cc49b44cefecbb22b3e24f9948"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile" DROP CONSTRAINT "FK_d752442f45f258a8bdefeebb2f2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" DROP CONSTRAINT "FK_61097fd6d1bb5e17d16c700a464"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment" DROP CONSTRAINT "FK_852d2f711f6867348d28e762318"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment" DROP CONSTRAINT "FK_8aa21186314ce53c5b61a0e8c93"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post" DROP CONSTRAINT "FK_d9266e126975114dee5bc1296e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."asset" DROP CONSTRAINT "FK_cf858fdc6181129c6dfcdbfb00b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message" DROP CONSTRAINT "FK_33e2f86a56c2f6cc113affdfb66"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message" DROP CONSTRAINT "FK_859ffc7f95098efb4d84d50c632"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth"."account" DROP CONSTRAINT "FK_efef1e5fdbe318a379c06678c51"`,
    );
    await queryRunner.query(`DROP INDEX "main"."IDX_6ac086446b4d4f9fb73c3a2561"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_421a61f9161e13f03edef1e95a"`);
    await queryRunner.query(`DROP TABLE "main"."profile_to_profile_configuration"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_5c2a1d5811b9b9611a90ce78fb"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_6a5f9e7c1d551da804471e9c62"`);
    await queryRunner.query(`DROP TABLE "main"."profile_follow"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_a2484dc2075243541aa1989414"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_4a0c128374ff87d4641cab920f"`);
    await queryRunner.query(`DROP TABLE "main"."comment_like"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_c235ebdea8e587bdc02e5ef8bc"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_a7ec6ac3dc7a05a9648c418f1a"`);
    await queryRunner.query(`DROP TABLE "main"."post_like"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_fe6fde31c2a839d2cb1c4d807a"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_a69a0ad8c79aa83c8f774941f6"`);
    await queryRunner.query(`DROP TABLE "main"."post_asset"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_69fd2e009a557aa529ace0a0ee"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_1704939b5304472a1476edc484"`);
    await queryRunner.query(`DROP TABLE "main"."message_asset"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_20528642fcbcb8c7686c87907a"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_a7d2e79a6837a8b97246034a95"`);
    await queryRunner.query(`DROP TABLE "main"."chat_participant"`);
    await queryRunner.query(`DROP TABLE "auth"."user"`);
    await queryRunner.query(`DROP TABLE "main"."profile"`);
    await queryRunner.query(`DROP TABLE "notification"."notification"`);
    await queryRunner.query(`DROP TABLE "main"."comment"`);
    await queryRunner.query(`DROP TABLE "main"."post"`);
    await queryRunner.query(`DROP TABLE "main"."asset"`);
    await queryRunner.query(`DROP TABLE "main"."message"`);
    await queryRunner.query(`DROP TABLE "main"."chat"`);
    await queryRunner.query(`DROP TABLE "auth"."account"`);
  }
}
