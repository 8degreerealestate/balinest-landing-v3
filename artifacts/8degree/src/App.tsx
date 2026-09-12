import { Suspense, useEffect, type ComponentType, type LazyExoticComponent } from "react";
import { clearChunkReloadFlag, lazyWithRetry } from "@/lib/lazy-with-retry";
import { Switch, Route, Router as WouterRouter, useLocation, useRoute, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setBaseUrl } from "@workspace/api-client-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { GtmRouteTracker } from "@/components/site/GtmRouteTracker";

import { getApiBaseUrl } from "@/lib/api-base";
import { ensureCurrencyRatesLoaded } from "@/lib/site-currency";
import { Seo } from "@/components/site/Seo";
import { SITE_NAME } from "@/lib/site-seo";
import {
  INVEST_SUBPATH_REDIRECT,
  LEGACY_PATH_REDIRECTS,
} from "@/lib/legacy-path-redirects";
import {
  ABOUT_PATH,
  isReservedRootSlug,
  journalPostPath,
  JOURNAL_INDEX_PATH,
  propertyListingPath,
} from "@/lib/site-paths";

const Home = lazyWithRetry(() => import("@/pages/home"));
const Projects = lazyWithRetry(() => import("@/pages/projects"));
const CompletedProjects = lazyWithRetry(() => import("@/pages/completed"));
const ProjectDetail = lazyWithRetry(() => import("@/pages/project-detail"));
const ListingDetail = lazyWithRetry(() => import("@/pages/listing-detail"));
const Blog = lazyWithRetry(() => import("@/pages/blog"));
const BlogDetail = lazyWithRetry(() => import("@/pages/blog-detail"));
const About = lazyWithRetry(() => import("@/pages/about"));
const Contact = lazyWithRetry(() => import("@/pages/contact"));
const Invest = lazyWithRetry(() => import("@/pages/invest"));
const InvestmentGuide = lazyWithRetry(() => import("@/pages/investment-guide"));
const Pricing = lazyWithRetry(() => import("@/pages/pricing"));
const InfoPage = lazyWithRetry(() => import("@/pages/info-page"));
const LongTermRentals = lazyWithRetry(() => import("@/pages/long-term-rentals"));
const BuyerAgent = lazyWithRetry(() => import("@/pages/buyer-agent"));
const SellerAgent = lazyWithRetry(() => import("@/pages/seller-agent"));
const LegalGuide = lazyWithRetry(() => import("@/pages/legal-guide"));
const LocationGuide = lazyWithRetry(() => import("@/pages/location-guide"));

const AdminDashboard = lazyWithRetry(() => import("@/pages/admin/dashboard"));
const AdminProjects = lazyWithRetry(() => import("@/pages/admin/projects"));
const AdminUnits = lazyWithRetry(() => import("@/pages/admin/units"));
const AdminBlog = lazyWithRetry(() => import("@/pages/admin/blog"));
const AdminEnquiries = lazyWithRetry(() => import("@/pages/admin/enquiries"));
const AdminTestimonials = lazyWithRetry(() => import("@/pages/admin/testimonials"));
const AdminGuides = lazyWithRetry(() => import("@/pages/admin/guides"));
const AdminContent = lazyWithRetry(() => import("@/pages/admin/content"));
const AdminInventoryImportRedirect = lazyWithRetry(() => import("@/pages/admin/inventory-import"));
const AdminInventory = lazyWithRetry(() => import("@/pages/admin/inventory"));
const AdminSettings = lazyWithRetry(() => import("@/pages/admin/settings"));

const apiBaseForClient = getApiBaseUrl();
if (apiBaseForClient) {
  setBaseUrl(apiBaseForClient);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      retry: 1,
    },
  },
});

function BlogSlugRedirect() {
  const [, params] = useRoute("/blog/:slug");
  if (!params?.slug) return <Redirect to={JOURNAL_INDEX_PATH} />;
  return <Redirect to={journalPostPath(params.slug)} />;
}

function JournalPrefixedArticleRedirect() {
  const [, params] = useRoute("/journal/:slug");
  if (!params?.slug) return <Redirect to={JOURNAL_INDEX_PATH} />;
  return <Redirect to={journalPostPath(params.slug)} />;
}

function InvestSubpathRedirect() {
  const [, params] = useRoute("/invest/:subpath+");
  if (!params?.subpath) return <Redirect to={INVEST_SUBPATH_REDIRECT} />;
  return <Redirect to={INVEST_SUBPATH_REDIRECT} />;
}

/** New-app URLs → legacy /property/{code} (lowercase). */
function PropertiesLegacyRedirect() {
  const [, params] = useRoute("/properties/:code");
  const raw = (params?.code ?? "").replace(/\/+$/, "").trim();
  if (!raw) return <Redirect to="/projects" />;
  return <Redirect to={propertyListingPath(raw)} />;
}

function JournalArticleBySlug() {
  const [, params] = useRoute("/:slug");
  const slug = (params?.slug ?? "").replace(/\/+$/, "").trim();
  if (!slug || isReservedRootSlug(slug)) {
    return (
      <PublicLayout>
        <NotFound />
      </PublicLayout>
    );
  }
  return (
    <PublicLayout>
      <Suspense fallback={<PageSpinner />}>
        <BlogDetail />
      </Suspense>
    </PublicLayout>
  );
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
    <div className="flex min-h-[100dvh] min-h-screen w-full max-w-full flex-col overflow-x-clip font-sans">
      <Navbar />
      <main className="min-w-0 max-w-full flex-1 overflow-x-clip">{children}</main>
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
      <Route path="/properties/:code" component={PropertiesLegacyRedirect} />
      <Route path="/property/:code" component={wrapPublic(ListingDetail)} />
      <Route path="/projects/:slug" component={wrapPublic(ProjectDetail)} />
      <Route path="/blog" component={() => <Redirect to={JOURNAL_INDEX_PATH} />} />
      <Route path="/blog/:slug" component={BlogSlugRedirect} />
      <Route path="/journal" component={wrapPublic(Blog)} />
      <Route path="/journal/:slug" component={JournalPrefixedArticleRedirect} />
      <Route path="/about" component={() => <Redirect to={ABOUT_PATH} />} />
      <Route path="/about-us" component={wrapPublic(About)} />
      <Route path="/contact" component={wrapPublic(Contact)} />
      <Route path="/invest" component={wrapPublic(Invest)} />
      <Route path="/invest/:subpath+" component={InvestSubpathRedirect} />
      {Object.entries(LEGACY_PATH_REDIRECTS).map(([from, to]) => (
        <Route key={from} path={from} component={() => <Redirect to={to} />} />
      ))}
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

      <Route path="/:slug" component={JournalArticleBySlug} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    clearChunkReloadFlag();
    void ensureCurrencyRatesLoaded();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={(import.meta.env.BASE_URL ?? "/").replace(/\/$/, "")}>
          <GtmRouteTracker />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
