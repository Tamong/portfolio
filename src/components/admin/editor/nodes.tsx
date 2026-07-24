"use client";

import React, { useEffect, useRef, useState } from "react";
import { mergeAttributes, Node } from "@tiptap/core";
import CodeBlock from "@tiptap/extension-code-block";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type ReactNodeViewProps,
} from "@tiptap/react";
import { Tweet } from "react-tweet";
import {
  ImageIcon,
  LayoutGrid,
  Pencil,
  SquareCode,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import type { ImageGridImage } from "@/lib/editor/doc-types";

// ---------------------------------------------------------------------------
// <Image src alt width height />
// ---------------------------------------------------------------------------

function ImageView({
  node,
  selected,
  editor,
  updateAttributes,
}: ReactNodeViewProps) {
  const { src, alt, width, height } = node.attrs as {
    src: string;
    alt: string;
    width: number | null;
    height: number | null;
  };

  return (
    <NodeViewWrapper
      className={`mdx-node group relative my-4 ${selected ? "mdx-node-selected" : ""}`}
      data-drag-handle
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          width={width ?? undefined}
          className="mx-auto h-auto max-w-full rounded-lg drop-shadow-2xl"
          draggable={false}
        />
      ) : (
        <div className="text-muted-foreground flex h-32 items-center justify-center rounded-lg border border-dashed">
          <ImageIcon className="mr-2 h-4 w-4" /> No image selected
        </div>
      )}
      <NodeBadge
        label={width && height ? `${width}×${height}` : "size missing!"}
        onEdit={() =>
          editor.commands.openMdxDialog({
            kind: "image",
            attrs: { src, alt, width, height },
            apply: (attrs) => updateAttributes(attrs),
          })
        }
      />
    </NodeViewWrapper>
  );
}

export const MdxImage = Node.create({
  name: "mdxImage",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: "" },
      alt: { default: "" },
      width: { default: null },
      height: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: "mdx-image" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["mdx-image", mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
});

// ---------------------------------------------------------------------------
// <Callout emoji="...">block content</Callout>
// ---------------------------------------------------------------------------

function CalloutView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const emoji = String(node.attrs.emoji ?? "💡");
  const [draft, setDraft] = useState(emoji);

  return (
    <NodeViewWrapper
      className={`mdx-node bg-primary/25 my-6 flex items-start rounded p-4 text-sm ${selected ? "mdx-node-selected" : ""}`}
    >
      <div contentEditable={false} className="mr-4 flex w-8 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="hover:bg-primary/20 rounded p-1 text-2xl"
              title="Change emoji"
            >
              {emoji}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-2" align="start">
            <div className="flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="h-8 text-center text-lg"
                maxLength={4}
              />
              <Button
                size="sm"
                className="h-8"
                onClick={() => updateAttributes({ emoji: draft || "💡" })}
              >
                Set
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <NodeViewContent className="callout-content w-full leading-relaxed" />
    </NodeViewWrapper>
  );
}

