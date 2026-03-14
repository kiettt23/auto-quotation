"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signUp } from "@/auth/client";
import { acceptInviteAction } from "./actions";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signUp.email({ name, email, password });
      if (result.error) {
        setError(result.error.message ?? "Đăng ký thất bại");
        return;
      }

      // If registering via invite link, accept the invite
      if (inviteToken) {
        await acceptInviteAction(inviteToken);
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Đã xảy ra lỗi không mong muốn");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-8 shadow-sm">
      <h1 className="mb-2 text-2xl font-bold text-foreground">Tạo tài khoản</h1>
      {inviteToken && (
        <p className="mb-5 text-sm text-primary bg-primary/10 rounded-md px-3 py-2">
          Bạn đang đăng ký qua lời mời. Tài khoản sẽ được tự động thêm vào nhóm sau khi đăng ký.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">
            Họ và tên
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Nguyễn Văn A"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">
            Mật khẩu
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Tối thiểu 8 ký tự"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Đang tạo tài khoản…" : "Tạo tài khoản"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <a href="/login" className="text-primary hover:underline">
          Đăng nhập
        </a>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="rounded-xl border bg-card p-8 shadow-sm">Đang tải…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
