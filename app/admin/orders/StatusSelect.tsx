"use client";

import { useMemo, useState } from "react";
import { OrderStatus, prettyStatus } from "@/lib/orderStatus";

const ADMIN_EDITABLE_STATUSES: OrderStatus[] = [
  "PAID",
  "SENT_TO_PRINTFUL",
  "IN_PRODUCTION",
  "SHIPPED",
  "CANCELLED",
  "FAILED",
];

type Props = {
  orderId: string;
  currentStatus: string | null | undefined;
  adminToken: string;
};

export function StatusSelect({ orderId, currentStatus, adminToken }: Props) {
  const [status, setStatus] = useState<string>(currentStatus ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const options = useMemo(() => {
    const normalized = (currentStatus ?? "").toString().toUpperCase();
    const currentOption = normalized && !ADMIN_EDITABLE_STATUSES.includes(normalized as OrderStatus)
      ? (normalized as OrderStatus)
      : undefined;

    const baseOptions = ADMIN_EDITABLE_STATUSES;
    if (currentOption && !baseOptions.includes(currentOption)) {
      return [currentOption, ...baseOptions];
    }
    return baseOptions;
  }, [currentStatus]);

  async function updateStatus(newStatus: string) {
    setStatus(newStatus);
    setError(null);
    setSuccess(null);

    if (!newStatus) return;

    setIsSaving(true);
    try {
      const res = await fetch(
        `/api/admin/orders/${orderId}/status?token=${encodeURIComponent(adminToken)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, status: newStatus }),
        }
      );

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? "Failed to update status");
      } else {
        setSuccess("Updated");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        className="rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        value={status}
        onChange={(e) => updateStatus(e.target.value)}
        disabled={isSaving}
      >
        <option value="">-- set status --</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {prettyStatus(opt)}
          </option>
        ))}
      </select>
      {isSaving ? (
        <span className="text-xs text-zinc-400">Saving…</span>
      ) : success ? (
        <span className="text-xs text-emerald-300">{success}</span>
      ) : error ? (
        <span className="text-xs text-rose-300">{error}</span>
      ) : null}
    </div>
  );
}
