import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3,
  Settings,
  ChevronLeft,
  Menu,
  ArrowLeftRight,
  ShoppingBag,
  UserCircle,
  Boxes,
  ClipboardList,
  ClipboardCheck,
  FileText,
  UsersRound,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { t, language } = useLanguage();
  const { isOwnerOrAdmin } = usePermissions();

  const menuItems = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/' },
    { type: 'separator', label: t('nav.catalog') },
    { icon: ClipboardList, label: t('nav.items'), path: '/items' },
    { type: 'separator', label: t('nav.stockManagement') },
    { icon: Boxes, label: t('nav.inventory'), path: '/inventory' },
    { icon: ArrowLeftRight, label: t('nav.stockMovements'), path: '/stock-movements' },
    { icon: ClipboardCheck, label: t('nav.stocktaking'), path: '/stocktaking' },
    { type: 'separator', label: t('nav.orders') },
    { icon: ShoppingCart, label: t('nav.purchaseOrders'), path: '/purchases' },
    { icon: ShoppingBag, label: t('nav.salesOrders'), path: '/sales' },
    { icon: FileText, label: t('nav.invoices'), path: '/invoices' },
    { type: 'separator', label: t('nav.directory') },
    { icon: Users, label: t('nav.suppliers'), path: '/suppliers' },
    { icon: UserCircle, label: t('nav.customers'), path: '/customers' },
    { type: 'separator', label: t('nav.analytics') },
    { icon: BarChart3, label: t('nav.reports'), path: '/reports' },
  ];

  // Add user management and activity history for owners/admins
  if (isOwnerOrAdmin) {
    menuItems.push(
      { type: 'separator', label: t('nav.userManagement') },
      { icon: UsersRound, label: t('nav.userManagement'), path: '/users' },
      { icon: History, label: language === 'id' ? 'Riwayat Aktivitas' : 'Activity History', path: '/activity' }
    );
  }

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 z-50 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Package className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">InvenPro</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item, index) => {
          if (item.type === 'separator') {
            if (collapsed) return null;
            return (
              <div key={`sep-${index}`} className="pt-4 pb-2">
                <span className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider px-3">
                  {item.label}
                </span>
              </div>
            );
          }

          const isActive = location.pathname === item.path;
          const Icon = item.icon!;
          
          return (
            <Link
              key={item.path}
              to={item.path!}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-3 border-t border-sidebar-border">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
            location.pathname === '/settings'
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed && "justify-center px-2"
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">{t('nav.settings')}</span>}
        </Link>
      </div>
    </aside>
  );
}
