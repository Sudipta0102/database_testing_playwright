import { PoolClient, QueryResult, QueryResultRow } from "pg";
import { DatabasePool } from "./DatabasePool.js";

/**
 * Represents a single database session
 * 
 * Responsibilities:
 * - acquire a connection from the pool
 * - begin a transaction
 * - execute sql query
 * - rollback the trasaction
 * - release the connection back to the pool
 * 
 * Each test is supposed to create its own database session 
 */
export class DatabaseSession{
    private client: PoolClient | null = null;

    /**
     * Acquires a connection and starts a transaction 
     */
    async beginTransaction(): Promise<void>{

        this.client = await DatabasePool.getConnection();

        // with BEGIN a transaction starts to happen which gives a 
        // provision to ROLLBACK later
        // Without begin if one does:
        // UPDATE Users
        // SET name='meow'
        // WHERE id=1;
        // The change will be permanent. But with BEGIN before every 
        // session every DML query will happen inside a transaction.
        await this.client.query('BEGIN');

    }

    /**
     * Executes a sql query.
     */
    async query<T extends QueryResultRow=QueryResultRow>(
        sql: string,
        params?: unknown[]
    ): Promise<QueryResult<T>>{

        if(!this.client){
            throw new Error("No active database session");
        }

        return await this.client.query(sql, params);
    }

    /**
     * Rolls back current transaction
     */
    async rollback(){

        if(!this.client){
            return;
        }

        await this.client.query('ROLLBACK');
    }

    /**
     * Releases the database connection back to the pool 
     */
    release():void{

        if(!this.client){
            return;
        }

        this.client.release();

        this.client = null;

    }

    /**
     * compounding rollback and release together.
     */
    async rollbackAndRelease(): Promise<void>{

        await this.rollback();

        this.release();
    }
}