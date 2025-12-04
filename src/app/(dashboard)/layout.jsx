"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, LogOut, BookOpen, User, ClipboardCheck } from "lucide-react";
import Button from "@/components/ui/Button";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const router = useRouter();

  console.log({ user });

  // Protect the route
  if (!user) {
    // TODO: use a loading spinner or server-side redirect
    // For now, this simple check works with Client Components
    return null;
  }

  const navItems = [
    { href: "/dashboard", label: "My Learning", icon: BookOpen },
    { href: "/dashboard/profile", label: "Profile", icon: User },
  ];

  // Admin Links (Only visible if admin)
  if (user.role === "admin") {
    navItems.push(
      {
        href: "/admin",
        label: "Admin Dashboard",
        icon: LayoutDashboard,
      },
      {
        href: "/admin/courses",
        label: "Manage Courses",
        icon: BookOpen,
      },
      {
        href: "/admin/assignments",
        label: "Review Assignments",
        icon: ClipboardCheck,
      }
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* --- Sidebar (Desktop) --- */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-slate-200 bg-white shadow-sm md:flex">
        {/* Logo Area */}
        <div className="flex h-16 items-center border-b border-slate-100 px-6">
          <Link href="/" className="text-xl font-bold text-primary-600">
            CourseMaster
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "text-primary-600" : "text-slate-400"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-slate-100 p-4">
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
              {user.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-medium text-slate-900">
                {user.name}
              </p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 md:pl-64">
        <div className="container mx-auto max-w-5xl p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
