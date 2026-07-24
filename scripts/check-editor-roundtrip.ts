// Validates that every post in the database survives the WYSIWYG editor:
// MDX parses to editor JSON conforming to the actual Tiptap schema, and the
// schema-normalized doc serializes back to MDX that compiles and re-parses
// to an identical document. Run with: bun run scripts/check-editor-roundtrip.ts
import postgres from "postgres";
import { getSchema } from "@tiptap/core";
import { Node as PMNode } from "@tiptap/pm/model";
import { compile } from "@mdx-js/mdx";
import remarkMath from "remark-math";
import { buildExtensions } from "../src/components/admin/editor/extensions";
import { mdxToDoc } from "../src/lib/editor/mdx-to-doc";
import { docToMdx } from "../src/lib/editor/doc-to-mdx";
import type { DocNode } from "../src/lib/editor/doc-types";

const schema = getSchema(buildExtensions(() => undefined));

const sql = postgres(process.env.DATABASE_URL!);
const rows = await sql`select slug, content from portfolio_post order by slug`;
await sql.end();

let failures = 0;

for (const row of rows) {
  const slug = row.slug as string;
  try {
    const doc = mdxToDoc(row.content as string);
    const pmDoc = PMNode.fromJSON(schema, doc);
    pmDoc.check(); // throws on invalid content/marks

    // Schema-normalized JSON (what the editor would emit) must serialize
    // back to valid MDX too.
    const normalized = pmDoc.toJSON() as DocNode;
    const mdx = docToMdx(normalized);
    await compile(mdx, {
      outputFormat: "function-body",
      remarkPlugins: [remarkMath],
    });

    // And re-parsing that MDX must produce a stable document.
    const doc2 = mdxToDoc(mdx);
    const doc2Normalized = PMNode.fromJSON(schema, doc2).toJSON() as DocNode;
    if (JSON.stringify(normalized) !== JSON.stringify(doc2Normalized)) {
      throw new Error("round-trip is not stable");
    }

    console.log(`OK    ${slug}`);
  } catch (err) {
    failures++;
    console.log(`FAIL  ${slug}: ${(err as Error).message}`);
  }
}

process.exit(failures > 0 ? 1 : 0);
