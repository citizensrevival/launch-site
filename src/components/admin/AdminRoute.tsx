import { useAuth } from '../../contexts/AuthContext';
import { AdminLoginForm } from './AdminLoginForm';
import AdminPage from '../../pages/AdminPage';

export function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AdminLoginForm />;
  }

  return <AdminPage />;
}
