"use client";

import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-surface transition-colors w-full"
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </button>
  );
}
