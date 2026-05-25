import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import { Switch, Route, Router as WouterRouter, useRoute, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setBaseUrl } from "@workspace/api-client-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

import { getApiBaseUrl } from "@/lib/api-base";
import { Seo } from "@/components/site/Seo";
import { SITE_NAME } from "@/lib/site-seo";

const Home = lazy(() => import("@/pages/home"));
const Projects = lazy(() => import("@/pages/projects"));
const CompletedProjects = lazy(() => import("@/pages/completed"));
const ProjectDetail = lazy(() => import("@/pages/project-detail"));
const ListingDetail = lazy(() => import("@/pages/listing-detail"));
const Blog = lazy(() => import("@/pages/blog"));
const BlogDetail = lazy(() => import("@/pages/blog-detail"));
const About = lazy(() => import("@/pages/about"));
const Contact = lazy(() => import("@/pages/contact"));
const Invest = lazy(() => import("@/pages/invest"));
const InvestmentGuide = lazy(() => import("@/pages/investment-guide"));
const Pricing = lazy(() => import("@/pages/pricing"));
const InfoPage = lazy(() => import("@/pages/info-page"));
const LongTermRentals = lazy(() => import("@/pages/long-term-rentals"));
const BuyerAgent = lazy(() => import("@/pages/buyer-agent"));
const SellerAgent = lazy(() => import("@/pages/seller-agent"));
const LegalGuide = lazy(() => import("@/pages/legal-guide"));
const LocationGuide = lazy(() => import("@/pages/location-guide"));

const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminProjects = lazy(() => import("@/pages/admin/projects"));
const AdminUnits = lazy(() => import("@/pages/admin/units"));
const AdminBlog = lazy(() => import("@/pages/admin/blog"));
const AdminEnquiries = lazy(() => import("@/pages/admin/enquiries"));
const AdminTestimonials = lazy(() => import("@/pages/admin/testimonials"));
const AdminGuides = lazy(() => import("@/pages/admin/guides"));
const AdminContent = lazy(() => import("@/pages/admin/content"));
const AdminInventoryImportRedirect = lazy(() => import("@/pages/admin/inventory-import"));
const AdminInventory = lazy(() => import("@/pages/admin/inventory"));
const AdminSettings = lazy(() => import("@/pages/admin/settings"));

const apiBaseForClient = getApiBaseUrl();
if (apiBaseForClient) {
  setBaseUrl(apiBaseForClient);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function BlogSlugRedirect() {
  const [, params] = useRoute("/blog/:slug");
  if (!params?.slug) return <Redirect to="/journal" />;
  return <Redirect to={`/journal/${encodeURIComponent(params.slug)}`} />;
}

function PageSpinner() {
  return (
    <div
      className="flex min-h-[40vh] flex-1 items-center justify-center bg-background"
      role="status"
      aria-label="Loading page"
    >
      <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
    </div>
  );
}

function wrapPublic(Lazy: LazyExoticComponent<ComponentType<object>>) {
  return function PublicRoute() {
    return (
      <PublicLayout>
        <Suspense fallback={<PageSpinner />}>
          <Lazy />
        </Suspense>
      </PublicLayout>
    );
  };
}

function wrapAdmin(Lazy: LazyExoticComponent<ComponentType<object>>) {
  return function AdminRoute() {
    return (
      <AdminLayout>
        <Suspense fallback={<PageSpinner />}>
          <Lazy />
        </Suspense>
      </AdminLayout>
    );
  };
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] min-h-screen flex-col font-sans">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loc] = useLocation();
  return (
    <div className="flex min-h-[100dvh] min-h-screen bg-background">
      <Seo
        title="Admin"
        description={`${SITE_NAME} admin (not for search indexing).`}
        path={loc || "/admin"}
        noindex
      />
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-muted/20">{children}</main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/admin" component={wrapAdmin(AdminDashboard)} />
      <Route path="/admin/projects" component={wrapAdmin(AdminProjects)} />
      <Route path="/admin/units" component={wrapAdmin(AdminUnits)} />
      <Route path="/admin/blog" component={wrapAdmin(AdminBlog)} />
      <Route path="/admin/enquiries" component={wrapAdmin(AdminEnquiries)} />
      <Route path="/admin/testimonials" component={wrapAdmin(AdminTestimonials)} />
      <Route path="/admin/guides" component={wrapAdmin(AdminGuides)} />
      <Route path="/admin/content" component={wrapAdmin(AdminContent)} />
      <Route path="/admin/inventory-import" component={wrapAdmin(AdminInventoryImportRedirect)} />
      <Route path="/admin/inventory" component={wrapAdmin(AdminInventory)} />
      <Route path="/admin/settings" component={wrapAdmin(AdminSettings)} />

      <Route path="/" component={wrapPublic(Home)} />
      <Route path="/projects" component={wrapPublic(Projects)} />
      <Route path="/projects/completed" component={wrapPublic(CompletedProjects)} />
      <Route path="/properties/:code" component={wrapPublic(ListingDetail)} />
      <Route path="/projects/:slug" component={wrapPublic(ProjectDetail)} />
      <Route path="/blog" component={() => <Redirect to="/journal" />} />
      <Route path="/blog/:slug" component={BlogSlugRedirect} />
      <Route path="/journal" component={wrapPublic(Blog)} />
      <Route path="/journal/:slug" component={wrapPublic(BlogDetail)} />
      <Route path="/about" component={wrapPublic(About)} />
      <Route path="/about-us" component={wrapPublic(About)} />
      <Route path="/contact" component={wrapPublic(Contact)} />
      <Route path="/invest" component={wrapPublic(Invest)} />
      <Route path="/investment-guide" component={wrapPublic(InvestmentGuide)} />
      <Route path="/sell" component={wrapPublic(Invest)} />
      <Route path="/buyer-agents" component={wrapPublic(BuyerAgent)} />
      <Route path="/buyer-agent" component={wrapPublic(BuyerAgent)} />
      <Route path="/seller-agents" component={wrapPublic(SellerAgent)} />
      <Route path="/seller-agent" component={wrapPublic(SellerAgent)} />
      <Route path="/legal-guide" component={wrapPublic(LegalGuide)} />
      <Route path="/pricing" component={wrapPublic(Pricing)} />
      <Route path="/buy-land" component={wrapPublic(Projects)} />
      <Route path="/favorite-properties" component={wrapPublic(InfoPage)} />
      <Route path="/frequently-asked-questions" component={wrapPublic(InfoPage)} />
      <Route path="/company-overview" component={wrapPublic(InfoPage)} />
      <Route path="/testimony" component={wrapPublic(InfoPage)} />
      <Route path="/legal-services" component={wrapPublic(InfoPage)} />
      <Route path="/legal-and-due-diligence" component={wrapPublic(InfoPage)} />
      <Route path="/data-driven" component={wrapPublic(InfoPage)} />
      <Route path="/bali-property-guide" component={wrapPublic(InfoPage)} />
      <Route path="/bali-location-guide" component={wrapPublic(LocationGuide)} />
      <Route path="/location-guide" component={wrapPublic(LocationGuide)} />
      <Route path="/long-term-rentals" component={wrapPublic(LongTermRentals)} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={(import.meta.env.BASE_URL ?? "/").replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
