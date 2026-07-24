import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import type { AnyExtension } from "@tiptap/core";
import {
  Callout,
  Caption,
  CodeBlockWithLang,
  ImageGrid,
  MdxImage,
  RawInline,
  RawMdx,
  StaticTweet,
  YouTube,
} from "./nodes";
import { SlashCommands } from "./slash-menu";
import { MdxDialogBridge, type MdxDialogRequest } from "./dialog-bridge";

/** The full extension list for the MDX editor (shared with schema tests). */
export function buildExtensions(
  onOpenDialog: (request: MdxDialogRequest) => void,
): AnyExtension[] {
  return [
    StarterKit.configure({
      codeBlock: false, // replaced by CodeBlockWithLang
      strike: false, // site pipeline has no strikethrough support
      underline: false, // no MDX representation
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      },
    }),
    CodeBlockWithLang,
    TableKit.configure({ table: { resizable: false } }),
    Placeholder.configure({
      placeholder: "Write, or type “/” for components…",
    }),
    MdxImage,
    Callout,
    Caption,
    YouTube,
    StaticTweet,
    ImageGrid,
    RawMdx,
    RawInline,
    SlashCommands,
    MdxDialogBridge.configure({ onOpen: onOpenDialog }),
  ];
}
