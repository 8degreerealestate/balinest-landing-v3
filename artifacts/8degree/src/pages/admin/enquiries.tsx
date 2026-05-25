import { useListEnquiries, useDeleteEnquiry, getListEnquiriesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminEnquiries() {
  const { data, isLoading } = useListEnquiries({ limit: 100 });
  const enquiries = data?.enquiries ?? [];
  const deleteEnquiry = useDeleteEnquiry();
  const { toast } = useToast();
  const qc = useQueryClient();

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete enquiry from ${name}?`)) return;
    try {
      await deleteEnquiry.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getListEnquiriesQueryKey() });
      toast({ title: "Enquiry deleted" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl mb-1">Enquiries</h1>
        <p className="text-muted-foreground text-sm">{enquiries.length} total leads</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse" />)}</div>
      ) : enquiries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="font-serif text-2xl mb-2">No enquiries yet</p>
          <p className="text-sm">Leads from your website forms will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((enq, i) => (
            <motion.div
              key={enq.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card border border-border p-5 hover:border-primary/30 transition-colors"
              data-testid={`row-enquiry-${enq.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className="font-medium">{enq.name}</span>
                    {enq.country && <span className="text-xs text-muted-foreground">{enq.country}</span>}
                    {enq.budgetRange && (
                      <span className="text-[10px] bg-primary/10 text-primary uppercase tracking-wider px-2 py-0.5">{enq.budgetRange}</span>
                    )}
                    {enq.source && (
                      <span className="text-[10px] bg-muted uppercase tracking-wider px-2 py-0.5 text-muted-foreground">{enq.source}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <a href={`mailto:${enq.email}`} className="flex items-center gap-1 hover:text-primary">
                      <Mail size={12} /> {enq.email}
                    </a>
                    {enq.phone && <a href={`tel:${enq.phone}`} className="flex items-center gap-1 hover:text-primary"><Phone size={12} /> {enq.phone}</a>}
                  </div>
                  {enq.interestedProjectTitle && (
                    <p className="text-xs text-muted-foreground">Interested in: <span className="text-foreground font-medium">{enq.interestedProjectTitle}</span></p>
                  )}
                  {enq.message && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">"{enq.message}"</p>
                  )}
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    {new Date(enq.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(enq.id, enq.name)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  data-testid={`button-delete-enquiry-${enq.id}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
