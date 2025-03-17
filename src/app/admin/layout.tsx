import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/server/auth";
import { cn } from "@/lib/utils";
import { FileText, Edit } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();

  // Redirect if not authenticated
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // Redirect if user is signed in but not an admin
  if (session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/admin">
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            </Link>
          </div>
          <nav className="flex items-center space-x-4 lg:space-x-6">
            <AdminNavLink href="/admin/posts">
              <FileText className="mr-2 h-4 w-4" />
              Posts
            </AdminNavLink>
            <AdminNavLink href="/admin/editor">
              <Edit className="mr-2 h-4 w-4" />
              Editor
            </AdminNavLink>
          </nav>
          <div className="ml-auto flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  width={64}
                  height={64}
                  alt={session.user.name ?? "User"}
                  className="h-8 w-8 rounded-full"
                />
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

interface AdminNavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

function AdminNavLink({ href, children, className }: AdminNavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "text-muted-foreground hover:text-primary flex items-center text-sm font-medium transition-colors",
        className,
      )}
    >
      {children}
    </Link>
  );
}
