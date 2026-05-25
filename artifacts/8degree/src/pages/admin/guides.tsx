import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api-base";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Guide = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  fileUrl: string;
  coverImageUrl: string | null;
  featured: boolean;
};

export default function AdminGuides() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    fileUrl: "",
    coverImageUrl: "",
    featured: false,
  });

  async function load() {
    setLoading(true);
    const response = await fetch(apiUrl("/api/guides"));
    const data = await response.json();
    setGuides(data.guides ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createGuide() {
    await fetch(apiUrl("/api/guides"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...form,
        slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-"),
        description: form.description || null,
        coverImageUrl: form.coverImageUrl || null,
      }),
    });
    setForm({
      title: "",
      slug: "",
      description: "",
      fileUrl: "",
      coverImageUrl: "",
      featured: false,
    });
    await load();
  }

  async function removeGuide(id: number) {
    await fetch(apiUrl(`/api/guides/${id}`), { method: "DELETE" });
    await load();
  }

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="font-serif text-3xl mb-1">Downloadable Guides</h1>
      <p className="text-muted-foreground text-sm mb-6">Manage investor guide files and URLs</p>

      <div className="bg-card border border-border p-6 mb-8 space-y-3">
        <Input placeholder="Guide title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
        <Input placeholder="Slug (optional)" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
        <Input placeholder="PDF/File URL" value={form.fileUrl} onChange={(e) => setForm((p) => ({ ...p, fileUrl: e.target.value }))} />
        <Input placeholder="Cover image URL (optional)" value={form.coverImageUrl} onChange={(e) => setForm((p) => ({ ...p, coverImageUrl: e.target.value }))} />
        <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} />
          Featured guide
        </label>
        <Button onClick={() => void createGuide()}>Add guide</Button>
      </div>

      <div className="bg-card border border-border">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-left px-4 py-3">Featured</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guides.map((guide) => (
                <tr key={guide.id} className="border-b border-border/60">
                  <td className="px-4 py-3">{guide.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{guide.slug}</td>
                  <td className="px-4 py-3">{guide.featured ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="destructive" size="sm" onClick={() => void removeGuide(guide.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
