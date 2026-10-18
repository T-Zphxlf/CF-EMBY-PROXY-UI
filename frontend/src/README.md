# frontend/src — 非生产镜像（已冻结）

生产管理端的事实来源是 `frontend/admin-runtime.template.html` 加
`frontend/scripts/admin-runtime-enhancements.mjs`，经 `sync-admin-runtime.mjs` 组合为
`frontend/index.html`，再由 Vite 输出 `frontend/dist/index.html` 交给 Worker `ASSETS`。

本目录是同一套管理台的 Vue 组件化副本，**不在生产链路上**：没有任何 module script 指向它，
没有 `main.js` 或 `createApp`，`wrangler.toml` 只上传 `frontend/dist`。只改这里，线上界面不会有任何变化。

维护规则（冻结 + 继续同步）：

- 生产功能改动只在模板链落地；本目录只做镜像，保持同名功能存在，或随模板一起删除。
- 同步是义务：`tests/frontend-runtime-enhancements.test.mjs` 用文本断言同时检查模板与本目录，漏改会让 `npm.cmd run check` 失败。
- 不在这里新增 admin action 或 UI 契约；契约变更先改模板链与 Worker action registry。
- 迁移到组件化构建是独立工程，必须先解决 Worker `validateAdminShellHtmlSource` 的资产策略（禁止 importmap、禁止内联动态 `import()`、禁止相对或本地 bundle 资源、2 MiB 上限）；模板或组合产物一旦出现 `<script type="module">`，`sync-admin-runtime.mjs --check` 会直接失败，所以不存在"半接通"的可用状态。

详见 `docs/architecture.md` 的「管理端事实来源与组合链」。
