import Link from "next/link";

export default function Nav() {
  return (
    <div className="flex items-center justify-between p-4 md:flex-row">
      <Link href="/">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Philip Wallis
        </h1>
      </Link>
      <div className="flex gap-4">
        <Link href="/posts">
          <h3 className="text-md">Blog</h3>
        </Link>
        <Link href="/projects">
          <h3 className="text-md">Projects</h3>
        </Link>
        <Link href="/about">
          <h3 className="text-md">About</h3>
        </Link>
      </div>
    </div>
  );
}
