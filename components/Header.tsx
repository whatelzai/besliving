import { getAppUser } from "@/lib/db/user";
import { HeaderClient } from "./HeaderClient";
export async function Header() {
  const user = await getAppUser();
  return <HeaderClient role={user?.role ?? null} />;
}
