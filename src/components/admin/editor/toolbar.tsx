"use client";

import React from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import {
  ArrowDownToLine,
  ArrowRightToLine,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Plus,
  Quote,
  Redo2,
  SquareCode,
  Trash2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { SLASH_ITEMS } from "./slash-menu";

function ToolButton({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "secondary" : "ghost"}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );
}

export function EditorToolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      code: e.isActive("code"),
      link: e.isActive("link"),
      h1: e.isActive("heading", { level: 1 }),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      blockquote: e.isActive("blockquote"),
      codeBlock: e.isActive("codeBlock"),
      inTable: e.isActive("table"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();

  return (
    <div className="bg-background/95 sticky top-0 z-40 rounded-t-md border-b backdrop-blur">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
        <ToolButton
          title="Undo (Ctrl+Z)"
          disabled={!state.canUndo}
          onClick={() => chain().undo().run()}
        >
          <Undo2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          title="Redo (Ctrl+Y)"
          disabled={!state.canRedo}
          onClick={() => chain().redo().run()}
        >
          <Redo2 className="h-4 w-4" />
        </ToolButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolButton
          title="Heading 1"
          active={state.h1}
          onClick={() => chain().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          title="Heading 2"
          active={state.h2}
          onClick={() => chain().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          title="Heading 3"
          active={state.h3}
          onClick={() => chain().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </ToolButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolButton
          title="Bold (Ctrl+B)"
          active={state.bold}
          onClick={() => chain().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          title="Italic (Ctrl+I)"
          active={state.italic}
          onClick={() => chain().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          title="Inline code (Ctrl+E)"
          active={state.code}
          onClick={() => chain().toggleCode().run()}
        >
          <Code className="h-4 w-4" />
        </ToolButton>
        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolButton
          title="Bullet list"
          active={state.bulletList}
          onClick={() => chain().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          title="Numbered list"
          active={state.orderedList}
          onClick={() => chain().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          title="Blockquote"
          active={state.blockquote}
          onClick={() => chain().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          title="Code block"
          active={state.codeBlock}
          onClick={() => chain().toggleCodeBlock().run()}
        >
          <SquareCode className="h-4 w-4" />
        </ToolButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 gap-1 px-2"
            >
              <Plus className="h-4 w-4" /> Insert
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-1" align="start">
            {SLASH_ITEMS.map((item) => (
              <button
                key={item.title}
                type="button"
                className="hover:bg-accent flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm"
                onClick={() => {
                  const { to } = editor.state.selection;
                  item.run(editor, { from: to, to });
                }}
              >
                <item.icon className="text-muted-foreground h-4 w-4" />
                {item.title}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        <span className="text-muted-foreground ml-auto hidden pr-2 text-xs sm:inline">
          type "/" for commands
        </span>
      </div>

      {state.inTable && (
        <div className="flex items-center gap-0.5 border-t px-2 py-1">
          <span className="text-muted-foreground mr-2 text-xs">Table:</span>
          <ToolButton
            title="Add column after"
            onClick={() => chain().addColumnAfter().run()}
          >
            <ArrowRightToLine className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            title="Add row after"
            onClick={() => chain().addRowAfter().run()}
          >
            <ArrowDownToLine className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            title="Delete column"
            onClick={() => chain().deleteColumn().run()}
          >
            <span className="text-xs">−col</span>
          </ToolButton>
          <ToolButton
            title="Delete row"
            onClick={() => chain().deleteRow().run()}
          >
            <span className="text-xs">−row</span>
          </ToolButton>
          <ToolButton
            title="Delete table"
            onClick={() => chain().deleteTable().run()}
          >
            <Trash2 className="h-4 w-4" />
          </ToolButton>
        </div>
      )}
    </div>
  );
}
