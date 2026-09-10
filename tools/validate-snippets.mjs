#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";
import vm from "node:vm";

const root = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const context = vm.createContext({ window: {}, console, JSON, Math });
const chapterFiles = fs
  .readdirSync(path.join(root, "data"))
  .filter((f) => /^ch\d+\.js$/.test(f))
  .sort()
  .map((f) => "data/" + f);
for (const file of ["data/index.js", ...chapterFiles, "data/cheatsheet.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, {
    filename: file,
  });
  if (context.window.OCP) context.OCP = context.window.OCP;
}
const ocp = context.window.OCP;
const known = new Set(
  ocp.objectives.flatMap((a) => a.bullets.map((b) => b.id)),
);
const ids = new Set();
const failures = [];
const checks = [];
for (const chapter of ocp.chapters) {
  for (const id of chapter.objectiveIds)
    if (!known.has(id))
      failures.push(`Chapter ${chapter.id} has unknown objective ${id}`);
  for (const question of chapter.questions || []) {
    if (ids.has(question.id))
      failures.push(`Duplicate question id: ${question.id}`);
    ids.add(question.id);
    if (
      !Array.isArray(question.answer) ||
      question.answer.some(
        (x) => !Number.isInteger(x) || x < 0 || x >= question.options.length,
      )
    )
      failures.push(`${question.id}: answer index out of range`);
    if (question.type === "single" && question.answer.length !== 1)
      failures.push(`${question.id}: single question needs one answer`);
    if (question.type === "multi" && question.answer.length < 2)
      failures.push(
        `${question.id}: multi question needs at least two answers`,
      );
    for (const id of question.objectiveIds || [])
      if (!known.has(id))
        failures.push(`${question.id} has unknown objective ${id}`);
    if (question.verify)
      checks.push({ id: question.id, verify: question.verify });
  }
  for (const [index, trap] of (chapter.traps || []).entries())
    if (trap.verify)
      checks.push({
        id: `ch${String(chapter.id).padStart(2, "0")}-trap-${index + 1}`,
        verify: trap.verify,
      });
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
try {
  execFileSync("javac", ["-version"], { stdio: "pipe" });
} catch {
  console.error(
    "javac is missing. Install JDK 17 and ensure javac is on PATH.",
  );
  process.exit(2);
}
const rows = await mapConcurrent(checks, 4, verify);
console.log("Snippet validation");
console.log("------------------");
console.log("ID".padEnd(18) + "EXPECTED".padEnd(18) + "RESULT");
for (const row of rows)
  console.log(row.id.padEnd(18) + row.expected.padEnd(18) + row.result);
console.log(
  `Schema OK · ${ocp.chapters.length} chapter(s) · ${ids.size} question(s) · ${rows.length} snippet(s)`,
);
if (rows.some((row) => row.result.startsWith("FAIL"))) process.exitCode = 1;

async function verify(question) {
  const verifySpec = question.verify;
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "ocp17-"));
  for (const [name, source] of Object.entries(verifySpec.files || {}))
    fs.writeFileSync(path.join(temp, name), source);
  const compile = await runProcess(
    "javac",
    Object.keys(verifySpec.files || {}),
    temp,
  );
  const expected =
    typeof verifySpec.expect === "string"
      ? verifySpec.expect
      : JSON.stringify(verifySpec.expect);
  if (verifySpec.expect === "compile-error") {
    const ok = compile.status !== 0;
    return {
      id: question.id,
      expected: "compile-error",
      result: ok ? "PASS" : "FAIL",
    };
  }
  if (compile.status !== 0)
    return {
      id: question.id,
      expected,
      result: `FAIL (javac: ${(compile.stderr || "").trim().split("\n")[0]})`,
    };
  const mainClass = findMainClass(verifySpec.files || {});
  if (!mainClass)
    return {
      id: question.id,
      expected,
      result: "FAIL (no public static void main class)",
    };
  const run = await runProcess("java", [mainClass], temp);
  if (verifySpec.expect === "runtime-exception") {
    const ok = run.status !== 0 && /Exception|Error/.test(run.stderr || "");
    return {
      id: question.id,
      expected: "runtime-exception",
      result: ok ? "PASS" : "FAIL",
    };
  }
  const actual = (run.stdout || "").replace(/\n+$/, "");
  const target = verifySpec.expect.output.replace(/\n+$/, "");
  return {
    id: question.id,
    expected: `output ${JSON.stringify(target)}`,
    result:
      actual === target && run.status === 0
        ? "PASS"
        : `FAIL (got ${JSON.stringify(actual)})`,
  };
}

function findMainClass(files) {
  for (const [filename, source] of Object.entries(files)) {
    if (!/\bpublic\s+static\s+void\s+main\s*\(/.test(source)) continue;
    const declared = source.match(
      /\b(?:public\s+)?(?:final\s+)?class\s+([A-Za-z_$][\w$]*)\b/,
    );
    if (declared) return declared[1];
    return path.basename(filename, ".java");
  }
  return null;
}

function runProcess(command, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, encoding: "utf8" });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (status) => resolve({ status, stdout, stderr }));
  });
}

async function mapConcurrent(items, limit, worker) {
  const output = new Array(items.length);
  let next = 0;
  async function consume() {
    while (next < items.length) {
      const index = next++;
      output[index] = await worker(items[index]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, consume),
  );
  return output;
}
