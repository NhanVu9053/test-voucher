import { MigrationInterface, QueryRunner } from "typeorm"

export class AddServiceTypeVoucherTable1698132952762 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE \`voucher\`
        ADD COLUMN \`service_type\` enum('1', '2', '3','4') NOT NULL DEFAULT 1
    `) 
    /* 1 delivery,
       2 bike,
       3 car,
       4 express */
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE \`voucher\`
        DROP COLUMN \`service_type\`
    `);
    }

}
