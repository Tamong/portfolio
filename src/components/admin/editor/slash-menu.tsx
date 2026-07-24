"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Extension, type Editor, type Range } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionProps } from "@tiptap/suggestion";
import {
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  LayoutGrid,
  List,
  ListOrdered,
  MessageSquareQuote,
  Minus,
  Quote,
  SquareCode,
  Table as TableIcon,
  Twitter,
  Youtube,
} from "lucide-react";
import type { MdxDialogRequest } from "./dialog-bridge";

export interface SlashItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string;
  run: (editor: Editor, range: Range) => void;
}

function insertNodeViaDialog(
  editor: Editor,
  range: Range,
  kind: MdxDialogRequest["kind"],
  nodeType: string,
  defaults: Record<string, unknown>,
) {
  editor.chain().focus().deleteRange(range).run();
  editor.commands.openMdxDialog({
    kind,
    attrs: defaults,
    apply: (attrs) =>
      editor.chain().focus().insertContent({ type: nodeType, attrs }).run(),
  });
}

export const SLASH_ITEMS: SlashItem[] = [
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: Heading1,
    keywords: "h1 title",
    run: (editor, range) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run(),
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: Heading2,
    keywords: "h2 subtitle",
    run: (editor, range) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run(),
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: Heading3,
    keywords: "h3",
    run: (editor, range) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run(),
  },
  {
    title: "Bullet List",
    description: "Simple unordered list",
    icon: List,
    keywords: "ul unordered",
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Numbered List",
    description: "Ordered list",
    icon: ListOrdered,
    keywords: "ol ordered",
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Code Block",
    description: "Syntax-highlighted code",
    icon: Code,
    keywords: "code fence pre",
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setCodeBlock().run(),
  },
  {
    title: "Blockquote",
    description: "Quoted text",
    icon: Quote,
    keywords: "quote cite",
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setBlockquote().run(),
  },
  {
    title: "Divider",
    description: "Horizontal rule",
    icon: Minus,
    keywords: "hr rule separator",
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    title: "Table",
    description: "Renders via the <Table> component",
    icon: TableIcon,
    keywords: "table grid data",
    run: (editor, range) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 2, withHeaderRow: true })
        .run(),
  },
  {
    title: "Image",
    description: "Image with lightbox (<Image>)",
    icon: ImageIcon,
    keywords: "image picture photo img",
    run: (editor, range) =>
      insertNodeViaDialog(editor, range, "image", "mdxImage", {
        src: "",
        alt: "",
        width: null,
        height: null,
      }),
  },
  {
    title: "Image Grid",
    description: "Grid of images (<ImageGrid>)",
    icon: LayoutGrid,
    keywords: "gallery grid photos",
    run: (editor, range) =>
      insertNodeViaDialog(editor, range, "imageGrid", "imageGrid", {
        images: [],
        columns: 3,
      }),
  },
  {
    title: "Callout",
    description: "Highlighted note with emoji",
    icon: MessageSquareQuote,
    keywords: "callout note info tip",
    run: (editor, range) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "callout",
          attrs: { emoji: "💡" },
          content: [{ type: "paragraph" }],
        })
        .run(),
  },
  {
    title: "Caption",
    description: "Centered caption text",
    icon: MessageSquareQuote,
    keywords: "caption subtitle figure",
    run: (editor, range) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({ type: "caption" })
        .run(),
  },
  {
    title: "YouTube",
    description: "Embedded video (<YouTube>)",
    icon: Youtube,
    keywords: "youtube video embed",
    run: (editor, range) =>
      insertNodeViaDialog(editor, range, "youtube", "youtube", {
        videoId: "",
      }),
  },
  {
    title: "Tweet",
    description: "Embedded tweet (<StaticTweet>)",
    icon: Twitter,
    keywords: "tweet twitter x embed",
    run: (editor, range) =>
      insertNodeViaDialog(editor, range, "tweet", "tweet", { id: "" }),
  },
  {
    title: "Raw MDX",
    description: "Verbatim MDX escape hatch",
    icon: SquareCode,
    keywords: "raw mdx jsx html source",
    run: (editor, range) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({ type: "rawMdx", attrs: { source: "" } })
        .run(),
  },
];

// ---------------------------------------------------------------------------
// Popup list component
// ---------------------------------------------------------------------------

interface SlashListProps {
  items: SlashItem[];
  command: (item: SlashItem) => void;
}

export interface SlashListHandle {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

const SlashList = forwardRef<SlashListHandle, SlashListProps>(
  function SlashList({ items, command }, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => setSelectedIndex(0), [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: (event) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((i) => (i + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((i) => (i + 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          const item = items[selectedIndex];
          if (item) command(item);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="bg-popover text-muted-foreground rounded-md border p-2 text-sm shadow-md">
          No matches
        </div>
      );
    }

    return (
      <div className="bg-popover max-h-80 w-64 overflow-y-auto rounded-md border p-1 shadow-md">
        {items.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm ${
              index === selectedIndex
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50"
            }`}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => command(item)}
          >
            <item.icon className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className="flex-1">
              <span className="block leading-tight">{item.title}</span>
              <span className="text-muted-foreground block text-xs leading-tight">
                {item.description}
              </span>
            </span>
          </button>
        ))}
      </div>
    );
  },
);

// ---------------------------------------------------------------------------
// Suggestion extension
// ---------------------------------------------------------------------------

export const SlashCommands = Extension.create({
  name: "slashCommands",

  addProseMirrorPlugins() {
    return [
      Suggestion<SlashItem>({
        editor: this.editor,
        char: "/",
        startOfLine: false,
        command: ({ editor, range, props }) => props.run(editor, range),
        items: ({ query }) => {
          const q = query.toLowerCase();
          return SLASH_ITEMS.filter(
            (item) =>
              item.title.toLowerCase().includes(q) || item.keywords.includes(q),
          );
        },
        render: () => {
          let component: ReactRenderer<SlashListHandle, SlashListProps> | null =
            null;
          let popup: HTMLDivElement | null = null;

          const position = (props: SuggestionProps<SlashItem>) => {
            if (!popup) return;
            const rect = props.clientRect?.();
            if (!rect) return;
            popup.style.left = `${rect.left}px`;
            const spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow < 340) {
              popup.style.top = "auto";
              popup.style.bottom = `${window.innerHeight - rect.top + 4}px`;
            } else {
              popup.style.bottom = "auto";
              popup.style.top = `${rect.bottom + 4}px`;
            }
          };

          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashList, {
                props: {
                  items: props.items,
                  command: (item: SlashItem) => props.command(item),
                },
                editor: props.editor,
              });
              popup = document.createElement("div");
              popup.style.position = "fixed";
              popup.style.zIndex = "60";
              popup.appendChild(component.element);
              document.body.appendChild(popup);
              position(props);
            },
            onUpdate: (props) => {
              component?.updateProps({
                items: props.items,
                command: (item: SlashItem) => props.command(item),
              });
              position(props);
            },
            onKeyDown: (props) => {
              if (props.event.key === "Escape") return true;
              return component?.ref?.onKeyDown(props.event) ?? false;
            },
            onExit: () => {
              popup?.remove();
              component?.destroy();
              component = null;
              popup = null;
            },
          };
        },
      }),
    ];
  },
});
