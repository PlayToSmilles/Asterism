// SPDX-License-Identifier: MPL-2.0
// User-supplied pixel art, shared by every brand placement.
export function AsterismMark() {
  return (
    <img
      className="asterism-mark"
      src={`${import.meta.env.BASE_URL}icons/tree-logo.png`}
      alt=""
      aria-hidden="true"
      draggable={false}
      width={22}
      height={29}
    />
  );
}
