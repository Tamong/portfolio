import { Extension } from "@tiptap/core";

export type MdxDialogKind = "image" | "youtube" | "tweet" | "imageGrid";

export interface MdxDialogRequest {
  kind: MdxDialogKind;
  attrs: Record<string, unknown>;
  apply: (attrs: Record<string, unknown>) => void;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mdxDialogBridge: {
      /** Asks the surrounding React editor shell to open a node-edit dialog. */
      openMdxDialog: (request: MdxDialogRequest) => ReturnType;
    };
  }
}

interface MdxDialogBridgeOptions {
  onOpen: (request: MdxDialogRequest) => void;
}

/**
 * Node views live inside ProseMirror and can't own modal state; this bridge
 * lets them request a dialog from the React shell via an editor command.
 */
export const MdxDialogBridge = Extension.create<MdxDialogBridgeOptions>({
  name: "mdxDialogBridge",

  addOptions() {
    return { onOpen: () => undefined };
  },

  addCommands() {
    return {
      openMdxDialog: (request: MdxDialogRequest) => () => {
        this.options.onOpen(request);
        return true;
      },
    };
  },
});
