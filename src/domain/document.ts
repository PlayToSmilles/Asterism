// Portable subset of ProseMirror JSON. No React or editor-library types here.
export interface DocumentNode {
  type:
    | "doc"
    | "paragraph"
    | "heading"
    | "bulletList"
    | "orderedList"
    | "listItem"
    | "text"
    | "hardBreak";
  content?: DocumentNode[];
  text?: string;
  attrs?: { level?: number; start?: number };
  marks?: { type: "bold" | "italic" }[];
}
export interface DocumentContent {
  type: "doc";
  content: DocumentNode[];
}
export const MAX_DOCUMENT_CHARACTERS = 200_000;
export const emptyDocument = (): DocumentContent => ({
  type: "doc",
  content: [{ type: "paragraph" }],
});

export function validateDocument(value: unknown): DocumentContent {
  let nodes = 0;
  let characters = 0;
  const fail = (): never => {
    throw new Error(
      "Conteúdo do Documento incompatível ou acima do limite (200 mil caracteres, 10 mil blocos/nós, 12 níveis).",
    );
  };
  function visit(input: unknown, parent: string, depth: number): DocumentNode {
    if (
      ++nodes > 10_000 ||
      depth > 12 ||
      typeof input !== "object" ||
      input === null ||
      Array.isArray(input)
    )
      return fail();
    const n = input as Record<string, unknown>;
    const allowed: Record<string, string[]> = {
      root: ["doc"],
      doc: ["paragraph", "heading", "bulletList", "orderedList"],
      paragraph: ["text", "hardBreak"],
      heading: ["text", "hardBreak"],
      bulletList: ["listItem"],
      orderedList: ["listItem"],
      listItem: ["paragraph", "bulletList", "orderedList"],
    };
    if (typeof n.type !== "string" || !allowed[parent]?.includes(n.type))
      return fail();
    const out: DocumentNode = { type: n.type as DocumentNode["type"] };
    if (n.type === "text") {
      if (
        typeof n.text !== "string" ||
        !n.text.length ||
        (characters += n.text.length) > MAX_DOCUMENT_CHARACTERS ||
        n.content !== undefined ||
        n.attrs !== undefined
      )
        return fail();
      out.text = n.text;
      if (n.marks !== undefined) {
        if (!Array.isArray(n.marks) || n.marks.length > 2) return fail();
        const marks = new Set<string>();
        out.marks = n.marks.map((mark: unknown) => {
          if (
            typeof mark !== "object" ||
            mark === null ||
            !("type" in mark) ||
            (mark.type !== "bold" && mark.type !== "italic") ||
            marks.has(mark.type)
          )
            return fail();
          marks.add(mark.type);
          return { type: mark.type };
        });
      }
    } else {
      if (n.text !== undefined || n.marks !== undefined) return fail();
      if (n.type === "hardBreak") {
        if (n.content !== undefined || n.attrs !== undefined) return fail();
      } else {
        if (n.content !== undefined && !Array.isArray(n.content)) return fail();
        const children = (n.content ?? []) as unknown[];
        if (
          ["doc", "bulletList", "orderedList", "listItem"].includes(n.type) &&
          !children.length
        )
          return fail();
        if (
          n.type === "listItem" &&
          (children[0] as Record<string, unknown>)?.type !== "paragraph"
        )
          return fail();
        if (children.length)
          out.content = children.map((child) =>
            visit(child, n.type as string, depth + 1),
          );
        if (n.type === "heading" || n.type === "orderedList") {
          if (
            typeof n.attrs !== "object" ||
            n.attrs === null ||
            Array.isArray(n.attrs)
          )
            return fail();
          const attrs = n.attrs as Record<string, unknown>;
          if (n.type === "heading") {
            if (attrs.level !== 1 && attrs.level !== 2) return fail();
            out.attrs = { level: attrs.level };
          } else {
            if (
              !Number.isSafeInteger(attrs.start) ||
              (attrs.start as number) < 1 ||
              (attrs.start as number) > 1_000_000
            )
              return fail();
            out.attrs = { start: attrs.start as number };
          }
        } else if (n.attrs !== undefined) return fail();
      }
    }
    return out;
  }
  const result = visit(value, "root", 0);
  return { type: "doc", content: result.content! };
}
