"use client";

import Link from "next/link";
import type { Company } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { IconExternal } from "@/components/ui/Icons";

const FUTURE_COLUMNS = ["Renewal", "SSL", "Hosting", "Last update"];

export function ClientTable({ clients }: { clients: Company[] }) {
  return (
    <div className="glass overflow-x-auto">
      <table className="w-full min-w-max text-left text-sm">
        <thead>
          <tr className="border-b border-white/8">
            {["Company", "Final domain", "Live site", "Sale price", "Monthly fee", "Status", ...FUTURE_COLUMNS].map(
              (col) => (
                <th
                  key={col}
                  className="px-5 py-3.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-faint"
                >
                  {col}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr
              key={client.id}
              className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]"
            >
              <td className="px-5 py-3.5">
                <Link
                  href={`/company/${client.id}`}
                  className="font-semibold text-ink transition-colors hover:text-ember"
                >
                  {client.name}
                </Link>
              </td>
              <td className="px-5 py-3.5 font-mono text-xs text-muted">
                {client.final_domain ?? "—"}
              </td>
              <td className="px-5 py-3.5">
                {client.final_url ? (
                  <a
                    href={client.final_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-ember"
                  >
                    {client.final_url.replace(/^https?:\/\//, "")}
                    <IconExternal className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-faint">—</span>
                )}
              </td>
              <td className="px-5 py-3.5 font-mono text-xs text-stage-sold">
                {client.sale_price != null ? formatCurrency(client.sale_price) : "—"}
              </td>
              <td className="px-5 py-3.5 font-mono text-xs text-ink">
                {client.monthly_fee != null ? `${formatCurrency(client.monthly_fee)}/mo` : "—"}
              </td>
              <td className="px-5 py-3.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-stage-sold/30 bg-stage-sold/10 px-2.5 py-1 text-[11px] font-medium text-stage-sold">
                  <span className="h-1.5 w-1.5 rounded-full bg-stage-sold" />
                  Active
                </span>
              </td>
              {FUTURE_COLUMNS.map((col) => (
                <td key={col} className="px-5 py-3.5 text-faint">
                  —
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
