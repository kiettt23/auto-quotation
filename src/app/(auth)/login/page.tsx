"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { LabeledField } from "@/components/shared/labeled-field";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn.email({ email, password });

    if (result.error) {
      setError(result.error.message ?? "Đăng nhập thất bại");
      setLoading(false);
      return;
    }

    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="mb-1">
        <h2 className="text-lg font-semibold text-slate-900">Đăng nhập</h2>
        <p className="text-xs text-slate-400">Nhập email và mật khẩu để tiếp tục</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      <LabeledField label="Email">
        <Input
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-9 text-sm"
        />
      </LabeledField>

      <LabeledField label="Mật khẩu">
        <Input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="h-9 text-sm"
        />
      </LabeledField>

      <Button type="submit" disabled={loading} className="mt-1 h-9 w-full gap-1.5 rounded-lg text-sm">
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>

      <p className="text-center text-xs text-slate-400">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
