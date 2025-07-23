"use client";
import dynamic from "next/dynamic";
import React, { Suspense } from "react";

const MdxPreview = dynamic(() => import("@/components/post/MdxPreview"), {
  ssr: false,
});

export default function PreviewPane({
  appliedContent,
}: {
  appliedContent: string;
}) {
  return (
    <Suspense fallback={<div>Loading preview...</div>}>
      <MdxPreview source={appliedContent} />
    </Suspense>
  );
}
