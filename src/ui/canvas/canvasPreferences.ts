// SPDX-License-Identifier: MPL-2.0
const key = "asterism.canvas.dynamic";

// A browser preference, deliberately excluded from universe JSON/backups.
export function readDynamicPreference(storage?: Pick<Storage, "getItem">): boolean {
  try { return (storage ?? window.localStorage).getItem(key) !== "false"; }
  catch { return true; }
}

export function writeDynamicPreference(storage: Pick<Storage, "setItem"> | undefined, enabled: boolean): boolean {
  try { (storage ?? window.localStorage).setItem(key, String(enabled)); return true; }
  catch { return false; }
}
