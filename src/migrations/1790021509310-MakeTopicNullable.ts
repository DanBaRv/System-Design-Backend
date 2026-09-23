import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeTopicNullable1790021509310 implements MigrationInterface {
    name = 'MakeTopicNullable1790021509310'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "username" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "topic" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "description" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "topic" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "username" SET NOT NULL`);
    }

}
