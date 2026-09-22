"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ArrowUpRight } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const management =
    pathname.startsWith("/admin") || pathname.startsWith("/superadmin");
  return (
    <header className="living-header">
      <div className="living-container header-inner">
        <Link href="/" className="living-brand" aria-label="BesLiving home">
          <span className="brand-mark" aria-hidden="true">
            b.
          </span>
          besliving<span className="brand-period">.</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link
            href="/catalogue"
            aria-current={
              pathname.startsWith("/catalogue") || pathname.startsWith("/units")
                ? "page"
                : undefined
            }
          >
            Our homes
          </Link>
          <Link href="/viewing">Book a viewing</Link>
          <Link
            href="/about"
            aria-current={pathname === "/about" ? "page" : undefined}
          >
            Our story
          </Link>
          {management && <Link href="/admin">Manage</Link>}
        </nav>
        <div className="header-account">
          <SignedOut>
            <Link href="/auth" className="header-signin">
              Sign in <ArrowUpRight size={15} />
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/user" className="header-signin">
              My account
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
