"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Building2,
  FileCheck,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
export function ManagementNav({
  superadmin,
  name,
}: {
  superadmin: boolean;
  name: string;
}) {
  const path = usePathname();
  const links = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/leads", label: "Leads", icon: Users },
    { href: "/admin/viewings", label: "Viewings", icon: CalendarDays },
    { href: "/admin/units", label: "Properties", icon: Building2 },
    ...(superadmin
      ? [{ href: "/superadmin", label: "Team & access", icon: ShieldCheck }]
      : []),
  ];
  return (
    <aside className="management-nav">
      <div className="workspace-person">
        <span className="person-avatar">{name.charAt(0)}</span>
        <div>
          <strong>{name}</strong>
          <small>{superadmin ? "Superadmin" : "Admin"}</small>
        </div>
      </div>
      <span className="nav-caption">WORKSPACE</span>
      <nav aria-label="Management navigation">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={
              (href === "/admin" ? path === href : path.startsWith(href))
                ? "page"
                : undefined
            }
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="nav-secondary">
        <span className="nav-caption">RESIDENT OPERATIONS</span>
        <Link
          href="/admin/tenancies"
          aria-current={
            path.startsWith("/admin/tenancies") ? "page" : undefined
          }
        >
          <FileCheck size={18} />
          Tenancies <small>Later</small>
        </Link>
      </div>
      <div className="nav-home-note">
        <span className="eyebrow">ONE HOME. MORE POSSIBILITY.</span>
        <p>Desa Aman</p>
        <Link href="/units/desa-aman">
          View the public listing <ArrowUpRight size={15} />
        </Link>
      </div>
    </aside>
  );
}
