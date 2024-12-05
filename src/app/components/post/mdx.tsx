import React, { type ReactNode, type FC, type ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import { highlight } from "sugar-high";
import { TweetComponent } from "./tweet";
import { CaptionComponent } from "./caption";
import { YouTubeComponent } from "./youtube";
import { ImageGrid } from "./image-grid";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";

interface CustomLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

const CustomLink: FC<CustomLinkProps> = (props) => {
  const { href, children, ...rest } = props;

  if (href.startsWith("/")) {
    return (
      <Link
        href={href}
        className="text-blue-400 transition-colors hover:text-blue-600 hover:underline"
        {...rest}
      >
        {children}
      </Link>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a
        className="text-blue-400 hover:text-blue-600 hover:underline"
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="external-link text-blue-400 hover:text-blue-600 hover:underline"
      {...rest}
    >
      {children}
    </a>
  );
};

interface RoundedImageProps extends React.ComponentProps<typeof Image> {
  alt: string;
}

const RoundedImage: FC<RoundedImageProps> = (props) => (
  <Image
    className="mx-auto my-4 h-auto max-w-full rounded-lg drop-shadow-2xl"
    {...props}
  />
);

interface CodeProps {
  children: string;
  className?: string;
}

const Code: FC<CodeProps> = ({ children, className }) => {
  const language = className?.replace(/^language-/, "") ?? "";

  // Generate highlighted code and sanitize line breaks
  const codeHTML = highlight(children.trim()).replace(/\n{2,}/g, "\n");

  return (
    <div className="relative my-4">
      {language && (
        <div className="absolute right-4 top-2 text-xs text-gray-500">
          {language}
        </div>
      )}
      <pre className="scrollbar-hidden overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed dark:border-gray-700 dark:bg-gray-900">
        <code
          className={`block ${language ? `language-${language}` : ""}`}
          dangerouslySetInnerHTML={{ __html: codeHTML }}
        />
      </pre>
    </div>
  );
};

interface TableProps {
  data: {
    headers: string[];
    rows: string[][];
  };
}

const Table: FC<TableProps> = ({ data }) => {
  const headers = data.headers.map((header, index) => (
    <th
      key={index}
      className="border-b border-gray-200 bg-gray-100 px-4 py-2 text-left dark:border-gray-700 dark:bg-gray-800"
    >
      {header}
    </th>
  ));

  const rows = data.rows.map((row, index) => (
    <tr
      key={index}
      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      {row.map((cell, cellIndex) => (
        <td
          key={cellIndex}
          className="border-b border-gray-200 px-4 py-2 dark:border-gray-700"
        >
          {cell}
        </td>
      ))}
    </tr>
  ));

  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>{headers}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
};

interface BlockquoteProps {
  children: ReactNode;
}

function Blockquote({ children }: BlockquoteProps) {
  return (
    <blockquote className="my-4 border-l-4 border-gray-300 pl-4 italic text-gray-700 dark:border-gray-600 dark:text-gray-300">
      {children}
    </blockquote>
  );
}

const Strikethrough: FC = (props) => (
  <del className="text-gray-500 line-through" {...props} />
);

interface CalloutProps {
  emoji: ReactNode;
  children: ReactNode;
}

const Callout: FC<CalloutProps> = ({ emoji, children }) => (
  <div className="mb-8 flex items-center rounded bg-blue-50 p-4 text-sm text-neutral-900 dark:bg-blue-900/30 dark:text-neutral-100">
    <div className="mr-4 flex w-8 items-center text-2xl">{emoji}</div>
    <div className="callout w-full leading-relaxed">{children}</div>
  </div>
);

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

function createHeading(level: number): FC<{ children: string }> {
  const Heading: FC<{ children: string }> = ({ children }) => {
    const slug = slugify(children);
    const headingClasses: Record<number, string> = {
      1: "text-3xl font-bold mb-4 mt-8 text-neutral-900 dark:text-neutral-100",
      2: "text-2xl font-semibold mb-3 mt-6 text-neutral-900 dark:text-neutral-100",
      3: "text-xl font-semibold mb-2 mt-4 text-neutral-900 dark:text-neutral-100",
      4: "text-lg font-medium mb-2 mt-3 text-neutral-800 dark:text-neutral-200",
      5: "text-base font-medium mb-1 mt-2 text-neutral-700 dark:text-neutral-300",
      6: "text-sm font-medium mb-1 mt-1 text-neutral-600 dark:text-neutral-400",
    };

    return React.createElement(
      `h${level}`,
      {
        id: slug,
        className: `group relative ${headingClasses[level]}`,
      },
      [
        React.createElement(
          "a",
          {
            href: `#${slug}`,
            key: `link-${slug}`,
            className:
              "absolute -left-5 opacity-0 group-hover:opacity-100 transition-opacity no-underline text-gray-500",
            "aria-hidden": "true",
          },
          "#",
        ),
      ],
      children,
    );
  };
  Heading.displayName = `Heading${level}`;
  return Heading;
}

// eslint any disable

/* eslint-disable @typescript-eslint/no-explicit-any */
type MDXComponents = Record<
  string,
  ComponentType<React.PropsWithChildren<any>>
>;

const components: MDXComponents = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  ImageGrid,
  a: CustomLink,
  StaticTweet: TweetComponent,
  Caption: CaptionComponent,
  YouTube: YouTubeComponent,
  code: Code,
  Table,
  del: Strikethrough,
  Callout,
  blockquote: Blockquote,
};

export const CustomMDX: FC<MDXRemoteProps> = (props) => {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components ?? {}) }}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
      }}
    />
  );
};
