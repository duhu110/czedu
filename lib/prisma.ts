// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
// 删除了 import { createClient } from "@libsql/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

type PrismaClientWithApplicationAccessAttempt = PrismaClient & {
  applicationAccessAttempt?: unknown;
};

const globalForPrisma = global as unknown as {
  prisma?: PrismaClientWithApplicationAccessAttempt;
};

// 直接将配置对象（包含 url）传给 PrismaLibSql 适配器即可
const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

function hasApplicationAccessAttemptDelegate(
  client: PrismaClientWithApplicationAccessAttempt | undefined,
): client is PrismaClient {
  return Boolean(client?.applicationAccessAttempt);
}

export const prisma = hasApplicationAccessAttemptDelegate(globalForPrisma.prisma)
  ? globalForPrisma.prisma
  : new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
