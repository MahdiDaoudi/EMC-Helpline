import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { env } from "./env";

const adapter = new PrismaMariaDb({
  host: env.dbHost,
  port: Number(env.dbPort),
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
});

export const prisma = new PrismaClient({ adapter });