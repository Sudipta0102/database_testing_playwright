import { DatabaseSession } from "../../database/DatabaseSession.js";

interface UserRoleRow {
    userId: number;
    username: string;
    roleName: string;
}

interface UserPermissionRow {
    userId: number;
    username: string;
    permissionName: string;
}

interface RolePermissionSummaryRow {
    roleName: string;
    permissionCount: string;
}

interface UserWithoutRoleRow {
    userId: number;
    username: string;
}

export class UserAccessReportRepository {

    constructor(
        private readonly session: DatabaseSession
    ) {}

    /**
     * Returns every user with their assigned roles.
     */
    async getUsersWithRoles(): Promise<UserRoleRow[]> {

        const result = await this.session.query<UserRoleRow>(
            `
            SELECT
                u.id AS "userId",
                u.username,
                r.name AS "roleName"
            FROM users u
            INNER JOIN user_roles ur
                ON u.id = ur.user_id
            INNER JOIN roles r
                ON ur.role_id = r.id
            ORDER BY
                u.username,
                r.name
            `
        );

        return result.rows;
    }

    /**
     * Returns every user with their respective permission.
     */
    async getUsersWithPermissions(): Promise<UserPermissionRow[]> {

        const result = await this.session.query<UserPermissionRow>(
            `
            SELECT
                u.id AS "userId",
                u.username,
                p.name AS "permissionName"
            FROM users u
            INNER JOIN user_roles ur
                ON u.id = ur.user_id
            INNER JOIN roles r
                ON ur.role_id = r.id
            INNER JOIN role_permissions rp
                ON r.id = rp.role_id
            INNER JOIN permissions p
                ON rp.permission_id = p.id
            ORDER BY
                u.username,
                p.name
            `
        );

        return result.rows;
    }

    /**
     * Returns the number of permissions assigned to each role.
     */
    async getRolePermissionSummary(): Promise<RolePermissionSummaryRow[]> {

        const result = await this.session.query<RolePermissionSummaryRow>(
            `
            SELECT
                r.name AS "roleName",
                COUNT(rp.permission_id)::TEXT AS "permissionCount"
            FROM roles r
            LEFT JOIN role_permissions rp
                ON r.id = rp.role_id
            GROUP BY
                r.id,
                r.name
            ORDER BY
                r.name
            `
        );

        return result.rows;
    }

    /**
     * Returns users that have no assigned role.
     */
    async getUsersWithoutRoles(): Promise<UserWithoutRoleRow[]> {

        const result = await this.session.query<UserWithoutRoleRow>(
            `
            SELECT
                u.id AS "userId",
                u.username
            FROM users u
            LEFT JOIN user_roles ur
                ON u.id = ur.user_id
            WHERE ur.user_id IS NULL
            ORDER BY
                u.username
            `
        );

        return result.rows;
    }

}