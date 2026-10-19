import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { collectVersionDocFailures } from "../scripts/check-version-consistency.mjs";
import { APP_VERSION } from "../worker/core/build-info.js";

const versionLabel = `V${APP_VERSION}`;
const readDoc = (file) => readFile(fileURLToPath(new URL(`../${file}`, import.meta.url)), "utf8");
const readmeWith = (label = versionLabel) => `version-${label}- … 当前 **${label}**`;

test("repo documents agree with APP_VERSION and keep the summary in README", async () => {
  const failures = collectVersionDocFailures({
    "README.md": await readDoc("README.md"),
    "AGENTS.md": await readDoc("AGENTS.md"),
  });
  assert.deepEqual(failures, []);
});

test("the version pointer must carry the live version", () => {
  const documents = (agents, readme = readmeWith()) => ({
    "README.md": readme,
    "AGENTS.md": agents,
  });
  assert.deepEqual(
    collectVersionDocFailures(documents(`> 见 README「当前 **${versionLabel}**」`)),
    [],
  );
  // AGENTS.md 指向旧版本
  assert.equal(collectVersionDocFailures(documents("> 见 README「当前 **V0.0**」")).length, 1);
  // README 摘要段漂移
  assert.equal(
    collectVersionDocFailures(documents(`> 当前 **${versionLabel}**`, "当前 **V0.0**")).length,
    2,
  );
  // 文档缺失时不是静默通过
  assert.equal(collectVersionDocFailures({}).length, 3);
});

test("a release summary heading cannot come back into AGENTS.md", () => {
  const agents = (extra) => `> 当前 **${versionLabel}**\n\n${extra}`;
  const documents = (text) => ({ "README.md": readmeWith(), "AGENTS.md": text });
  for (const heading of [
    `## ${versionLabel}版本`,
    "## 更新摘要",
    "##  V19.5版本",
    "##\t更新摘要",
  ]) {
    const failures = collectVersionDocFailures(documents(agents(heading)));
    assert.equal(failures.length, 1, heading);
    assert.match(failures[0], /只放 README/);
  }
  // 正文里提到同名概念不算违规，只有整行标题才拦。
  assert.deepEqual(
    collectVersionDocFailures(
      documents(agents(`见 README 的「当前 **${versionLabel}**」段与更新摘要。`)),
    ),
    [],
  );
});
