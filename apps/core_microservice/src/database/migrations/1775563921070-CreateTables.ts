import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1775563921070 implements MigrationInterface {
  name = 'CreateTables1775563921070';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "auth"."user" (
        "id" uuid NOT NULL PRIMARY KEY,
        "email" varchar(320) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX "IDX_auth_user_email" ON "auth"."user" ("email");
      CREATE INDEX "IDX_auth_user_created_at" ON "auth"."user" ("created_at");
    `);

    await queryRunner.query(`
      CREATE TABLE "auth"."account" (
        "id" uuid NOT NULL PRIMARY KEY,
        "user_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_account_user" FOREIGN KEY ("user_id") REFERENCES "auth"."user" ("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "main"."profile" (
        "id" uuid NOT NULL PRIMARY KEY,
        "user_id" uuid NOT NULL,
        "display_name" varchar(120) NOT NULL,
        "bio" text,
        "avatar_asset_id" uuid,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_profile_user" FOREIGN KEY ("user_id") REFERENCES "auth"."user" ("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "main"."asset" (
        "id" uuid NOT NULL PRIMARY KEY,
        "owner_profile_id" uuid NOT NULL,
        "storage_key" varchar(500) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "main"."post" (
        "id" uuid NOT NULL PRIMARY KEY,
        "author_profile_id" uuid NOT NULL,
        "title" varchar(255) NOT NULL,
        "content" text NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_post_profile" FOREIGN KEY ("author_profile_id") REFERENCES "main"."profile" ("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "main"."comment" (
        "id" uuid NOT NULL PRIMARY KEY,
        "post_id" uuid NOT NULL,
        "author_profile_id" uuid NOT NULL,
        "content" text NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_comment_post" FOREIGN KEY ("post_id") REFERENCES "main"."post" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_comment_profile" FOREIGN KEY ("author_profile_id") REFERENCES "main"."profile" ("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "main"."chat" (
        "id" uuid NOT NULL PRIMARY KEY,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "main"."message" (
        "id" uuid NOT NULL PRIMARY KEY,
        "chat_id" uuid NOT NULL,
        "author_profile_id" uuid NOT NULL,
        "content" text NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_message_chat" FOREIGN KEY ("chat_id") REFERENCES "main"."chat" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_message_profile" FOREIGN KEY ("author_profile_id") REFERENCES "main"."profile" ("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "main"."profile_follow" (
        "follower_profile_id" uuid NOT NULL,
        "following_profile_id" uuid NOT NULL,
        PRIMARY KEY ("follower_profile_id", "following_profile_id"),
        CONSTRAINT "FK_follower_profile" FOREIGN KEY ("follower_profile_id") REFERENCES "main"."profile" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_following_profile" FOREIGN KEY ("following_profile_id") REFERENCES "main"."profile" ("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "main"."profile_to_profile_configuration" (
        "source_profile_id" uuid NOT NULL,
        "target_profile_id" uuid NOT NULL,
        PRIMARY KEY ("source_profile_id", "target_profile_id"),
        CONSTRAINT "FK_source_profile" FOREIGN KEY ("source_profile_id") REFERENCES "main"."profile" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_target_profile" FOREIGN KEY ("target_profile_id") REFERENCES "main"."profile" ("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "main"."post_asset" (
        "post_id" uuid NOT NULL,
        "asset_id" uuid NOT NULL,
        PRIMARY KEY ("post_id", "asset_id"),
        CONSTRAINT "FK_post_asset_post" FOREIGN KEY ("post_id") REFERENCES "main"."post" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_post_asset_asset" FOREIGN KEY ("asset_id") REFERENCES "main"."asset" ("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "main"."post_like" (
        "post_id" uuid NOT NULL,
        "profile_id" uuid NOT NULL,
        PRIMARY KEY ("post_id", "profile_id"),
        CONSTRAINT "FK_post_like_post" FOREIGN KEY ("post_id") REFERENCES "main"."post" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_post_like_profile" FOREIGN KEY ("profile_id") REFERENCES "main"."profile" ("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "main"."comment_like" (
        "comment_id" uuid NOT NULL,
        "profile_id" uuid NOT NULL,
        PRIMARY KEY ("comment_id", "profile_id"),
        CONSTRAINT "FK_comment_like_comment" FOREIGN KEY ("comment_id") REFERENCES "main"."comment" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_comment_like_profile" FOREIGN KEY ("profile_id") REFERENCES "main"."profile" ("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "main"."chat_participant" (
        "chat_id" uuid NOT NULL,
        "profile_id" uuid NOT NULL,
        PRIMARY KEY ("chat_id", "profile_id"),
        CONSTRAINT "FK_chat_participant_chat" FOREIGN KEY ("chat_id") REFERENCES "main"."chat" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_chat_participant_profile" FOREIGN KEY ("profile_id") REFERENCES "main"."profile" ("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "notification"."notification" (
        "id" uuid NOT NULL PRIMARY KEY,
        "recipient_profile_id" uuid NOT NULL,
        "type" varchar(50) NOT NULL,
        "title" varchar(255) NOT NULL,
        "message" text,
        "is_read" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_notification_profile" FOREIGN KEY ("recipient_profile_id") REFERENCES "main"."profile" ("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "notification"."notification" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "main"."chat_participant" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "main"."comment_like" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "main"."post_like" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "main"."post_asset" CASCADE');
    await queryRunner.query(
      'DROP TABLE IF EXISTS "main"."profile_to_profile_configuration" CASCADE',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "main"."profile_follow" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "main"."message" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "main"."chat" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "main"."comment" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "main"."post" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "main"."asset" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "main"."profile" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "auth"."account" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "auth"."user" CASCADE');
  }
}
