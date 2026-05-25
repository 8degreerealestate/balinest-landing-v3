import { useState } from "react";
import { useListUnits, useUpdateUnit, useDeleteUnit, useListProjects, getListUnitsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

export default function AdminUnits() {
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: unitsData, isLoading } = useListUnits({
    project_id: projectFilter !== "all" ? Number(projectFilter) : undefined,
    status: statusFilter !== "all" ? (statusFilter as "available" | "reserved" | "sold") : undefined,
  });
  const { data: projectsData } = useListProjects({ limit: 50 });
  const updateUnit = useUpdateUnit();
  const deleteUnit = useDeleteUnit();
  const { toast } = useToast();
  const qc = useQueryClient();

  const units = unitsData?.units ?? [];
  const projects = projectsData?.projects ?? [];

  const handleStatusChange = async (id: number, status: string, unit: typeof units[0]) => {
    try {
      await updateUnit.mutateAsync({
        id,
        data: {
          projectId: unit.projectId,
          unitName: unit.unitName,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          buildSize: unit.buildSize,
          landSize: unit.landSize,
          price: unit.price,
          currency: unit.currency,
          status: status as "available" | "reserved" | "sold",
          floorplanUrl: unit.floorplanUrl,
        },
      });
      qc.invalidateQueries({ queryKey: getListUnitsQueryKey() });
      toast({ title: "Unit updated" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this unit?")) return;
    try {
      await deleteUnit.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getListUnitsQueryKey() });
      toast({ title: "Unit deleted" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const statusBadge = (status: string) => {
    const classes = { available: "bg-green-100 text-green-800", reserved: "bg-yellow-100 text-yellow-800", sold: "bg-red-100 text-red-800" };
    return classes[status as keyof typeof classes] ?? "";
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl mb-1">Units / Inventory</h1>
        <p className="text-muted-foreground text-sm">{units.length} units</p>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-52 rounded-none" data-testid="select-project-filter">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 rounded-none" data-testid="select-status-filter">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-muted animate-pulse" />)}</div>
      ) : (
        <div className="bg-card border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Unit</th>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Project</th>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Bed/Bath</th>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Price</th>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {units.map(unit => {
                const project = projects.find(p => p.id === unit.projectId);
                return (
                  <tr key={unit.id} className="border-b border-border/50 hover:bg-muted/20" data-testid={`row-unit-${unit.id}`}>
                    <td className="py-3 px-4 font-medium">{unit.unitName}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{project?.title ?? `Project ${unit.projectId}`}</td>
                    <td className="py-3 px-4 text-muted-foreground">{unit.bedrooms}B / {unit.bathrooms}Ba</td>
                    <td className="py-3 px-4">{unit.currency} {unit.price.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Select value={unit.status} onValueChange={(v) => handleStatusChange(unit.id, v, unit)}>
                        <SelectTrigger className={`rounded-none h-7 w-32 text-xs ${statusBadge(unit.status)}`} data-testid={`select-unit-status-${unit.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleDelete(unit.id)} className="text-muted-foreground hover:text-destructive" data-testid={`button-delete-unit-${unit.id}`}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {units.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No units found</div>}
        </div>
      )}
    </div>
  );
}
