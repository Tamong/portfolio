import { getBlogPosts } from "@/lib/posts";
import { games } from "@/lib/games";
import { NextResponse } from "next/server";
import { metaData } from "@/config";
export const dynamic = "force-dynamic";

export async function GET() {
  const { title, description, details } = metaData;

  const posts = await getBlogPosts();

  const content = `# ${title}

> ${description}

${details}

## Blog Posts

${posts.map((post) => `- [${post.title}](https://pwallis.com/posts/${post.slug}): ${post.summary}`).join("\n")}

## Games

${Object.entries(games)
  .map(([slug, { title }]) => `- [${title}](https://pwallis.com/games/${slug})`)
  .join("\n")}
        `;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
}
