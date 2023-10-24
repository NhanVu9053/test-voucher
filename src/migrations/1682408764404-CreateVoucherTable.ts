import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateVoucherTable1682408764404 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE TABLE \`voucher\` (
          \`id\` INT NOT NULL AUTO_INCREMENT,
          \`code\` VARCHAR(255) NOT NULL,
          \`description\` VARCHAR(255),
          \`usage_limit\` INT NOT NULL,
          \`discount_type\` enum('1', '2', '3') NOT NULL,
          \`free_shipping_condition\` enum('1', '2', '3') NOT NULL,
          \`discount_percent\` INT,
          \`minimum_order_value\` INT,
          \`start_date\` DATETIME NOT NULL,
          \`end_date\` DATETIME NOT NULL,
          \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB;
      `);    

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`voucher\``);

    }

}
