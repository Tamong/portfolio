import { type MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/posts";
import { metaData } from "@/config";

const BaseUrl = metaData.baseUrl.endsWith("/")
  ? metaData.baseUrl
  : `${metaData.baseUrl}/`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allPosts = await getBlogPosts();
  const posts = allPosts.map((post) => ({
    url: `${BaseUrl}posts/${post.slug}`,
    lastModified: post.publishedAt?.toISOString().split("T")[0] ?? "",
  }));

  const routes = ["", "posts", "resume"].map((route) => ({
    url: `${BaseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...posts, ...routes];
}
