import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeTableNameAndColumnNameVoucherAppliedLocationToVoucherAppliedMerchant1689219372312
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE \`voucher_applied_location\`
        CHANGE \`locationId\` \`merchant_id\` VARCHAR(255)
    `);

    await queryRunner.query(`
        RENAME TABLE \`voucher_applied_location\` TO \`voucher_applied_merchant\`
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE \`voucher_applied_merchant\`
        CHANGE \`merchant_id\` \`locationId\` VARCHAR(255)
    `);

    await queryRunner.query(`
        RENAME TABLE \`voucher_applied_merchant\` TO \`voucher_applied_location\`
    `);
  }
}
