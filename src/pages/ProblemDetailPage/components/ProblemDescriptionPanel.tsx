import Container from '@/components/Layout/Container';
import CommentList from '@/components/Comment/CommentList';
import MyRankCard from '@/components/Leaderboard/MyRankCard';
import LeaderboardTable from '@/components/Leaderboard/LeaderboardTable';
import { FiLoader, FiAward } from 'react-icons/fi';
import type { ProblemDetailResponse } from '@/types/problem.types';
import type { SubmissionResponse, SubmissionDetailResponse, RunCodeResponse } from '@/apis/submission.api';
import type { ContestSubmissionResponse } from '@/types/contest.types';
import { getLevelBadge } from '../utils';
import type { TabType } from '../types';

interface ProblemDescriptionPanelProps {
  problem: ProblemDetailResponse;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  submissions: SubmissionResponse[];
  contestSubmissions?: ContestSubmissionResponse[];
  isLoadingSubmissions: boolean;
  selectedSubmission: SubmissionDetailResponse | null;
  onSelectSubmission: (submission: SubmissionDetailResponse) => void;
  runResults: RunCodeResponse | null;
  currentUserId?: number;
  contestId?: string | null;
}

const ProblemDescriptionPanel = ({
  problem,
  activeTab,
  onTabChange,
  submissions,
  contestSubmissions = [],
  isLoadingSubmissions,
  selectedSubmission,
  onSelectSubmission,
  runResults,
  currentUserId,
  contestId,
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
          {!contestId && (
            <>
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
            </>
          )}
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
          {!contestId && (
            <>
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
            </>
          )}
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
          <>
            <style>{`
              .prose .problem-examples .example-item ul {
                list-style-type: disc !important;
                list-style-position: inside !important;
                padding-left: 1rem !important;
                margin-top: 0.5rem !important;
                margin-bottom: 0.5rem !important;
              }
              .prose .problem-examples .example-item ul li {
                display: list-item !important;
                margin-bottom: 0.5rem !important;
                line-height: 1.75 !important;
              }
              .prose .problem-examples .example-item ul li:last-child {
                margin-bottom: 0 !important;
              }
              .prose .problem-examples .example-item code {
                background-color: rgb(241 245 249) !important;
                padding: 0.125rem 0.375rem !important;
                border-radius: 0.25rem !important;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
                font-size: 0.875rem !important;
                color: rgb(30 41 59) !important;
              }
            `}</style>
            <div className="prose max-w-none">
              <style>{`
                .prose .problem-description {
                  line-height: 1.8;
                  color: #374151;
                }
                .prose .problem-description .problem-h1 {
                  font-size: 1.75rem;
                  font-weight: 700;
                  color: #1e293b;
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                  padding-bottom: 0.5rem;
                  border-bottom: 2px solid #e2e8f0;
                }
                .prose .problem-description .problem-h2 {
                  font-size: 1.5rem;
                  font-weight: 600;
                  color: #1e293b;
                  margin-top: 1.5rem;
                  margin-bottom: 0.75rem;
                }
                .prose .problem-description .problem-h3 {
                  font-size: 1.25rem;
                  font-weight: 600;
                  color: #334155;
                  margin-top: 1.25rem;
                  margin-bottom: 0.5rem;
                }
                .prose .problem-description .problem-paragraph {
                  margin-bottom: 1rem;
                  line-height: 1.8;
                  color: #374151;
                }
                .prose .problem-description .problem-bold,
                .prose .problem-description strong.problem-bold,
                .prose .problem-description strong {
                  font-weight: 600 !important;
                  color: #1e293b !important;
                }
                .prose .problem-description .problem-italic {
                  font-style: italic;
                  color: #4b5563;
                }
                .prose .problem-description .problem-code {
                  background-color: #f1f5f9;
                  color: #0f172a;
                  padding: 0.125rem 0.5rem;
                  border-radius: 0.375rem;
                  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                  font-size: 0.875rem;
                  border: 1px solid #e2e8f0;
                }
              `}</style>
              <div
                dangerouslySetInnerHTML={{ __html: problem.content || 'No content yet' }}
                className="text-gray-700"
              />
            </div>
          </>
        )}

        {!contestId && activeTab === 'editorial' && (
          <div className="text-center py-12 text-gray-500">
            Editorial coming soon...
          </div>
        )}

        {!contestId && activeTab === 'solutions' && (
          <div className="text-center py-12 text-gray-500">
            Solutions coming soon...
          </div>
        )}

        {!contestId && activeTab === 'comments' && (
          <div>
            <CommentList problemId={problem.id} />
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {contestId ? 'Submission History (Contest)' : 'Submission History'}
              </h2>
              {contestId && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  Contest Mode
                </span>
              )}
            </div>
            
            {isLoadingSubmissions ? (
              <div className="flex items-center justify-center py-12">
                <FiLoader className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading...</span>
              </div>
            ) : (contestId ? contestSubmissions : submissions).length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No submissions yet</p>
                <p className="text-sm mt-2">Submit code to see history here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {contestId && (
                        <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                          Score
                        </th>
                      )}
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
                    {(contestId ? contestSubmissions : submissions).map((submission: any) => {
                      // Handle both SubmissionResponse and ContestSubmissionResponse
                      const isContestSubmission = contestId && 'score' in submission;
                      const statusMsg = submission.statusMsg || (submission.isAccepted ? 'Accepted' : 'Wrong Answer');
                      const language = submission.languageName || submission.language || 'N/A';
                      const runtime = submission.statusRuntime || (submission.runtime ? `${submission.runtime}ms` : 'N/A');
                      const memory = submission.statusMemory || (submission.memory ? `${submission.memory}MB` : 'N/A');
                      const submittedAt = submission.submittedAt || submission.createdAt;
                      const isAccepted = submission.isAccepted || (submission.state === 'ACCEPTED');
                      const getStatusBadge = () => {
                        if (isAccepted) {
                          return 'text-green-600 font-medium';
                        } else if (statusMsg.includes('Error') || statusMsg.includes('Compile')) {
                          return 'text-red-600 font-medium';
                        } else {
                          return 'text-yellow-600 font-medium';
                        }
                      };
                      
                      const statusColor = getStatusBadge();
                      const isSelected = selectedSubmission?.id === (isContestSubmission ? submission.submissionId : submission.id);
                      
                      return (
                        <tr
                          key={isContestSubmission ? submission.id : submission.id}
                          onClick={() => {
                            if (isContestSubmission && submission.codeContent) {
                              // For contest submissions, directly set code from codeContent
                              onSelectSubmission({
                                ...submission,
                                id: submission.submissionId,
                                codeContent: submission.codeContent
                              } as any);
                            } else if (!isContestSubmission) {
                              onSelectSubmission(submission as any);
                            }
                          }}
                          className={`border-b border-gray-100 hover:bg-gray-50 ${(isContestSubmission && submission.codeContent) || !isContestSubmission ? 'cursor-pointer' : ''} transition-colors ${
                            isSelected ? 'bg-blue-50' : ''
                          }`}
                        >
                          {contestId && (
                            <td className="py-3 px-3">
                              <span className="text-sm font-semibold text-blue-600">
                                {submission.score || 0} pts
                              </span>
                            </td>
                          )}
                          <td className="py-3 px-3">
                            <div className="flex flex-col">
                              <span className={statusColor}>
                                {statusMsg}
                              </span>
                              <span className="text-xs text-gray-400 mt-0.5">
                                {new Date(submittedAt).toLocaleDateString('vi-VN', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-sm text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                              {language}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-sm text-gray-600">
                              {runtime}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-sm text-gray-600">
                              {memory}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-xs text-gray-500">
                              {new Date(submittedAt).toLocaleString('vi-VN', {
                                month: 'short',
                                hour12: false,
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

        {!contestId && activeTab === 'leaderboard' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg">
                <FiAward className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Leaderboard</h2>
                <p className="text-sm text-gray-600">View your ranking and other programmers</p>
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

