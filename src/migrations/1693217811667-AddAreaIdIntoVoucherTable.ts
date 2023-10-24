import { MigrationInterface, QueryRunner } from "typeorm"

export class AddAreaIdIntoVoucherTable1693217811667 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE \`voucher\`
        ADD COLUMN \`area_id\` int NOT NULL DEFAULT 0
    `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE \`voucher\`
        DROP COLUMN \`area_id\`
    `);
    }

}
