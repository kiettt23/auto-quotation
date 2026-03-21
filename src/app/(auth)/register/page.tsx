"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signUp.email({ name, email, password });

    if (result.error) {
      setError(result.error.message ?? "Đăng ký thất bại");
      setLoading(false);
      return;
    }

    router.push("/onboarding");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900">Đăng ký</h1>
        <p className="text-sm text-slate-500">
          Tạo tài khoản để bắt đầu sử dụng
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Họ và tên</Label>
        <Input
          id="name"
          type="text"
          placeholder="Nguyễn Văn A"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          type="password"
          placeholder="Tối thiểu 8 ký tự"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Đang đăng ký..." : "Đăng ký"}
      </Button>

      <p className="text-center text-sm text-indigo-500">
        <Link href="/login">Đã có tài khoản? Đăng nhập</Link>
      </p>
    </form>
  );
}
