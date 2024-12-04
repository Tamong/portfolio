import Link from "next/link";
import { Instagram, GitHub, YouTube, LinkedIn } from "./icons";

const links = {
  website: "https://pwallis.com",
  github: "https://github.com/Tamong",
  instagram: "https://instagram.com/philip_wallis",
  youtube: "https://youtube.com/@ca9",
  linkedin: "https://www.linkedin.com/in/philip-wallis/",
};

export default function Footer() {
  return (
    <div className="flex items-center justify-between p-4 md:flex-row">
      <Link href="/">
        <h1 className="text-sm tracking-tight">© 2024 Philip Wallis</h1>
      </Link>
      <div className="flex gap-4">
        <Link href={links.github} target="_blank">
          <GitHub width={16} fill="#ffffff" />
        </Link>
        <Link href={links.instagram} target="_blank">
          <Instagram width={16} fill="#ffffff" />
        </Link>
        <Link href={links.linkedin} target="_blank">
          <LinkedIn width={16} fill="#ffffff" />
        </Link>
        <Link href={links.youtube} target="_blank">
          <YouTube width={16} fill="#ffffff" />
        </Link>
      </div>
    </div>
  );
}
