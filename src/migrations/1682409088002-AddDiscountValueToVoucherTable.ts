import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDiscountValueToVoucherTable1682409088002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`voucher\` ADD \`discount_value\` INT `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`voucher\` DROP COLUMN \`discount_value\``,
    );
  }
}
