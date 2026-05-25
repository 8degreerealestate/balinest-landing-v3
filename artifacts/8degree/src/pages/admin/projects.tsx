import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, CheckCircle, X } from "lucide-react";
import {
  useListProjects,
  useListInventoryListings,
  useCreateProject,
  useDeleteProject,
  getListProjectsQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminProjects() {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useListProjects({ limit: 50 });
  const projects = data?.projects ?? [];
  const { data: invWebsite } = useListInventoryListings({ channel: "website", limit: 2000, offset: 0 });
  const { data: invSilent } = useListInventoryListings({ channel: "silent", limit: 2000, offset: 0 });
  const websiteRows = invWebsite?.listings ?? [];
  const silentRows = invSilent?.listings ?? [];
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    title: "", slug: "", status: "ongoing", area: "", propertyType: "Villa",
    bedroomsMin: 2, bedroomsMax: 3, priceFrom: 300000, currency: "USD",
    completionDate: "", shortDescription: "", fullDescription: "",
    amenities: "", investmentHighlights: "", heroImageUrl: "", featured: false, unitsLeft: "",
  });

  const handleCreate = async () => {
    try {
      await createProject.mutateAsync({
        data: {
          title: form.title,
          slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          status: form.status as "ongoing" | "completed" | "upcoming",
          area: form.area,
          propertyType: form.propertyType,
          bedroomsMin: Number(form.bedroomsMin),
          bedroomsMax: Number(form.bedroomsMax),
          priceFrom: Number(form.priceFrom),
          currency: form.currency,
          completionDate: form.completionDate || null,
          shortDescription: form.shortDescription,
          fullDescription: form.fullDescription,
          amenities: form.amenities.split('\n').filter(Boolean),
          investmentHighlights: form.investmentHighlights.split('\n').filter(Boolean),
          heroImageUrl: form.heroImageUrl || null,
          featured: form.featured,
          unitsLeft: form.unitsLeft ? Number(form.unitsLeft) : null,
          brochureUrl: null,
        },
      });
      qc.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      toast({ title: "Project created" });
      setShowForm(false);
    } catch {
      toast({ title: "Error creating project", variant: "destructive" });
    }
  };

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteProject.mutateAsync({ slug });
      qc.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      toast({ title: "Project deleted" });
    } catch {
      toast({ title: "Error deleting project", variant: "destructive" });
    }
  };

  const statusBadge = (status: string) => {
    const classes = { ongoing: "bg-blue-100 text-blue-800", completed: "bg-green-100 text-green-800", upcoming: "bg-yellow-100 text-yellow-800" };
    return <span className={`text-[10px] uppercase tracking-wider px-2 py-1 font-medium ${classes[status as keyof typeof classes] ?? ''}`}>{status}</span>;
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl mb-1">Projects</h1>
          <p className="text-muted-foreground text-sm">
            {projects.length} developments · {websiteRows.length} website CRM · {silentRows.length} silent CRM
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            The public <a href="/projects" className="underline hover:text-primary">portfolio</a> merges ongoing developments with website-channel
            inventory. Use{" "}
            <a href="/admin/inventory#import-import" className="underline hover:text-primary">Inventory Import</a> to bulk upsert codes.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="rounded-none tracking-widest uppercase" data-testid="button-new-project">
          <Plus size={16} className="mr-2" />
          New Project
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-medium">New Development</h2>
            <button onClick={() => setShowForm(false)}><X size={18} /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input placeholder="Title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="rounded-none" data-testid="input-project-title" />
            <Input placeholder="Slug (auto-generated)" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} className="rounded-none" />
            <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
              <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Area (e.g. Seminyak)" value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} className="rounded-none" />
            <Input placeholder="Price From (USD)" type="number" value={form.priceFrom} onChange={e => setForm(p => ({ ...p, priceFrom: Number(e.target.value) }))} className="rounded-none" />
            <Input placeholder="Completion Date (e.g. Q2 2027)" value={form.completionDate} onChange={e => setForm(p => ({ ...p, completionDate: e.target.value }))} className="rounded-none" />
            <Input placeholder="Units Left" type="number" value={form.unitsLeft} onChange={e => setForm(p => ({ ...p, unitsLeft: e.target.value }))} className="rounded-none" />
            <Input placeholder="Hero Image URL" value={form.heroImageUrl} onChange={e => setForm(p => ({ ...p, heroImageUrl: e.target.value }))} className="rounded-none" />
          </div>
          <Textarea placeholder="Short Description" value={form.shortDescription} onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))} className="rounded-none resize-none h-20 mt-4" />
          <Textarea placeholder="Full Description" value={form.fullDescription} onChange={e => setForm(p => ({ ...p, fullDescription: e.target.value }))} className="rounded-none resize-none h-28 mt-4" />
          <Textarea placeholder="Amenities (one per line)" value={form.amenities} onChange={e => setForm(p => ({ ...p, amenities: e.target.value }))} className="rounded-none resize-none h-24 mt-4" />
          <Textarea placeholder="Investment Highlights (one per line)" value={form.investmentHighlights} onChange={e => setForm(p => ({ ...p, investmentHighlights: e.target.value }))} className="rounded-none resize-none h-24 mt-4" />
          <div className="flex gap-3 mt-4">
            <Button onClick={handleCreate} disabled={createProject.isPending} className="rounded-none tracking-wider" data-testid="button-create-project">
              {createProject.isPending ? "Creating..." : "Create Project"}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} className="rounded-none">Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-card border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Title</th>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Area</th>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Price From</th>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Units Left</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors" data-testid={`row-project-${project.id}`}>
                  <td className="py-3 px-4 font-medium">{project.title}</td>
                  <td className="py-3 px-4 text-muted-foreground">{project.area}</td>
                  <td className="py-3 px-4">{statusBadge(project.status)}</td>
                  <td className="py-3 px-4 text-muted-foreground">{project.currency} {project.priceFrom.toLocaleString()}</td>
                  <td className="py-3 px-4 text-muted-foreground">{project.unitsLeft ?? '-'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-end">
                      <a href={`/projects/${project.slug}`} target="_blank" className="text-muted-foreground hover:text-primary">
                        <CheckCircle size={14} />
                      </a>
                      <button
                        onClick={() => handleDelete(project.slug, project.title)}
                        className="text-muted-foreground hover:text-destructive"
                        data-testid={`button-delete-project-${project.id}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {projects.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No projects yet</div>
          )}
        </div>
      )}

      <div className="mt-14 space-y-10">
        <div>
          <h2 className="font-serif text-xl mb-1">Website listings (portfolio)</h2>
          <p className="text-muted-foreground text-xs mb-4">Shown on /projects with developments. Edit in Inventory.</p>
          <div className="bg-card border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Code</th>
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Title</th>
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">URL</th>
                </tr>
              </thead>
              <tbody>
                {websiteRows.map((r) => (
                  <tr key={r.id} className="border-b border-border/40">
                    <td className="py-2 px-3 font-sans text-xs">{r.code}</td>
                    <td className="py-2 px-3">{r.title}</td>
                    <td className="py-2 px-3 text-muted-foreground text-xs truncate max-w-[200px]">
                      {r.listingUrl ? (
                        <a href={r.listingUrl} target="_blank" rel="noreferrer" className="underline">
                          link
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {websiteRows.length === 0 && <div className="text-center py-8 text-muted-foreground text-xs">No website rows</div>}
          </div>
        </div>

        <div>
          <h2 className="font-serif text-xl mb-1">Silent listings (internal)</h2>
          <p className="text-muted-foreground text-xs mb-4">Not shown on the public site.</p>
          <div className="bg-card border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Code</th>
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Title</th>
                </tr>
              </thead>
              <tbody>
                {silentRows.map((r) => (
                  <tr key={r.id} className="border-b border-border/40">
                    <td className="py-2 px-3 font-sans text-xs">{r.code}</td>
                    <td className="py-2 px-3">{r.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {silentRows.length === 0 && <div className="text-center py-8 text-muted-foreground text-xs">No silent rows</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
