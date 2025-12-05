import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAward, FiTrendingUp } from 'react-icons/fi';
import { leaderboardApi } from '@/apis/leaderboard.api';
import type { GlobalLeaderboardResponse } from '@/types/leaderboard.types';
import Loading from '@/components/Loading';
import toast from 'react-hot-toast';
import Avatar from '@/components/Avatar';

interface GlobalLeaderboardTableProps {
  highlightUserId?: number;
}

const GlobalLeaderboardTable = ({ highlightUserId }: GlobalLeaderboardTableProps) => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<GlobalLeaderboardResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const data = await leaderboardApi.getGlobalLeaderboard();
        setLeaderboard(data);
      } catch (error: any) {
        console.error('Error fetching global leaderboard:', error);
        toast.error('Không thể tải bảng xếp hạng toàn cục');
        setLeaderboard([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center gap-1">
          <span className="text-lg">🥇</span>
          <span className="font-bold text-yellow-600">1</span>
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center gap-1">
          <span className="text-lg">🥈</span>
          <span className="font-bold text-gray-400">2</span>
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center gap-1">
          <span className="text-lg">🥉</span>
          <span className="font-bold text-orange-600">3</span>
        </div>
      );
    }
    return <span className="font-medium text-gray-700">{rank}</span>;
  };

  const getLevelBadge = (level: string, count: number) => {
    const colors = {
      EASY: 'text-green-600 bg-green-50',
      MEDIUM: 'text-yellow-600 bg-yellow-50',
      HARD: 'text-red-600 bg-red-50',
    };
    const labels = {
      EASY: 'Dễ',
      MEDIUM: 'Trung bình',
      HARD: 'Khó',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[level as keyof typeof colors] || 'text-gray-600 bg-gray-50'}`}>
        {labels[level as keyof typeof labels] || level}: {count}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loading size="md" />
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <FiAward className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có dữ liệu</h3>
        <p className="text-gray-500">Chưa có ai giải đúng bài tập nào</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hạng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người dùng
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng số bài đã giải
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Theo độ khó
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.map((entry) => {
              const isHighlighted = highlightUserId && entry.userId === highlightUserId;
              return (
                <tr
                  key={entry.userId}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                    isHighlighted ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''
                  }`}
                  onClick={() => navigate(`/profile/${entry.userId}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRankBadge(entry.rank)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar username={entry.username} size="sm" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{entry.username}</span>
                          {isHighlighted && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                              Bạn
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <FiTrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-lg font-bold text-gray-900">{entry.totalSolved}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {entry.solvedEasy > 0 && getLevelBadge('EASY', entry.solvedEasy)}
                      {entry.solvedMedium > 0 && getLevelBadge('MEDIUM', entry.solvedMedium)}
                      {entry.solvedHard > 0 && getLevelBadge('HARD', entry.solvedHard)}
                      {entry.solvedEasy === 0 && entry.solvedMedium === 0 && entry.solvedHard === 0 && (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GlobalLeaderboardTable;

