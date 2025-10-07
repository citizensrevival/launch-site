import { AdminLayout } from '../components/admin/AdminLayout';

export default function AdminPage() {
  const breadcrumb = (
    <div className="flex items-center gap-2">
      <a href="/manage" className="hover:text-gray-200">Dashboard</a>
      <span className="text-gray-600">›</span>
      <span className="text-gray-300">Leads</span>
      <span className="text-gray-600">›</span>
      <span className="text-gray-300">All</span>
      <span className="text-gray-600">›</span>
      <span className="text-gray-200">ACME Corp</span>
    </div>
  );

  const pageHeader = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400">Overview of your organization.</p>
      </div>
      <div className="flex items-center gap-2">
        <a href="/manage/leads/import" className="px-3 py-2 text-sm rounded-md bg-gray-800 text-gray-100 hover:bg-gray-700">Import CSV</a>
        <a href="/manage/leads/export" className="px-3 py-2 text-sm rounded-md bg-gray-800 text-gray-100 hover:bg-gray-700">Download CSV</a>
        <div className="hidden sm:flex rounded-md bg-gray-800 p-1">
          <a href="#" className="px-3 py-1.5 text-xs rounded bg-indigo-600 text-white">KPI</a>
          <a href="#" className="px-3 py-1.5 text-xs rounded text-gray-300 hover:text-white">Table</a>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout breadcrumb={breadcrumb} pageHeader={pageHeader}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-lg bg-gray-800 p-4">
          <div className="text-xs text-gray-400">Total Leads</div>
          <div className="mt-1 text-2xl font-semibold text-white">—</div>
        </div>
        <div className="rounded-lg bg-gray-800 p-4">
          <div className="text-xs text-gray-400">Vendors</div>
          <div className="mt-1 text-2xl font-semibold text-white">—</div>
        </div>
        <div className="rounded-lg bg-gray-800 p-4">
          <div className="text-xs text-gray-400">Volunteers</div>
          <div className="mt-1 text-2xl font-semibold text-white">—</div>
        </div>
        <div className="rounded-lg bg-gray-800 p-4">
          <div className="text-xs text-gray-400">Sponsors</div>
          <div className="mt-1 text-2xl font-semibold text-white">—</div>
        </div>
      </div>

      <div className="rounded-lg bg-gray-800 p-4">
        <div className="text-sm text-gray-300">Leads table placeholder</div>
        <div className="mt-3 h-40 rounded bg-gray-900/40" />
      </div>
    </AdminLayout>
  );
}
