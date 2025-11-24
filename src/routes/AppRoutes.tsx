import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import PublicRoute from './PublicRoute';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import OAuth2RedirectPage from '@/pages/OAuth2RedirectPage';
import ProblemsPage from '@/pages/ProblemsPage';
import ProblemDetailPage from '@/pages/ProblemDetailPage';
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
]);

export default router;

