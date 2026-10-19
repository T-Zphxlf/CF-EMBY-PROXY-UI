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









## V19.9版本

## 更新摘要

- **皮肤进配置**：界面皮肤从浏览器本地偏好升级为 KV 配置字段 `adminUiSkin`（存 `sys:theme`），随 bootstrap 注入，首帧即落主题；导入旧备份或局部保存配置时该字段缺失会沿用现值，不再被静默重置回经典蓝（备份里显式写皮肤仍按显式选择覆盖）。深浅模式仍是本机偏好，不上传。
- **管理端请求收敛**：仪表盘分层数据 60 秒内复用（优先 1 小时 D1 快照，`cacheStatus=cache` 直接早退）、设置 bootstrap 5 秒内合并在飞请求 / 10 秒内直接返回、日志第一页 30 秒内复用（日志功能关闭时绕开）。翻页、强刷、跨域一律不进缓存，代价是窗口内可能读到旧数据；保存配置后同时失效仪表盘缓存。
- **管理端其它修正**：强制刷新被后来的普通加载顶掉时必须解锁 `dashboardRefreshPending`，否则刷新按钮永久失效；Vue 换成 runtime-only 构建（壳层无运行时编译）；日志缓存补丁复用 app 自己的 `logPageCache` 与 `applyCachedLogPage`，签名构造字段与线上同序。
- **重定向凭据**：客户端可见的 `Location` 一律剥离 userinfo，只有与节点基址完全一致（origin + 账号 + 密码）的凭据才保留，路径式跨域写法（`//`、`/\`、`\`、`	//`）统一归一为同一绝对目标；跳数预算收敛成单个常量，与 `redirect_limit` 诊断标签不再可能失同步；非可跟随状态（300/305）同样剥离，只是不重写目标。
- **访问日志门禁**：日志先判定后构造。命中缓存、进度节流 204、直连 404、探针透传、entry 307、上游错误等路径都先过 `shouldRecordAccessLog` / `shouldWriteAccessLog`，会被丢弃的行不再构造 `detailJson`；`logWriteMode=error` 下流式响应中断仍记 502（`statusFinal:false`）。`Logger.record` 的过滤一处未改，日志行数不变。
- **热点小修**：私有鉴权头名匹配拆出已归一化的 `matchPrivateMediaAuthHeaderName`，元数据缓存身份计算不再对每个头重复 `trim().toLowerCase()`；日志类别在同一门禁内只分类一次。
- **构建与仓库**：`worker.js` 标记 `-diff`（压缩器每次重排标识符，产物差异全是改名噪声），新鲜度由 `check-worker-bundle` 守住；bundle 硬守卫提到 1.5 MB，工作目标 1.1 MB；`*.pprof` 进 `.gitignore`。测试 393 条，`npm run check` 覆盖格式、架构、壳层上限、CDN 资产策略与产物新鲜度。
