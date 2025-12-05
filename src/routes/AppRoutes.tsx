import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import OAuth2RedirectPage from '@/pages/OAuth2RedirectPage';
import ProblemsPage from '@/pages/ProblemsPage';
import ProblemDetailPage from '@/pages/ProblemDetailPage/index';
import ProfilePage from '@/pages/ProfilePage';
import PublicProfilePage from '@/pages/PublicProfilePage';
import DiscussPage from '@/pages/DiscussPage';
import CreatePostPage from '@/pages/CreatePostPage';
import PostDetailPage from '@/pages/PostDetailPage';
import MessagesPage from '@/pages/MessagesPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
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
    element: <ProblemDetailPage />,
  },
  {
    path: ROUTES.PROFILE,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <ProfilePage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/users/:userId',
    element: (
      <MainLayout>
        <PublicProfilePage />
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
    path: ROUTES.CREATE_POST,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <CreatePostPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.DISCUSS,
    element: (
      <MainLayout>
        <DiscussPage />
      </MainLayout>
    ),
  },
  {
    path: `${ROUTES.DISCUSS}/:id`,
    element: (
      <MainLayout>
        <PostDetailPage />
      </MainLayout>
    ),
  },
  {
    path: ROUTES.LEADERBOARD,
    element: (
      <MainLayout>
        <LeaderboardPage />
      </MainLayout>
    ),
  },
  {
    path: ROUTES.MESSAGES,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <MessagesPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: `${ROUTES.MESSAGES}/:conversationId`,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <MessagesPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
]);

export default router;

