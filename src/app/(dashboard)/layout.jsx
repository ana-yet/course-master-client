"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  LogOut,
  BookOpen,
  User,
  ClipboardCheck,
  Menu,
  X,
  Loader2,
  ShieldX,
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    if (typeof window !== "undefined") {
      router.push("/login");
    }
    return null;
  }

  // Check if current path is admin route
  const isAdminRoute = pathname.startsWith("/admin");

  // Protect admin routes - only admin can access
  if (isAdminRoute && user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md">
          <ShieldX className="w-16 h-16 text-rose-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Access Denied
          </h1>
          <p className="text-slate-500 mb-6">
            You don't have permission to access this page. Only administrators
            can view this content.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Build navigation items based on role
  const studentNavItems = [
    { href: "/dashboard", label: "My Learning", icon: BookOpen },
    { href: "/dashboard/profile", label: "Profile", icon: User },
  ];

  const adminNavItems = [
    { href: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
    { href: "/admin/courses", label: "Manage Courses", icon: BookOpen },
    {
      href: "/admin/assignments",
      label: "Review Assignments",
      icon: ClipboardCheck,
    },
  ];

  // Show different nav based on current section
  const navItems = isAdminRoute
    ? [...adminNavItems, { href: "/dashboard", label: "Student View", icon: User }]
    : user.role === "admin"
    ? [...studentNavItems, { href: "/admin", label: "Admin Panel", icon: LayoutDashboard }]
    : studentNavItems;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* --- Mobile Header --- */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <Link href="/" className="text-xl font-bold text-primary-600">
          CourseMaster
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* --- Mobile Menu Overlay --- */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* --- Sidebar --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-slate-200 bg-white shadow-sm transition-transform duration-300 md:translate-x-0 md:flex ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Area */}
        <div className="flex h-16 items-center border-b border-slate-100 px-6">
          <Link href="/" className="text-xl font-bold text-primary-600">
            CourseMaster
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                item.href !== "/admin" &&
                pathname.startsWith(item.href));
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
                  className={`h-5 w-5 flex-shrink-0 ${
                    isActive ? "text-primary-600" : "text-slate-400"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-slate-100 p-4">
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
              {user.name?.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
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
      <main className="flex-1 pt-16 md:pt-0 md:pl-64">
        <div className="container mx-auto max-w-5xl p-4 md:p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
