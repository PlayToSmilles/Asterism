// SPDX-License-Identifier: MPL-2.0
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";
import { parseRoadmap, renderSummary, syncRoadmap } from "./roadmap.mjs";

const fixture = `# Plano
- [x] Não conta fora dos marcos.
<!-- roadmap:summary:start -->
- [x] Resumo antigo não conta.
<!-- roadmap:summary:end -->
## v0.1.0 Beta — Fundação
- [X] Concluída.
## v0.2.0 — Faísca
- [x] Verificada.
- [ ] Pendente.
\`\`\`md
- [x] Exemplo que não conta.
## v9.0.0 — Exemplo
\`\`\`
Nota manual que deve permanecer.
## v1.0.0 — Estúdio
- [ ] Aprovação.
## Ideias futuras
- [ ] Não conta.
`;

test("interpreta checkboxes, versões e estados sem contar resumo, exemplos ou ideias", () => {
  const milestones = parseRoadmap(fixture);
  assert.deepEqual(milestones.map(m => [m.version, m.done, m.total, m.percent, m.state]), [
    ["v0.1.0", 1, 1, 100, "concluída"], ["v0.2.0", 1, 2, 50, "em andamento"], ["v1.0.0", 0, 1, 0, "planejada"],
  ]);
  const summary = renderSummary(milestones);
  assert.match(summary, /2\/4 tarefas \(50%\)/);
  assert.match(summary, /atual \/ próxima a iniciar:\*\* v0\.2\.0/);
});

test("sincroniza somente o bloco gerado e é idempotente, inclusive em CRLF", () => {
  for (const source of [fixture, fixture.replaceAll("\n", "\r\n")]) {
    const result = syncRoadmap(source);
    const strip = text => text.replace(/(<!-- roadmap:summary:start -->)[\s\S]*?(<!-- roadmap:summary:end -->)/, "$1$2");
    assert.equal(strip(result), strip(source));
    assert.equal(syncRoadmap(result), result);
    if (source.includes("\r\n")) assert.equal(result.replaceAll("\r\n", "").includes("\n"), false);
  }
});

test("progresso parcial nunca arredonda para conclusão e todos concluídos encerram o plano", () => {
  const summary = renderSummary([{ version: "v1.0.0", name: "Estúdio", qualifier: "", done: 199, total: 200,
    percent: 99, state: "em andamento" }]);
  assert.match(summary, /99%/);
  assert.doesNotMatch(summary, /100%/);
  assert.match(renderSummary(parseRoadmap(fixture.replaceAll("[ ]", "[x]"))), /todos os marcos concluídos/);
});

test("rejeita marcadores ausentes, duplicados ou invertidos sem gerar saída destrutiva", () => {
  assert.throws(() => syncRoadmap(fixture.replace("<!-- roadmap:summary:start -->", "")), /marcadores/);
  assert.throws(() => syncRoadmap(fixture + "<!-- roadmap:summary:end -->"), /marcadores/);
  assert.throws(() => syncRoadmap("<!-- roadmap:summary:end --><!-- roadmap:summary:start -->"), /marcadores/);
});

test("rejeita marcos duplicados, sem tarefas, sem destino 1.0 ou checkboxes inválidos", () => {
  assert.throws(() => parseRoadmap(fixture.replace("v0.2.0 — Faísca", "v0.1.0 — Duplicada")), /duplicada/);
  assert.throws(() => parseRoadmap(fixture.replace("- [ ] Aprovação.", "Sem tarefas.")), /tarefas/);
  assert.throws(() => parseRoadmap(fixture.replace("v1.0.0 — Estúdio", "v0.9.0 — Estúdio")), /último marco/);
  assert.throws(() => parseRoadmap(fixture.replace("[ ] Aprovação", "[y] Aprovação")), /inválido/);
});

test("roadmap real contém os oito marcos, resumo sincronizado e links locais existentes", () => {
  const url = new URL("../docs/ROADMAP.md", import.meta.url);
  const source = readFileSync(url, "utf8");
  assert.deepEqual(parseRoadmap(source).map(m => m.version),
    ["v0.1.0", "v0.2.0", "v0.3.0", "v0.4.0", "v0.5.0", "v0.6.0", "v0.9.0", "v1.0.0"]);
  assert.equal(syncRoadmap(source), source);
  for (const match of source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    if (/^(https?:|#)/.test(match[1])) continue;
    assert.ok(existsSync(new URL(match[1].split("#")[0], url)), `Link inexistente: ${match[1]}`);
  }
  for (const path of ["../README.md", "../AGENTS.md", "../docs/PROJECT_STATUS.md"]) {
    assert.match(readFileSync(new URL(path, import.meta.url), "utf8"), /ROADMAP\.md/);
  }
});

test("CLI status não escreve no roadmap; comando inválido falha claramente", () => {
  const path = new URL("../docs/ROADMAP.md", import.meta.url);
  const before = readFileSync(path, "utf8");
  const script = fileURLToPath(new URL("./roadmap.mjs", import.meta.url));
  const status = spawnSync(process.execPath, [script, "status"], { encoding: "utf8" });
  assert.equal(status.status, 0);
  assert.match(status.stdout, /A Primeira Faísca/);
  assert.equal(readFileSync(path, "utf8"), before);
  const invalid = spawnSync(process.execPath, [script, "invalid"], { encoding: "utf8" });
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /Use:/);
});
