"use client";

export default function AuthError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">Đã xảy ra lỗi. Vui lòng thử lại.</p>
      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
      >
        Thử lại
      </button>
    </div>
  );
}
