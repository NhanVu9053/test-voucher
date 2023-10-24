import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateVoucherAppliedLocationTable1688527620736 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE TABLE \`voucher_applied_location\` (
          \`id\` INT NOT NULL AUTO_INCREMENT,
          \`code\` VARCHAR(255) NOT NULL,
          \`locationId\` VARCHAR(255),
          \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB;
      `);    
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`voucher_applied_location\``);
    }

}
