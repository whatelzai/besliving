import { createServerSupabase } from "@/lib/supabase/server";

export default async function SuperadminPage() {
  const supabase = createServerSupabase();
  const { data: admins } = await supabase
    .from("users")
    .select("id, full_name, email, role")
    .in("role", ["admin", "superadmin"])
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-full bg-[#fefefe]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-[#e9e3f5] bg-white p-6">
          <h2 className="font-semibold text-[#8b6cb8]">Admins & superadmins</h2>
          {!admins?.length ? (
            <p className="mt-4 text-[#6b7280]">No admins yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {(admins ?? []).map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-[#e9e3f5] px-4 py-3"
                >
                  <div>
                    <span className="font-medium text-[#1f2937]">
                      {a.full_name || a.email || "Unknown"}
                    </span>
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        a.role === "superadmin"
                          ? "bg-[#b19cd9] text-white"
                          : "bg-[#fef3c7] text-[#d4a017]"
                      }`}
                    >
                      {a.role}
                    </span>
                  </div>

                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-6 text-sm text-[#6b7280]">
          Role changes are managed in the database. To promote a user to admin,
          update their <code className="rounded bg-[#e9e3f5] px-1">role</code> in
          the <code className="rounded bg-[#e9e3f5] px-1">users</code> table.
        </p>
      </div>
    </main>
  );
}
