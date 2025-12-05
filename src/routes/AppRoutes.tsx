import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import PublicRoute from './PublicRoute';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import OAuth2RedirectPage from '@/pages/OAuth2RedirectPage';
import ProblemsPage from '@/pages/ProblemsPage';
import ProblemDetailPage from '@/pages/ProblemDetailPage';
import AdminProtectedRoute from '@/routes/AdminProtectedRoute';
import AdminLayout from '@/layouts/LayoutsAdmin/AdminLayout';
import AdminDashboard from '@/pages/admin/Dashboard/AdminDashboard';
import AdminLanguagesPage from '@/pages/admin/AdminLanguagesPage';
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage';
import AdminProblemsPage from '@/pages/admin/AdminProblemsPage';
import AdminProblemForm from '@/pages/admin/AdminProblemForm';
import AdminTagsPage from '@/pages/admin/AdminTagsPage';
import AdminTestcasesPage from '@/pages/admin/AdminTestcasesPage';
import { ROUTES } from '@/utils/constants';

const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: (
      <MainLayout>
        <HomePage />
      </MainLayout>
    ),
  },
  {
    path: ROUTES.LOGIN,
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.REGISTER,
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.OAUTH2_REDIRECT,
    element: <OAuth2RedirectPage />,
  },
  {
    path: ROUTES.PROBLEMS,
    element: (
      <MainLayout>
        <ProblemsPage />
      </MainLayout>
    ),
  },
  {
    path: `${ROUTES.PROBLEMS}/:id`,
    element: (
      <MainLayout>
        <ProblemDetailPage />
      </MainLayout>
    ),
  },
  // Placeholder routes - sẽ implement sau
  {
    path: ROUTES.CONTEST,
    element: (
      <MainLayout>
        <div className="py-12 text-center">
          <h1 className="text-2xl font-bold">Contest Page - Coming Soon</h1>
        </div>
      </MainLayout>
    ),
  },
  {
    path: ROUTES.DISCUSS,
    element: (
      <MainLayout>
        <div className="py-12 text-center">
          <h1 className="text-2xl font-bold">Discuss Page - Coming Soon</h1>
        </div>
      </MainLayout>
    ),
  },
  {
    path: ROUTES.LEADERBOARD,
    element: (
      <MainLayout>
        <div className="py-12 text-center">
          <h1 className="text-2xl font-bold">Leaderboard Page - Coming Soon</h1>
        </div>
      </MainLayout>
    ),
  },
 {
    path: '/admin',
    element: (
      <AdminProtectedRoute>
        <AdminLayout />
      </AdminProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'languages',
        element: <AdminLanguagesPage />,
      },
      {
        path: 'categories',
        element: <AdminCategoriesPage />,
      },
      {
        path: 'tags',
        element: <AdminTagsPage />,
      },
      {
       path: 'problems',
       element: <AdminProblemsPage />,
     },
     {
       path: 'problems/new',
       element: <AdminProblemForm />,
     },
     {
       path: 'problems/:id/edit',
       element: <AdminProblemForm />,
     },
      {
        path: 'testcases',
        element: <AdminTestcasesPage />,
      },
    ],
  },
]);

export default router;

