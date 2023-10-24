import { MigrationInterface, QueryRunner } from "typeorm"

export class AddUniqueConstraintToCode1691830883955 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`voucher\`
            ADD CONSTRAINT \`UQ_voucher_code\` UNIQUE (\`code\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`voucher\`
            DROP CONSTRAINT \`UQ_voucher_code\`
        `);
    }

}
