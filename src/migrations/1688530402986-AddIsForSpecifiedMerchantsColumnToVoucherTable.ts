import { MigrationInterface, QueryRunner } from "typeorm"

export class AddIsForSpecifiedMerchantsColumnToVoucherTable1688530402986 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`voucher\` ADD \`is_for_specified_merchants\` BOOLEAN NOT NULL`,
          );      
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`voucher\` DROP COLUMN \`is_for_specified_merchants\``,
          );
      
    }

}
