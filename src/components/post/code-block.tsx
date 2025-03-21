import Prism from "prismjs";
import { type FC } from "react";
import { cn } from "@/lib/utils";

import "./prism.css";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

interface CodeProps {
  children: string;
  className?: string;
}

export const CodeBlock: FC<CodeProps> = ({ children, className }) => {
  const language = className?.replace(/^language-/, "") ?? "markdown";

  // Pre-highlight the code
  const grammar = Prism.languages[language];
  const highlightedCode =
    language && grammar
      ? Prism.highlight(children.trim(), grammar, language)
      : children.trim();

  return (
    <div className="relative my-4">
      {language && (
        <div className="absolute top-2 right-4 text-xs text-gray-500">
          {language}
        </div>
      )}
      <pre
        className={cn(
          "scrollbar-hidden overflow-x-auto rounded-xl bg-stone-800 p-4 text-sm leading-relaxed",
        )}
      >
        <code
          className={language ? `language-${language}` : ""}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
};
