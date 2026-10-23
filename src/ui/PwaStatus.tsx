// SPDX-License-Identifier: MPL-2.0
import { useEffect, useState } from "react";
import { registerPwa, type PwaState } from "../pwa/register";
export function PwaStatus() {
  const [state, setState] = useState<PwaState | null>(null);
  useEffect(() => {
    if (import.meta.env.PROD && "serviceWorker" in navigator)
      return registerPwa(
        navigator.serviceWorker,
        setState,
        import.meta.env.BASE_URL,
      );
  }, []);
  if (!state) return null;
  return (
    <div className={`pwa-status pwa-${state}`} role="status">
      {state === "ready"
        ? "Aplicação disponível offline neste navegador."
        : state === "update"
          ? "Nova versão pronta. Após salvar, feche todas as abas e janelas da aplicação e abra novamente para atualizar."
          : "Não foi possível preparar o uso offline. Verifique a conexão e tente reabrir a aplicação."}
    </div>
  );
}
