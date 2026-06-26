import { test, expect } from "../src/fixtures/database.fixture.js";

/**
 * serial mode is used just to test trnsaction-per-test which is defined 
 * in fixture. So creating an user at 2nd test and verifying that same 
 * username doe not exist in third test, which confirms ROLLBACK success.

 * As this framework uses no temporary SQL dumps and only uses 
 * Database Transactions. 
 * This pattern gives you:
 *
 *  BEGIN
 *    ↓
 * Run test
 *    ↓
 * ROLLBACK
 *
 * instead of,
 *
 * Import SQL dump
 *       ↓
 *    Run test
 *       ↓
 * Import SQL dump again
 *
 */
test.describe.configure({ mode: 'serial' });

test.describe('Database session', ()=>{
    test('should retreve a user', async ({ db })=>{

        
        const result = await db.query<{
            id: number;
            first_name: string;
            email: string;
        }>(`SELECT id, first_name, email FROM users WHERE id=$1`, [1]);

        console.table(result.rows);

        expect(result.rowCount).toBe(1);
        expect(result.rows[0].first_name).toBe('John');
        expect(result.rows[0].email).toBe("john.doe@test.com");
    })

     test("should insert a user within the transaction", async ({db})=>{

        await db.query(
            `
            INSERT INTO users
            (
                first_name,
                last_name,
                username,
                email
            )
            VALUES
            (
                $1, $2, $3, $4
            )    
            `,
            [ "some", "name", "namesome", "somename@test.com" ]
        );

        const result = await db.query<{count:string}>(
            `
            SELECT COUNT(*) AS count
            FROM users
            WHERE username = $1 
            `,
            ["namesome"]
        );

        expect(result.rows[0].count).toBe("1");

     });

    test("should rollback the transaction after each test", async ({ db })=>{

         const result = await db.query<{count:string}>(
            `
            SELECT COUNT(*) AS count
            FROM users
            WHERE username = $1 
            `,
            ["namesome"]
        );

        expect(result.rows[0].count).toBe("0");
    });
})