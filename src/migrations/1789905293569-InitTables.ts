import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTables1789905293569 implements MigrationInterface {
    name = 'InitTables1789905293569'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("userId" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "email" character varying(50) NOT NULL, CONSTRAINT "PK_8bf09ba754322ab9c22a215c919" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TABLE "likes" ("id" SERIAL NOT NULL, "channelId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_a9323de3f8bced7539a794b4a37" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."channel_status_enum" AS ENUM('draft', 'published', 'deleted')`);
        await queryRunner.query(`CREATE TABLE "channel" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "username" character varying(50) NOT NULL, "topic" character varying(100) NOT NULL, "subscribersCount" integer NOT NULL DEFAULT '0', "averageReach" integer NOT NULL DEFAULT '0', "adPrice" integer NOT NULL DEFAULT '0', "repostsCount" integer NOT NULL DEFAULT '0', "commentsCount" integer NOT NULL DEFAULT '0', "description" character varying(100) NOT NULL, "status" "public"."channel_status_enum" NOT NULL DEFAULT 'draft', "coverUrl" character varying(250), "videoUrl" character varying(250), "nextId" integer, "channelCreated" TIMESTAMP NOT NULL, "channelFormed" TIMESTAMP, "creatorId" integer NOT NULL, CONSTRAINT "PK_590f33ee6ee7d76437acf362e39" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "likes" ADD CONSTRAINT "FK_9119c233f8700b67c855e3b6323" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "likes" ADD CONSTRAINT "FK_cfd8e81fac09d7339a32e57d904" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "channel" ADD CONSTRAINT "FK_ea990eb9792cca9333f6b507cdf" FOREIGN KEY ("creatorId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channel" DROP CONSTRAINT "FK_ea990eb9792cca9333f6b507cdf"`);
        await queryRunner.query(`ALTER TABLE "likes" DROP CONSTRAINT "FK_cfd8e81fac09d7339a32e57d904"`);
        await queryRunner.query(`ALTER TABLE "likes" DROP CONSTRAINT "FK_9119c233f8700b67c855e3b6323"`);
        await queryRunner.query(`DROP TABLE "channel"`);
        await queryRunner.query(`DROP TYPE "public"."channel_status_enum"`);
        await queryRunner.query(`DROP TABLE "likes"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
