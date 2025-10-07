import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  breadcrumb?: React.ReactNode;
  pageHeader?: React.ReactNode;
}

type SidebarGroupKey = 'primary' | 'settings';

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

export function AdminLayout({ children, breadcrumb, pageHeader }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [globalSearch, setGlobalSearch] = useState('');

  const storageKey = useMemo(() => `admin_sidebar_groups_${user?.email || 'anon'}`, [user?.email]);
  const [openGroups, setOpenGroups] = useState<Record<SidebarGroupKey, boolean>>({ primary: true, settings: true });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<SidebarGroupKey, boolean>;
        setOpenGroups({ primary: parsed.primary ?? true, settings: parsed.settings ?? true });
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
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm9-4a1 1 0 10-2 0v4a1 1 0 00.553.894l3 1.5a1 1 0 10.894-1.788L11 9.382V6z"/></svg>
    ) },
    { name: 'Leads', href: '/manage/leads', icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M8 7a4 4 0 118 0 4 4 0 01-8 0z"/></svg>
    ) },
  ];

  const settingsItems = [
    { name: 'Users / Roles', href: '/manage/users', icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
    ) },
    { name: 'Site Settings', href: '/manage/settings', icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M11.983 13.95a1.967 1.967 0 100-3.933 1.967 1.967 0 000 3.933z"/><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.341a8 8 0 10-14.856-6.682m-.243 6.981l1.4 2.424a1 1 0 00.866.5h2.8a1 1 0 01.866.5l1.4 2.424a1 1 0 001.732 0l1.4-2.424a1 1 0 01.866-.5h2.8a1 1 0 00.866-.5l1.4-2.424"/></svg>
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
              <button
                onClick={() => (window.location.href = '/')}
                className="mr-3 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors duration-200"
                title="Go to Home"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-white">Admin</h1>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="flex-1 flex flex-col pt-4 pb-4 overflow-y-auto">
            <div className="px-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Primary</h2>
            </div>
            <div className="mt-2">
              <button
                className="w-full flex items-center justify-between px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => setOpenGroups((s) => ({ ...s, primary: !s.primary }))}
              >
                <span className="font-medium">Sections</span>
                <svg className={classNames('h-4 w-4 transform transition-transform', openGroups.primary && 'rotate-180')} viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"/></svg>
              </button>
              <nav className={classNames('px-2 space-y-1', openGroups.primary ? 'block' : 'hidden')}>
                {primaryItems.map((item) => (
                  <a key={item.name} href={item.href} className="group flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">
                    <span className="text-gray-400 group-hover:text-gray-200">{item.icon}</span>
                    {item.name}
                  </a>
                ))}
              </nav>
            </div>

            <div className="mt-6 px-4">
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
            </div>
          </div>

          <div className="mt-auto border-t border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-white">{user?.email}</div>
                <div className="text-xs text-gray-400">Administrator</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top bar */}
        <div className="bg-gray-800 shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
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
                onChange={(e) => setGlobalSearch(e.target.value)}
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
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg>
                </button>
              </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700" aria-label="Notifications">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"/></svg>
              </button>
              <div className="relative">
                <details className="group">
                  <summary className="list-none flex items-center gap-2 cursor-pointer select-none rounded-full p-1 hover:bg-gray-700">
                    <span className="sr-only">Help</span>
                    <svg className="h-5 w-5 text-gray-300 group-open:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 10a4 4 0 118 0c0 2-4 2-4 4m0 4h.01"/></svg>
                  </summary>
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-gray-800 border border-gray-700 shadow-lg p-1">
                    <a href="/manage/help" className="block px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded">Help Center</a>
                    <a href="/manage/shortcuts" className="block px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded">Keyboard Shortcuts</a>
                  </div>
                </details>
              </div>
              <div className="relative">
                <details className="group">
                  <summary className="list-none flex items-center gap-2 cursor-pointer select-none">
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white">
                      {initials}
                    </div>
                  </summary>
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-gray-800 border border-gray-700 shadow-lg p-1">
                    <div className="px-3 py-2 text-xs text-gray-400">{user?.email}</div>
                    <a href="/manage/profile" className="block px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded">Profile</a>
                    <button onClick={signOut} className="w-full text-left block px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded">Sign out</button>
                  </div>
                </details>
              </div>
            </div>
          </div>
          {/* Breadcrumbs */}
          <div className="px-4 sm:px-6 lg:px-8 py-2 bg-gray-850 border-t border-b border-gray-700">
            <div className="max-w-7xl mx-auto">
              <nav className="text-sm text-gray-400" aria-label="Breadcrumb">
                {breadcrumb || (
                  <div className="flex items-center gap-2">
                    <span>Dashboard</span>
                    <span className="text-gray-600">›</span>
                    <span className="text-gray-300">Home</span>
                  </div>
                )}
              </nav>
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
          <div className="grid grid-cols-2">
            <a href="/manage" className="flex flex-col items-center justify-center py-2 text-xs text-gray-300 hover:text-white">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"/></svg>
              <span>Dashboard</span>
            </a>
            <a href="/manage/leads" className="flex flex-col items-center justify-center py-2 text-xs text-gray-300 hover:text-white">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M8 7a4 4 0 118 0 4 4 0 01-8 0z"/></svg>
              <span>Leads</span>
            </a>
          </div>
        </div>

        {/* Mobile FAB */}
        <button
          className="lg:hidden fixed bottom-16 right-4 z-30 h-12 w-12 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-500"
          aria-label="Add Lead"
          onClick={() => (window.location.href = '/manage/leads/new')}
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
        </button>
      </div>
    </div>
  );
}
