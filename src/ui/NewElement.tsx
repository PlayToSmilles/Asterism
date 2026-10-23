// SPDX-License-Identifier: MPL-2.0
import { useEffect, useRef } from "react";
import { categories, type Category } from "../domain/model";
export function NewElement({
  create,
  close,
}: {
  create: (category: Category, title: string) => void;
  close: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="creation-dialog"
      aria-labelledby="create-element-heading"
      onCancel={close}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const values = new FormData(event.currentTarget);
          create(
            values.get("category") as Category,
            String(values.get("title")),
          );
        }}
      >
        <h2 id="create-element-heading">Novo elemento</h2>
        <label>
          Categoria
          <select name="category" defaultValue="Ideia">
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label>
          Título
          <input
            name="title"
            autoFocus
            maxLength={120}
            placeholder="Dê um nome à sua ideia"
          />
        </label>
        <div className="button-row">
          <button type="button" onClick={close}>
            Cancelar
          </button>
          <button type="submit" className="primary">
            Criar elemento
          </button>
        </div>
      </form>
    </dialog>
  );
}
