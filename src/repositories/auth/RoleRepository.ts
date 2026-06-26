import { DatabaseSession } from "../../database/DatabaseSession.js";
import { Role } from "../../types/Role.js";

interface RoleRow {
    id: number;
    name: string;
    description: string;
}

// interface UserRoleRow {
//     roleId: number;
//     roleName: string;
//     roleDescription: string | null;
// }

export class RoleRepository {

    constructor(
        private readonly session: DatabaseSession
    ) {}

    async findById(id: number): Promise<Role | null> {

        const result = await this.session.query<RoleRow>(
            `
            SELECT
                id,
                name,
                description
            FROM roles
            WHERE id = $1
            `,
            [id]
        );

        if (result.rowCount === 0) {
            return null;
        }

        return {
            id: result.rows[0].id,
            name: result.rows[0].name,
            description: result.rows[0].description
        };
    }

    async findByName(name: string): Promise<Role | null> {

        const result = await this.session.query<RoleRow>(
            `
            SELECT
                id,
                name,
                description
            FROM roles
            WHERE name = $1
            `,
            [name]
        );

        if (result.rowCount === 0) {
            return null;
        }

        return {
            id: result.rows[0].id,
            name: result.rows[0].name,
            description: result.rows[0].description
        };
    }

    async findAll(): Promise<Role[]> {

        const result = await this.session.query<RoleRow>(
            `
            SELECT 
                id, 
                name,
                description
            FROM roles
            ORDER BY name    
            `
        );

        return result.rows.map(role => ({
            id: role.id,
            name: role.name,
            description: role.description
        }));
    }

    async getRolesByUser(userId: number): Promise<Role[]> {

        const result = await this.session.query<RoleRow>(
            `
            SELECT
                r.id,
                r.name,
                r.description
            FROM roles r
            INNER JOIN user_roles ur
                ON r.id = ur.role_id
            WHERE ur.user_id = $1
            ORDER BY r.name
            `,
            [userId]
        );

        return result.rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description
        }));
    }

    async assignRole(
        userId: number,
        roleId: number
    ): Promise<void> {

        await this.session.query(
            `
            INSERT INTO user_roles
            (
                user_id,
                role_id
            )
            VALUES
            (
                $1,
                $2
            )
            ON CONFLICT DO NOTHING
            `,
            [
                userId,
                roleId
            ]
        );

    }

    async removeRole(
        userId: number,
        roleId: number
    ): Promise<void> {

        await this.session.query(
            `
            DELETE
            FROM user_roles
            WHERE user_id = $1
              AND role_id = $2
            `,
            [
                userId,
                roleId
            ]
        );

    }
}