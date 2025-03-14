import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
/*
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
*/
export default async function Home() {
  {
    /*
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }
  */
  }
  return (
    <section className="text-md flex flex-col gap-6 py-4">
      <p>Hello! I am Philip, a software engineer based in Texas, USA. </p>

      <p>
        My engineering interests are in Artificial Intelligence, Computer
        Vision, and Web Development.
      </p>
      <p>I have been learning new things and working on projects.</p>
    </section>
    /*
    <HydrateClient>
      <section className="text-md flex flex-col gap-6 py-4">
        <p>Hello! I am Philip, a software engineer based in Texas, USA. </p>

        <p>
          My engineering interests are in Artificial Intelligence, Computer
          Vision, and Web Development.
        </p>
        <p>I have been learning new things and working on projects.</p>
      </section>

      <div className="flex flex-col items-center gap-2">
        <p className="text-2xl">
          {hello ? hello.greeting : "Loading tRPC query..."}
        </p>

        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-center text-2xl">
            {session && <span>Logged in as {session.user?.name}</span>}
          </p>
          <Link
            href={session ? "/api/auth/signout" : "/api/auth/signin"}
            className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
          >
            {session ? "Sign out" : "Sign in"}
          </Link>
        </div>
      </div>

      {session?.user && <LatestPost />}
    </HydrateClient>
    */
  );
}
