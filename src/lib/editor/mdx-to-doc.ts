import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import remarkMath from "remark-math";
import type {
  Root,
  RootContent,
  PhrasingContent,
  BlockContent,
  DefinitionContent,
  ListItem,
} from "mdast";
import type {
  MdxJsxFlowElement,
  MdxJsxTextElement,
  MdxJsxAttribute,
  MdxJsxExpressionAttribute,
} from "mdast-util-mdx-jsx";
import { NODE, MARK, type DocMark, type DocNode } from "./doc-types";

/**
 * Parses MDX (the subset used by this blog) into a Tiptap-compatible JSON
 * document. Anything the visual editor can't represent is preserved verbatim
 * as a `rawMdx` block, so unknown constructs round-trip untouched.
 */
export interface MdxParseResult {
  doc: DocNode;
  /** Set when the source could not be parsed and the doc is one raw block. */
  parseError: string | null;
}

/**
 * Like {@link mdxToDoc}, but never throws: unparseable MDX becomes a single
 * rawMdx block so the editor still opens (and the source tab still works).
 */
export function mdxToDocSafe(source: string): MdxParseResult {
  try {
    return { doc: mdxToDoc(source), parseError: null };
  } catch (err) {
    return {
      doc: {
        type: NODE.doc,
        content: [{ type: NODE.rawMdx, attrs: { source } }],
      },
      parseError: err instanceof Error ? err.message : String(err),
    };
  }
}

export function mdxToDoc(source: string): DocNode {
  // remark-math mirrors the site's render pipeline: without it, KaTeX
  // braces inside $...$ would be parsed (and rejected) as JS expressions.
  const tree = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkMdx)
    .parse(source) as Root;

  const content: DocNode[] = [];
  for (const child of tree.children) {
    content.push(...blockToNodes(child, source));
  }

  if (content.length === 0) {
    content.push({ type: NODE.paragraph });
  }

  return { type: NODE.doc, content };
}

type MdastBlock = RootContent;

function blockToNodes(node: MdastBlock, source: string): DocNode[] {
  switch (node.type) {
    case "paragraph": {
      // A paragraph that is exactly one known component written on a single
      // line (e.g. `<Caption>text</Caption>`) parses as inline JSX — promote
      // it to the corresponding block node.
      if (
        node.children.length === 1 &&
        node.children[0]!.type === "mdxJsxTextElement"
      ) {
        const promoted = jsxTextElementToBlock(node.children[0]!, source);
        if (promoted) return [promoted];
      }
      const inline = inlineToNodes(node.children, [], source);
      return [{ type: NODE.paragraph, content: inline }];
    }
    case "heading": {
      return [
        {
          type: NODE.heading,
          attrs: { level: node.depth },
          content: inlineToNodes(node.children, [], source),
        },
      ];
    }
    case "code": {
      return [
        {
          type: NODE.codeBlock,
          attrs: { language: node.lang ?? null },
          content: node.value ? [{ type: NODE.text, text: node.value }] : [],
        },
      ];
    }
    case "blockquote": {
      return [
        {
          type: NODE.blockquote,
          content: childBlocks(node.children, source),
        },
      ];
    }
    case "list": {
      return [
        {
          type: node.ordered ? NODE.orderedList : NODE.bulletList,
          ...(node.ordered ? { attrs: { start: node.start ?? 1 } } : {}),
          content: node.children.map((item) => listItemToNode(item, source)),
        },
      ];
    }
    case "thematicBreak": {
      return [{ type: NODE.horizontalRule }];
    }
    case "mdxJsxFlowElement": {
      return [jsxFlowToNode(node, source)];
    }
    case "mdxFlowExpression":
    case "mdxjsEsm": {
      return [rawBlock(node, source)];
    }
    default: {
      // html / definitions / gfm nodes we don't support — preserve verbatim
      return [rawBlock(node, source)];
    }
  }
}

function childBlocks(
  children: (BlockContent | DefinitionContent)[],
  source: string,
): DocNode[] {
  const out: DocNode[] = [];
  for (const child of children) {
    out.push(...blockToNodes(child, source));
  }
  return out;
}

