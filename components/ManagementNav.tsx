"use client";
import { Translated } from "@/components/preferences/Translated";

import { Localized, Text } from "@/components/preferences/Localized";
import Link from "@/components/preferences/LocalizedLink";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarDays, Building2, FileCheck, ShieldCheck, ArrowUpRight, } from "lucide-react";
export function ManagementNav({ superadmin, name, }: {
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
    return (<aside className="management-nav">
      <div className="workspace-person">
        <span className="person-avatar"><Localized>{name.charAt(0)}</Localized></span>
        <div>
          <strong translate="no">{name}</strong>
          <small><Localized>{superadmin ? "Superadmin" : "Admin"}</Localized></small>
        </div>
      </div>
      <span className="nav-caption"><Text>WORKSPACE</Text></span>
      <Translated as="nav" aria-label="Management navigation">
        <Localized>{links.map(({ href, label, icon: Icon }) => (<Link key={href} href={href} aria-current={(href === "/admin" ? path === href : path.startsWith(href))
                ? "page"
                : undefined}>
            <Icon size={18}/>
            <Localized>{label}</Localized>
          </Link>))}</Localized>
      </Translated>
      <div className="nav-secondary">
        <span className="nav-caption"><Text>RESIDENT OPERATIONS</Text></span>
        <Link href="/admin/tenancies" aria-current={path.startsWith("/admin/tenancies") ? "page" : undefined}>
          <FileCheck size={18}/><Text>
          Tenancies
        </Text></Link>
      </div>
      <div className="nav-home-note">
        <span className="eyebrow"><Text>ONE HOME. MORE POSSIBILITY.</Text></span>
        <p><Text>Desa Aman</Text></p>
        <Link href="/units/desa-aman"><Text>
          View the public listing </Text><ArrowUpRight size={15}/>
        </Link>
      </div>
    </aside>);
}
