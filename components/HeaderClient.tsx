"use client";
import { Translated } from "@/components/preferences/Translated";

import { Localized, Text } from "@/components/preferences/Localized";
import { PreferenceControls } from "./preferences/PreferenceControls";
import Link from "@/components/preferences/LocalizedLink";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ArrowUpRight, Eye, ArrowLeft, ShieldCheck } from "lucide-react";
export function HeaderClient({ role, }: {
    role: "admin" | "superadmin" | "user" | null;
}) {
    const path = usePathname();
    const staff = role === "admin" || role === "superadmin";
    const managing = path.startsWith("/admin") || path.startsWith("/superadmin");
    const publicPage = path === "/" ||
        path === "/about" ||
        path === "/catalogue" ||
        path.startsWith("/units") ||
        path === "/viewing";
    const browsing = staff && publicPage;
    return (<>
      <header className="living-header">
        <div className="living-container header-inner">
          <Link href="/" className="living-brand" aria-label="BesLiving home">
            <span className="brand-mark" aria-hidden="true"><Text>
              b.
            </Text></span><Text>
            besliving</Text><span className="brand-period"><Text>.</Text></span>
          </Link>
          <Localized>{managing ? (<span className="workspace-label">
              <ShieldCheck size={16}/>
              <Localized>{role === "superadmin" ? "Superadmin" : "Admin"}</Localized><Text> workspace
            </Text></span>) : (<Translated as="nav" aria-label="Main navigation">
              <Link href="/catalogue" aria-current={path.startsWith("/units") || path === "/catalogue"
                ? "page"
                : undefined}><Text>
                Our homes
              </Text></Link>
              <Link href="/viewing" aria-current={path === "/viewing" ? "page" : undefined}><Text>
                Book a viewing
              </Text></Link>
              <Link href="/about" aria-current={path === "/about" ? "page" : undefined}><Text>
                Our story
              </Text></Link>
            </Translated>)}</Localized>
          <div className="header-account">
            <PreferenceControls />
            <Localized>{staff &&
            (managing ? (<Link className="header-signin" href="/">
                  <Eye size={16}/><Text>
                  Browse as visitor
                </Text></Link>) : (<Link className="header-signin staff-return" href="/admin">
                  <ArrowLeft size={16}/>
                  <Localized>{browsing ? "Exit anonymous browsing" : "Admin dashboard"}</Localized>
                </Link>))}</Localized>
            <SignedOut>
              <Link href="/auth" className="header-signin"><Text>
                Sign in </Text><ArrowUpRight size={15}/>
              </Link>
            </SignedOut>
            <SignedIn>
              <Localized>{!staff && (<Link className="header-signin" href="/user"><Text>
                  My home
                </Text></Link>)}</Localized>
              <UserButton afterSignOutUrl="/"/>
            </SignedIn>
          </div>
        </div>
      </header>
      <Localized>{browsing && (<div className="visitor-banner">
          <Eye size={15}/>
          <span><Text>
            Anonymous browsing</Text><Localized>{" "}</Localized>
            <span className="visitor-detail"><Text>
              — previewing the visitor experience. You’re still signed in.
            </Text></span>
          </span>
          <Link href="/admin"><Text>
            Back to dashboard </Text><ArrowUpRight size={14}/>
          </Link>
        </div>)}</Localized>
    </>);
}
