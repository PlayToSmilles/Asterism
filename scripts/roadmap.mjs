// SPDX-License-Identifier: MPL-2.0
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";
import process from "node:process";
import { log, error } from "node:console";

const startMarker = "<!-- roadmap:summary:start -->";
const endMarker = "<!-- roadmap:summary:end -->";
const roadmapPath = fileURLToPath(new URL("../docs/ROADMAP.md", import.meta.url));

function summaryBounds(markdown) {
  const start = markdown.indexOf(startMarker), end = markdown.indexOf(endMarker);
  if (start < 0 || end <= start || markdown.indexOf(startMarker, start + 1) !== -1 ||
      markdown.indexOf(endMarker, end + 1) !== -1) {
    throw new Error("O roadmap deve ter exatamente um par ordenado de marcadores de resumo.");
  }
  return { start, end };
}

export function parseRoadmap(markdown) {
  const { start, end } = summaryBounds(markdown);
  const manual = markdown.slice(0, start) + markdown.slice(end + endMarker.length);
  const milestones = [];
  let current = null, fence = null;
  for (const line of manual.split(/\r?\n/)) {
    const delimiter = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (delimiter) {
      if (!fence) fence = delimiter[1];
      else if (delimiter[1][0] === fence[0] && delimiter[1].length >= fence.length) fence = null;
      continue;
    }
    if (fence) continue;
    const heading = line.match(/^## (v\d+\.\d+\.\d+)(?: (Beta|Release Candidate))? — (.+)$/);
    if (heading) {
      if (milestones.some(m => m.version === heading[1])) throw new Error(`Versão duplicada: ${heading[1]}`);
      current = { version: heading[1], name: heading[3], qualifier: heading[2] ?? "", done: 0, total: 0 };
      milestones.push(current);
      continue;
    }
    if (/^## /.test(line)) current = null;
    if (!current) continue;
    const task = line.match(/^\s*[-*+] \[([ xX])\] (\S.*)$/);
    if (task) {
      current.total++;
      if (task[1].toLowerCase() === "x") current.done++;
    } else if (/^\s*[-*+] \[/.test(line)) {
      throw new Error(`Checkbox inválido em ${current.version}: ${line.trim()}`);
    }
  }
  if (!milestones.length || milestones.some(m => !m.total)) throw new Error("Cada marco precisa conter tarefas.");
  if (milestones.at(-1).version !== "v1.0.0") throw new Error("O último marco deve ser v1.0.0.");
  return milestones.map(m => ({ ...m, percent: Math.floor(m.done / m.total * 100),
    state: m.done === m.total ? "concluída" : m.done ? "em andamento" : "planejada" }));
}

export function renderSummary(milestones) {
  const done = milestones.reduce((sum, m) => sum + m.done, 0);
  const total = milestones.reduce((sum, m) => sum + m.total, 0);
  const current = milestones.find(m => m.done < m.total);
  const next = current ? milestones.slice(milestones.indexOf(current) + 1).map(m => m.version).join(" → ") : "nenhuma";
  const rows = milestones.map(m => {
    const filled = Math.floor(m.done / m.total * 10);
    return `| ${m.version}${m.qualifier ? ` ${m.qualifier}` : ""} — ${m.name} | ${m.state} | ${m.done}/${m.total} | ${"■".repeat(filled)}${"□".repeat(10 - filled)} ${m.percent}% |`;
  });
  return ["Resumo gerado por `npm run roadmap:sync`; edite as tarefas abaixo, não esta tabela.", "",
    "| Marco | Estado | Tarefas | Progresso |", "| --- | --- | ---: | --- |", ...rows, "",
    `**Geral até a v1.0.0:** ${done}/${total} tarefas (${Math.floor(done / total * 100)}%).`,
    "Cada checkbox tem o mesmo peso; o percentual não estima esforço, prazo ou maturidade.", "",
    `**Fase atual / próxima a iniciar:** ${current ? `${current.version} — ${current.name} (${current.state})` : "todos os marcos concluídos"}.`,
    `**Na sequência:** ${next}.`].join("\n");
}

export function syncRoadmap(markdown) {
  const milestones = parseRoadmap(markdown);
  const { start, end } = summaryBounds(markdown);
  const newline = markdown.includes("\r\n") ? "\r\n" : "\n";
  return markdown.slice(0, start + startMarker.length) + newline +
    renderSummary(milestones).replaceAll("\n", newline) + newline + markdown.slice(end);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const command = process.argv[2];
    if (!["status", "sync"].includes(command)) throw new Error("Use: node scripts/roadmap.mjs status|sync");
    const markdown = readFileSync(roadmapPath, "utf8");
    if (command === "status") log(renderSummary(parseRoadmap(markdown)));
    else {
      const updated = syncRoadmap(markdown);
      if (updated !== markdown) writeFileSync(roadmapPath, updated);
      log(updated === markdown ? "Resumo já atualizado." : "Resumo atualizado; tarefas e notas preservadas.");
    }
  } catch (cause) {
    error(cause.message);
    process.exitCode = 1;
  }
}
