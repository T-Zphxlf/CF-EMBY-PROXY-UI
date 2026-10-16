import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { APP_VERSION } from "../worker/core/build-info.js";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const versionLabel = `V${APP_VERSION}`;

// Worker 落地页、前端标题/徽章与产物都由 APP_VERSION 派生；这里只兜住手工维护的文档。
const expectations = [
  { file: "README.md", needle: `version-${versionLabel}-`, description: "版本徽章" },
  { file: "README.md", needle: `当前 **${versionLabel}**`, description: "版本摘要" },
  { file: "AGENTS.md", needle: `## ${versionLabel}版本`, description: "版本标题" },
];

const failures = [];
for (const expectation of expectations) {
  const text = await readFile(path.join(repositoryRoot, expectation.file), "utf8");
  if (!text.includes(expectation.needle)) {
    failures.push(
      `${expectation.file} 缺少${expectation.description}（应包含 "${expectation.needle}"）`,
    );
  }
}

if (failures.length) {
  console.error(
    `[check-version-consistency] 文档版本号与 worker/core/build-info.js 的 ${versionLabel} 不一致：`,
  );
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `[check-version-consistency] 版本号 ${versionLabel} 在 worker/core/build-info.js 与 README.md / AGENTS.md 中一致`,
);
