"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useCompanies } from "@/hooks/useCompanies";
import { useToast } from "@/components/ui/Toast";
import { normalizeUrl } from "@/lib/format";
import { AutofillButton } from "./AutofillButton";

interface AddCompanyModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddCompanyModal({ open, onClose }: AddCompanyModalProps) {
  const { addCompany } = useCompanies();
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName("");
    setIndustry("");
    setContact("");
    setWebsite("");
    setNotes("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    const company = await addCompany({
      name: name.trim(),
      industry,
      contact,
      website: website ? normalizeUrl(website) : "",
      notes,
    });
    setSaving(false);
    if (company) {
      toast(`Added ${company.name}`, "success");
      reset();
      onClose();
      router.push(`/app/company?id=${company.id}`);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add company">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex items-end gap-2">
          <Input
            label="Company name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Coral Reef Dive Shop"
            required
            className="min-w-0 flex-1"
          />
          <AutofillButton
            name={name}
            className="shrink-0"
            onResult={(r) => {
              if (r.industry) setIndustry(r.industry);
              if (r.contact) setContact(r.contact);
              if (r.website) setWebsite(r.website);
              if (r.summary) setNotes(r.summary);
            }}
          />
        </div>
        <Input
          label="Industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder="Tourism & Watersports"
        />
        <Input
          label="Contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Name, phone, or email"
        />
        <Input
          label="Existing website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="coralreefdivers.ky"
        />
        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What's the angle for this one?"
          rows={3}
        />
        <div className="mt-1 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!name.trim() || saving}>
            {saving ? "Adding…" : "Add company"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
