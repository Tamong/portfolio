import Link from "next/link";

export default function Nav() {
  return (
    <div className="flex items-center justify-between text-white md:flex-row">
      <Link href="/">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Philip Wallis
        </h1>
      </Link>
      <div className="flex gap-4">
        <Link href="/posts">
          <h2 className="text-md">Posts</h2>
        </Link>
        <Link href="/resume">
          <h2 className="text-md">Resume</h2>
        </Link>
      </div>
    </div>
  );
}
