"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ArrowUpRight, Eye, ArrowLeft, ShieldCheck } from "lucide-react";
export function HeaderClient({
  role,
}: {
  role: "admin" | "superadmin" | "user" | null;
}) {
  const path = usePathname();
  const staff = role === "admin" || role === "superadmin";
  const managing = path.startsWith("/admin") || path.startsWith("/superadmin");
  const publicPage =
    path === "/" ||
    path === "/about" ||
    path === "/catalogue" ||
    path.startsWith("/units") ||
    path === "/viewing";
  const browsing = staff && publicPage;
  return (
    <>
      <header className="living-header">
        <div className="living-container header-inner">
          <Link href="/" className="living-brand" aria-label="BesLiving home">
            <span className="brand-mark" aria-hidden="true">
              b.
            </span>
            besliving<span className="brand-period">.</span>
          </Link>
          {managing ? (
            <span className="workspace-label">
              <ShieldCheck size={16} />
              {role === "superadmin" ? "Superadmin" : "Admin"} workspace
            </span>
          ) : (
            <nav aria-label="Main navigation">
              <Link
                href="/catalogue"
                aria-current={
                  path.startsWith("/units") || path === "/catalogue"
                    ? "page"
                    : undefined
                }
              >
                Our homes
              </Link>
              <Link
                href="/viewing"
                aria-current={path === "/viewing" ? "page" : undefined}
              >
                Book a viewing
              </Link>
              <Link
                href="/about"
                aria-current={path === "/about" ? "page" : undefined}
              >
                Our story
              </Link>
            </nav>
          )}
          <div className="header-account">
            {staff &&
              (managing ? (
                <Link className="header-signin" href="/">
                  <Eye size={16} />
                  Browse as visitor
                </Link>
              ) : (
                <Link className="header-signin staff-return" href="/admin">
                  <ArrowLeft size={16} />
                  {browsing ? "Exit anonymous browsing" : "Admin dashboard"}
                </Link>
              ))}
            <SignedOut>
              <Link href="/auth" className="header-signin">
                Sign in <ArrowUpRight size={15} />
              </Link>
            </SignedOut>
            <SignedIn>
              {!staff && (
                <Link className="header-signin" href="/user">
                  My home
                </Link>
              )}
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>
      {browsing && (
        <div className="visitor-banner">
          <Eye size={15} />
          <span>
            Anonymous browsing{" "}
            <span className="visitor-detail">
              — previewing the visitor experience. You’re still signed in.
            </span>
          </span>
          <Link href="/admin">
            Back to dashboard <ArrowUpRight size={14} />
          </Link>
        </div>
      )}
    </>
  );
}
