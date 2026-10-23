// SPDX-License-Identifier: MPL-2.0
import StarterKit from "@tiptap/starter-kit";
export const documentExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2] },
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    link: false,
    strike: false,
    underline: false,
    trailingNode: false,
  }),
];
