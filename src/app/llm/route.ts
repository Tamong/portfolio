import { getBlogPosts } from "@/lib/posts";
import { games } from "@/lib/games";
import { NextResponse } from "next/server";
import { metaData } from "@/config";
export const dynamic = "force-dynamic";

export async function GET() {
  const { title, description, details, baseUrl } = metaData;

  const posts = await getBlogPosts();

  const content = `# ${title}

> ${description}

${details}

## Resume 

[PDF](https://pwallis.com/Philip_Wallis_Resume.pdf)
[Page](https://pwallis.com/resume)

## Blog Posts

${posts.map((post) => `- [${post.title}](${baseUrl}posts/${post.slug}): ${post.summary}`).join("\n")}

## Games

${Object.entries(games)
  .map(([slug, { title }]) => `- [${title}](${baseUrl}games/${slug})`)
  .join("\n")}
        `;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
