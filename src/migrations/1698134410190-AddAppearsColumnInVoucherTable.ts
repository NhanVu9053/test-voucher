import { MigrationInterface, QueryRunner } from "typeorm"

export class AddAppearsColumnInVoucherTable1698134410190 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE \`voucher\`
        ADD COLUMN \`appear_type\` enum('1', '2', '3') NOT NULL DEFAULT 2
    `) 
    /* 1 all,
       2 app,
       3 hidden_app */
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE \`voucher\`
        DROP COLUMN \`appear_type\`
    `);
    }

}
