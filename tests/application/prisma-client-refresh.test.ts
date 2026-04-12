import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("prisma client refresh", () => {
  const previousPrisma = (globalThis as { prisma?: unknown }).prisma;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock("@prisma/client");
    vi.doUnmock("@prisma/adapter-libsql");

    if (typeof previousPrisma === "undefined") {
      delete (globalThis as { prisma?: unknown }).prisma;
    } else {
      (globalThis as { prisma?: unknown }).prisma = previousPrisma;
    }
  });

  it("recreates the singleton when the cached client is missing a new delegate", async () => {
    const staleClient = {
      application: {},
    };

    (globalThis as { prisma?: unknown }).prisma = staleClient;

    const freshClient = {
      application: {},
      applicationAccessAttempt: {},
    };

    const prismaClientMock = vi.fn(function PrismaClientMock() {
      return freshClient;
    });
    const prismaLibSqlMock = vi.fn(function PrismaLibSqlMock() {
      return { adapter: true };
    });

    vi.doMock("@prisma/client", () => ({
      PrismaClient: prismaClientMock,
    }));
    vi.doMock("@prisma/adapter-libsql", () => ({
      PrismaLibSql: prismaLibSqlMock,
    }));

    const imported = await import("@/lib/prisma");

    expect(prismaClientMock).toHaveBeenCalledTimes(1);
    expect(imported.default).toBe(freshClient);
    expect((globalThis as { prisma?: unknown }).prisma).toBe(freshClient);
  });
});
