// ...existing code...
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/Admin/AdminSidebar';
import AdminHeader from '@/components/Layout/AdminHeader';

// removed children prop, use Outlet for nested routing
const AdminLayout = () => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
// ...existing code...