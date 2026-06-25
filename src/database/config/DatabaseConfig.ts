
/**
 * Represents postgreSQL configuration
 * 
 * - reads datase config from .env file
 */
export interface DatabaseConfig{
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl: boolean;
    maxConnections: number;
}

function getEnv(name: string): string{

    const value = process.env[name];

    if(!value){
        throw new Error(`Missing env var: ${name}`);
    }

    return value;
}

export const databaseConfig: DatabaseConfig = {

    host: getEnv("DB_HOST"),
    port: Number(getEnv("DB_PORT")),
    database: getEnv("DB_NAME"),
    user: getEnv("DB_USER"),
    password: getEnv("DB_PASSWORD"),

    /**
     * Enables SSL when connecting to postgreSQL services
     * like AWS RDS, Azure etc
     */
    ssl: process.env.DB_SSL === "true",

    /**
     * max nos. of connections maintained by the pool.
     */
    maxConnections: Number(process.env.DB_MAX_CONNECTIONS ?? "10")
};