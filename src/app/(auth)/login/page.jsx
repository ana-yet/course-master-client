"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // For redirection
import toast from "react-hot-toast"; // For alerts
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { authService } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login(formData);
      console.log({ response });

      // Success
      toast.success(response.message || "Logged in successfully!");

      router.push("/"); // Redirect to Home
    } catch (error) {
      // Extract error message from Backend "ApiError" response
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
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
          value={formData.email}
          onChange={handleChange}
          required
        />

        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
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
