import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../shell/contexts/AuthContext';
import { useAppSelector, useAppDispatch } from '../shell/store/hooks';
import { setGlobalSearch } from '../shell/store/slices/adminSlice';
import { Icon } from '@mdi/react';
import { Tooltip } from '../shell/Tooltip';
import { 
  mdiClock,
  mdiAccountGroup,
  mdiHome,
  mdiClose,
  mdiChevronDown,
  mdiMenu,
  mdiMagnify,
  mdiChartLine,
  mdiWeb,
  mdiCog
} from '@mdi/js';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageHeader?: React.ReactNode;
}

type SidebarGroupKey = 'primary' | 'analytics' | 'content' | 'settings';

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function getInitialsFromEmail(email?: string | null): string {
  if (!email) return 'U';
  const name = email.split('@')[0] || 'user';
  const parts = name.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(' ');
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
  return initials || 'U';
}

export function AdminLayout({ children, pageHeader }: AdminLayoutProps) {
  const dispatch = useAppDispatch();
  const globalSearch = useAppSelector((state) => state.admin.globalSearch);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [currentPath, setCurrentPath] = useState('');

  // Get current path for active navigation
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  // Helper function to check if a navigation item is active
  const isActive = (href: string) => {
    if (href === '/manage') {
      return currentPath === '/manage';
    }
    // For analytics overview, only match exact path
    if (href === '/manage/analytics') {
      return currentPath === '/manage/analytics';
    }
    return currentPath.startsWith(href);
  };

  const storageKey = useMemo(() => `admin_sidebar_groups_${user?.email || 'anon'}`, [user?.email]);
  const [openGroups, setOpenGroups] = useState<Record<SidebarGroupKey, boolean>>({ primary: true, analytics: true, content: true, settings: true });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<SidebarGroupKey, boolean>;
        setOpenGroups({ primary: parsed.primary ?? true, analytics: parsed.analytics ?? true, content: parsed.content ?? true, settings: parsed.settings ?? true });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(openGroups));
    } catch {}
  }, [openGroups, storageKey]);

  const primaryItems = [
    { name: 'Dashboard', href: '/manage', icon: (
      <Icon path={mdiClock} className="h-5 w-5" />
    ) },
    { name: 'Leads', href: '/manage/leads', icon: (
      <Icon path={mdiAccountGroup} className="h-5 w-5" />
    ) },
  ];

  const analyticsItems = [
    { name: 'Overview', href: '/manage/analytics', icon: (
      <Icon path={mdiChartLine} className="h-5 w-5" />
    ) },
    { name: 'Referrers', href: '/manage/analytics/referrers', icon: (
      <Icon path={mdiWeb} className="h-5 w-5" />
    ) },
    { name: 'Users', href: '/manage/analytics/users', icon: (
      <Icon path={mdiAccountGroup} className="h-5 w-5" />
    ) },
    { name: 'Sessions', href: '/manage/analytics/sessions', icon: (
      <Icon path={mdiClock} className="h-5 w-5" />
    ) },
    { name: 'Events', href: '/manage/analytics/events', icon: (
      <Icon path={mdiChartLine} className="h-5 w-5" />
    ) },
  ];

  const contentItems = [
    { name: 'Pages', href: '/manage/content/pages', icon: (
      <Icon path={mdiWeb} className="h-5 w-5" />
    ) },
    { name: 'Content Blocks', href: '/manage/content/blocks', icon: (
      <Icon path={mdiAccountGroup} className="h-5 w-5" />
    ) },
    { name: 'Assets', href: '/manage/content/assets', icon: (
      <Icon path={mdiChartLine} className="h-5 w-5" />
    ) },
    { name: 'Site Settings', href: '/manage/content/settings', icon: (
      <Icon path={mdiCog} className="h-5 w-5" />
    ) },
  ];


  const initials = getInitialsFromEmail(user?.email);

  return (
    <div className="h-screen bg-gray-900 flex">
      {/* Mobile overlay */}
      <div className={classNames(
        'fixed inset-0 z-40 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
      </div>

      {/* Sidebar */}
      <div className={classNames(
        'fixed inset-y-0 left-0 z-50 w-72 transform bg-gray-800 overflow-y-auto lg:static lg:inset-0 lg:flex lg:w-64 lg:translate-x-0 transition-transform duration-200 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700 lg:hidden">
            <div className="flex items-center">
              <Tooltip content="Go to Home">
                <button
                  onClick={() => (window.location.href = '/')}
                  className="mr-3 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors duration-200"
                >
                  <Icon path={mdiHome} className="h-5 w-5" />
                </button>
              </Tooltip>
              <h1 className="text-lg font-semibold text-white">Admin</h1>
            </div>
            <Tooltip content="Close sidebar">
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md">
                <Icon path={mdiClose} className="h-5 w-5" />
              </button>
            </Tooltip>
          </div>

          <div className="flex-1 flex flex-col pt-4 pb-4 overflow-y-auto">
            <div className="mt-2">
              <button
                className="w-full flex items-center justify-between px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => setOpenGroups((s) => ({ ...s, primary: !s.primary }))}
              >
                <span className="font-medium">Manage</span>
                <Icon path={mdiChevronDown} className={classNames('h-4 w-4 transform transition-transform', openGroups.primary && 'rotate-180')} />
              </button>
              <nav className={classNames('px-2 space-y-1', openGroups.primary ? 'block' : 'hidden')}>
                {primaryItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <a 
                      key={item.name} 
                      href={item.href} 
                      className={classNames(
                        'group flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors',
                        active 
                          ? 'bg-gray-700 text-white' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      )}
                    >
                      <span className={classNames(
                        active ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                      )}>{item.icon}</span>
                      {item.name}
                    </a>
                  );
                })}
              </nav>
            </div>

            <div className="mt-6">
              <button
                className="w-full flex items-center justify-between px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => setOpenGroups((s) => ({ ...s, analytics: !s.analytics }))}
              >
                <span className="font-medium">Analytics</span>
                <Icon path={mdiChevronDown} className={classNames('h-4 w-4 transform transition-transform', openGroups.analytics && 'rotate-180')} />
              </button>
              <nav className={classNames('px-2 space-y-1', openGroups.analytics ? 'block' : 'hidden')}>
                {analyticsItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <a 
                      key={item.name} 
                      href={item.href} 
                      className={classNames(
                        'group flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors',
                        active 
                          ? 'bg-gray-700 text-white' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      )}
                    >
                      <span className={classNames(
                        active ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                      )}>{item.icon}</span>
                      {item.name}
                    </a>
                  );
                })}
              </nav>
            </div>

            <div className="mt-6">
              <button
                className="w-full flex items-center justify-between px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => setOpenGroups((s) => ({ ...s, content: !s.content }))}
              >
                <span className="font-medium">Content</span>
                <Icon path={mdiChevronDown} className={classNames('h-4 w-4 transform transition-transform', openGroups.content && 'rotate-180')} />
              </button>
              <nav className={classNames('px-2 space-y-1', openGroups.content ? 'block' : 'hidden')}>
                {contentItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <a 
                      key={item.name} 
                      href={item.href} 
                      className={classNames(
                        'group flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors',
                        active 
                          ? 'bg-gray-700 text-white' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      )}
                    >
                      <span className={classNames(
                        active ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                      )}>{item.icon}</span>
                      {item.name}
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Settings section commented out for now */}
            {/* <div className="mt-6 px-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</h2>
            </div>
            <div className="mt-2">
              <button
                className="w-full flex items-center justify-between px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => setOpenGroups((s) => ({ ...s, settings: !s.settings }))}
              >
                <span className="font-medium">Manage</span>
                <svg className={classNames('h-4 w-4 transform transition-transform', openGroups.settings && 'rotate-180')} viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"/></svg>
              </button>
              <nav className={classNames('px-2 space-y-1', openGroups.settings ? 'block' : 'hidden')}>
                {settingsItems.map((item) => (
                  <a key={item.name} href={item.href} className="group flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">
                    <span className="text-gray-400 group-hover:text-gray-200">{item.icon}</span>
                    {item.name}
                  </a>
                ))}
              </nav>
            </div> */}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top bar */}
        <div className="bg-gray-800 shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Tooltip content="Open sidebar">
                <button
                  type="button"
                  className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <Icon path={mdiMenu} className="h-6 w-6" />
                </button>
              </Tooltip>
              <div className="hidden lg:block">
                <a href="/" className="text-gray-300 hover:text-white text-sm">Home</a>
              </div>
            </div>
            <div className="flex-1 max-w-xl mx-4 hidden sm:block">
              <label htmlFor="global-search" className="sr-only">Search leads</label>
              <div className="relative">
              <input
                id="global-search"
                name="search"
                placeholder="Search leads"
                value={globalSearch}
                onChange={(e) => dispatch(setGlobalSearch(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const q = globalSearch.trim();
                    const url = q ? `/manage/leads?search=${encodeURIComponent(q)}` : '/manage/leads';
                    window.location.href = url;
                  }
                }}
                className="block w-full bg-gray-700 border border-transparent rounded-md py-2 pl-2 pr-9 text-sm placeholder-gray-400 text-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                <Tooltip content="Search leads">
                  <button
                    type="button"
                    aria-label="Search"
                    className="p-1 rounded text-gray-300 hover:text-white hover:bg-gray-700"
                    onClick={() => {
                      const q = globalSearch.trim();
                      const url = q ? `/manage/leads?search=${encodeURIComponent(q)}` : '/manage/leads';
                      window.location.href = url;
                    }}
                  >
                    <Icon path={mdiMagnify} className="h-5 w-5" />
                  </button>
                </Tooltip>
              </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* <button className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700" aria-label="Notifications">
                <Icon path={mdiBell} className="h-5 w-5" />
              </button> */}
              {/* <div className="relative">
                <details className="group">
                  <summary className="list-none flex items-center gap-2 cursor-pointer select-none rounded-full p-1 hover:bg-gray-700">
                    <span className="sr-only">Help</span>
                    <Icon path={mdiHelpCircle} className="h-5 w-5 text-gray-300 group-open:text-white" />
                  </summary>
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-gray-800 border border-gray-700 shadow-lg p-1">
                    <a href="/manage/help" className="block px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded">Help Center</a>
                    <a href="/manage/shortcuts" className="block px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded">Keyboard Shortcuts</a>
                  </div>
                </details>
              </div> */}
              <div className="relative">
                <details className="group">
                  <summary className="list-none flex items-center gap-2 cursor-pointer select-none">
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white">
                      {initials}
                    </div>
                  </summary>
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-gray-800 border border-gray-700 shadow-lg p-1">
                    <div className="px-3 py-2 text-xs text-gray-400">{user?.email}</div>
                    {/* <a href="/manage/profile" className="block px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded">Profile</a> */}
                    <Tooltip content="Sign out of admin">
                      <button onClick={signOut} className="w-full text-left block px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded">Sign out</button>
                    </Tooltip>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-900">
          <div className="py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Page header */}
              <div className="mb-4">{pageHeader}</div>
              {/* Content */}
              {children}
            </div>
          </div>
        </main>

        {/* Mobile bottom bar */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-gray-800 border-t border-gray-700">
          <div className="grid grid-cols-4">
            <a 
              href="/manage" 
              className={classNames(
                'flex flex-col items-center justify-center py-2 text-xs transition-colors',
                isActive('/manage') 
                  ? 'text-gray-200' 
                  : 'text-gray-300 hover:text-white'
              )}
            >
              <Icon path={mdiHome} className="h-5 w-5" />
              <span>Dashboard</span>
            </a>
            <a 
              href="/manage/leads" 
              className={classNames(
                'flex flex-col items-center justify-center py-2 text-xs transition-colors',
                isActive('/manage/leads') 
                  ? 'text-gray-200' 
                  : 'text-gray-300 hover:text-white'
              )}
            >
              <Icon path={mdiAccountGroup} className="h-5 w-5" />
              <span>Leads</span>
            </a>
            <a 
              href="/manage/analytics" 
              className={classNames(
                'flex flex-col items-center justify-center py-2 text-xs transition-colors',
                isActive('/manage/analytics') 
                  ? 'text-gray-200' 
                  : 'text-gray-300 hover:text-white'
              )}
            >
              <Icon path={mdiChartLine} className="h-5 w-5" />
              <span>Analytics</span>
            </a>
            <a 
              href="/manage/content/pages" 
              className={classNames(
                'flex flex-col items-center justify-center py-2 text-xs transition-colors',
                isActive('/manage/content') 
                  ? 'text-gray-200' 
                  : 'text-gray-300 hover:text-white'
              )}
            >
              <Icon path={mdiWeb} className="h-5 w-5" />
              <span>Content</span>
            </a>
          </div>
        </div>

        {/* Mobile FAB */}
        {/* <button
          className="lg:hidden fixed bottom-16 right-4 z-30 h-12 w-12 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-500"
          aria-label="Add Lead"
          onClick={() => (window.location.href = '/manage/leads/new')}
        >
          <Icon path={mdiPlus} className="h-6 w-6" />
        </button> */}
      </div>
    </div>
  );
}
