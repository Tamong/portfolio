"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ExternalLink,
  Loader2,
  Save,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { cn, slugify } from "@/lib/utils";
import { toast } from "sonner";
import { RichEditor } from "@/components/admin/editor/RichEditor";

const MdxPreview = dynamic(() => import("@/components/post/MdxPreview"), {
  ssr: false,
  loading: () => (
    <div className="text-muted-foreground text-sm">Loading preview…</div>
  ),
});

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export default function PostEditorPage() {
  return (
    <Suspense>
      <PostEditor />
    </Suspense>
  );
}

function PostEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [published, setPublished] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [customSlug, setCustomSlug] = useState("");
  const [postId, setPostId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  // Visual-tab sync: the editor re-parses MDX only when content changed
  // somewhere other than the visual editor itself (MDX tab, post load).
  const [activeTab, setActiveTab] = useState("visual");
  const [editorKey, setEditorKey] = useState(0);
  const lastVisualMdxRef = useRef<string | null>(null);
  const loadedSlugRef = useRef<string | null>(null);

  const debouncedContent = useDebounce(content, 400);

  const { data: postData, isLoading: postLoading } =
    api.post.getBySlug.useQuery({ slug: slug! }, { enabled: !!slug });

  useEffect(() => {
    if (!postData || loadedSlugRef.current === postData.slug) return;
    loadedSlugRef.current = postData.slug;
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
    setDirty(false);
    lastVisualMdxRef.current = null;
    setEditorKey((k) => k + 1);
  }, [postData]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const createMutation = api.post.create.useMutation({
    onSuccess: (data) => {
      toast.success("Post created");
      setDirty(false);
      router.push(`/admin/editor?slug=${data?.slug}`);
    },
    onError: (error) => toast.error(error.message || "Failed to create post"),
  });

  const updateMutation = api.post.update.useMutation({
    onSuccess: () => {
      toast.success("Saved");
      setDirty(false);
    },
    onError: (error) => toast.error(error.message || "Failed to save post"),
  });

  const saving = createMutation.isPending || updateMutation.isPending;

  const handleSave = useCallback(() => {
    if (!title) {
      toast.error("Title is required");
      return;
    }
    const postSlug = customSlug.trim() !== "" ? customSlug : slugify(title);
    const payload = {
      title,
      content,
      summary,
      tags,
      category,
      image,
      published,
      publishedAt: date,
      slug: postSlug,
    };
    if (postId) {
      updateMutation.mutate({ id: postId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }, [
    title,
    content,
    summary,
    tags,
    category,
    image,
    published,
    date,
    customSlug,
    postId,
    createMutation,
    updateMutation,
  ]);

  // Ctrl+S / Cmd+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  const markDirty = <T,>(setter: (v: T) => void) => {
    return (value: T) => {
      setter(value);
      setDirty(true);
    };
  };

  const onTabChange = (tab: string) => {
    if (tab === "visual" && content !== lastVisualMdxRef.current) {
      lastVisualMdxRef.current = content;
      setEditorKey((k) => k + 1);
    }
    setActiveTab(tab);
  };

  if (slug && postLoading) {
    return (
      <div className="text-muted-foreground flex h-64 items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading post…
      </div>
    );
  }

  return (
    <div>
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/posts">
            <ArrowLeft className="mr-1 h-4 w-4" /> Posts
          </Link>
        </Button>
        <span className="text-muted-foreground text-sm">
          {postId ? "Editing" : "New post"}
          {dirty && <span className="ml-2 text-amber-500">● unsaved</span>}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {postId && published && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={`/posts/${customSlug || slugify(title)}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="mr-1 h-4 w-4" /> View
              </a>
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Main column */}
        <div className="min-w-0">
          <Input
            value={title}
            onChange={(e) => markDirty(setTitle)(e.target.value)}
            placeholder="Post title"
            className="mb-4 h-auto border-none px-0 !text-3xl font-semibold tracking-tight shadow-none focus-visible:ring-0"
          />

          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="mb-3">
              <TabsTrigger value="visual">Visual</TabsTrigger>
              <TabsTrigger value="mdx">MDX</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="visual" className="mt-0">
              <RichEditor
                key={editorKey}
                initialMdx={content}
                onMdxChange={(mdx) => {
                  lastVisualMdxRef.current = mdx;
                  setContent(mdx);
                  setDirty(true);
                }}
              />
            </TabsContent>

            <TabsContent value="mdx" className="mt-0">
              <Textarea
                value={content}
                onChange={(e) => markDirty(setContent)(e.target.value)}
                placeholder="Write MDX…"
                spellCheck={false}
                className="min-h-[600px] w-full resize-y font-mono text-sm"
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="rounded-md border p-6">
                <article className="prose prose-invert max-w-none">
                  <MdxPreview source={debouncedContent} />
                </article>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="published"
                  checked={published}
                  onCheckedChange={(checked) =>
                    markDirty(setPublished)(checked === true)
                  }
                />
                <Label htmlFor="published">Published</Label>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={markDirty(setDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="summary" className="text-xs">
                  Summary
                </Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => markDirty(setSummary)(e.target.value)}
                  placeholder="Brief summary for cards and SEO"
                  className="mt-1 h-20 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="tags" className="text-xs">
                  Tags
                </Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => markDirty(setTags)(e.target.value)}
                  placeholder="React, TypeScript"
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-xs">
                  Category
                </Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => markDirty(setCategory)(e.target.value)}
                  placeholder="Tutorial, Project…"
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="image" className="text-xs">
                  Featured image URL
                </Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => markDirty(setImage)(e.target.value)}
                  placeholder="/images/posts/cover.png"
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="slug" className="text-xs">
                  Slug
                </Label>
                <Input
                  id="slug"
                  value={customSlug}
                  onChange={(e) => markDirty(setCustomSlug)(e.target.value)}
                  placeholder={title ? slugify(title) : "auto from title"}
                  className="mt-1 text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
