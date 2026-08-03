import "dotenv/config"

export const env = {
    databaseUrl : process.env.DATABASE_URL!,
    port: process.env.PORT!,
    secretKey: process.env.SECRET_KEY!,
    dbHost : process.env.DB_HOST!,
    dbPort : process.env.DB_PORT!,
    dbUser : process.env.DB_USER!,
    dbPassword : process.env.DB_PASSWORD!,
    dbName : process.env.DB_NAME!,
}

