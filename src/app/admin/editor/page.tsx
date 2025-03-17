"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomMDX } from "@/components/post/mdx";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn, slugify } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

export default function PostEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  // State for post data
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [published, setPublished] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [customSlug, setCustomSlug] = useState("");
  const [useCustomSlug, setUseCustomSlug] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);

  // Fetch post data if slug is provided
  const { data: postData } = api.post.getBySlug.useQuery(
    { slug: slug! },
    {
      enabled: !!slug,
    },
  );

  useEffect(() => {
    if (postData) {
      console.log("Post data loaded:", postData);
      setTitle(postData.title);
      setContent(postData.content);
      setSummary(postData.summary ?? "");
      setTags(postData.tags ?? "");
      setCategory(postData.category ?? "");
      setImage(postData.image ?? "");
      setPublished(postData.published);
      setDate(postData.publishedAt ?? new Date());
      setPostId(postData.id);
      setCustomSlug(postData.slug);
      setUseCustomSlug(true);
    }
  }, [postData]);

  // Create or update post
  const createMutation = api.post.create.useMutation({
    onSuccess: (data) => {
      toast.success("Post created successfully!");
      router.push(`/admin/editor?slug=${data?.slug}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create post");
    },
  });

  const updateMutation = api.post.update.useMutation({
    onSuccess: () => {
      toast.success("Post updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update post");
    },
  });

  const handleSave = () => {
    if (!title) {
      toast.error("Title is required");
      return;
    }

    const postSlug = useCustomSlug && customSlug ? customSlug : slugify(title);

    if (postId) {
      updateMutation.mutate({
        id: postId,
        title,
        content,
        summary,
        tags,
        category,
        image,
        published,
        publishedAt: date,
        slug: postSlug,
      });
    } else {
      createMutation.mutate({
        title,
        content,
        summary,
        tags,
        category,
        image,
        published,
        publishedAt: date,
        slug: postSlug,
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {slug ? "Edit Post" : "Create New Post"}
        </h1>
        <div className="flex flex-col gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="published"
              checked={published}
              onCheckedChange={(checked) => setPublished(checked as boolean)}
            />
            <Label htmlFor="published">Published</Label>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Saving..."
              : "Save"}
          </Button>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="mt-1"
          />
        </div>

        <div className="flex items-start space-x-4">
          <div className="flex-1">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief summary of the post"
              className="mt-1 h-20"
            />
          </div>
          <div className="flex-1">
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="React, TypeScript, etc."
                className="mt-1"
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Tutorial, Project, etc."
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="image">Featured Image URL</Label>
          <Input
            id="image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="/images/posts/my-image.png"
            className="mt-1"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="customSlug"
            checked={useCustomSlug}
            onCheckedChange={(checked) => {
              setUseCustomSlug(checked as boolean);
              if (checked && !customSlug && title) {
                setCustomSlug(slugify(title));
              }
            }}
          />
          <Label htmlFor="customSlug">Custom Slug</Label>
          {useCustomSlug && (
            <Input
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder="custom-url-slug"
              className="ml-2 max-w-xs"
            />
          )}
        </div>
      </div>

      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="split">Split View</TabsTrigger>
          <TabsTrigger value="edit">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="split" className="mt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-md border p-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your content in MDX..."
                className="min-h-[600px] w-full resize-none font-mono"
              />
            </div>
            <div className="max-h-[600px] overflow-auto rounded-md border p-4">
              <div className="prose prose-invert max-w-none">
                <CustomMDX source={content} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="mt-0">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your content in MDX..."
            className="min-h-[600px] w-full resize-none font-mono"
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <div className="max-h-[600px] overflow-auto rounded-md border p-4">
            <div className="prose prose-invert max-w-none">
              <CustomMDX source={content} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
