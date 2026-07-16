"use client";

import { useState } from "react";
import type { Company } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCompanies } from "@/hooks/useCompanies";
import { useToast } from "@/components/ui/Toast";
import { normalizeUrl } from "@/lib/format";
import { IconChevronDown } from "@/components/ui/Icons";

const OTHER = "__other__";

interface SoldModalProps {
  company: Company | null;
  onClose: () => void;
}

function SoldForm({ company, onClose }: { company: Company; onClose: () => void }) {
  const { markSold } = useCompanies();
  const { toast } = useToast();
  const existingDomain = company.final_domain;
  const [salePrice, setSalePrice] = useState(
    company.sale_price != null ? String(company.sale_price) : ""
  );
  const [monthlyFee, setMonthlyFee] = useState(
    company.monthly_fee != null ? String(company.monthly_fee) : "30"
  );
  const [domainChoice, setDomainChoice] = useState(() => {
    if (existingDomain && company.potential_domains.includes(existingDomain)) {
      return existingDomain;
    }
    if (existingDomain) return OTHER;
    return company.potential_domains[0] ?? OTHER;
  });
  const [customDomain, setCustomDomain] = useState(
    existingDomain && !company.potential_domains.includes(existingDomain) ? existingDomain : ""
  );
  const [finalUrl, setFinalUrl] = useState(company.final_url ?? "");
  const [saving, setSaving] = useState(false);

  const finalDomain = domainChoice === OTHER ? customDomain.trim() : domainChoice;
  const priceValue = Number(salePrice);
  const feeValue = Number(monthlyFee);
  const valid =
    salePrice !== "" &&
    Number.isFinite(priceValue) &&
    priceValue >= 0 &&
    monthlyFee !== "" &&
    Number.isFinite(feeValue) &&
    feeValue >= 0 &&
    finalDomain.length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    await markSold(company.id, {
      sale_price: priceValue,
      monthly_fee: feeValue,
      final_domain: finalDomain,
      final_url: finalUrl.trim() ? normalizeUrl(finalUrl) : normalizeUrl(finalDomain),
    });
    setSaving(false);
    toast(`${company.name} marked sold`, "success");
    onClose();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Input
        label="Sale price"
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        value={salePrice}
        onChange={(e) => setSalePrice(e.target.value)}
        placeholder="3500"
        required
      />
      <Input
        label="Monthly management fee"
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        value={monthlyFee}
        onChange={(e) => setMonthlyFee(e.target.value)}
        hint="Recurring hosting and management. Defaults to $30."
        required
      />
      <div>
        <label htmlFor="sold-domain" className="mb-1.5 block text-[13px] font-medium text-muted">
          Final domain
        </label>
        <div className="relative">
          <select
            id="sold-domain"
            value={domainChoice}
            onChange={(e) => setDomainChoice(e.target.value)}
            className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pr-9 pl-3.5 font-mono text-sm text-ink transition-colors focus:border-ember/50 focus:outline-none [&>option]:bg-void-raised"
          >
            {company.potential_domains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
            <option value={OTHER}>Another domain…</option>
          </select>
          <IconChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-faint" />
        </div>
        {domainChoice === OTHER && (
          <Input
            className="mt-2"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder="company.ky"
            aria-label="Custom final domain"
            required
          />
        )}
      </div>
      <Input
        label="Final live website URL"
        value={finalUrl}
        onChange={(e) => setFinalUrl(e.target.value)}
        placeholder={finalDomain ? `https://${finalDomain}` : "https://company.ky"}
        hint="Leave blank to use the final domain."
      />
      <div className="mt-1 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={!valid || saving}>
          {saving ? "Saving…" : "Confirm sale"}
        </Button>
      </div>
    </form>
  );
}

export function SoldModal({ company, onClose }: SoldModalProps) {
  return (
    <Modal
      open={company !== null}
      onClose={onClose}
      title={company ? `Mark ${company.name} sold` : "Mark sold"}
    >
      {company && <SoldForm key={company.id} company={company} onClose={onClose} />}
    </Modal>
  );
}
