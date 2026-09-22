"use client";

import { usePersistedCollapse } from "@/lib/hooks/use-persisted-collapse";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Building2,
  FileCheck,
  CalendarDays,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const adminLinks = [
  { href: "/admin/leads", label: "Leads", icon: ClipboardList },
  { href: "/admin/viewings", label: "Viewings", icon: CalendarDays },
  { href: "/admin/units", label: "Units", icon: Building2 },
  { href: "/admin/tenancies", label: "Tenancies (later)", icon: FileCheck },
];

const STORAGE_KEY = "admin-sidebar-collapsed";

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, toggle] = usePersistedCollapse(STORAGE_KEY);

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-[#e9e3f5] bg-white transition-[width] ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {adminLinks.map((link) => {
          const isActive =
            pathname === link.href || pathname?.startsWith(link.href + "/");
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
                  ? "border-[#2ec4b6] bg-[#a7f3ec]/30 text-[#1a9b8f]"
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
