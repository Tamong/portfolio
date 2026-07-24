// Minimal JSON shape of a Tiptap/ProseMirror document, shared by the
// MDX parser and serializer so neither needs to import @tiptap packages.

export interface DocMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface DocNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: DocNode[];
  marks?: DocMark[];
  text?: string;
}

export interface ImageGridImage {
  src: string;
  alt: string;
  href?: string;
}

/** Node type names used by the editor schema and both converters. */
export const NODE = {
  doc: "doc",
  paragraph: "paragraph",
  heading: "heading",
  codeBlock: "codeBlock",
  blockquote: "blockquote",
  bulletList: "bulletList",
  orderedList: "orderedList",
  listItem: "listItem",
  horizontalRule: "horizontalRule",
  hardBreak: "hardBreak",
  text: "text",
  table: "table",
  tableRow: "tableRow",
  tableHeader: "tableHeader",
  tableCell: "tableCell",
  mdxImage: "mdxImage",
  callout: "callout",
  caption: "caption",
  youtube: "youtube",
  tweet: "tweet",
  imageGrid: "imageGrid",
  rawMdx: "rawMdx",
  rawInline: "rawInline",
} as const;

export const MARK = {
  bold: "bold",
  italic: "italic",
  code: "code",
  link: "link",
} as const;
