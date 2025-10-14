import { AdminLayout } from '../AdminLayout';

export function PagesPage() {
  return (
    <AdminLayout
      pageHeader={
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Pages</h1>
          <p className="text-gray-400 mt-1">Manage your website pages</p>
        </div>
      }
    >
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <div className="text-gray-400 text-lg mb-2">📄</div>
        <h2 className="text-xl font-semibold text-white mb-2">Pages Management</h2>
        <p className="text-gray-400">This page will contain page management functionality.</p>
        <p className="text-gray-500 text-sm mt-2">Coming soon...</p>
      </div>
    </AdminLayout>
  );
}
