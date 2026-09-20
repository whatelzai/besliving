"use client";

import { usePersistedCollapse } from "@/lib/hooks/use-persisted-collapse";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  ClipboardList,
  Building2,
  FileCheck,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const superadminLinks = [
  { href: "/superadmin", label: "Manage Users", icon: Users },
  { href: "/admin/waitlist", label: "Waitlist", icon: ClipboardList },
  { href: "/admin/units", label: "Units", icon: Building2 },
  { href: "/admin/tenancies", label: "Tenancies", icon: FileCheck },
  { href: "/admin/design-system", label: "Design System", icon: Palette },
];

const STORAGE_KEY = "superadmin-sidebar-collapsed";

export function SuperadminSidebar() {
  const pathname = usePathname();
  const [collapsed, toggle] = usePersistedCollapse(STORAGE_KEY);

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-[#e9e3f5] bg-white transition-[width] ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {superadminLinks.map((link) => {
          const isActive =
            link.href === "/superadmin"
              ? pathname === "/superadmin" || pathname?.startsWith("/superadmin/")
              : pathname === link.href || pathname?.startsWith(link.href + "/");
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              title={collapsed ? link.label : undefined}
              className={`flex items-center gap-3 rounded-lg border-l-4 px-3 py-2 text-sm font-medium transition-colors ${
                collapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "border-[#b19cd9] bg-[#e9e3f5]/50 text-[#8b6cb8]"
                  : "border-transparent text-[#6b7280] hover:border-[#e9e3f5] hover:bg-[#e9e3f5]/30 hover:text-[#1f2937]"
              }`}
            >
              <Icon className="size-5 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="mb-4 flex items-center justify-center gap-2 self-center rounded-lg p-2 text-[#6b7280] transition-colors hover:bg-[#e9e3f5]/50 hover:text-[#8b6cb8]"
      >
        {collapsed ? (
          <PanelLeftOpen className="size-5" />
        ) : (
          <>
            <PanelLeftClose className="size-5" />
            <span className="text-sm">Collapse</span>
          </>
        )}
      </button>
    </aside>
  );
}
