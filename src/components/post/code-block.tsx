import Prism from "prismjs";
import { type FC } from "react";
import { cn } from "@/lib/utils";

import "./ayu-mirage.css";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

// Function to add bracket pair colorization
function addBracketPairColorization(code: string): string {
  // Stack to keep track of bracket nesting levels
  const stack: { char: string; level: number }[] = [];
  const bracketPairs: Record<string, string> = {
    "(": ")",
    "[": "]",
    "{": "}",
  };
  const openingBrackets = Object.keys(bracketPairs);
  const closingBrackets = Object.values(bracketPairs);

  // Replace brackets with spans that have appropriate classes
  let result = "";
  let inTag = false;
  let currentToken = "";

  for (const char of code) {
    // Handle HTML tags (avoid modifying them)
    if (char === "<" && !inTag) {
      inTag = true;
      result += currentToken;
      currentToken = char;
      continue;
    } else if (char === ">" && inTag) {
      inTag = false;
      result += currentToken + char;
      currentToken = "";
      continue;
    } else if (inTag) {
      currentToken += char;
      continue;
    }

    // Check if current character is a bracket
    if (openingBrackets.includes(char)) {
      // It's an opening bracket
      const bracketType =
        char === "(" ? "paren" : char === "[" ? "bracket" : "brace";
      const level = (stack.filter((b) => b.char === char).length % 5) + 1;
      stack.push({ char, level });
      result += `<span class="token punctuation ${bracketType}-level-${level}">${char}</span>`;
    } else if (closingBrackets.includes(char)) {
      // It's a closing bracket
      let matchingOpenBracket = "";
      for (const [open, close] of Object.entries(bracketPairs)) {
        if (close === char) {
          matchingOpenBracket = open;
          break;
        }
      }

      const lastOpeningIndex = stack
        .map((b) => b.char)
        .lastIndexOf(matchingOpenBracket);
      if (lastOpeningIndex !== -1) {
        const { level } = stack[lastOpeningIndex]!;
        const bracketType =
          char === ")" ? "paren" : char === "]" ? "bracket" : "brace";
        stack.splice(lastOpeningIndex, 1);
        result += `<span class="token punctuation ${bracketType}-level-${level}">${char}</span>`;
      } else {
        result += char; // Unmatched closing bracket
      }
    } else {
      result += char;
    }
  }

  return result + currentToken;
}

interface CodeProps {
  children: string;
  className?: string;
}

export const CodeBlock: FC<CodeProps> = ({ children, className }) => {
  const language = className?.replace(/^language-/, "") ?? "markdown";

  // Pre-highlight the code
  const grammar = Prism.languages[language];
  let highlightedCode =
    language && grammar
      ? Prism.highlight(children.trim(), grammar, language)
      : children.trim();

  // Apply bracket pair colorization
  highlightedCode = addBracketPairColorization(highlightedCode);

  return (
    <div className="relative my-4">
      {language && (
        <div className="absolute top-2 right-4 text-xs text-stone-400">
          {language}
        </div>
      )}
      <pre
        className={cn(
          "scrollbar-hidden overflow-x-auto rounded-xl bg-stone-800 p-4 text-sm leading-relaxed shadow-md",
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
