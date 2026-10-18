# Agent Instructions

> 这是仓库级入口文档。它只保留始终适用的规则；任务细节按需读取 `docs/`。

## 工作范围

本仓库是一个 Cloudflare Worker + 管理端前端项目：Worker 负责 Emby 节点代理、管理 API、管理端 HTML 投递和定时维护；管理端负责配置、节点、日志、DNS、运行状态和备份操作。

## 开始工作前

- 先运行 `git status --short`，保留用户已有改动；不要用重置、回滚或覆盖命令清理不相关改动。
- 先读取与任务匹配的按需文档，再定位具体源码和测试。
- 以源码为准，生成物只通过仓库脚本更新，不手工修改 `worker.js`、`frontend/index.html` 或 `frontend/dist/`。
- 运行环境使用 Node `>=24.15.0`；PowerShell 中优先使用 `npm.cmd`，避免执行策略阻止 `npm.ps1`。

## 按需阅读

| 任务 | 先读 | 触发条件 |
| --- | --- | --- |
| 了解目录、请求路由、Worker/前端/存储边界 | [`docs/architecture.md`](docs/architecture.md) | 新功能、调试路由、修改 KV/D1、修改管理端投递 |
| 修改源码、构建、测试、发布或处理生成物 | [`docs/development.md`](docs/development.md) | 任何代码改动、运行检查、部署前验证 |
| 查找文档入口与仓库地图 | [`docs/README.md`](docs/README.md) | 不确定该读哪份文档 |

## 必须遵守

- Worker 生产入口只有 `worker/index.js` 的默认导出；生产 Worker 源码位于 `worker/`。
- 生产管理端的事实来源是 `frontend/admin-runtime.template.html` 加 `frontend/scripts/admin-runtime-enhancements.mjs`；`frontend/index.html` 是组合产物。
- `frontend/src/` 不要删除：它是线上管理台在分叉前的可读 Vue 源码，仓库内唯一的可读实现（线上只有 `admin-runtime.template.html` 里一段 651 KB 压缩 bundle）。它不参与构建，只改它不会改变线上 UI；生产 UI 只在模板链落地，并按现有断言同步到 `frontend/src/`。意义、证据与禁令见 `frontend/src/README.md`。
- 不把密钥写入仓库、日志、测试快照或文档。使用 `.dev.vars.example`、`frontend/.env.example` 中的占位配置。
- 保持现有层依赖：`entry -> runtime -> core/platform`；代理 `http` slice 不依赖 `playback`，`playback` 可依赖 `http`。架构检查器是最终约束。
- 行为修改必须补充或调整对应测试，并运行最小相关检查；完成前优先运行完整 `npm.cmd run check`。

## 优先级

1. 用户当前明确要求。
2. 更近路径的项目指令文件（如后续新增）。
3. 本文件的始终适用规则。
4. `docs/` 中与任务匹配的详细说明。









## V19.8版本

## 更新摘要

- **管理端功能**：新增界面皮肤（经典蓝 / 暖纸）与字体加载，主题面板同步当前皮肤；上传类请求跳过 `withUiRequestTimeout`，重新登录期间的挂起请求同样不计超时；自绘弹层补上原生 dialog 语义、焦点管理与 Esc 关闭（弹层是 `#app-shell` 子节点，不对 shell 加 inert）。组合链新增两条断言：发布源预览方法必须存在、设置保存必须带 `expectedConfigRevision`。
- **管理端简化**：模板重新生成后不再包含配置快照面板与 `__INIT_HEALTH_BANNER__`，sync 里那套切除改写器（`stripLegacyConfigSnapshotUi` 及专用工具函数）随之删除，`applyHeadProbeContract` 成为唯一保留的编译产物改写层；fallback bootstrap 不再携带 `primaryViews` / 设置分区元数据，IA 事实改由契约测试断言。
- **壳层校验**：`validateAdminShellHtmlSource` 要求一份管理端壳同时带 `data-admin-runtime-enhancements` 的 `<style>` 与 `<script>`，缺 enhancement 层的旧壳被直接拒绝，而不是静默降级丢掉皮肤、并发保存保护和探针并发池。
- **契约测试**：新增 `admin-contract-parity`。壳层与补丁层静态调用的 action 必须能被 worker registry 解析；`__ADMIN_UI_BOOTED__` 等 4 个启动协议符号在模板、loader 与 Worker 兜底壳中是同一套；`frontend/src` 只调用可解析 action，且保持 5 个主视图与 8 个设置分区。
- **管理端交付**：构建不再经过打包器。`publish-dist.mjs` 先清空输出目录再把 sync 生成的 `frontend/index.html` 拷进 `frontend/dist/`，所以 `dist/` 里只剩 `index.html`，历史打包残留（`assets/`、`.vite/manifest.json`）不会进仓库；`build:bundle` 删除，`VITE_CDN_BASE_URL` 与 Vite 的 `base` 归一化一并退场。
- **构建期与部署门禁**：`check-cdn-paths.mjs` 量真实产物的 UTF-8 字节数，超过 Worker 的 2 MiB 壳层上限直接失败，并通过 `admin-contract-parity` 用 `validateAdminShellHtmlSource` 校验仓库里的 `dist/index.html`；GitHub Actions 在构建与部署前先跑 `npm run check`，构建步骤换成 `npm run build:cdn`，同步漂移、资产策略、壳层上限和 `worker.js` 新鲜度都在部署前失败。
- **依赖与配置清理**：workspace 依赖统一提升到根 `node_modules`，dev-server 不再写死 Vite CLI 路径而是用 `createRequire` 从 `frontend/package.json` 解析，Vite 缓存目录显式指到根 `node_modules/.vite`，`allowScripts` 显式登记安装脚本；`CONFIG_AUTHORITY_MODE`、`VITE_VENDOR_MODE`、`VITE_CDN_IMPORT_*` 等运行时已不再读取的条目从 `.dev.vars.example` 与 `frontend/.env.example` 删除。