export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "paragraph+",
  defining: true,
  addAttributes() {
    return { emoji: { default: "💡" } };
  },
  parseHTML() {
    return [{ tag: "mdx-callout" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["mdx-callout", mergeAttributes(HTMLAttributes), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(CalloutView);
  },
});

// ---------------------------------------------------------------------------
// <Caption>inline content</Caption>
// ---------------------------------------------------------------------------

function CaptionView({ selected }: ReactNodeViewProps) {
  return (
    <NodeViewWrapper
      className={`mdx-node my-3 ${selected ? "mdx-node-selected" : ""}`}
    >
      <NodeViewContent className="block w-full text-center font-mono text-xs leading-normal text-gray-500" />
    </NodeViewWrapper>
  );
}

export const Caption = Node.create({
  name: "caption",
  group: "block",
  content: "inline*",
  defining: true,
  parseHTML() {
    return [{ tag: "mdx-caption" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["mdx-caption", mergeAttributes(HTMLAttributes), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(CaptionView);
  },
});

// ---------------------------------------------------------------------------
// <YouTube videoId="..." />
// ---------------------------------------------------------------------------

function YouTubeView({
  node,
  selected,
  editor,
  updateAttributes,
}: ReactNodeViewProps) {
  const videoId = String(node.attrs.videoId ?? "");
  return (
    <NodeViewWrapper
      className={`mdx-node group relative my-6 ${selected ? "mdx-node-selected" : ""}`}
      data-drag-handle
    >
      {videoId ? (
        <div className="relative h-0 w-full pb-[56.25%]">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            className="absolute top-0 left-0 h-full w-full rounded"
            allowFullScreen
            title={`YouTube video ${videoId}`}
          />
        </div>
      ) : (
        <div className="text-muted-foreground flex h-32 items-center justify-center rounded-lg border border-dashed">
          No video id
        </div>
      )}
      <NodeBadge
        label="YouTube"
        onEdit={() =>
          editor.commands.openMdxDialog({
            kind: "youtube",
            attrs: { videoId },
            apply: (attrs) => updateAttributes(attrs),
          })
        }
      />
    </NodeViewWrapper>
  );
}

export const YouTube = Node.create({
  name: "youtube",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return { videoId: { default: "" } };
  },
  parseHTML() {
    return [{ tag: "mdx-youtube" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["mdx-youtube", mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(YouTubeView);
  },
});

// ---------------------------------------------------------------------------
// <StaticTweet id="..." />
// ---------------------------------------------------------------------------

function TweetView({
  node,
  selected,
  editor,
  updateAttributes,
}: ReactNodeViewProps) {
  const id = String(node.attrs.id ?? "");
  return (
    <NodeViewWrapper
      className={`mdx-node group relative my-6 ${selected ? "mdx-node-selected" : ""}`}
      data-drag-handle
    >
      <div
        contentEditable={false}
        className="flex justify-center [&_.react-tweet-theme]:my-0"
      >
        {id ? (
          <Tweet id={id} />
        ) : (
          <div className="text-muted-foreground flex h-24 w-full items-center justify-center rounded-lg border border-dashed">
            No tweet id
          </div>
        )}
      </div>
      <NodeBadge
        label="Tweet"
        onEdit={() =>
          editor.commands.openMdxDialog({
            kind: "tweet",
            attrs: { id },
            apply: (attrs) => updateAttributes(attrs),
          })
        }
      />
    </NodeViewWrapper>
  );
}

export const StaticTweet = Node.create({
  name: "tweet",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return { id: { default: "" } };
  },
  parseHTML() {
    return [{ tag: "mdx-tweet" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["mdx-tweet", mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(TweetView);
  },
});

// ---------------------------------------------------------------------------
// <ImageGrid images={[...]} columns={n} />
// ---------------------------------------------------------------------------

function ImageGridView({
  node,
  selected,
  editor,
  updateAttributes,
}: ReactNodeViewProps) {
  const images = (node.attrs.images ?? []) as ImageGridImage[];
  const columns = Number(node.attrs.columns ?? 3);
  const gridClass = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" }[
    columns as 2 | 3 | 4
  ];

  return (
    <NodeViewWrapper
      className={`mdx-node group relative my-8 ${selected ? "mdx-node-selected" : ""}`}
      data-drag-handle
    >
      {images.length > 0 ? (
        <div className={`grid ${gridClass} gap-4`}>
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.alt}
                className="absolute inset-0 h-full w-full rounded-lg object-cover"
                draggable={false}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground flex h-32 items-center justify-center rounded-lg border border-dashed">
          <LayoutGrid className="mr-2 h-4 w-4" /> Empty image grid
        </div>
      )}
      <NodeBadge
        label={`Grid ${columns}col`}
        onEdit={() =>
          editor.commands.openMdxDialog({
            kind: "imageGrid",
            attrs: { images, columns },
            apply: (attrs) => updateAttributes(attrs),
          })
        }
      />
    </NodeViewWrapper>
  );
}

export const ImageGrid = Node.create({
  name: "imageGrid",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return { images: { default: [] }, columns: { default: 3 } };
  },
  parseHTML() {
    return [{ tag: "mdx-image-grid" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["mdx-image-grid", mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageGridView);
  },
});

// ---------------------------------------------------------------------------
// Raw MDX block (verbatim escape hatch)
// ---------------------------------------------------------------------------

function RawMdxView({
  node,
  selected,
  updateAttributes,
  deleteNode,
}: ReactNodeViewProps) {
  const source = String(node.attrs.source ?? "");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.style.height = "0";
      el.style.height = `${el.scrollHeight + 2}px`;
    }
  }, [source]);

  return (
    <NodeViewWrapper
      className={`mdx-node group relative my-4 ${selected ? "mdx-node-selected" : ""}`}
    >
      <div
        contentEditable={false}
        className="rounded-lg border border-dashed border-amber-600/50"
      >
        <div className="text-muted-foreground flex items-center justify-between px-3 pt-2 text-xs">
          <span className="flex items-center gap-1">
            <SquareCode className="h-3 w-3" /> raw MDX
          </span>
          <button
            type="button"
            className="hover:text-destructive opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => deleteNode()}
            title="Delete block"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
        <textarea
          ref={ref}
          value={source}
          spellCheck={false}
          onChange={(e) => updateAttributes({ source: e.target.value })}
          onKeyDown={(e) => e.stopPropagation()}
          className="w-full resize-none bg-transparent p-3 font-mono text-sm outline-none"
        />
      </div>
    </NodeViewWrapper>
  );
}

export const RawMdx = Node.create({
  name: "rawMdx",
  group: "block",
  atom: true,
  addAttributes() {
    return { source: { default: "" } };
  },
  parseHTML() {
    return [{ tag: "mdx-raw" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["mdx-raw", mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(RawMdxView);
  },
});

// ---------------------------------------------------------------------------
// Raw inline (math / inline JSX preserved verbatim)
// ---------------------------------------------------------------------------

function RawInlineView({ node, selected }: ReactNodeViewProps) {
  return (
    <NodeViewWrapper
      as="span"
      className={`rounded bg-amber-500/10 px-1 font-mono text-[0.85em] text-amber-500 ${selected ? "mdx-node-selected" : ""}`}
      title="Raw MDX/math — edit in the MDX tab"
    >
      {String(node.attrs.source ?? "")}
    </NodeViewWrapper>
  );
}

export const RawInline = Node.create({
  name: "rawInline",
  group: "inline",
  inline: true,
  atom: true,
  addAttributes() {
    return { source: { default: "" } };
  },
  parseHTML() {
    return [{ tag: "mdx-raw-inline" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["mdx-raw-inline", mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(RawInlineView);
  },
});

// ---------------------------------------------------------------------------
// Code block with a language field
// ---------------------------------------------------------------------------

function CodeBlockView({ node, updateAttributes }: ReactNodeViewProps) {
  const language = (node.attrs.language as string | null) ?? "";
  return (
    <NodeViewWrapper className="mdx-node relative my-4">
      <input
        contentEditable={false}
        value={language}
        placeholder="lang"
        spellCheck={false}
        onChange={(e) => updateAttributes({ language: e.target.value || null })}
        onKeyDown={(e) => e.stopPropagation()}
        className="text-muted-foreground absolute top-2 right-3 w-16 bg-transparent text-right font-mono text-xs outline-none"
      />
      <pre className="overflow-x-auto rounded-xl bg-stone-800 p-4 text-sm leading-relaxed text-stone-100 shadow-md">
        <NodeViewContent<"code"> as="code" spellCheck={false} />
      </pre>
    </NodeViewWrapper>
  );
}

export const CodeBlockWithLang = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },
});

// ---------------------------------------------------------------------------
// Shared floating badge for atom nodes
// ---------------------------------------------------------------------------

function NodeBadge({ label, onEdit }: { label: string; onEdit: () => void }) {
  return (
    <div
      contentEditable={false}
      className="absolute top-2 right-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
    >
      <span className="bg-background/80 text-muted-foreground rounded px-1.5 py-0.5 text-xs backdrop-blur">
        {label}
      </span>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="h-6 px-2"
        onClick={onEdit}
      >
        <Pencil className="h-3 w-3" />
      </Button>
    </div>
  );
}
