import {
  NODE,
  MARK,
  type DocMark,
  type DocNode,
  type ImageGridImage,
} from "./doc-types";

/**
 * Serializes a Tiptap JSON document back to MDX in the house style used by
 * existing posts (custom <Table>/<Image>/<Callout>/... components).
 */
export function docToMdx(doc: DocNode): string {
  return serializeBlocks(doc.content ?? []);
}

function serializeBlocks(nodes: DocNode[]): string {
  return nodes
    .map((node) => serializeBlock(node))
    .filter((s) => s !== "")
    .join("\n\n");
}

function serializeBlock(node: DocNode): string {
  switch (node.type) {
    case NODE.paragraph: {
      const inline = serializeInline(node.content ?? [], new Set());
      return inline.trim() === "" && !inline.includes("\\")
        ? ""
        : escapeLineStarts(inline);
    }
    case NODE.heading: {
      const level = Number(node.attrs?.level ?? 1);
      const inline = serializeInline(node.content ?? [], new Set());
      return inline.trim() === "" ? "" : `${"#".repeat(level)} ${inline}`;
    }
    case NODE.codeBlock: {
      const code = plainText(node);
      const language = (node.attrs?.language as string | null) ?? "";
      const longestFence = /`{3,}/.exec(code)?.[0].length ?? 0;
      const fence = "`".repeat(Math.max(3, longestFence + 1));
      return `${fence}${language}\n${code}\n${fence}`;
    }
    case NODE.blockquote: {
      return serializeBlocks(node.content ?? [])
        .split("\n")
        .map((line) => (line === "" ? ">" : `> ${line}`))
        .join("\n");
    }
    case NODE.bulletList:
      return serializeList(node, false);
    case NODE.orderedList:
      return serializeList(node, true);
    case NODE.horizontalRule:
      return "---";
    case NODE.table:
      return serializeTable(node);
    case NODE.mdxImage:
      return serializeImage(node);
    case NODE.callout:
      return serializeCallout(node);
    case NODE.caption:
      return serializeCaption(node);
    case NODE.youtube:
      return `<YouTube videoId=${quoteAttr(String(node.attrs?.videoId ?? ""))} />`;
    case NODE.tweet:
      return `<StaticTweet id=${quoteAttr(String(node.attrs?.id ?? ""))} />`;
    case NODE.imageGrid:
      return serializeImageGrid(node);
    case NODE.rawMdx:
      return String(node.attrs?.source ?? "");
    default:
      return "";
  }
}

function serializeList(node: DocNode, ordered: boolean): string {
  const start = Number(node.attrs?.start ?? 1);
  const items = (node.content ?? []).map((item, index) => {
    const marker = ordered ? `${start + index}. ` : "- ";
    const indent = " ".repeat(marker.length);
    const body = serializeBlocks(item.content ?? []);
    return body
      .split("\n")
      .map((line, lineIndex) =>
        lineIndex === 0 ? marker + line : line === "" ? "" : indent + line,
      )
      .join("\n");
  });
  return items.join("\n");
}

// ---------------------------------------------------------------------------
// Custom components
// ---------------------------------------------------------------------------

function serializeTable(node: DocNode): string {
  const rows = node.content ?? [];
  const headerRow = rows.find((row) =>
    row.content?.some((cell) => cell.type === NODE.tableHeader),
  );
  const bodyRows = rows.filter((row) => row !== headerRow);

  const headers = (headerRow?.content ?? []).map((cell) =>
    plainText(cell).trim(),
  );
  const data = bodyRows.map((row) =>
    (row.content ?? []).map((cell) => plainText(cell).trim()),
  );

  const headersLine = `[${headers.map((h) => JSON.stringify(h)).join(", ")}]`;
  const rowLines = data
    .map((row) => `      [${row.map((c) => JSON.stringify(c)).join(", ")}],`)
    .join("\n");

  return [
    "<Table",
    "  data={{",
    `    headers: ${headersLine},`,
    "    rows: [",
    rowLines,
    "    ],",
    "  }}",
    "/>",
  ].join("\n");
}

function serializeImage(node: DocNode): string {
  const src = String(node.attrs?.src ?? "");
  const alt = String(node.attrs?.alt ?? "");
  const width = node.attrs?.width;
  const height = node.attrs?.height;

  if (typeof width !== "number" || typeof height !== "number") {
    return `![${alt}](${src})`;
  }

  return [
    "<Image",
    `  src=${quoteAttr(src)}`,
    `  alt=${quoteAttr(alt)}`,
    `  width={${width}}`,
    `  height={${height}}`,
    "/>",
  ].join("\n");
}

function serializeCallout(node: DocNode): string {
  const emoji = String(node.attrs?.emoji ?? "💡");
  const body = indent(serializeBlocks(node.content ?? []), 2);
  return `<Callout emoji=${quoteAttr(emoji)}>\n${body}\n</Callout>`;
}

function serializeCaption(node: DocNode): string {
  // Multi-line form: single-line `<Caption>text</Caption>` would re-parse
  // as inline JSX inside a paragraph rather than a flow element.
  const inline = serializeInline(node.content ?? [], new Set());
  return `<Caption>\n${indent(inline, 2)}\n</Caption>`;
}

