import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeneratedMigration1776630897232 implements MigrationInterface {
  name = 'GeneratedMigration1776630897232';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auth"."account" DROP CONSTRAINT "FK_account_user"`);
    await queryRunner.query(`ALTER TABLE "main"."message" DROP CONSTRAINT "FK_message_chat"`);
    await queryRunner.query(`ALTER TABLE "main"."message" DROP CONSTRAINT "FK_message_profile"`);
    await queryRunner.query(`ALTER TABLE "main"."post" DROP CONSTRAINT "FK_post_profile"`);
    await queryRunner.query(`ALTER TABLE "main"."comment" DROP CONSTRAINT "FK_comment_post"`);
    await queryRunner.query(`ALTER TABLE "main"."comment" DROP CONSTRAINT "FK_comment_profile"`);
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" DROP CONSTRAINT "FK_notification_profile"`,
    );
    await queryRunner.query(`ALTER TABLE "main"."profile" DROP CONSTRAINT "FK_profile_user"`);
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" DROP CONSTRAINT "FK_chat_participant_chat"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" DROP CONSTRAINT "FK_chat_participant_profile"`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post_asset" DROP CONSTRAINT "FK_post_asset_post"`);
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" DROP CONSTRAINT "FK_post_asset_asset"`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post_like" DROP CONSTRAINT "FK_post_like_post"`);
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" DROP CONSTRAINT "FK_post_like_profile"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" DROP CONSTRAINT "FK_comment_like_comment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" DROP CONSTRAINT "FK_comment_like_profile"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" DROP CONSTRAINT "FK_follower_profile"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" DROP CONSTRAINT "FK_following_profile"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" DROP CONSTRAINT "FK_source_profile"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" DROP CONSTRAINT "FK_target_profile"`,
    );
    await queryRunner.query(`DROP INDEX "auth"."IDX_auth_user_created_at"`);
    await queryRunner.query(`DROP INDEX "auth"."IDX_auth_user_email"`);
    await queryRunner.query(`DROP INDEX "auth"."UQ_auth_user_email"`);
    await queryRunner.query(
      `CREATE TABLE "main"."message_asset" ("message_id" integer NOT NULL, "asset_id" integer NOT NULL, CONSTRAINT "PK_e35f0b633ebfbc79d14c064a390" PRIMARY KEY ("message_id", "asset_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1704939b5304472a1476edc484" ON "main"."message_asset" ("message_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_69fd2e009a557aa529ace0a0ee" ON "main"."message_asset" ("asset_id") `,
    );
    await queryRunner.query(`ALTER TABLE "main"."asset" DROP COLUMN "storage_key"`);
    await queryRunner.query(`ALTER TABLE "notification"."notification" DROP COLUMN "title"`);
    await queryRunner.query(`ALTER TABLE "notification"."notification" DROP COLUMN "message"`);
    await queryRunner.query(`ALTER TABLE "notification"."notification" DROP COLUMN "is_read"`);
    await queryRunner.query(
      `ALTER TABLE "main"."asset" ADD "file_name" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."asset" ADD "mime_type" character varying(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "notification"."notification" ADD "payload" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" ADD "read_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "auth"."account" DROP CONSTRAINT "account_pkey"`);
    await queryRunner.query(`ALTER TABLE "auth"."account" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "auth"."account" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "auth"."account" ADD CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "auth"."account" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "auth"."account" ADD "user_id" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "main"."chat" DROP CONSTRAINT "chat_pkey"`);
    await queryRunner.query(`ALTER TABLE "main"."chat" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "main"."chat" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."chat" ADD CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."message" DROP CONSTRAINT "message_pkey"`);
    await queryRunner.query(`ALTER TABLE "main"."message" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "main"."message" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."message" ADD CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."message" DROP COLUMN "chat_id"`);
    await queryRunner.query(`ALTER TABLE "main"."message" ADD "chat_id" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "main"."message" DROP COLUMN "author_profile_id"`);
    await queryRunner.query(
      `ALTER TABLE "main"."message" ADD "author_profile_id" integer NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "main"."message" ALTER COLUMN "content" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "main"."asset" DROP CONSTRAINT "asset_pkey"`);
    await queryRunner.query(`ALTER TABLE "main"."asset" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "main"."asset" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."asset" ADD CONSTRAINT "PK_1209d107fe21482beaea51b745e" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."asset" DROP COLUMN "owner_profile_id"`);
    await queryRunner.query(`ALTER TABLE "main"."asset" ADD "owner_profile_id" integer`);
    await queryRunner.query(`ALTER TABLE "main"."post" DROP CONSTRAINT "post_pkey"`);
    await queryRunner.query(`ALTER TABLE "main"."post" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "main"."post" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."post" ADD CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post" DROP COLUMN "author_profile_id"`);
    await queryRunner.query(`ALTER TABLE "main"."post" ADD "author_profile_id" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "main"."comment" DROP CONSTRAINT "comment_pkey"`);
    await queryRunner.query(`ALTER TABLE "main"."comment" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "main"."comment" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."comment" ADD CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."comment" DROP COLUMN "post_id"`);
    await queryRunner.query(`ALTER TABLE "main"."comment" ADD "post_id" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "main"."comment" DROP COLUMN "author_profile_id"`);
    await queryRunner.query(
      `ALTER TABLE "main"."comment" ADD "author_profile_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" DROP CONSTRAINT "notification_pkey"`,
    );
    await queryRunner.query(`ALTER TABLE "notification"."notification" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "notification"."notification" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" ADD CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" DROP COLUMN "recipient_profile_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" ADD "recipient_profile_id" integer NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "notification"."notification" DROP COLUMN "type"`);
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" ADD "type" character varying(100) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "main"."profile" DROP CONSTRAINT "profile_pkey"`);
    await queryRunner.query(`ALTER TABLE "main"."profile" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "main"."profile" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."profile" ADD CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."profile" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "main"."profile" ADD "user_id" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "main"."profile" DROP COLUMN "avatar_asset_id"`);
    await queryRunner.query(`ALTER TABLE "main"."profile" ADD "avatar_asset_id" integer`);
    await queryRunner.query(`ALTER TABLE "auth"."user" DROP CONSTRAINT "user_pkey"`);
    await queryRunner.query(`ALTER TABLE "auth"."user" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "auth"."user" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "auth"."user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" DROP CONSTRAINT "chat_participant_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" ADD CONSTRAINT "chat_participant_pkey" PRIMARY KEY ("profile_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."chat_participant" DROP COLUMN "chat_id"`);
    await queryRunner.query(`ALTER TABLE "main"."chat_participant" ADD "chat_id" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" DROP CONSTRAINT "chat_participant_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" ADD CONSTRAINT "chat_participant_pkey" PRIMARY KEY ("profile_id", "chat_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" DROP CONSTRAINT "chat_participant_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" ADD CONSTRAINT "PK_a7d2e79a6837a8b97246034a954" PRIMARY KEY ("chat_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."chat_participant" DROP COLUMN "profile_id"`);
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" ADD "profile_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" DROP CONSTRAINT "PK_a7d2e79a6837a8b97246034a954"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" ADD CONSTRAINT "PK_f138c00c9d0d1e0c3190a594757" PRIMARY KEY ("chat_id", "profile_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post_asset" DROP CONSTRAINT "post_asset_pkey"`);
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" ADD CONSTRAINT "post_asset_pkey" PRIMARY KEY ("asset_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post_asset" DROP COLUMN "post_id"`);
    await queryRunner.query(`ALTER TABLE "main"."post_asset" ADD "post_id" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "main"."post_asset" DROP CONSTRAINT "post_asset_pkey"`);
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" ADD CONSTRAINT "post_asset_pkey" PRIMARY KEY ("asset_id", "post_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post_asset" DROP CONSTRAINT "post_asset_pkey"`);
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" ADD CONSTRAINT "PK_a69a0ad8c79aa83c8f774941f6b" PRIMARY KEY ("post_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post_asset" DROP COLUMN "asset_id"`);
    await queryRunner.query(`ALTER TABLE "main"."post_asset" ADD "asset_id" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" DROP CONSTRAINT "PK_a69a0ad8c79aa83c8f774941f6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" ADD CONSTRAINT "PK_348e3a53179b9663801a35cd83a" PRIMARY KEY ("post_id", "asset_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post_like" DROP CONSTRAINT "post_like_pkey"`);
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" ADD CONSTRAINT "post_like_pkey" PRIMARY KEY ("profile_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post_like" DROP COLUMN "post_id"`);
    await queryRunner.query(`ALTER TABLE "main"."post_like" ADD "post_id" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "main"."post_like" DROP CONSTRAINT "post_like_pkey"`);
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" ADD CONSTRAINT "post_like_pkey" PRIMARY KEY ("profile_id", "post_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post_like" DROP CONSTRAINT "post_like_pkey"`);
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" ADD CONSTRAINT "PK_a7ec6ac3dc7a05a9648c418f1ad" PRIMARY KEY ("post_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post_like" DROP COLUMN "profile_id"`);
    await queryRunner.query(`ALTER TABLE "main"."post_like" ADD "profile_id" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" DROP CONSTRAINT "PK_a7ec6ac3dc7a05a9648c418f1ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" ADD CONSTRAINT "PK_fe7a91a35a831eb09a2b228e139" PRIMARY KEY ("post_id", "profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" DROP CONSTRAINT "comment_like_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" ADD CONSTRAINT "comment_like_pkey" PRIMARY KEY ("profile_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."comment_like" DROP COLUMN "comment_id"`);
    await queryRunner.query(`ALTER TABLE "main"."comment_like" ADD "comment_id" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" DROP CONSTRAINT "comment_like_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" ADD CONSTRAINT "comment_like_pkey" PRIMARY KEY ("profile_id", "comment_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" DROP CONSTRAINT "comment_like_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" ADD CONSTRAINT "PK_4a0c128374ff87d4641cab920f0" PRIMARY KEY ("comment_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."comment_like" DROP COLUMN "profile_id"`);
    await queryRunner.query(`ALTER TABLE "main"."comment_like" ADD "profile_id" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" DROP CONSTRAINT "PK_4a0c128374ff87d4641cab920f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" ADD CONSTRAINT "PK_6cc18c1013184bdf1f3ad1b88b7" PRIMARY KEY ("comment_id", "profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" DROP CONSTRAINT "profile_follow_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" ADD CONSTRAINT "profile_follow_pkey" PRIMARY KEY ("following_profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" DROP COLUMN "follower_profile_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" ADD "follower_profile_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" DROP CONSTRAINT "profile_follow_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" ADD CONSTRAINT "profile_follow_pkey" PRIMARY KEY ("following_profile_id", "follower_profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" DROP CONSTRAINT "profile_follow_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" ADD CONSTRAINT "PK_6a5f9e7c1d551da804471e9c627" PRIMARY KEY ("follower_profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" DROP COLUMN "following_profile_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" ADD "following_profile_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" DROP CONSTRAINT "PK_6a5f9e7c1d551da804471e9c627"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" ADD CONSTRAINT "PK_3701cc1c94104fd2968bc50c6a9" PRIMARY KEY ("follower_profile_id", "following_profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" DROP CONSTRAINT "profile_to_profile_configuration_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" ADD CONSTRAINT "profile_to_profile_configuration_pkey" PRIMARY KEY ("target_profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" DROP COLUMN "source_profile_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" ADD "source_profile_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" DROP CONSTRAINT "profile_to_profile_configuration_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" ADD CONSTRAINT "profile_to_profile_configuration_pkey" PRIMARY KEY ("target_profile_id", "source_profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" DROP CONSTRAINT "profile_to_profile_configuration_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" ADD CONSTRAINT "PK_421a61f9161e13f03edef1e95a8" PRIMARY KEY ("source_profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" DROP COLUMN "target_profile_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" ADD "target_profile_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" DROP CONSTRAINT "PK_421a61f9161e13f03edef1e95a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" ADD CONSTRAINT "PK_ad741672888ca43b310895d09f2" PRIMARY KEY ("source_profile_id", "target_profile_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a7d2e79a6837a8b97246034a95" ON "main"."chat_participant" ("chat_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_20528642fcbcb8c7686c87907a" ON "main"."chat_participant" ("profile_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a69a0ad8c79aa83c8f774941f6" ON "main"."post_asset" ("post_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fe6fde31c2a839d2cb1c4d807a" ON "main"."post_asset" ("asset_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a7ec6ac3dc7a05a9648c418f1a" ON "main"."post_like" ("post_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c235ebdea8e587bdc02e5ef8bc" ON "main"."post_like" ("profile_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4a0c128374ff87d4641cab920f" ON "main"."comment_like" ("comment_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a2484dc2075243541aa1989414" ON "main"."comment_like" ("profile_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6a5f9e7c1d551da804471e9c62" ON "main"."profile_follow" ("follower_profile_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5c2a1d5811b9b9611a90ce78fb" ON "main"."profile_follow" ("following_profile_id") `,
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
    await queryRunner.query(`DROP INDEX "main"."IDX_5c2a1d5811b9b9611a90ce78fb"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_6a5f9e7c1d551da804471e9c62"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_a2484dc2075243541aa1989414"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_4a0c128374ff87d4641cab920f"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_c235ebdea8e587bdc02e5ef8bc"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_a7ec6ac3dc7a05a9648c418f1a"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_fe6fde31c2a839d2cb1c4d807a"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_a69a0ad8c79aa83c8f774941f6"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_20528642fcbcb8c7686c87907a"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_a7d2e79a6837a8b97246034a95"`);
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" DROP CONSTRAINT "PK_ad741672888ca43b310895d09f2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" ADD CONSTRAINT "PK_421a61f9161e13f03edef1e95a8" PRIMARY KEY ("source_profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" DROP COLUMN "target_profile_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" ADD "target_profile_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" DROP CONSTRAINT "PK_421a61f9161e13f03edef1e95a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" ADD CONSTRAINT "profile_to_profile_configuration_pkey" PRIMARY KEY ("target_profile_id", "source_profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" DROP CONSTRAINT "profile_to_profile_configuration_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" ADD CONSTRAINT "profile_to_profile_configuration_pkey" PRIMARY KEY ("target_profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" DROP COLUMN "source_profile_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" ADD "source_profile_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" DROP CONSTRAINT "profile_to_profile_configuration_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" ADD CONSTRAINT "profile_to_profile_configuration_pkey" PRIMARY KEY ("source_profile_id", "target_profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" DROP CONSTRAINT "PK_3701cc1c94104fd2968bc50c6a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" ADD CONSTRAINT "PK_6a5f9e7c1d551da804471e9c627" PRIMARY KEY ("follower_profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" DROP COLUMN "following_profile_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" ADD "following_profile_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" DROP CONSTRAINT "PK_6a5f9e7c1d551da804471e9c627"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" ADD CONSTRAINT "profile_follow_pkey" PRIMARY KEY ("following_profile_id", "follower_profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" DROP CONSTRAINT "profile_follow_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" ADD CONSTRAINT "profile_follow_pkey" PRIMARY KEY ("following_profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" DROP COLUMN "follower_profile_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" ADD "follower_profile_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" DROP CONSTRAINT "profile_follow_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" ADD CONSTRAINT "profile_follow_pkey" PRIMARY KEY ("follower_profile_id", "following_profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" DROP CONSTRAINT "PK_6cc18c1013184bdf1f3ad1b88b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" ADD CONSTRAINT "PK_4a0c128374ff87d4641cab920f0" PRIMARY KEY ("comment_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."comment_like" DROP COLUMN "profile_id"`);
    await queryRunner.query(`ALTER TABLE "main"."comment_like" ADD "profile_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" DROP CONSTRAINT "PK_4a0c128374ff87d4641cab920f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" ADD CONSTRAINT "comment_like_pkey" PRIMARY KEY ("profile_id", "comment_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" DROP CONSTRAINT "comment_like_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" ADD CONSTRAINT "comment_like_pkey" PRIMARY KEY ("profile_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."comment_like" DROP COLUMN "comment_id"`);
    await queryRunner.query(`ALTER TABLE "main"."comment_like" ADD "comment_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" DROP CONSTRAINT "comment_like_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" ADD CONSTRAINT "comment_like_pkey" PRIMARY KEY ("comment_id", "profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" DROP CONSTRAINT "PK_fe7a91a35a831eb09a2b228e139"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" ADD CONSTRAINT "PK_a7ec6ac3dc7a05a9648c418f1ad" PRIMARY KEY ("post_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post_like" DROP COLUMN "profile_id"`);
    await queryRunner.query(`ALTER TABLE "main"."post_like" ADD "profile_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" DROP CONSTRAINT "PK_a7ec6ac3dc7a05a9648c418f1ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" ADD CONSTRAINT "post_like_pkey" PRIMARY KEY ("profile_id", "post_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post_like" DROP CONSTRAINT "post_like_pkey"`);
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" ADD CONSTRAINT "post_like_pkey" PRIMARY KEY ("profile_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post_like" DROP COLUMN "post_id"`);
    await queryRunner.query(`ALTER TABLE "main"."post_like" ADD "post_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "main"."post_like" DROP CONSTRAINT "post_like_pkey"`);
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" ADD CONSTRAINT "post_like_pkey" PRIMARY KEY ("post_id", "profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" DROP CONSTRAINT "PK_348e3a53179b9663801a35cd83a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" ADD CONSTRAINT "PK_a69a0ad8c79aa83c8f774941f6b" PRIMARY KEY ("post_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post_asset" DROP COLUMN "asset_id"`);
    await queryRunner.query(`ALTER TABLE "main"."post_asset" ADD "asset_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" DROP CONSTRAINT "PK_a69a0ad8c79aa83c8f774941f6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" ADD CONSTRAINT "post_asset_pkey" PRIMARY KEY ("asset_id", "post_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post_asset" DROP CONSTRAINT "post_asset_pkey"`);
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" ADD CONSTRAINT "post_asset_pkey" PRIMARY KEY ("asset_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post_asset" DROP COLUMN "post_id"`);
    await queryRunner.query(`ALTER TABLE "main"."post_asset" ADD "post_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "main"."post_asset" DROP CONSTRAINT "post_asset_pkey"`);
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" ADD CONSTRAINT "post_asset_pkey" PRIMARY KEY ("post_id", "asset_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" DROP CONSTRAINT "PK_f138c00c9d0d1e0c3190a594757"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" ADD CONSTRAINT "PK_a7d2e79a6837a8b97246034a954" PRIMARY KEY ("chat_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."chat_participant" DROP COLUMN "profile_id"`);
    await queryRunner.query(`ALTER TABLE "main"."chat_participant" ADD "profile_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" DROP CONSTRAINT "PK_a7d2e79a6837a8b97246034a954"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" ADD CONSTRAINT "chat_participant_pkey" PRIMARY KEY ("profile_id", "chat_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" DROP CONSTRAINT "chat_participant_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" ADD CONSTRAINT "chat_participant_pkey" PRIMARY KEY ("profile_id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."chat_participant" DROP COLUMN "chat_id"`);
    await queryRunner.query(`ALTER TABLE "main"."chat_participant" ADD "chat_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" DROP CONSTRAINT "chat_participant_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" ADD CONSTRAINT "chat_participant_pkey" PRIMARY KEY ("chat_id", "profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth"."user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`,
    );
    await queryRunner.query(`ALTER TABLE "auth"."user" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "auth"."user" ADD "id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "auth"."user" ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."profile" DROP COLUMN "avatar_asset_id"`);
    await queryRunner.query(`ALTER TABLE "main"."profile" ADD "avatar_asset_id" uuid`);
    await queryRunner.query(`ALTER TABLE "main"."profile" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "main"."profile" ADD "user_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."profile" DROP CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb"`,
    );
    await queryRunner.query(`ALTER TABLE "main"."profile" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "main"."profile" ADD "id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."profile" ADD CONSTRAINT "profile_pkey" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "notification"."notification" DROP COLUMN "type"`);
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" ADD "type" character varying(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" DROP COLUMN "recipient_profile_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" ADD "recipient_profile_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" DROP CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7"`,
    );
    await queryRunner.query(`ALTER TABLE "notification"."notification" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "notification"."notification" ADD "id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" ADD CONSTRAINT "notification_pkey" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."comment" DROP COLUMN "author_profile_id"`);
    await queryRunner.query(`ALTER TABLE "main"."comment" ADD "author_profile_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "main"."comment" DROP COLUMN "post_id"`);
    await queryRunner.query(`ALTER TABLE "main"."comment" ADD "post_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."comment" DROP CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2"`,
    );
    await queryRunner.query(`ALTER TABLE "main"."comment" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "main"."comment" ADD "id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."comment" ADD CONSTRAINT "comment_pkey" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post" DROP COLUMN "author_profile_id"`);
    await queryRunner.query(`ALTER TABLE "main"."post" ADD "author_profile_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."post" DROP CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee"`,
    );
    await queryRunner.query(`ALTER TABLE "main"."post" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "main"."post" ADD "id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."post" ADD CONSTRAINT "post_pkey" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."asset" DROP COLUMN "owner_profile_id"`);
    await queryRunner.query(`ALTER TABLE "main"."asset" ADD "owner_profile_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."asset" DROP CONSTRAINT "PK_1209d107fe21482beaea51b745e"`,
    );
    await queryRunner.query(`ALTER TABLE "main"."asset" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "main"."asset" ADD "id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."asset" ADD CONSTRAINT "asset_pkey" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "main"."message" ALTER COLUMN "content" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "main"."message" DROP COLUMN "author_profile_id"`);
    await queryRunner.query(`ALTER TABLE "main"."message" ADD "author_profile_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "main"."message" DROP COLUMN "chat_id"`);
    await queryRunner.query(`ALTER TABLE "main"."message" ADD "chat_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."message" DROP CONSTRAINT "PK_ba01f0a3e0123651915008bc578"`,
    );
    await queryRunner.query(`ALTER TABLE "main"."message" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "main"."message" ADD "id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."message" ADD CONSTRAINT "message_pkey" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat" DROP CONSTRAINT "PK_9d0b2ba74336710fd31154738a5"`,
    );
    await queryRunner.query(`ALTER TABLE "main"."chat" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "main"."chat" ADD "id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "main"."chat" ADD CONSTRAINT "chat_pkey" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "auth"."account" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "auth"."account" ADD "user_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "auth"."account" DROP CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea"`,
    );
    await queryRunner.query(`ALTER TABLE "auth"."account" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "auth"."account" ADD "id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "auth"."account" ADD CONSTRAINT "account_pkey" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "notification"."notification" DROP COLUMN "read_at"`);
    await queryRunner.query(`ALTER TABLE "notification"."notification" DROP COLUMN "payload"`);
    await queryRunner.query(`ALTER TABLE "main"."asset" DROP COLUMN "mime_type"`);
    await queryRunner.query(`ALTER TABLE "main"."asset" DROP COLUMN "file_name"`);
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" ADD "is_read" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "notification"."notification" ADD "message" text`);
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" ADD "title" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."asset" ADD "storage_key" character varying(500) NOT NULL`,
    );
    await queryRunner.query(`DROP INDEX "main"."IDX_69fd2e009a557aa529ace0a0ee"`);
    await queryRunner.query(`DROP INDEX "main"."IDX_1704939b5304472a1476edc484"`);
    await queryRunner.query(`DROP TABLE "main"."message_asset"`);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_auth_user_email" ON "auth"."user" ("email") `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_auth_user_email" ON "auth"."user" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_auth_user_created_at" ON "auth"."user" ("created_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" ADD CONSTRAINT "FK_target_profile" FOREIGN KEY ("target_profile_id") REFERENCES "main"."profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_to_profile_configuration" ADD CONSTRAINT "FK_source_profile" FOREIGN KEY ("source_profile_id") REFERENCES "main"."profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" ADD CONSTRAINT "FK_following_profile" FOREIGN KEY ("following_profile_id") REFERENCES "main"."profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile_follow" ADD CONSTRAINT "FK_follower_profile" FOREIGN KEY ("follower_profile_id") REFERENCES "main"."profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" ADD CONSTRAINT "FK_comment_like_profile" FOREIGN KEY ("profile_id") REFERENCES "main"."profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_like" ADD CONSTRAINT "FK_comment_like_comment" FOREIGN KEY ("comment_id") REFERENCES "main"."comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" ADD CONSTRAINT "FK_post_like_profile" FOREIGN KEY ("profile_id") REFERENCES "main"."profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_like" ADD CONSTRAINT "FK_post_like_post" FOREIGN KEY ("post_id") REFERENCES "main"."post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" ADD CONSTRAINT "FK_post_asset_asset" FOREIGN KEY ("asset_id") REFERENCES "main"."asset"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_asset" ADD CONSTRAINT "FK_post_asset_post" FOREIGN KEY ("post_id") REFERENCES "main"."post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" ADD CONSTRAINT "FK_chat_participant_profile" FOREIGN KEY ("profile_id") REFERENCES "main"."profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participant" ADD CONSTRAINT "FK_chat_participant_chat" FOREIGN KEY ("chat_id") REFERENCES "main"."chat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profile" ADD CONSTRAINT "FK_profile_user" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" ADD CONSTRAINT "FK_notification_profile" FOREIGN KEY ("recipient_profile_id") REFERENCES "main"."profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment" ADD CONSTRAINT "FK_comment_profile" FOREIGN KEY ("author_profile_id") REFERENCES "main"."profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment" ADD CONSTRAINT "FK_comment_post" FOREIGN KEY ("post_id") REFERENCES "main"."post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post" ADD CONSTRAINT "FK_post_profile" FOREIGN KEY ("author_profile_id") REFERENCES "main"."profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message" ADD CONSTRAINT "FK_message_profile" FOREIGN KEY ("author_profile_id") REFERENCES "main"."profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message" ADD CONSTRAINT "FK_message_chat" FOREIGN KEY ("chat_id") REFERENCES "main"."chat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth"."account" ADD CONSTRAINT "FK_account_user" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
