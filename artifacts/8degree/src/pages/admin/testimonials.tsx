import { useListTestimonials } from "@workspace/api-client-react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminTestimonials() {
  const { data, isLoading } = useListTestimonials();
  const testimonials = data?.testimonials ?? [];

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl mb-1">Testimonials</h1>
        <p className="text-muted-foreground text-sm">{testimonials.length} client reviews</p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-40 bg-muted animate-pulse" />)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border p-6"
              data-testid={`card-testimonial-${t.id}`}
            >
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={12} className="fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm italic text-muted-foreground mb-4 leading-relaxed">"{t.quote}"</p>
              <div className="border-t border-border pt-3">
                <p className="font-medium text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.country}</p>
                {t.projectTitle && <p className="text-xs text-primary mt-1">{t.projectTitle}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
