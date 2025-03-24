import React, { type ReactNode, type FC, type ComponentType } from "react";
import Link from "next/link";
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import { CodeBlock } from "./code-block";
import { TweetComponent } from "./tweet";
import { CaptionComponent } from "./caption";
import { YouTubeComponent } from "./youtube";
import { ImageWithModal } from "./ImageModal";
import { ImageGrid } from "./image-grid";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import { Button } from "@/components/ui/button";

interface CustomLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

const CustomLink: FC<CustomLinkProps> = (props) => {
  const { href, children, ...rest } = props;

  if (href.startsWith("/")) {
    return (
      <Link href={href} {...rest}>
        <Button className="px-0" variant="link">
          {children}
        </Button>
      </Link>
    );
  }

  if (href.startsWith("#")) {
    return (
      <Link href={href} {...rest}>
        <Button className="px-0" variant="link">
          {children}
        </Button>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="external-link"
      {...rest}
    >
      <Button className="px-0" variant="link">
        {children}
      </Button>
    </Link>
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
      className="border-b border-gray-700 bg-gray-800 px-4 py-2 text-left"
    >
      {header}
    </th>
  ));

  const rows = data.rows.map((row, index) => (
    <tr key={index} className="transition-colors hover:bg-gray-800">
      {row.map((cell, cellIndex) => (
        <td key={cellIndex} className="border-b border-gray-700 px-4 py-2">
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
    <blockquote className="text-secondary-foreground my-4 border-l-4 border-gray-600 pl-4 italic">
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
  <div className="bg-primary/25 my-6 flex items-center rounded p-4 text-sm">
    <div className="mr-4 flex w-8 items-center text-2xl">{emoji}</div>
    <div className="callout text-foreground w-full leading-relaxed">
      {children}
    </div>
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
      1: "text-4xl font-semibold mb-4 mt-8",
      2: "text-3xl font-semibold mb-3 mt-6",
      3: "text-2xl font-semibold mb-2 mt-4",
      4: "text-xl font-medium mb-2 mt-3",
      5: "text-base font-medium mb-1 mt-2 text-secondary-foreground",
      6: "text-sm font-medium mb-1 mt-1 text-secondary-foreground",
    };

    return React.createElement(
      `h${level}`,
      {
        id: slug,
        className: `group text-foreground relative ${headingClasses[level]}`,
      },
      [
        React.createElement(
          "a",
          {
            href: `#${slug}`,
            key: `link-${slug}`,
            className:
              "absolute -left-5 opacity-0 group-hover:opacity-100 transition-opacity no-underline",
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
  Image: ImageWithModal,
  ImageGrid,
  a: CustomLink,
  StaticTweet: TweetComponent,
  Caption: CaptionComponent,
  YouTube: YouTubeComponent,
  code: CodeBlock,
  Table,
  del: Strikethrough,
  Callout,
  blockquote: Blockquote,
  ul: (props: any) => <ol className="ml-6 list-disc" {...props} />,
  ol: (props: any) => <ol className="ml-8 list-decimal" {...props} />,
  hr: () => <hr className="my-8 border-t border-gray-700" />,
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
