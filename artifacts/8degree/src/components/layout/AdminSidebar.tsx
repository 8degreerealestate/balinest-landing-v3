import type { ComponentType, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  PanelsTopLeft,
  Users,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

function pathOnly(loc: string) {
  const i = loc.indexOf("?");
  return i === -1 ? loc : loc.slice(0, i);
}

type NavLinkItem = { kind: "link"; href: string; label: string; icon?: ComponentType<{ size?: number; className?: string }> };

function NavLink({ href, label, icon: Icon }: NavLinkItem) {
  const [location] = useLocation();
  const active =
    pathOnly(location) === pathOnly(href) ||
    (href !== "/admin" && pathOnly(location).startsWith(`${pathOnly(href)}/`));

  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors cursor-pointer text-sm",
          active
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent"
        )}
      >
        {Icon ? <Icon size={16} /> : null}
        <span className="font-medium">{label}</span>
      </div>
    </Link>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-3 pb-1.5 pt-5 text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground first:pt-2">
      {children}
    </div>
  );
}

export function AdminSidebar() {
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border min-h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <div className="font-serif text-xl font-bold tracking-widest text-sidebar-foreground">8 DEGREE</div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5">
        <NavLink kind="link" href="/admin" label="Dashboard" icon={LayoutDashboard} />

        <SectionLabel>Inventory</SectionLabel>
        <div className="pl-1 space-y-0.5">
          <NavLink kind="link" href="/admin/inventory" label="All Listings" icon={ClipboardList} />
          <Link href="/admin/inventory#import-import">
            <div className="flex items-center justify-center mx-2 mt-1 px-3 py-2 rounded-md border border-sidebar-border text-sidebar-foreground text-sm font-medium hover:bg-sidebar-accent transition-colors cursor-pointer">
              Import
            </div>
          </Link>
        </div>

        <SectionLabel>Content</SectionLabel>
        <div className="pl-1 space-y-0.5">
          <NavLink kind="link" href="/admin/blog" label="Blog" icon={FileText} />
          <NavLink kind="link" href="/admin/content" label="Homepage" icon={PanelsTopLeft} />
          <NavLink kind="link" href="/admin/testimonials" label="Testimonials" icon={Users} />
        </div>

        <SectionLabel>CRM</SectionLabel>
        <div className="pl-1 space-y-0.5">
          <NavLink kind="link" href="/admin/enquiries" label="Enquiries" icon={MessageSquare} />
        </div>
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        <div className="px-3 text-[10px] uppercase tracking-wider text-muted-foreground/80">Optional</div>
        <NavLink kind="link" href="/admin/settings" label="Settings" icon={Settings} />
        <Link href="/">
          <div className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer">
            <LogOut size={18} />
            <span className="font-medium text-sm">Exit Admin</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
