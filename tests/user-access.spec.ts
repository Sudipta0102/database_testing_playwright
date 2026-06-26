import { test, expect } from "../src/fixtures/database.fixture";

import { UserRepository } from "../src/repositories/auth/UserRepository";
import { RoleRepository } from "../src/repositories/auth/RoleRepository";
import { PermissionRepository } from "../src/repositories/auth/PermissionRepository";

test.describe("Repository composition", () => {
    test("should assign a role and verify inherited permissions", async ({ db }) => {

        const userRepository = new UserRepository(db);
        const roleRepository = new RoleRepository(db);
        const permissionRepository = new PermissionRepository(db);

        // creating an user in users table  
        const user =
            await userRepository.create(
                "Alice",
                "Smith",
                "asmith",
                "alice@test.com"
            );

        // get manager role from roles table    
        const manager = await roleRepository.findByName("Manager");
        expect(manager).not.toBeNull();

        // assign the roles in user_roles table
        // manager!.id -> tells typescript that this role will exist
        await roleRepository.assignRole(user.id, manager!.id);

        // users
        //    ↓
        // user_roles
        //    ↓
        // roles
        //    ↓
        // role_permissions
        //    ↓
        // permissions
        const permissions = await permissionRepository.getPermissionsByUser(user.id);

        console.table(permissions);
        // Verify that the assigned role grants the expected permissions.
        expect(permissions.some(permission => permission.name === "VIEW_PRODUCT")).toBeTruthy();
        expect(permissions.some(permission => permission.name === "UPDATE_PRODUCT")).toBeTruthy();
        expect(permissions.some(permission => permission.name === "VIEW_ORDER")).toBeTruthy();

    });

});
