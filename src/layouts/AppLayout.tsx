import {
  BarChart3,
  Bell,
  Home,
  LogOut,
  MessageCircle,
  Megaphone,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react';
import {
  NavLink,
  Outlet,
} from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';

const navigation = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: Home,
  },
  {
    label: 'Inbox',
    path: '/inbox',
    icon: MessageCircle,
  },
  {
    label: 'Customers',
    path: '/customers',
    icon: Users,
  },
  {
    label: 'Broadcasts',
    path: '/broadcasts',
    icon: Megaphone,
  },
  {
    label: 'Orders',
    path: '/orders',
    icon: ShoppingCart,
  },
  {
    label: 'Auto Replies',
    path: '/auto-replies',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },
];

export default function AppLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-slate-950 text-white lg:flex lg:flex-col">
          <div className="flex h-16 items-center border-b border-slate-800 px-5">
            <div>
              <p className="font-bold tracking-tight">
                WhatsApp CRM
              </p>
              <p className="text-xs text-slate-400">
                Business Console
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                      isActive
                        ? 'bg-white text-slate-950'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                    ].join(' ')
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="border-t border-slate-800 p-3">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
                <MessageCircle className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  WhatsApp Business CRM
                </p>
                <p className="text-xs text-slate-500">
                  Customer communication & automation
                </p>
              </div>
            </div>

            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <Bell className="h-4 w-4" />
            </button>
          </header>

          <main className="min-w-0 flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}