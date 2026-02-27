import { createRootRoute, createRoute, createRouter, RouterProvider, Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import LandingPage from './pages/LandingPage';
import CustomerPage from './pages/CustomerPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import OrderDetailPage from './pages/OrderDetailPage';
import PartnerPage from './pages/PartnerPage';
import AdminPage from './pages/AdminPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminCustomersPage from './pages/AdminCustomersPage';
import AdminShopsPage from './pages/AdminShopsPage';
import AdminSetupPage from './pages/AdminSetupPage';
import AdminPricingPage from './pages/AdminPricingPage';
import AdminPaymentsPage from './pages/AdminPaymentsPage';
import AdminAreasPage from './pages/AdminAreasPage';
import AdminNotificationsPage from './pages/AdminNotificationsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminItemsPage from './pages/AdminItemsPage';
import OwnerRegistrationPage from './pages/OwnerRegistrationPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import BrandHeader from './components/BrandHeader';
import { clearStoredAppRole } from './lib/roleStorage';

function RootLayout() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await clear();
    clearStoredAppRole();
    queryClient.clear();
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BrandHeader isAuthenticated={!!identity} onLogout={handleLogout} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const customerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customer',
  component: CustomerPage,
});

const placeOrderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customer/place-order',
  component: PlaceOrderPage,
});

const orderDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customer/orders/$orderId',
  component: OrderDetailPage,
});

const partnerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/partner',
  component: PartnerPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/orders',
  component: AdminOrdersPage,
});

// Keep /admin/users pointing to same component for backward compat
const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  component: AdminUsersPage,
});

const adminCustomersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/customers',
  component: AdminCustomersPage,
});

const adminShopsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/shops',
  component: AdminShopsPage,
});

const adminSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/setup',
  component: AdminSetupPage,
});

const adminPricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/pricing',
  component: AdminPricingPage,
});

const adminPaymentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/payments',
  component: AdminPaymentsPage,
});

const adminAreasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/areas',
  component: AdminAreasPage,
});

const adminNotificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/notifications',
  component: AdminNotificationsPage,
});

const adminReportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/reports',
  component: AdminReportsPage,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/settings',
  component: AdminSettingsPage,
});

const adminItemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/items',
  component: AdminItemsPage,
});

const ownerRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/owner/register',
  component: OwnerRegistrationPage,
});

const ownerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/owner/dashboard',
  component: OwnerDashboardPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  customerRoute,
  placeOrderRoute,
  orderDetailRoute,
  partnerRoute,
  adminRoute,
  adminOrdersRoute,
  adminUsersRoute,
  adminCustomersRoute,
  adminShopsRoute,
  adminSetupRoute,
  adminPricingRoute,
  adminPaymentsRoute,
  adminAreasRoute,
  adminNotificationsRoute,
  adminReportsRoute,
  adminSettingsRoute,
  adminItemsRoute,
  ownerRegisterRoute,
  ownerDashboardRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  );
}
