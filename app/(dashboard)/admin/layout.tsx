import { redirect } from "next/navigation";
import { getAppUser } from "@/lib/db/user";
import { AdminSidebar } from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAppUser();
  if (!user) redirect("/auth");
  const hasAccess =
    user.role === "admin" ||
    user.role === "superadmin";
  if (!hasAccess) redirect("/");
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
