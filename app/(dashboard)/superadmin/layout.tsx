import { redirect } from "next/navigation";
import { getAppUser } from "@/lib/db/user";
import { ManagementNav } from "@/components/ManagementNav";

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAppUser();
  if (!user) redirect("/auth");
  const hasAccess = user.role === "superadmin";
  if (!hasAccess) redirect("/");
  return (
    <div className="management-shell">
      <ManagementNav superadmin name={user.full_name || "Superadmin"} />
      <div className="management-content">{children}</div>
    </div>
  );
}
