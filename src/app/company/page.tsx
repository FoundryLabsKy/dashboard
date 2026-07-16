"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CompanyWorkspace } from "@/components/company/CompanyWorkspace";
import { Skeleton } from "@/components/ui/Skeleton";

// The company id lives in the query string (?id=...) so the app can be
// statically exported and hosted on GitHub Pages.
function CompanyFromQuery() {
  const id = useSearchParams().get("id") ?? "";
  return <CompanyWorkspace id={id} />;
}

export default function CompanyPage() {
  return (
    <Suspense fallback={<Skeleton className="mt-8 h-96" />}>
      <CompanyFromQuery />
    </Suspense>
  );
}
