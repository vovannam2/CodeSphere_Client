import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '@/components/Layout/Container';
import Button from '@/components/Button';
import Loading from '@/components/Loading';
import CodeEditorDisplay from '@/components/CodeEditor/CodeEditorDisplay';
import { ROUTES } from '@/utils/constants';
import { problemApi } from '@/apis/problem.api';
import type { ProblemResponse } from '@/types/problem.types';

const HomePage = () => {
  const [featuredProblems, setFeaturedProblems] = useState<ProblemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProblems = async () => {
      try {
        setIsLoading(true);
        const response = await problemApi.getProblems({
          page: 0,
          size: 3,
          sortBy: 'createdAt',
          sortDir: 'DESC',
        });
        setFeaturedProblems(response.content);
      } catch (error) {
        console.error('Error fetching featured problems:', error);
        setFeaturedProblems([
          { id: 1, title: 'Two Sum', level: 'EASY' } as ProblemResponse,
          { id: 2, title: 'Reverse Linked List', level: 'MEDIUM' } as ProblemResponse,
          { id: 3, title: 'Binary Tree Maximum Path Sum', level: 'HARD' } as ProblemResponse,
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProblems();
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Introduction Section */}
      <section className="py-20 lg:py-32">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Chào mừng đến với CodeSphere
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                CodeSphere là nền tảng luyện tập lập trình toàn diện, giúp bạn nâng cao kỹ năng coding, 
                tham gia các cuộc thi lập trình, và kết nối với cộng đồng lập trình viên trên toàn thế giới.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to={ROUTES.PROBLEMS}>
                  <Button variant="primary" size="lg">
                    Bắt đầu luyện tập
                  </Button>
                </Link>
                <Link to={ROUTES.LEADERBOARD}>
                  <Button variant="outline" size="lg">
                    Xem Leaderboard
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side - Code Editor */}
            <CodeEditorDisplay />
          </div>
        </Container>
      </section>

      {/* Featured Problems Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Bài tập nổi bật
            </h2>
            <p className="text-lg text-gray-600">
              Khám phá các bài tập phổ biến được nhiều lập trình viên giải
            </p>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loading />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProblems.map((problem) => (
                <Link
                  key={problem.id}
                  to={`${ROUTES.PROBLEMS}/${problem.id}`}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {problem.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        problem.level === 'EASY'
                          ? 'bg-green-100 text-green-800'
                          : problem.level === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {problem.level}
                    </span>
                  </div>
                  {problem.authorName && (
                    <p className="text-sm text-gray-600">
                      Tác giả: {problem.authorName}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link to={ROUTES.PROBLEMS}>
              <Button variant="outline" size="lg">
                Xem tất cả bài tập
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-lg">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hàng nghìn bài tập</h3>
              <p className="text-gray-600">
                Luyện tập với các bài tập từ cơ bản đến nâng cao
              </p>
            </div>
            <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-lg">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Contest thường xuyên</h3>
              <p className="text-gray-600">
                Tham gia các cuộc thi lập trình để nâng cao kỹ năng
              </p>
            </div>
            <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-lg">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Cộng đồng sôi động</h3>
              <p className="text-gray-600">
                Thảo luận và học hỏi từ cộng đồng lập trình viên
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
