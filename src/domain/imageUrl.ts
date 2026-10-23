// SPDX-License-Identifier: MPL-2.0
export const MAX_IMAGE_URL_LENGTH = 2048;

export function isValidImageUrl(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    value.length > MAX_IMAGE_URL_LENGTH ||
    value !== value.trim() ||
    !/^https?:\/\//i.test(value) ||
    /\s/.test(value)
  )
    return false;
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") && !!url.hostname
    );
  } catch {
    return false;
  }
}
