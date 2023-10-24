import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateAppliedVoucher1682409514049 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE TABLE \`applied_voucher\` (
          \`id\` INT NOT NULL AUTO_INCREMENT,
          \`code\` VARCHAR(255) NOT NULL,
          \`user_id\` VARCHAR(255),
          \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB;
      `);    

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`applied_voucher\``);

    }

}
