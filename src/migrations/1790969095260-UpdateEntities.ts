import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEntities1790969095260 implements MigrationInterface {
    name = 'UpdateEntities1790969095260'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "subscribersCount" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "subscribersCount" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "averageReach" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "averageReach" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "coverUrl" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "videoUrl" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "videoUrl" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "coverUrl" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "averageReach" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "averageReach" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "subscribersCount" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "subscribersCount" SET NOT NULL`);
    }

}
