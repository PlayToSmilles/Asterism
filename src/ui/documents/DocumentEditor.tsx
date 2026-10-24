// SPDX-License-Identifier: MPL-2.0
import { useState, type ReactNode } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { Plugin } from "@tiptap/pm/state";
import { validateDocument } from "../../domain/document";
import { updateEntity, type Entity, type Project } from "../../domain/model";
import { documentExtensions } from "./editorConfig";

export default function DocumentEditor({
  entity,
  change,
  close,
  saveStatus,
  save,
  searchAction,
  backLabel = "← Voltar ao canvas",
}: {
  entity: Entity;
  change: (
    operation: (project: Project) => Project,
    deferred?: boolean,
  ) => void;
  close: () => void;
  saveStatus: string;
  save: () => void;
  backLabel?: string;
  searchAction?: ReactNode;
}) {
  const [error, setError] = useState("");
  const editor = useEditor(
    {
      extensions: documentExtensions,
      content: entity.document,
      editorProps: {
        attributes: {
          role: "textbox",
          "aria-label": "Conteúdo do documento",
          "aria-multiline": "true",
          spellcheck: "true",
        },
      },
      onCreate({ editor }) {
        editor.registerPlugin(
          new Plugin({
            filterTransaction(transaction) {
              if (!transaction.docChanged) return true;
              try {
                validateDocument(transaction.doc.toJSON());
                return true;
              } catch (cause) {
                setError(
                  cause instanceof Error
                    ? cause.message
                    : "Conteúdo incompatível. A alteração não foi aplicada.",
                );
                return false;
              }
            },
          }),
        );
      },
      onUpdate({ editor }) {
        const document = validateDocument(editor.getJSON());
        setError("");
        change((p) => updateEntity(p, entity.id, { document }), true);
      },
    },
    [entity.id],
  );
  const controls = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            h1: editor.isActive("heading", { level: 1 }),
            h2: editor.isActive("heading", { level: 2 }),
            bullet: editor.isActive("bulletList"),
            ordered: editor.isActive("orderedList"),
            undo: editor.can().undo(),
            redo: editor.can().redo(),
          }
        : null,
  });
  return (
    <section className="document-workspace" aria-label="Editor de documento">
      <header className="document-header">
        <button onClick={close}>{backLabel}</button>
        <span className="eyebrow">Documento</span>
        {searchAction}
        <span
          className={`document-save ${saveStatus.startsWith("Falha") ? "save-error" : ""}`}
          role="status"
        >
          {saveStatus}
        </span>
        <button type="button" className="primary document-save-button" onClick={save}>
          Salvar
        </button>
      </header>
      <div
        className="document-tools"
        role="group"
        aria-label="Formatação do documento"
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) e.preventDefault();
        }}
      >
        <button
          disabled={!editor}
          aria-pressed={controls?.h1 ?? false}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          Título
        </button>
        <button
          disabled={!editor}
          aria-pressed={controls?.h2 ?? false}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          Subtítulo
        </button>
        <button
          disabled={!editor}
          aria-pressed={controls?.bold ?? false}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <strong>Negrito</strong>
        </button>
        <button
          disabled={!editor}
          aria-pressed={controls?.italic ?? false}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <em>Itálico</em>
        </button>
        <button
          disabled={!editor}
          aria-pressed={controls?.bullet ?? false}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          Lista
        </button>
        <button
          disabled={!editor}
          aria-pressed={controls?.ordered ?? false}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          Lista numerada
        </button>
        <button
          disabled={!controls?.undo}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          Desfazer
        </button>
        <button
          disabled={!controls?.redo}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          Refazer
        </button>
      </div>
      {error && (
        <p className="field-error document-error" role="alert">
          {error} O conteúdo anterior foi preservado; reduza o texto colado.
        </p>
      )}
      <div className="document-scroll">
        <div className="document-page">
          <label className="sr-only" htmlFor="document-title">
            Título do documento
          </label>
          <input
            id="document-title"
            className="document-title"
            defaultValue={entity.title}
            maxLength={120}
            onChange={(e) => {
              const title = e.target.value.trim() || "Sem título";
              change((p) => updateEntity(p, entity.id, { title }), true);
            }}
            onBlur={(e) => {
              e.target.value = entity.title;
            }}
          />
          <p className="document-caption">
            Escreva sua lore. As conexões continuam no canvas.
          </p>
          <EditorContent editor={editor} />
        </div>
      </div>
    </section>
  );
}
