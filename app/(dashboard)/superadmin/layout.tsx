import { redirect } from "next/navigation";
import { getAppUser } from "@/lib/db/user";
import { SuperadminSidebar } from "@/components/SuperadminSidebar";

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAppUser();
  if (!user) redirect("/auth");
  const hasAccess =
    user.role === "superadmin";
  if (!hasAccess) redirect("/");
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <SuperadminSidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
