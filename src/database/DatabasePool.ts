import { Pool, PoolClient } from 'pg';
import { databaseConfig } from './config/DatabaseConfig';

/**
 * Responsibilities:
 * - Lazy creation of postgres connection pool
 * - provides pooled db connection
 * - closes the the pool when framework shuts down
 * 
 * DatabaseConfig
 *       ↓
 *  DatabasePool
 *       ↓
 * getConnection()
 *       ↓
 * DatabaseSession
 *       ↓
 *  BEGIN / ROLLBACK
 *       ↓
 *  Repositories
 * 
 *  
 */
export class DatabasePool{

    // lazy initialization of pool connection
    private static pool : Pool | null = null;

    /**
     * 
     * returns a connection pool
     */
    private static getPool(): Pool {
        if (!this.pool) {
            this.pool = new Pool({
                host: databaseConfig.host,
                port: databaseConfig.port,
                database: databaseConfig.database,
                user: databaseConfig.user,
                password: databaseConfig.password,
                ssl: databaseConfig.ssl ? { rejectUnauthorized: false } : false,
                max: databaseConfig.maxConnections
            });
        }

        return this.pool;
    }

    /**
     * 
     * Acquires a database connection from the pool
     * 
     */
    static async getConnection(): Promise<PoolClient>{

        return await this.getPool().connect();
    }

    /**
     * 
     * Closes all pooled connection
     * 
     */
    static async closePool(): Promise<void>{

        if(!this.pool){
            return;
        }

        await this.pool.end();
        this.pool = null;
    }

}