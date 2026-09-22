import { redirect } from "next/navigation";
import { getAppUser } from "@/lib/db/user";
import { ManagementNav } from "@/components/ManagementNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAppUser();
  if (!user) redirect("/auth");
  const hasAccess = user.role === "admin" || user.role === "superadmin";
  if (!hasAccess) redirect("/");
  return (
    <div className="management-shell">
      <ManagementNav
        superadmin={user.role === "superadmin"}
        name={user.full_name || "Admin"}
      />
      <div className="management-content">{children}</div>
    </div>
  );
}
