"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary-600">
          CourseMaster
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm font-medium text-slate-700">
                Hi, {user.name}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
