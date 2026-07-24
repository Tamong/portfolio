"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Ruler, Trash2 } from "lucide-react";
import type { ImageGridImage } from "@/lib/editor/doc-types";
import type { MdxDialogRequest } from "./dialog-bridge";

interface MdxDialogsProps {
  request: MdxDialogRequest | null;
  onClose: () => void;
}

/** Renders the edit/insert dialog matching the current bridge request. */
export function MdxDialogs({ request, onClose }: MdxDialogsProps) {
  if (!request) return null;

  const apply = (attrs: Record<string, unknown>) => {
    request.apply(attrs);
    onClose();
  };

  switch (request.kind) {
    case "image":
      return <ImageDialog request={request} apply={apply} onClose={onClose} />;
    case "youtube":
      return (
        <SingleFieldDialog
          title="YouTube video"
          label="Video ID"
          placeholder="dQw4w9WgXcQ"
          initial={String(request.attrs.videoId ?? "")}
          onSubmit={(value) => apply({ videoId: extractYouTubeId(value) })}
          onClose={onClose}
        />
      );
    case "tweet":
      return (
        <SingleFieldDialog
          title="Tweet"
          label="Tweet ID or URL"
          placeholder="1617979122625712128"
          initial={String(request.attrs.id ?? "")}
          onSubmit={(value) => apply({ id: extractTweetId(value) })}
          onClose={onClose}
        />
      );
    case "imageGrid":
      return (
        <ImageGridDialog request={request} apply={apply} onClose={onClose} />
      );
  }
}

function extractYouTubeId(value: string): string {
  const match =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/.exec(
      value,
    );
  return match?.[1] ?? value.trim();
}

function extractTweetId(value: string): string {
  const match = /status\/(\d+)/.exec(value);
  return match?.[1] ?? value.trim();
}

// ---------------------------------------------------------------------------
// Image dialog
// ---------------------------------------------------------------------------

interface SubDialogProps {
  request: MdxDialogRequest;
  apply: (attrs: Record<string, unknown>) => void;
  onClose: () => void;
}

function ImageDialog({ request, apply, onClose }: SubDialogProps) {
  const [src, setSrc] = useState(String(request.attrs.src ?? ""));
  const [alt, setAlt] = useState(String(request.attrs.alt ?? ""));
  const [width, setWidth] = useState<string>(
    request.attrs.width == null ? "" : String(request.attrs.width),
  );
  const [height, setHeight] = useState<string>(
    request.attrs.height == null ? "" : String(request.attrs.height),
  );
  const [detecting, setDetecting] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => setPreviewError(false), [src]);

  const detectSize = () => {
    if (!src) return;
    setDetecting(true);
    const probe = new window.Image();
    probe.onload = () => {
      setWidth(String(probe.naturalWidth));
      setHeight(String(probe.naturalHeight));
      setDetecting(false);
    };
    probe.onerror = () => setDetecting(false);
    probe.src = src;
  };

  const submit = () =>
    apply({
      src: src.trim(),
      alt: alt.trim(),
      width: width === "" ? null : Number(width),
      height: height === "" ? null : Number(height),
    });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="img-src">URL</Label>
            <Input
              id="img-src"
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              placeholder="https://cdn.pwallis.com/images/…"
              className="mt-1"
              autoFocus
            />
          </div>
          {src && !previewError && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt="preview"
              className="max-h-48 w-auto rounded border"
              onError={() => setPreviewError(true)}
            />
          )}
          {previewError && (
            <p className="text-destructive text-xs">Couldn't load image.</p>
          )}
          <div>
            <Label htmlFor="img-alt">Alt text</Label>
            <Input
              id="img-alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="w-28">
              <Label htmlFor="img-w">Width</Label>
              <Input
                id="img-w"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="w-28">
              <Label htmlFor="img-h">Height</Label>
              <Input
                id="img-h"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={detectSize}
              disabled={!src || detecting}
            >
              <Ruler className="mr-1 h-4 w-4" />
              {detecting ? "…" : "Detect"}
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            Width and height are required for the post to render.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!src || !width || !height}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Single text field dialog (YouTube / Tweet)
// ---------------------------------------------------------------------------

function SingleFieldDialog({
  title,
  label,
  placeholder,
  initial,
  onSubmit,
  onClose,
}: {
  title: string;
  label: string;
  placeholder: string;
  initial: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div>
          <Label htmlFor="single-field">{label}</Label>
          <Input
            id="single-field"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="mt-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && value.trim()) onSubmit(value);
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(value)} disabled={!value.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Image grid dialog
// ---------------------------------------------------------------------------

function ImageGridDialog({ request, apply, onClose }: SubDialogProps) {
  const [images, setImages] = useState<ImageGridImage[]>(
    (request.attrs.images as ImageGridImage[] | undefined)?.map((i) => ({
      ...i,
    })) ?? [],
  );
  const [columns, setColumns] = useState(Number(request.attrs.columns ?? 3));

  const update = (index: number, patch: Partial<ImageGridImage>) =>
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, ...patch } : img)),
    );

  const valid =
    images.length > 0 && images.every((img) => img.src.trim() !== "");

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Image grid</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label>Columns</Label>
            {[2, 3, 4].map((n) => (
              <Button
                key={n}
                type="button"
                size="sm"
                variant={columns === n ? "default" : "outline"}
                onClick={() => setColumns(n)}
              >
                {n}
              </Button>
            ))}
          </div>
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {images.map((image, index) => (
              <div key={index} className="flex items-start gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src || undefined}
                  alt=""
                  className="bg-muted h-16 w-16 shrink-0 rounded object-cover"
                />
                <div className="flex-1 space-y-1">
                  <Input
                    value={image.src}
                    onChange={(e) => update(index, { src: e.target.value })}
                    placeholder="Image URL"
                  />
                  <div className="flex gap-1">
                    <Input
                      value={image.alt}
                      onChange={(e) => update(index, { alt: e.target.value })}
                      placeholder="Alt text"
                    />
                    <Input
                      value={image.href ?? ""}
                      onChange={(e) =>
                        update(index, {
                          href: e.target.value || undefined,
                        })
                      }
                      placeholder="Link (optional)"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() =>
                    setImages((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setImages((prev) => [...prev, { src: "", alt: "" }])}
          >
            <Plus className="mr-1 h-4 w-4" /> Add image
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => apply({ images, columns })} disabled={!valid}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
