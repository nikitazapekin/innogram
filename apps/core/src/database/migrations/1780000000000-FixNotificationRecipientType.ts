import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixNotificationRecipientType1780000000000 implements MigrationInterface {
  name = 'FixNotificationRecipientType1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" DROP COLUMN "recipient_profile_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" ADD "recipient_profile_id" integer NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" DROP COLUMN "recipient_profile_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification"."notification" ADD "recipient_profile_id" uuid NOT NULL`,
    );
  }
}
