import { PrismaClient } from "@prisma/client";

/**
 * @description Prisma DB Client
 */
const db = new PrismaClient();

export default db;
