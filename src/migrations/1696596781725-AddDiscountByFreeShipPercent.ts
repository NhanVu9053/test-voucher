import { MigrationInterface, QueryRunner } from "typeorm"

export class AddDiscountByFreeShipPercent1696596781725 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`voucher\`
        MODIFY COLUMN
         \`discount_type\` enum('1', '2', '3', '4')
        NOT NULL AFTER \`usage_limit\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`voucher\` MODIFY COLUMN \`discount_type\` enum('1', '2', '3') NOT NULL AFTER \`usage_limit\``);
    }

}
