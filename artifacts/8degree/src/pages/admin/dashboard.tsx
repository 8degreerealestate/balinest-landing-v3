import { motion } from "framer-motion";
import { Building2, Home, Users, BookOpen, TrendingUp, Circle } from "lucide-react";
import { useGetDashboardStats } from "@workspace/api-client-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  const statCards = stats ? [
    { label: "Total Projects", value: stats.totalProjects, sub: `${stats.ongoingProjects} ongoing · ${stats.completedProjects} completed`, icon: Building2 },
    { label: "Total Units", value: stats.totalUnits, sub: `${stats.availableUnits} available · ${stats.soldUnits} sold · ${stats.reservedUnits} reserved`, icon: Home },
    { label: "Total Enquiries", value: stats.totalEnquiries, sub: `${stats.newEnquiriesThisMonth} this month`, icon: Users },
    { label: "Blog Posts", value: stats.totalBlogPosts, sub: "Published articles", icon: BookOpen },
  ] : [];

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of all 8 Degree operations</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-none" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {statCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border p-6"
              data-testid={`stat-${card.label.toLowerCase().replace(/\s/g, '-')}`}
            >
              <div className="flex items-start justify-between mb-4">
                <card.icon size={18} className="text-muted-foreground" />
                <span className="text-3xl font-serif font-medium">{card.value}</span>
              </div>
              <p className="font-medium text-sm mb-1">{card.label}</p>
              <p className="text-xs text-muted-foreground">{card.sub}</p>
            </motion.div>
          ))}
        </div>
      )}

      {stats && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Unit Breakdown */}
          <div className="bg-card border border-border p-6">
            <h2 className="font-medium mb-6 text-sm uppercase tracking-wider">Unit Status Breakdown</h2>
            <div className="space-y-4">
              {[
                { label: "Available", value: stats.availableUnits, total: stats.totalUnits, color: "bg-green-500" },
                { label: "Reserved", value: stats.reservedUnits, total: stats.totalUnits, color: "bg-yellow-500" },
                { label: "Sold", value: stats.soldUnits, total: stats.totalUnits, color: "bg-red-500" },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value} / {item.total}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-card border border-border p-6">
            <h2 className="font-medium mb-6 text-sm uppercase tracking-wider">Quick Actions</h2>
            <div className="space-y-3">
              {[
                { href: "/admin/inventory", label: "All listings" },
                { href: "/admin/inventory#import-import", label: "Import listings" },
                { href: "/admin/blog", label: "Blog" },
                { href: "/admin/content", label: "Homepage" },
                { href: "/admin/testimonials", label: "Testimonials" },
                { href: "/admin/enquiries", label: "Enquiries" },
                { href: "/admin/settings", label: "Settings" },
              ].map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between p-3 border border-border hover:bg-muted/50 transition-colors group"
                  data-testid={`link-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <span className="text-sm">{link.label}</span>
                  <TrendingUp size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
