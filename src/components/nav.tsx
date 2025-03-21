import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Nav() {
  return (
    <nav className="mb-8 flex items-center justify-between text-white md:flex-row">
      <Link href="/">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Philip Wallis
        </h1>
      </Link>
      <div className="flex">
        <Link prefetch={true} href="/games">
          <Button variant="link">Games</Button>
        </Link>
        <Link prefetch={true} href="/posts">
          <Button variant="link">Posts</Button>
        </Link>
        <Link prefetch={true} href="/resume">
          <Button variant="link">Resume</Button>
        </Link>
      </div>
    </nav>
  );
}