function listItemToNode(item: ListItem, source: string): DocNode {
  const content = childBlocks(item.children, source);
  return {
    type: NODE.listItem,
    content: content.length > 0 ? content : [{ type: NODE.paragraph }],
  };
}

// ---------------------------------------------------------------------------
// Inline content
// ---------------------------------------------------------------------------

function inlineToNodes(
  children: PhrasingContent[],
  marks: DocMark[],
  source: string,
): DocNode[] {
  const out: DocNode[] = [];

  for (const child of children) {
    switch (child.type) {
      case "text": {
        // Soft line breaks are semantically spaces — normalize them so
        // ProseMirror text nodes never contain newlines.
        const value = child.value.replace(/[ \t]*\n[ \t]*/g, " ");
        if (value) out.push(textNode(value, marks));
        break;
      }
      case "strong": {
        out.push(
          ...inlineToNodes(
            child.children,
            addMark(marks, { type: MARK.bold }),
            source,
          ),
        );
        break;
      }
      case "emphasis": {
        out.push(
          ...inlineToNodes(
            child.children,
            addMark(marks, { type: MARK.italic }),
            source,
          ),
        );
        break;
      }
      case "inlineCode": {
        out.push(textNode(child.value, addMark(marks, { type: MARK.code })));
        break;
      }
      case "link": {
        out.push(
          ...inlineToNodes(
            child.children,
            addMark(marks, { type: MARK.link, attrs: { href: child.url } }),
            source,
          ),
        );
        break;
      }
      case "break": {
        out.push({ type: NODE.hardBreak });
        break;
      }
      case "image": {
        // Markdown image in inline position — represented as text fallback,
        // the flow-level <Image /> component is the supported path.
        out.push(textNode(sliceOf(child, source), marks));
        break;
      }
      case "mdxJsxTextElement": {
        const converted = jsxTextToNodes(child, marks, source);
        out.push(...converted);
        break;
      }
      case "mdxTextExpression": {
        out.push(rawInline(child, source, marks));
        break;
      }
      default: {
        if ((child as { type: string }).type === "inlineMath") {
          // KaTeX source — must survive serialization unescaped
          out.push(rawInline(child, source, marks));
        } else {
          out.push(textNode(sliceOf(child, source), marks));
        }
        break;
      }
    }
  }

  return out;
}

const MARK_ORDER: string[] = [MARK.link, MARK.bold, MARK.italic, MARK.code];

function textNode(text: string, marks: DocMark[]): DocNode {
  // Canonical mark order so `_**x**_` and `**_x_**` produce identical docs
  const sorted = [...marks].sort(
    (a, b) => MARK_ORDER.indexOf(a.type) - MARK_ORDER.indexOf(b.type),
  );
  return {
    type: NODE.text,
    text,
    ...(sorted.length > 0 ? { marks: sorted } : {}),
  };
}

function rawInline(
  node: Positioned,
  source: string,
  marks: DocMark[],
): DocNode {
  return {
    type: NODE.rawInline,
    attrs: { source: sliceOf(node, source) },
    ...(marks.length > 0 ? { marks } : {}),
  };
}

function addMark(marks: DocMark[], mark: DocMark): DocMark[] {
  if (marks.some((m) => m.type === mark.type)) return marks;
  return [...marks, mark];
}

// ---------------------------------------------------------------------------
// JSX components
// ---------------------------------------------------------------------------

type JsxAttr = MdxJsxAttribute | MdxJsxExpressionAttribute;

function jsxFlowToNode(node: MdxJsxFlowElement, source: string): DocNode {
  try {
    switch (node.name) {
      case "Image":
        return imageToNode(node.attributes);
      case "Table":
        return tableToNode(node.attributes);
      case "Callout":
        return calloutToNode(node, source);
      case "Caption":
        return captionToNode(node, source);
      case "YouTube":
        return youtubeToNode(node.attributes);
      case "StaticTweet":
        return tweetToNode(node.attributes);
      case "ImageGrid":
        return imageGridToNode(node.attributes);
      default:
        return rawBlock(node, source);
    }
  } catch {
    // Attribute shapes we can't understand — keep the source intact.
    return rawBlock(node, source);
  }
}

