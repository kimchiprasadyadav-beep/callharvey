import Link from "next/link";
import { Phone, Settings, LayoutDashboard, List, MessageSquare } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { LogoutButton } from "./logout-button";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/calls", label: "Call History", icon: List },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border p-4 flex flex-col shrink-0">
        <Link href="/" className="flex items-center gap-2 mb-6 px-3">
          <Phone className="w-5 h-5 text-accent" />
          <span className="font-semibold text-white">Call Harvey</span>
        </Link>
        <div className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-surface transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>

        {/* User info */}
        {user && (
          <div className="border-t border-border pt-4 mt-4">
            <p className="text-xs text-muted truncate px-3 mb-2" title={user.email}>
              {user.email}
            </p>
            <LogoutButton />
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
