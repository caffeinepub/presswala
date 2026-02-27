import { useNavigate, useRouterState } from '@tanstack/react-router';
import { ClipboardList, Wallet } from 'lucide-react';

interface PartnerBottomNavProps {
  activeTab: 'orders' | 'earnings';
  onTabChange: (tab: 'orders' | 'earnings') => void;
}

export default function PartnerBottomNav({ activeTab, onTabChange }: PartnerBottomNavProps) {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const path = location.pathname;

  const tabs = [
    { label: 'Orders', icon: ClipboardList, id: 'orders' as const },
    { label: 'Earnings', icon: Wallet, id: 'earnings' as const },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-card-md">
      <div className="max-w-2xl mx-auto flex">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors relative ${
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
