"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { TextSelection } from "@tiptap/pm/state";
import { Bold, Check, Code, Italic, Link as LinkIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mdxToDocSafe } from "@/lib/editor/mdx-to-doc";
import { docToMdx } from "@/lib/editor/doc-to-mdx";
import type { DocNode } from "@/lib/editor/doc-types";
import { buildExtensions } from "./extensions";
import type { MdxDialogRequest } from "./dialog-bridge";
import { MdxDialogs } from "./insert-dialogs";
import { EditorToolbar } from "./toolbar";
import "./editor.css";

interface RichEditorProps {
  /** MDX source to load. The editor re-initializes when `resetKey` changes. */
  initialMdx: string;
  /** Debounced: fires with regenerated MDX after edits settle. */
  onMdxChange: (mdx: string) => void;
}

export function RichEditor({ initialMdx, onMdxChange }: RichEditorProps) {
  const [dialogRequest, setDialogRequest] = useState<MdxDialogRequest | null>(
    null,
  );
  const [parseError, setParseError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onMdxChangeRef = useRef(onMdxChange);
  onMdxChangeRef.current = onMdxChange;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: buildExtensions(setDialogRequest),
    onCreate: ({ editor: e }) => {
      const { doc, parseError: err } = mdxToDocSafe(initialMdx);
      e.commands.setContent(doc as never, { emitUpdate: false });
      setParseError(err);
    },
    onUpdate: ({ editor: e }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onMdxChangeRef.current(docToMdx(e.getJSON() as unknown as DocNode));
      }, 300);
    },
  });

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (!editor) {
    return (
      <div className="text-muted-foreground flex min-h-[600px] items-center justify-center rounded-md border">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="mdx-editor rounded-md border">
      <EditorToolbar editor={editor} />
      {parseError && (
        <div className="border-b border-amber-600/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-600">
          Couldn't fully parse this post's MDX ({parseError}) — it's loaded as a
          single raw block. The MDX tab still works normally.
        </div>
      )}
      <SelectionBubble editor={editor} />
      <EditorContent editor={editor} />
      <MdxDialogs
        request={dialogRequest}
        onClose={() => setDialogRequest(null)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bubble menu: marks + inline link editing
// ---------------------------------------------------------------------------

function SelectionBubble({ editor }: { editor: Editor }) {
  const [linkDraft, setLinkDraft] = useState<string | null>(null);

  const applyLink = useCallback(() => {
    const href = linkDraft?.trim();
    if (href) {
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    setLinkDraft(null);
  }, [editor, linkDraft]);

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ state }) => {
        if (!(state.selection instanceof TextSelection)) return false;
        if (state.selection.empty) return false;
        // Only for plain text selections — not atoms/tables cells context
        return !editor.isActive("codeBlock");
      }}
      options={{ placement: "top", offset: 6 }}
    >
      <div className="bg-popover flex items-center gap-0.5 rounded-md border p-1 shadow-md">
        {linkDraft === null ? (
          <>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive("bold") ? "secondary" : "ghost"}
              className="h-7 w-7 p-0"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive("italic") ? "secondary" : "ghost"}
              className="h-7 w-7 p-0"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive("code") ? "secondary" : "ghost"}
              className="h-7 w-7 p-0"
              onClick={() => editor.chain().focus().toggleCode().run()}
            >
              <Code className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive("link") ? "secondary" : "ghost"}
              className="h-7 w-7 p-0"
              onClick={() =>
                setLinkDraft(
                  (editor.getAttributes("link").href as string) ?? "",
                )
              }
            >
              <LinkIcon className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <>
            <Input
              value={linkDraft}
              onChange={(e) => setLinkDraft(e.target.value)}
              placeholder="https://… or /posts/…"
              className="h-7 w-56 text-xs"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") applyLink();
                if (e.key === "Escape") setLinkDraft(null);
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={applyLink}
              title="Apply link (empty removes)"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => setLinkDraft(null)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </BubbleMenu>
  );
}
