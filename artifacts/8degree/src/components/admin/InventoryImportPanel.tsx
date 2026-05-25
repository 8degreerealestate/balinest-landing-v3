import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiUrl } from "@/lib/api-base";

const sampleProjectImport = {
  project: {
    title: "New Development",
    slug: "new-development",
    status: "ongoing",
    area: "Canggu",
    propertyType: "Villa",
    bedroomsMin: 2,
    bedroomsMax: 4,
    priceFrom: 320000,
    currency: "USD",
    completionDate: "Q4 2027",
    shortDescription: "Luxury villas in Canggu",
    fullDescription: "Detailed marketing description",
    amenities: ["Pool", "Gym"],
    investmentHighlights: ["High ROI", "Prime location"],
    brochureUrl: null,
    heroImageUrl: null,
    featured: false,
    unitsLeft: 10,
  },
  units: [
    {
      unitName: "Type A-01",
      bedrooms: 2,
      bathrooms: 2,
      buildSize: 120,
      landSize: 200,
      price: 320000,
      currency: "USD",
      status: "available",
      floorplanUrl: null,
    },
  ],
};

const sampleListingUpsert = {
  listings: [
    {
      code: "8DV106A",
      title: "8DV106A | 8 Degree",
      listingUrl: null,
      description: "Short marketing copy or full paste (max 100k chars per row).",
      channel: "silent",
      sortOrder: 0,
    },
    {
      code: "8DV28",
      title: "Semesta Villas",
      listingUrl: null,
      description: "Use channel website to show this card on the public /projects portfolio.",
      channel: "website",
      sortOrder: 100,
    },
  ],
};

type Props = {
  onSuccess?: () => void;
};

export function InventoryImportPanel({ onSuccess }: Props) {
  const [mode, setMode] = useState<"project" | "crm">("crm");
  const [projectPayload, setProjectPayload] = useState(JSON.stringify(sampleProjectImport, null, 2));
  const [crmPayload, setCrmPayload] = useState(JSON.stringify(sampleListingUpsert, null, 2));
  const [message, setMessage] = useState("");

  async function importProjectPlusUnits() {
    setMessage("");
    try {
      const response = await fetch(apiUrl("/api/inventory/import"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: projectPayload,
      });
      const data = (await response.json()) as { error?: string; projectId?: string; unitsImported?: number };
      if (!response.ok) {
        setMessage(`Import failed: ${data.error ?? "Unknown error"}`);
        return;
      }
      setMessage(`Project created. ID ${data.projectId}, ${data.unitsImported ?? 0} units.`);
      onSuccess?.();
    } catch (error) {
      setMessage(`Import failed: ${(error as Error).message}`);
    }
  }

  async function upsertCrmListings() {
    setMessage("");
    try {
      const response = await fetch(apiUrl("/api/inventory/listings/upsert"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: crmPayload,
      });
      const data = (await response.json()) as { error?: string; upserted?: number };
      if (!response.ok) {
        setMessage(`Upsert failed: ${data.error ?? "Unknown error"}`);
        return;
      }
      setMessage(`Upserted ${data.upserted ?? 0} CRM listing row(s).`);
      onSuccess?.();
    } catch (error) {
      setMessage(`Upsert failed: ${(error as Error).message}`);
    }
  }

  return (
    <div className="flex flex-col gap-4 min-h-0">
      <p className="text-muted-foreground text-sm">
        Bulk-load CRM codes into Postgres.{" "}
        <span className="text-foreground/80">
          <code className="text-xs">website</code> rows appear on the public portfolio; <code className="text-xs">silent</code> stays
          internal.
        </span>
      </p>

      <div className="flex gap-2 flex-wrap shrink-0">
        <Button variant={mode === "crm" ? "default" : "outline"} className="rounded-none" onClick={() => setMode("crm")}>
          CRM listings upsert
        </Button>
        <Button variant={mode === "project" ? "default" : "outline"} className="rounded-none" onClick={() => setMode("project")}>
          Project + units (legacy)
        </Button>
      </div>

      {mode === "crm" ? (
        <>
          <p className="text-sm text-muted-foreground shrink-0">
            POST <code className="text-xs">/api/inventory/listings/upsert</code> (up to 500 rows per request).{" "}
            <code className="text-xs">listingUrl</code> must be a valid URL or omit / null. Re-run with the same{" "}
            <code className="text-xs">code</code> to update.
          </p>
          <Textarea
            className="min-h-[280px] max-h-[45vh] font-sans text-xs shrink-0"
            value={crmPayload}
            onChange={(e) => setCrmPayload(e.target.value)}
          />
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button onClick={() => void upsertCrmListings()}>Run CRM upsert</Button>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground shrink-0">Creates one development plus optional units (original flow).</p>
          <Textarea
            className="min-h-[280px] max-h-[45vh] font-sans text-xs shrink-0"
            value={projectPayload}
            onChange={(e) => setProjectPayload(e.target.value)}
          />
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button onClick={() => void importProjectPlusUnits()}>Run project import</Button>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
          </div>
        </>
      )}
    </div>
  );
}
