"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Connect to Backend API
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="bg-white px-6 py-8 shadow-md rounded-xl border border-slate-200">
      <h3 className="mb-6 text-xl font-semibold text-slate-900">
        Create your account
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input id="name" label="Full Name" placeholder="John Doe" required />

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

        <Button
          type="submit"
          className="w-full"
          variant="primary"
          isLoading={isLoading}
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:text-primary-500 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
