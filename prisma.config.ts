// prisma.config.ts
import "./lib/china-time";
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  // 1. 指向多文件 Schema 的存放文件夹
  schema: "prisma/schema",

  // 2. 数据库迁移文件的存放路径（保持默认）
  migrations: {
    path: "prisma/migrations",
  },

  // 3. 数据库连接（Prisma 7 将这里的优先级置于 schema 之上）
  datasource: {
    // 优先读取 .env 中的 DATABASE_URL，如果没读到则默认使用根目录的 dev.db
    url: process.env["DATABASE_URL"] || "file:./dev.db",
  },
});
