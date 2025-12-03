"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Connect to Backend API here
    setTimeout(() => setIsLoading(false), 2000); // Simulate API
  };

  return (
    <div className="bg-white px-6 py-8 shadow-md rounded-xl border border-slate-200">
      <h3 className="mb-6 text-xl font-semibold text-slate-900">
        Sign in to your account
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="email"
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          required
        />

        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          required
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary-600 hover:text-primary-500 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
