"use client";

import { useEffect, useRef } from "react";
import { api } from "@/trpc/react";

/**
 * Client island on the (static) post page: registers one view per browser
 * session and shows the running total without ever revalidating the page.
 */
export default function ViewCounter({ slug }: { slug: string }) {
  const utils = api.useUtils();
  const viewsQuery = api.post.getViews.useQuery({ slug });
  const registerView = api.post.registerView.useMutation({
    onSuccess: (data) => {
      if (data.views !== null) {
        utils.post.getViews.setData({ slug }, { views: data.views });
      }
    },
  });
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    const key = `viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage unavailable — still count the view
    }
    registerView.mutate({ slug });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const views = viewsQuery.data?.views;
  if (views === null || views === undefined) return null;

  return (
    <span className="text-muted-foreground text-sm tabular-nums">
      {views.toLocaleString()} view{views === 1 ? "" : "s"}
    </span>
  );
}
