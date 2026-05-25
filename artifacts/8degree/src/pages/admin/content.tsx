import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api-base";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Section = {
  id: number;
  sectionKey: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  imageUrl: string | null;
  sortOrder: number;
  enabled: boolean;
};

export default function AdminContent() {
  const [sections, setSections] = useState<Section[]>([]);
  const [form, setForm] = useState({
    sectionKey: "",
    title: "",
    subtitle: "",
    body: "",
    ctaLabel: "",
    ctaHref: "",
    imageUrl: "",
    sortOrder: 0,
    enabled: true,
  });

  async function load() {
    const response = await fetch(apiUrl("/api/content/homepage-sections"));
    const data = await response.json();
    setSections(data.sections ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createSection() {
    await fetch(apiUrl("/api/content/homepage-sections"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...form,
        title: form.title || null,
        subtitle: form.subtitle || null,
        body: form.body || null,
        ctaLabel: form.ctaLabel || null,
        ctaHref: form.ctaHref || null,
        imageUrl: form.imageUrl || null,
        payload: {},
      }),
    });
    setForm({
      sectionKey: "",
      title: "",
      subtitle: "",
      body: "",
      ctaLabel: "",
      ctaHref: "",
      imageUrl: "",
      sortOrder: 0,
      enabled: true,
    });
    await load();
  }

  async function removeSection(id: number) {
    await fetch(apiUrl(`/api/content/homepage-sections/${id}`), { method: "DELETE" });
    await load();
  }

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="font-serif text-3xl mb-1">Homepage Content</h1>
      <p className="text-muted-foreground text-sm mb-6">Manage homepage sections and CTAs</p>

      <div className="bg-card border border-border p-6 mb-8 space-y-3">
        <Input placeholder="Section key (e.g. hero-main)" value={form.sectionKey} onChange={(e) => setForm((p) => ({ ...p, sectionKey: e.target.value }))} />
        <Input placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
        <Input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} />
        <Textarea placeholder="Body text" value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} />
        <Input placeholder="CTA label" value={form.ctaLabel} onChange={(e) => setForm((p) => ({ ...p, ctaLabel: e.target.value }))} />
        <Input placeholder="CTA href" value={form.ctaHref} onChange={(e) => setForm((p) => ({ ...p, ctaHref: e.target.value }))} />
        <Input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} />
        <Input type="number" placeholder="Sort order" value={String(form.sortOrder)} onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.enabled} onChange={(e) => setForm((p) => ({ ...p, enabled: e.target.checked }))} />
          Enabled
        </label>
        <Button onClick={() => void createSection()}>Add section</Button>
      </div>

      <div className="bg-card border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className="text-left px-4 py-3">Key</th>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Enabled</th>
              <th className="text-left px-4 py-3">Order</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <tr key={section.id} className="border-b border-border/60">
                <td className="px-4 py-3">{section.sectionKey}</td>
                <td className="px-4 py-3">{section.title ?? "-"}</td>
                <td className="px-4 py-3">{section.enabled ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{section.sortOrder}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="destructive" size="sm" onClick={() => void removeSection(section.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
