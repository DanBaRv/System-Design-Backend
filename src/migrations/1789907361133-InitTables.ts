import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTables1789907361133 implements MigrationInterface {
    name = 'InitTables1789907361133'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "channel" ADD "description" character varying(300) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "channel" ADD "description" character varying(100) NOT NULL`);
    }

}
