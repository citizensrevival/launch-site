import React from 'react';
import { useAppSelector } from '../../shell/store/hooks';
import { AdminLayout } from '../AdminLayout';

interface CmsRouteProps {
  children: React.ReactNode;
}

export function CmsRoute({ children }: CmsRouteProps) {
  const selectedSite = useAppSelector((state) => state.site.selectedSite);

  if (!selectedSite) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Site Selected</h3>
            <p className="text-gray-500">Please select a site from the dropdown in the header to access CMS features.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return <>{children}</>;
}
