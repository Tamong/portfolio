"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import type { Session } from "next-auth";
import Comments from "./comments";

/**
 * Client island wrapping Comments: fetches the viewer's session in the
 * browser so the post page itself can stay fully static.
 */
export default function CommentsSection({ slug }: { slug: string }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    getSession()
      .then(setSession)
      .catch(() => setSession(null));
  }, []);

  return <Comments slug={slug} session={session} />;
}
