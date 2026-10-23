// SPDX-License-Identifier: MPL-2.0
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const documents = {
  "MPL-2.0.txt": "LICENSE",
  "ASSETS_LICENSE.md": "ASSETS_LICENSE.md",
  "THIRD_PARTY_NOTICES.md": "THIRD_PARTY_NOTICES.md",
  "LICENSING.md": "docs/LICENSING.md",
  "DOCUMENTATION_LICENSE.md": "docs/DOCUMENTATION_LICENSE.md",
};

function sourceDetails() {
  let revision = null;
  let dirty = null;
  try {
    revision = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
    dirty = execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }).trim() !== "";
  } catch {
    // Archives without Git retain an explicit unknown source revision.
  }
  const repository = "https://github.com/PlayToSmilles/Asterism";
  return JSON.stringify({ repository, baseCommit: revision, dirty,
    correspondingSource: revision && dirty === false ? `${repository}/tree/${revision}` : null,
    notice: "Confirmar acesso dos destinatários ao fonte correspondente antes de distribuir. Um commit-base com alterações locais não representa este build.",
  }, null, 2);
}

export function legalAssets() {
  return {
    name: "asterism-legal-notices",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const name = request.url?.split("?")[0]?.split("/legal/")[1];
        if (name === "SOURCE.json") {
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.end(sourceDetails());
        } else if (name && Object.hasOwn(documents, name)) {
          response.setHeader("Content-Type", "text/plain; charset=utf-8");
          response.end(readFileSync(new URL(`../${documents[name]}`, import.meta.url)));
        } else next();
      });
    },
    generateBundle() {
      for (const [name, path] of Object.entries(documents)) {
        this.emitFile({ type: "asset", fileName: `legal/${name}`, source: readFileSync(new URL(`../${path}`, import.meta.url)) });
      }
      this.emitFile({ type: "asset", fileName: "legal/SOURCE.json", source: sourceDetails() });
    },
  };
}
