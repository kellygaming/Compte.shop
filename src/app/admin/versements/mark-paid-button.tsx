"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkPaidButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const response = await fetch(`/api/admin/orders/${orderId}/mark-paid`, { method: "POST" });
    if (response.ok) {
      router.refresh();
    } else {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-[10px] bg-accent px-4 py-2.5 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-60"
    >
      {loading ? "…" : "Marquer comme payé"}
    </button>
  );
}
