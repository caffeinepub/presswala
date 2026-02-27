import { useNavigate, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard,
  ClipboardList,
  Store,
  Users,
  Tag,
  CreditCard,
  MapPin,
  Bell,
  BarChart2,
  Settings,
  Shirt,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Orders', icon: ClipboardList, path: '/admin/orders' },
  { label: 'Shops', icon: Store, path: '/admin/shops' },
  { label: 'Customers', icon: Users, path: '/admin/customers' },
  { label: 'Pricing', icon: Tag, path: '/admin/pricing' },
  { label: 'Items', icon: Shirt, path: '/admin/items' },
  { label: 'Payments', icon: CreditCard, path: '/admin/payments' },
  { label: 'Areas', icon: MapPin, path: '/admin/areas' },
  { label: 'Notifications', icon: Bell, path: '/admin/notifications' },
  { label: 'Reports', icon: BarChart2, path: '/admin/reports' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const path = location.pathname;

  return (
    <aside className="w-56 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-sidebar-primary flex items-center justify-center">
            <Shirt className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-extrabold text-sm text-sidebar-foreground">
            Admin Panel
          </span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = path === item.path;
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate({ to: item.path })}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
