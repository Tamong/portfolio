import { type MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/posts";
import { games } from "@/lib/games";
import { metaData } from "@/config";

const BaseUrl = metaData.baseUrl.endsWith("/")
  ? metaData.baseUrl
  : `${metaData.baseUrl}/`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allPosts = await getBlogPosts();
  const allGames = Object.entries(games).map(([slug]) => ({
    slug,
  }));
  const postRoute = allPosts.map((post) => ({
    url: `${BaseUrl}posts/${post.slug}`,
    lastModified: post.publishedAt?.toISOString().split("T")[0] ?? "",
  }));

  const gameRoute = allGames.map((game) => ({
    url: `${BaseUrl}games/${game.slug}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  const routes = ["", "posts", "games", "resume"].map((route) => ({
    url: `${BaseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...postRoute, ...gameRoute, ...routes];
}
