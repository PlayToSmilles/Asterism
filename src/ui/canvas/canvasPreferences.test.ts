import { describe, expect, it } from "vitest";
import { readDynamicPreference, writeDynamicPreference } from "./canvasPreferences";

describe("preferência de física do canvas", () => {
  it("começa habilitada, aceita apenas false para desativar e preserva a escolha", () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
    expect(readDynamicPreference(storage)).toBe(true);
    expect(writeDynamicPreference(storage, false)).toBe(true);
    expect(readDynamicPreference(storage)).toBe(false);
    writeDynamicPreference(storage, true);
    expect(readDynamicPreference(storage)).toBe(true);
    expect(readDynamicPreference({ getItem: () => "invalid" })).toBe(true);
  });
  it("tolera armazenamento indisponível sem bloquear a sessão", () => {
    expect(readDynamicPreference({ getItem: () => { throw Error("blocked"); } })).toBe(true);
    expect(writeDynamicPreference({ setItem: () => { throw Error("quota"); } }, false)).toBe(false);
  });
});
