import { Localized } from "@/components/preferences/Localized";
import Link from "@/components/preferences/LocalizedLink";
type DashboardLayoutProps = {
    role: "user" | "admin";
    title: string;
    children: React.ReactNode;
};
const roleConfig = {
    user: {
        links: [
            { href: "/user", label: "Overview" },
            { href: "/user/waitlist", label: "Waitlist" },
        ],
        color: "turquoise",
    },
    admin: {
        links: [
            { href: "/admin", label: "Dashboard" },
            { href: "/admin/units", label: "Units" },
            { href: "/admin/users", label: "Users" },
        ],
        color: "yellow",
    },
};
export function DashboardLayout({ role, title, children, }: DashboardLayoutProps) {
    const config = roleConfig[role];
    const accent = config.color === "turquoise"
        ? "border-[#2ec4b6] text-[#2ec4b6] hover:bg-[#a7f3ec]/30"
        : "border-[#f4d35e] text-[#d4a017] hover:bg-[#fef3c7]";
    return (<div className="flex min-h-[calc(100vh-4rem)] bg-[#fefefe]">
      <aside className="w-56 border-r border-[#e9e3f5] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#1f2937]"><Localized>{title}</Localized></h2>
        <nav className="mt-6 space-y-1">
          <Localized>{config.links.map((link) => (<Link key={link.href} href={link.href} className={`block rounded-lg border-l-4 px-4 py-2 text-sm font-medium ${accent}`}>
              <Localized>{link.label}</Localized>
            </Link>))}</Localized>
        </nav>
      </aside>
      <main className="flex-1 p-8"><Localized>{children}</Localized></main>
    </div>);
}