function serializeImageGrid(node: DocNode): string {
  const images = (node.attrs?.images ?? []) as ImageGridImage[];
  const columns = Number(node.attrs?.columns ?? 3);
  const imageLines = images
    .map((image) => {
      const parts = [
        `src: ${JSON.stringify(image.src)}`,
        `alt: ${JSON.stringify(image.alt ?? "")}`,
      ];
      if (image.href) parts.push(`href: ${JSON.stringify(image.href)}`);
      return `    { ${parts.join(", ")} },`;
    })
    .join("\n");

  return [
    "<ImageGrid",
    "  images={[",
    imageLines,
    "  ]}",
    `  columns={${columns}}`,
    "/>",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Inline serialization
// ---------------------------------------------------------------------------

const MARK_PRIORITY: string[] = [MARK.link, MARK.bold, MARK.italic, MARK.code];

function serializeInline(nodes: DocNode[], active: Set<string>): string {
  let out = "";
  let i = 0;

  while (i < nodes.length) {
    const node = nodes[i]!;

    if (node.type === NODE.hardBreak) {
      out += "\\\n";
      i += 1;
      continue;
    }
    if (node.type === NODE.rawInline) {
      out += String(node.attrs?.source ?? "");
      i += 1;
      continue;
    }
    if (node.type !== NODE.text) {
      i += 1;
      continue;
    }

    const pending = (node.marks ?? []).filter((m) => !active.has(m.type));
    if (pending.length === 0) {
      out += escapeText(node.text ?? "");
      i += 1;
      continue;
    }

    const mark = pickMark(pending);

    if (mark.type === MARK.code) {
      // Code is innermost — emit the raw text of the consecutive code run.
      let j = i;
      let code = "";
      while (
        j < nodes.length &&
        nodes[j]!.type === NODE.text &&
        hasMark(nodes[j]!, MARK.code)
      ) {
        code += nodes[j]!.text ?? "";
        j += 1;
      }
      out += codeSpan(code);
      i = j;
      continue;
    }

    // Find the longest run of nodes sharing this mark (same href for links).
    let j = i;
    while (
      j < nodes.length &&
      (nodes[j]!.type === NODE.hardBreak ||
        (nodes[j]!.type === NODE.text && sameMark(nodes[j]!, mark)))
    ) {
      j += 1;
    }
    // Don't let a run end on a hard break
    while (j > i + 1 && nodes[j - 1]!.type === NODE.hardBreak) j -= 1;

    const inner = serializeInline(
      nodes.slice(i, j),
      new Set([...active, mark.type]),
    );

    out += wrapMark(inner, mark);
    i = j;
  }

  return out;
}

function pickMark(marks: DocMark[]): DocMark {
  for (const type of MARK_PRIORITY) {
    const found = marks.find((m) => m.type === type);
    if (found) return found;
  }
  return marks[0]!;
}

function hasMark(node: DocNode, type: string): boolean {
  return (node.marks ?? []).some((m) => m.type === type);
}

function sameMark(node: DocNode, mark: DocMark): boolean {
  const found = (node.marks ?? []).find((m) => m.type === mark.type);
  if (!found) return false;
  if (mark.type === MARK.link) {
    return found.attrs?.href === mark.attrs?.href;
  }
  return true;
}

function wrapMark(inner: string, mark: DocMark): string {
  switch (mark.type) {
    case MARK.link: {
      const href = String(mark.attrs?.href ?? "");
      const target = /[\s()<>]/.test(href) ? `<${href}>` : href;
      return `[${inner}](${target})`;
    }
    case MARK.bold:
      return wrapEmphasis(inner, "**");
    case MARK.italic:
      return wrapEmphasis(inner, "_");
    default:
      return inner;
  }
}

/** Wraps with emphasis delimiters, hoisting boundary whitespace outside. */
function wrapEmphasis(inner: string, delim: string): string {
  const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(inner)!;
  const [, lead, core, trail] = match;
  if (!core) return inner;
  return `${lead}${delim}${core}${delim}${trail}`;
}

function codeSpan(code: string): string {
  const longestRun = /`+/.exec(code)?.[0].length ?? 0;
  const ticks = "`".repeat(Math.max(1, longestRun + 1));
  const pad = code.startsWith("`") || code.endsWith("`") ? " " : "";
  return `${ticks}${pad}${code}${pad}${ticks}`;
}

// ---------------------------------------------------------------------------
// Text escaping
// ---------------------------------------------------------------------------

/** Escapes characters that would be parsed as markdown/MDX syntax. */
function escapeText(text: string): string {
  return text.replace(/([\\<>{}*_`[\]])/g, "\\$1");
}

/** Escapes block-level markers at the start of paragraph lines. */
function escapeLineStarts(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      const match = /^(\s*)(#{1,6}|>|[-+]|\d+[.)])(\s)/.exec(line);
      if (!match) return line;
      const [, lead, marker, space] = match;
      return `${lead}\\${marker}${space}${line.slice(match[0].length)}`;
    })
    .join("\n");
}

function quoteAttr(value: string): string {
  return JSON.stringify(value);
}

function indent(text: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line === "" ? "" : pad + line))
    .join("\n");
}

function plainText(node: DocNode): string {
  if (node.type === NODE.text) return node.text ?? "";
  if (node.type === NODE.hardBreak) return "\n";
  return (node.content ?? []).map(plainText).join("");
}
