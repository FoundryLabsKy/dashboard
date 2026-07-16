"use client";

import { useState } from "react";
import type { Company } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useCompanies } from "@/hooks/useCompanies";
import { normalizeUrl } from "@/lib/format";

interface TodoEditModalProps {
  company: Company | null;
  onClose: () => void;
}

function EditForm({ company, onClose }: { company: Company; onClose: () => void }) {
  const { updateCompany } = useCompanies();
  const [name, setName] = useState(company.name);
  const [website, setWebsite] = useState(company.website ?? "");
  const [notes, setNotes] = useState(company.notes);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    void updateCompany(company.id, {
      name: name.trim(),
      website: website.trim() ? normalizeUrl(website) : null,
      notes,
    });
    onClose();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Input label="Company name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input
        label="Existing website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        placeholder="company.ky"
      />
      <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      <div className="mt-1 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={!name.trim()}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

export function TodoEditModal({ company, onClose }: TodoEditModalProps) {
  return (
    <Modal open={company !== null} onClose={onClose} title="Edit idea">
      {company && <EditForm key={company.id} company={company} onClose={onClose} />}
    </Modal>
  );
}