function jsxTextToNodes(
  node: MdxJsxTextElement,
  marks: DocMark[],
  source: string,
): DocNode[] {
  // Inline JSX mixed with other content — preserve verbatim (unescaped).
  return [rawInline(node, source, marks)];
}

/**
 * Converts a lone inline JSX element (whole-paragraph) into the block node it
 * was meant to be, or null if the component isn't one the editor understands.
 */
function jsxTextElementToBlock(
  node: MdxJsxTextElement,
  source: string,
): DocNode | null {
  try {
    switch (node.name) {
      case "Image":
        return imageToNode(node.attributes);
      case "Table":
        return tableToNode(node.attributes);
      case "YouTube":
        return youtubeToNode(node.attributes);
      case "StaticTweet":
        return tweetToNode(node.attributes);
      case "ImageGrid":
        return imageGridToNode(node.attributes);
      case "Caption":
        return {
          type: NODE.caption,
          content: inlineToNodes(node.children, [], source),
        };
      case "Callout": {
        const attrs = attrMap(node.attributes);
        return {
          type: NODE.callout,
          attrs: {
            emoji: typeof attrs.emoji === "string" ? attrs.emoji : "💡",
          },
          content: [
            {
              type: NODE.paragraph,
              content: inlineToNodes(node.children, [], source),
            },
          ],
        };
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

function imageToNode(attributes: JsxAttr[]): DocNode {
  const attrs = attrMap(attributes);
  const src = expectString(attrs.src, "src");
  return {
    type: NODE.mdxImage,
    attrs: {
      src,
      alt: typeof attrs.alt === "string" ? attrs.alt : "",
      width: expectNumberOrNull(attrs.width),
      height: expectNumberOrNull(attrs.height),
    },
  };
}

function tableToNode(attributes: JsxAttr[]): DocNode {
  const attrs = attrMap(attributes);
  const data = attrs.data as { headers?: unknown; rows?: unknown } | undefined;
  const headers = data?.headers;
  const rows = data?.rows;
  if (!isStringArray(headers) || !isStringMatrix(rows)) {
    throw new Error("Unsupported Table data shape");
  }

  const headerRow: DocNode = {
    type: NODE.tableRow,
    content: headers.map((h) => tableCellNode(NODE.tableHeader, h)),
  };
  const bodyRows: DocNode[] = rows.map((row) => ({
    type: NODE.tableRow,
    // Pad short rows so the table stays rectangular
    content: headers.map((_, i) => tableCellNode(NODE.tableCell, row[i] ?? "")),
  }));

  return { type: NODE.table, content: [headerRow, ...bodyRows] };
}

function tableCellNode(type: string, text: string): DocNode {
  return {
    type,
    content: [
      {
        type: NODE.paragraph,
        content: text ? [{ type: NODE.text, text }] : [],
      },
    ],
  };
}

function calloutToNode(node: MdxJsxFlowElement, source: string): DocNode {
  const attrs = attrMap(node.attributes);
  const emoji = typeof attrs.emoji === "string" ? attrs.emoji : "💡";
  const content = childBlocks(
    node.children as (BlockContent | DefinitionContent)[],
    source,
  );
  return {
    type: NODE.callout,
    attrs: { emoji },
    content: content.length > 0 ? content : [{ type: NODE.paragraph }],
  };
}

function captionToNode(node: MdxJsxFlowElement, source: string): DocNode {
  // Caption content is inline; children arrive as paragraph block(s).
  const inline: DocNode[] = [];
  for (const child of node.children) {
    if (child.type === "paragraph") {
      if (inline.length > 0) inline.push({ type: NODE.hardBreak });
      inline.push(...inlineToNodes(child.children, [], source));
    } else {
      throw new Error("Unsupported Caption content");
    }
  }
  return { type: NODE.caption, content: inline };
}

function youtubeToNode(attributes: JsxAttr[]): DocNode {
  const attrs = attrMap(attributes);
  return {
    type: NODE.youtube,
    attrs: { videoId: expectString(attrs.videoId, "videoId") },
  };
}

function tweetToNode(attributes: JsxAttr[]): DocNode {
  const attrs = attrMap(attributes);
  return {
    type: NODE.tweet,
    attrs: { id: expectString(attrs.id, "id") },
  };
}

function imageGridToNode(attributes: JsxAttr[]): DocNode {
  const attrs = attrMap(attributes);
  const images = attrs.images;
  if (!Array.isArray(images)) throw new Error("ImageGrid images missing");
  for (const image of images) {
    if (
      typeof image !== "object" ||
      image === null ||
      typeof (image as { src?: unknown }).src !== "string"
    ) {
      throw new Error("Unsupported ImageGrid image entry");
    }
  }
  const columns = attrs.columns;
  return {
    type: NODE.imageGrid,
    attrs: {
      images,
      columns: typeof columns === "number" ? columns : 3,
    },
  };
}

// ---------------------------------------------------------------------------
// Attribute helpers
// ---------------------------------------------------------------------------

function attrMap(attributes: JsxAttr[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const attr of attributes) {
    if (attr.type !== "mdxJsxAttribute") {
      throw new Error("Spread attributes are not supported");
    }
    out[attr.name] = attrValue(attr);
  }
  return out;
}

function attrValue(attr: MdxJsxAttribute): unknown {
  if (attr.value === null || attr.value === undefined) return true;
  if (typeof attr.value === "string") return attr.value;
  // Expression attribute — evaluate literal-only estree (objects, arrays,
  // strings, numbers, booleans). Anything else throws → rawMdx fallback.
  const estree = attr.value.data?.estree;
  const statement = estree?.body[0];
  if (!statement || statement.type !== "ExpressionStatement") {
    throw new Error(`Cannot evaluate attribute ${attr.name}`);
  }
  return evalLiteral(statement.expression as unknown as EstreeNode);
}

interface EstreeNode {
  type: string;
  [key: string]: unknown;
}

function evalLiteral(node: EstreeNode): unknown {
  switch (node.type) {
    case "Literal":
      return node.value;
    case "ObjectExpression": {
      const out: Record<string, unknown> = {};
      for (const prop of node.properties as EstreeNode[]) {
        if (prop.type !== "Property" || prop.computed) {
          throw new Error("Unsupported object property");
        }
        const key = prop.key as EstreeNode;
        const name =
          key.type === "Identifier"
            ? (key.name as string)
            : key.type === "Literal"
              ? String(key.value)
              : null;
        if (name === null) throw new Error("Unsupported object key");
        out[name] = evalLiteral(prop.value as EstreeNode);
      }
      return out;
    }
    case "ArrayExpression":
      return (node.elements as (EstreeNode | null)[]).map((el) => {
        if (!el) throw new Error("Sparse arrays are not supported");
        return evalLiteral(el);
      });
    case "UnaryExpression": {
      if (node.operator !== "-") throw new Error("Unsupported unary operator");
      const value = evalLiteral(node.argument as EstreeNode);
      if (typeof value !== "number") throw new Error("Unsupported negation");
      return -value;
    }
    case "TemplateLiteral": {
      const expressions = node.expressions as EstreeNode[];
      if (expressions.length > 0) {
        throw new Error("Template interpolation is not supported");
      }
      const quasis = node.quasis as { value: { cooked?: string } }[];
      return quasis.map((q) => q.value.cooked ?? "").join("");
    }
    default:
      throw new Error(`Unsupported expression: ${node.type}`);
  }
}

function expectString(value: unknown, name: string): string {
  if (typeof value !== "string") throw new Error(`Expected string ${name}`);
  return value;
}

function expectNumberOrNull(value: unknown): number | null {
  if (value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string" && value !== "" && !Number.isNaN(+value)) {
    return +value;
  }
  throw new Error("Expected numeric attribute");
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function isStringMatrix(value: unknown): value is string[][] {
  return Array.isArray(value) && value.every(isStringArray);
}

// ---------------------------------------------------------------------------
// Raw fallback
// ---------------------------------------------------------------------------

interface Positioned {
  position?: {
    start: { offset?: number };
    end: { offset?: number };
  };
}

function sliceOf(node: Positioned, source: string): string {
  const start = node.position?.start.offset;
  const end = node.position?.end.offset;
  if (typeof start !== "number" || typeof end !== "number") return "";
  return source.slice(start, end);
}

function rawBlock(node: Positioned, source: string): DocNode {
  return {
    type: NODE.rawMdx,
    attrs: { source: sliceOf(node, source) },
  };
}
