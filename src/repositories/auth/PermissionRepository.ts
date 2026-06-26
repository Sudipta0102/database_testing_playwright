import { DatabaseSession } from "../../database/DatabaseSession.js";
import { Permission } from "../../types/Permission.js";

interface ExistsRow {
    exists: boolean;
}

export class PermissionRepository {

    constructor(
        private readonly session: DatabaseSession
    ) {}

    async findById(id: number): Promise<Permission | null> {

        const result = await this.session.query<Permission>(
            `
            SELECT
                id,
                name,
                description
            FROM permissions
            WHERE id = $1
            `,
            [id]
        );

        if (result.rowCount === 0) {
            return null;
        }

        return result.rows[0];

    }

    async findByName(name: string): Promise<Permission | null> {

        const result = await this.session.query<Permission>(
            `
            SELECT
                id,
                name,
                description
            FROM permissions
            WHERE name = $1
            `,
            [name]
        );

        if (result.rowCount === 0) {
            return null;
        }

        return result.rows[0];

    }

    async findAll(): Promise<Permission[]> {

        const result = await this.session.query<Permission>(
            `
            SELECT
                id,
                name,
                description
            FROM permissions
            ORDER BY name
            `
        );

        return result.rows;

    }

    async getPermissionsByRole(
        roleId: number
    ): Promise<Permission[]> {

        const result = await this.session.query<Permission>(
            `
            SELECT
                p.id,
                p.name,
                p.description
            FROM permissions p
            INNER JOIN role_permissions rp
                ON p.id = rp.permission_id
            WHERE rp.role_id = $1
            ORDER BY p.name
            `,
            [roleId]
        );

        return result.rows;

    }

    async getPermissionsByUser(
        userId: number
    ): Promise<Permission[]> {

        const result = await this.session.query<Permission>(
            `
            SELECT DISTINCT
                p.id,
                p.name,
                p.description
            FROM permissions p
            INNER JOIN role_permissions rp
                ON p.id = rp.permission_id
            INNER JOIN roles r
                ON rp.role_id = r.id
            INNER JOIN user_roles ur
                ON r.id = ur.role_id
            WHERE ur.user_id = $1
            ORDER BY p.name
            `,
            [userId]
        );

        return result.rows;

    }

    async hasPermission(
        userId: number,
        permissionName: string
    ): Promise<boolean> {

        const result = await this.session.query<ExistsRow>(
            `
            SELECT EXISTS (

                SELECT 1

                FROM permissions p

                INNER JOIN role_permissions rp
                    ON p.id = rp.permission_id

                INNER JOIN roles r
                    ON rp.role_id = r.id

                INNER JOIN user_roles ur
                    ON r.id = ur.role_id

                WHERE ur.user_id = $1
                  AND p.name = $2

            ) AS exists
            `,
            [
                userId,
                permissionName
            ]
        );

        return result.rows[0].exists;

    }

}