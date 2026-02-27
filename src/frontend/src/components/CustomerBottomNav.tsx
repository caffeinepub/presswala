import { useNavigate, useRouterState } from '@tanstack/react-router';
import { LayoutDashboard, PlusCircle } from 'lucide-react';

export default function CustomerBottomNav() {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const path = location.pathname;

  const tabs = [
    { label: 'My Orders', icon: LayoutDashboard, path: '/customer' },
    { label: 'New Order', icon: PlusCircle, path: '/customer/place-order' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-card-md">
      <div className="max-w-2xl mx-auto flex">
        {tabs.map((tab) => {
          const isActive = path === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate({ to: tab.path })}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'font-bold' : ''}`}>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-12 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
