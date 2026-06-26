import { DatabaseSession } from "../../database/DatabaseSession";
import { User } from "../../types/User";

interface UserRow{
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

interface ExistsRow{
    exists: boolean;
}

export class UserRepository{

    constructor(private readonly session: DatabaseSession){

    }

    async findById(id: number): Promise<User|null>{

        const result = await this.session.query<UserRow>(
            `
            SELECT
                id, 
                first_name,
                last_name,
                email,
                is_active,
                created_at,
                updated_at
            FROM users
            WHERE id = $1    
            `,
            [id]
        );

        if(result.rowCount===0){
            return null;
        }

        return {
            id: result.rows[0].id,
            firstName: result.rows[0].first_name,
            lastName: result.rows[0].last_name,
            username: result.rows[0].username,
            email: result.rows[0].email,
            isActive: result.rows[0].is_active,
            createdAt: result.rows[0].created_at,
            updatedAt: result.rows[0].updated_at
        };
    }

    async findByEmail(email: string): Promise<User|null>{

        const result = await this.session.query<UserRow>(
            `
            SELECT
                id, 
                first_name,
                last_name,
                email,
                is_active,
                created_at,
                updated_at
            FROM users
            WHERE email = $1    
            `,
            [email]
        );

        if(result.rowCount===0){
            return null;
        }

        return {
            id: result.rows[0].id,
            firstName: result.rows[0].first_name,
            lastName: result.rows[0].last_name,
            username: result.rows[0].username,
            email: result.rows[0].email,
            isActive: result.rows[0].is_active,
            createdAt: result.rows[0].created_at,
            updatedAt: result.rows[0].updated_at
        };
    }

    async findByUsername(username: string):Promise<User| null >{

        const result = await this.session.query<UserRow>(
            `
            SELECT
                id, 
                first_name,
                last_name,
                email,
                is_active,
                created_at,
                updated_at
            FROM users
            WHERE username = $1    
            `,
            [username]
        );

        if(result.rowCount===0){
            return null;
        }

        return{
            id: result.rows[0].id,
            firstName: result.rows[0].first_name,
            lastName: result.rows[0].last_name,
            username: result.rows[0].username,
            email: result.rows[0].email,
            isActive: result.rows[0].is_active,
            createdAt: result.rows[0].created_at,
            updatedAt: result.rows[0].updated_at
        };
    }

    async findAll(): Promise<User[]>{

        const result = await this.session.query<UserRow>(
            `
            SELECT
                id, 
                first_name,
                last_name,
                email,
                is_active,
                created_at,
                updated_at
            FROM users
            ORDER BY id   
            `
        );

        // return by mapping each user row to a "User"
        return result.rows.map(row=>({
            id: row.id,
            firstName: row.first_name,
            lastName: row.last_name,
            username: row.username,
            email: row.email,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));

    }

    async exists(id: number):Promise<boolean>{

        const result = await this.session.query<ExistsRow>(
            `
            SELECT EXISTS (
                SELECT 1
                FROM users
                WHERE id = $1
            ) AS EXISTS   
            `,
            [id]
        );

        return result.rows[0].exists;

    }

    async create(
        firstName: string,
        lastName: string,
        username: string,
        email: string
    ): Promise<User>{

        const result = await this.session.query<UserRow>(
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
            RETURNING
                id, 
                first_name,
                last_name,
                username,
                email,
                is_active,
                created_at,
                updated_at        
            `,
            [ firstName, lastName, username, email ]
        );

        return {
            id: result.rows[0].id,
            firstName: result.rows[0].first_name,
            lastName: result.rows[0].last_name,
            username: result.rows[0].username,
            email: result.rows[0].email,
            isActive: result.rows[0].is_active,
            createdAt: result.rows[0].created_at,
            updatedAt: result.rows[0].updated_at
        };
    }

    async updateEmail(
        id: number,
        email: string
    ):Promise<void>{

        await this.session.query(
            `
            UPDATE users
            SET 
                email = $2
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1    
            `,
            [id, email]
        );

    }

    async delete(id:number): Promise<void>{

        await this.session.query(
            `
            DELETE 
            FROM users
            WHERE id = $1
            `,
            [id]
        );
    } 

}