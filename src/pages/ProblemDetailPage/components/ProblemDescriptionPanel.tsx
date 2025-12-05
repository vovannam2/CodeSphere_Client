import Container from '@/components/Layout/Container';
import CommentList from '@/components/Comment/CommentList';
import MyRankCard from '@/components/Leaderboard/MyRankCard';
import LeaderboardTable from '@/components/Leaderboard/LeaderboardTable';
import { FiLoader, FiAward } from 'react-icons/fi';
import type { ProblemDetailResponse } from '@/types/problem.types';
import type { SubmissionResponse, SubmissionDetailResponse, RunCodeResponse } from '@/apis/submission.api';
import { getLevelBadge } from '../utils';
import type { TabType } from '../types';

interface ProblemDescriptionPanelProps {
  problem: ProblemDetailResponse;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  submissions: SubmissionResponse[];
  isLoadingSubmissions: boolean;
  selectedSubmission: SubmissionDetailResponse | null;
  onSelectSubmission: (submission: SubmissionDetailResponse) => void;
  runResults: RunCodeResponse | null;
  currentUserId?: number;
}

const ProblemDescriptionPanel = ({
  problem,
  activeTab,
  onTabChange,
  submissions,
  isLoadingSubmissions,
  selectedSubmission,
  onSelectSubmission,
  runResults,
  currentUserId,
}: ProblemDescriptionPanelProps) => {
  const badge = getLevelBadge(problem.level);

  return (
    <Container>
      <div className="py-3">
        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 mb-3">
          <button
            onClick={() => onTabChange('description')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'description'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => onTabChange('editorial')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'editorial'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Editorial
          </button>
          <button
            onClick={() => onTabChange('solutions')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'solutions'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Solutions
          </button>
          <button
            onClick={() => onTabChange('submissions')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'submissions'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Submissions
          </button>
          <button
            onClick={() => onTabChange('comments')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'comments'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Comments
          </button>
          <button
            onClick={() => onTabChange('leaderboard')}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'leaderboard'
                ? 'text-yellow-600 border-b-2 border-yellow-600 bg-yellow-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FiAward className="w-4 h-4" />
            <span>Leaderboard</span>
          </button>
        </div>

        {/* Problem Title */}
        <div className="mb-2">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {problem.title}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${badge.className}`}>
              {badge.label}
            </span>
            {problem.tags && problem.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Topics:</span>
                {problem.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2.5 py-1 rounded-md text-xs font-medium text-blue-600 bg-blue-50"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Problem Content */}
        {activeTab === 'description' && (
          <div className="prose max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: problem.content || 'Chưa có nội dung' }}
              className="text-gray-700"
            />

            {/* Examples */}
            {problem.sampleInput && problem.sampleOutput && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Examples:</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="mb-3">
                    <strong className="text-sm font-medium text-gray-700">Input:</strong>
                    <pre className="mt-1 text-sm text-gray-800 whitespace-pre-wrap font-mono">
                      {problem.sampleInput}
                    </pre>
                  </div>
                  <div>
                    <strong className="text-sm font-medium text-gray-700">Output:</strong>
                    <pre className="mt-1 text-sm text-gray-800 whitespace-pre-wrap font-mono">
                      {problem.sampleOutput}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Constraints */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Constraints:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Time limit: {problem.timeLimitMs}ms</li>
                <li>Memory limit: {problem.memoryLimitMb}MB</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'editorial' && (
          <div className="text-center py-12 text-gray-500">
            Editorial coming soon...
          </div>
        )}

        {activeTab === 'solutions' && (
          <div className="text-center py-12 text-gray-500">
            Solutions coming soon...
          </div>
        )}

        {activeTab === 'comments' && (
          <div>
            <CommentList problemId={problem.id} />
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Lịch sử Submissions</h2>
            
            {isLoadingSubmissions ? (
              <div className="flex items-center justify-center py-12">
                <FiLoader className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Đang tải...</span>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Chưa có submission nào</p>
                <p className="text-sm mt-2">Submit code để xem lịch sử ở đây</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                        Language
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                        Runtime
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                        Memory
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                        Submitted
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission) => {
                      const getStatusBadge = () => {
                        if (submission.state === 'ACCEPTED' || submission.isAccepted) {
                          return 'text-green-600 font-medium';
                        } else if (submission.state === 'COMPILE_ERROR' || submission.state === 'ERROR') {
                          return 'text-red-600 font-medium';
                        } else {
                          return 'text-yellow-600 font-medium';
                        }
                      };
                      
                      const statusColor = getStatusBadge();
                      const isSelected = selectedSubmission?.id === submission.id;
                      
                      return (
                        <tr
                          key={submission.id}
                          onClick={() => onSelectSubmission(submission as any)}
                          className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50' : ''
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div className="flex flex-col">
                              <span className={statusColor}>
                                {submission.statusMsg}
                              </span>
                              <span className="text-xs text-gray-400 mt-0.5">
                                {new Date(submission.createdAt).toLocaleDateString('vi-VN', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-sm text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                              {submission.languageName}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-sm text-gray-600">
                              {submission.statusRuntime}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-sm text-gray-600">
                              {submission.statusMemory}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-xs text-gray-500">
                              {new Date(submission.createdAt).toLocaleString('vi-VN', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg">
                <FiAward className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Bảng xếp hạng</h2>
                <p className="text-sm text-gray-600">Xem thứ hạng của bạn và các lập trình viên khác</p>
              </div>
            </div>

            {/* My Rank Card */}
            {currentUserId && (
              <MyRankCard problemId={problem.id} userId={currentUserId} compact={false} />
            )}

            {/* Leaderboard Table */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Contributors</h3>
              <LeaderboardTable
                problemId={problem.id}
                highlightUserId={currentUserId}
                compact={false}
              />
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default ProblemDescriptionPanel;

