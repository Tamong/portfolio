import Link from "next/link";
import { socialLinks } from "../config";
import { Instagram, GitHub, YouTube, LinkedIn, GMail } from "./icons";

export default function Footer() {
  return (
    <footer className="flex items-center justify-between py-4 text-white md:flex-row">
      <Link href="/">
        <h1 className="text-sm tracking-tight">© 2024 Philip Wallis</h1>
      </Link>
      <div className="flex gap-4">
        <Link href={socialLinks.github} target="_blank">
          <GitHub width={16} fill="#ffffff" />
        </Link>
        <Link href={socialLinks.instagram} target="_blank">
          <Instagram width={16} fill="#ffffff" />
        </Link>
        <Link href={socialLinks.linkedin} target="_blank">
          <LinkedIn width={16} fill="#ffffff" />
        </Link>
        <Link href={socialLinks.email} target="_blank">
          <GMail width={16} fill="#ffffff" />
        </Link>
        <Link href={socialLinks.youtube} target="_blank">
          <YouTube width={16} fill="#ffffff" />
        </Link>
      </div>
    </footer>
  );
}
