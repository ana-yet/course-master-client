"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import api from "@/lib/axios";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams ? searchParams.get("session_id") : null;

  const [status, setStatus] = useState("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus("error");
        setError("Invalid session");
        return;
      }

      try {
        await api.post("/payments/verify", { sessionId });
        setStatus("success");
      } catch (error) {
        setStatus("error");
        setError(
          error.response?.data?.message || "Payment verification failed"
        );
      }
    };

    // Only run effect on client side
    if (typeof window !== "undefined") {
      verifyPayment();
    }
  }, [sessionId]);

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">
            Verifying Payment...
          </h1>
          <p className="text-slate-500 mt-2">
            Please wait while we confirm your purchase
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-rose-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Payment Verification Failed
          </h1>
          <p className="text-slate-500 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.push("/")}>
              Go Home
            </Button>
            <Button onClick={() => router.push("/dashboard")}>
              My Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Payment Successful! 🎉
        </h1>
        <p className="text-slate-500 mb-8">
          Congratulations! You&apos;re now enrolled. Start learning right away!
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => router.push("/")}>
            Browse More
          </Button>
          <Button onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
