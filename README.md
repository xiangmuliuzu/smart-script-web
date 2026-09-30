# 智能剧本创作平台 PC Web

Vue 3 + Vite 应用。管理员账号（`00`）进入管理端，用户账号（`01/02/03`）进入个人工作台。管理端菜单来自后端 `/getRouters`；用户侧使用独立路由和 App 凭证域接口。页面、接口、权限与样式位于 `src/`，`scripts/` 与 `tests/` 用于校验。

## 安装与运行

```bash
npm ci
npm run dev
```

开发服务器默认使用 `http://localhost:3000`。联调时设置 `VITE_API_TARGET` 指向后端；后端数据库初始化及启动见 [后端 README](../smart-script-backend/README.md)。跨端接口约定见 [共享资源](../shared/README.md)。

## 校验与构建

```bash
npm run gate
```

该命令依次执行 lint、静态检查、测试和生产构建。`scripts/typecheck-static.mjs` 及 `tests/menu-icon.test.js` 会读取同级 `../shared/sql/` 的菜单 seed 与 rollback SQL，因此整个 `shared/sql/` 应与三仓保持同级目录。

管理端遵循若依返回体和 RBAC 权限；用户侧请求使用 App Access Token。客户端隐藏无权限操作，写入权限仍由后端校验。
