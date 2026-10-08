# 智能剧本创作平台 PC Web

Vue 3 + Vite 应用。管理员账号（`00`）进入管理端，用户账号（`01/02/03`）进入个人工作台。管理端菜单来自后端 `/getRouters`；用户侧使用独立路由和 App 凭证域接口。页面、接口、权限与样式位于 `src/`，`scripts/` 与 `tests/` 用于校验。

## 安装与运行

环境要求：Node.js `^20.19.0 || >=22.12.0`（见 `package.json` 的 `engines`）。

```bash
npm ci
npm run dev
```

开发服务器默认使用 `http://localhost:3000`。联调时设置 `VITE_API_TARGET` 指向后端；后端数据库初始化及启动见 [后端 README](../smart-script-backend/README.md)。

环境变量从 `.env.development` 读取，完整字段说明见 `.env.example`：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_APP_BASE_API` | `/dev-api` | 若依认证与系统 API 的统一前缀。**不得为空**——空值会把 `/login` 等 SPA 路由误代理到后端 |
| `VITE_API_TARGET` | `http://localhost:8080` | Vite 代理目标（本机 RuoYi 后端） |

## 校验与构建

```bash
npm run gate
```

该命令依次执行 lint、静态检查、测试和生产构建。各步骤也可单独运行：

| 命令 | 作用 |
| --- | --- |
| `npm run lint` | 检查 `src/` 中禁用的认证 / 权限写法 |
| `npm run typecheck` | 契约检查：确认生产页面调用真实契约，而不是测试副本 |
| `npm run test` | 单元测试 |
| `npm run build` | 生产构建 |

管理端遵循若依返回体和 RBAC 权限；用户侧请求使用 App Access Token。客户端隐藏无权限操作，写入权限仍由后端校验。

## 目录导航

| 路径 | 内容 |
| --- | --- |
| `src/api/` | 接口封装，按域分文件（`pcWork` 作品、`chat` / `adminChat` 沟通、`copyright` 版权、`trade` 交易等），系统类接口在 `system/`、`monitor/`、`user/` 子目录 |
| `src/views/` | 页面，按模块分目录：`system` 若依管理端、`pc` 用户工作台、`chat` 沟通、`copyright` 版权、`trade` 交易、`content` 内容、`risk` 风控、`statistics` 统计等 |
| `src/router/` | 路由、动态菜单适配与组件映射 |
| `src/utils/` | `request`、若依返回体解包、菜单图标等公共工具 |
| `src/components/` | 跨页面复用组件 |
| `scripts/` | 自研静态检查脚本（不是标准 eslint） |
| `tests/` | `node --test` 单元测试 |
| `docs/` | 阶段交付文档，如 `docs/a4/` |

## 分支与提交规范

- `main`：日常开发分支，需保持可运行。
- `release`：受保护分支，禁止直接 push，只能提 PR，由项目经理在阶段验收通过后合并。
- 一次提交只解决一个明确问题，提交信息写清模块和动作。
- 不得提交编译错误、临时文件、个人配置和密钥。
- 涉及接口、表结构、状态枚举、权限的改动，须同步项目经理与关联开发 / 测试。
- **push 前先确认目标**：`git remote -v` 核对仓库，`git log --oneline -3` 核对历史是否接得上。历史对不上时不要用 `--force`，先把情况说清楚。

开发规范以仓库根目录 `rules.md` 为准。
