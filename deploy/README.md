# Docker 部署说明

这套部署文件只在 Docker 镜像构建时生效，不修改根目录 SQLite 开发配置：

- 本地开发继续使用根目录 `prisma/schema/main.prisma` 的 SQLite provider 和根目录 `.env`。
- Docker 构建会把 `deploy/prisma/schema` 覆盖到镜像内的 `prisma/schema`，使用 PostgreSQL provider。
- Docker 构建会把 `deploy/overrides/lib/prisma.ts.template` 覆盖到镜像内的 `lib/prisma.ts`，使用 `@prisma/adapter-pg`。
- 上传文件通过 volume 存储到宿主机 `/home/oss/xnczjyj`，容器内路径是 `/app/public/uploads`。

## 前置条件

1. PostgreSQL 已在另一容器中运行。
2. 该 PostgreSQL 容器和本应用容器加入同一个 Docker network。
3. 宿主机上传目录存在，并允许容器 UID `1001` 写入：

```bash
mkdir -p /home/oss/xnczjyj
chown -R 1001:1001 /home/oss/xnczjyj
```

如果 PostgreSQL 容器所在 network 不是 `postgres_net`，把实际 network 名称写入 `deploy/.env` 的 `POSTGRES_DOCKER_NETWORK`。

## 启动

```bash
cd deploy
cp env.example .env
```

编辑 `deploy/.env`：

- `DATABASE_URL`：把账号、密码、数据库名、PostgreSQL 容器名改成服务器实际值。
- `POSTGRES_DOCKER_NETWORK`：改成 PostgreSQL 容器所在 Docker network。
- `UPLOAD_HOST_DIR`：默认 `/home/oss/xnczjyj`。

然后启动：

```bash
docker compose up -d --build
```

查看日志：

```bash
docker compose logs -f czedu
```

## 数据库初始化

默认 `PRISMA_DB_PUSH=true`，容器启动时会执行：

```bash
prisma db push --schema prisma/schema
```

这用于把 `deploy/prisma/schema` 同步到 PostgreSQL。数据库结构稳定后，可以在 `deploy/.env` 里改成：

```env
PRISMA_DB_PUSH=false
```

本项目根目录的 SQLite migration 不会用于 PostgreSQL，因为根目录 migration lock 是 SQLite provider。PostgreSQL 部署使用 `db push` 同步 schema，避免影响本地 SQLite 开发流程。
