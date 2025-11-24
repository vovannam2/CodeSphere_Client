import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
import {
  FiArrowRight,
  FiStar,
  FiPlay,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiPlus,
  FiTrash2,
  FiMenu,
  FiX,
  FiSearch,
  FiFilter,
  FiArrowDown,
  FiArrowUp,
} from 'react-icons/fi';
import Container from '@/components/Layout/Container';
import Loading from '@/components/Loading';
import { problemApi, type TestCaseResponse } from '@/apis/problem.api';
import type { ProblemResponse } from '@/types/problem.types';
import { submissionApi, type RunCodeResponse, type CustomTestCase, type SubmissionResponse, type SubmissionDetailResponse } from '@/apis/submission.api';
import { ROUTES } from '@/utils/constants';
import type { ProblemDetailResponse } from '@/types/problem.types';
import toast from 'react-hot-toast';

type TabType = 'description' | 'editorial' | 'solutions' | 'submissions';

const ProblemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<ProblemDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('description');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('cpp');
  const [code, setCode] = useState<string>('');
  const [activeEditorTab, setActiveEditorTab] = useState<'code' | 'testcase' | 'result'>('code');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [timer, setTimer] = useState(0); // Timer in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sampleTestCases, setSampleTestCases] = useState<TestCaseResponse[]>([]);
  const [customTestCases, setCustomTestCases] = useState<CustomTestCase[]>([]);
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState<number>(0); // 0 = sample, >0 = custom
  const [runResults, setRunResults] = useState<RunCodeResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetailResponse | null>(null);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [isProblemListOpen, setIsProblemListOpen] = useState(false);
  const [problemList, setProblemList] = useState<ProblemResponse[]>([]);
  const [isLoadingProblemList, setIsLoadingProblemList] = useState(false);
  const [problemListSearchQuery, setProblemListSearchQuery] = useState('');
  const [totalSolved, setTotalSolved] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchProblem = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await problemApi.getProblemDetail(Number(id));
        setProblem(data);
        
        // Set default language chỉ khi chưa có selectedLanguage hoặc selectedLanguage không có trong danh sách
        if (data.languages && data.languages.length > 0) {
          setSelectedLanguage((prevLang) => {
            // Nếu ngôn ngữ hiện tại không có trong danh sách languages của problem này, thì set về ngôn ngữ đầu tiên
            const isCurrentLangAvailable = data.languages.some(lang => lang.code === prevLang);
            if (!isCurrentLangAvailable) {
              return data.languages[0].code || 'cpp';
            }
            // Giữ nguyên ngôn ngữ đã chọn
            return prevLang;
          });
        }

        // Fetch sample testcases
        try {
          const sampleCases = await problemApi.getSampleTestCases(Number(id));
          setSampleTestCases(sampleCases);
          // Set selected to first sample testcase
          if (sampleCases.length > 0) {
            setSelectedTestCaseIndex(0);
          }
        } catch (error) {
          console.error('Error fetching sample testcases:', error);
        }

        // Check bookmark status
        try {
          const bookmarkStatus = await problemApi.checkBookmark(Number(id));
          setIsBookmarked(bookmarkStatus.isBookmarked);
        } catch (error) {
          // Ignore if not authenticated
        }
      } catch (error: any) {
        const message = error.response?.data?.message || 'Không tìm thấy bài tập';
        toast.error(message);
        navigate(ROUTES.PROBLEMS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblem();
  }, [id, navigate]);

  // Fetch submissions when switching to submissions tab
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!id || activeTab !== 'submissions') return;
      
      try {
        setIsLoadingSubmissions(true);
        const response = await submissionApi.getMySubmissions({
          problemId: Number(id),
          page: 0,
          size: 50, // Get last 50 submissions
        });
        setSubmissions(response.content || []);
      } catch (error: any) {
        console.error('Error fetching submissions:', error);
        // Don't show error if user is not authenticated
        if (error.response?.status !== 401) {
          toast.error('Không thể tải lịch sử submissions');
        }
      } finally {
        setIsLoadingSubmissions(false);
      }
    };

    fetchSubmissions();
  }, [id, activeTab]);

  // Fetch problem list when opening sidebar
  useEffect(() => {
    const fetchProblemList = async () => {
      if (!isProblemListOpen) return;
      
      try {
        setIsLoadingProblemList(true);
        const response = await problemApi.getProblems({
          page: 0,
          size: 100, // Get first 100 problems
          sortBy: 'id',
          sortDir: 'ASC',
        });
        setProblemList(response.content || []);
        
        // Count solved problems
        const solved = (response.content || []).filter(p => p.status === 'COMPLETED').length;
        setTotalSolved(solved);
      } catch (error: any) {
        console.error('Error fetching problem list:', error);
        if (error.response?.status !== 401) {
          toast.error('Không thể tải danh sách problems');
        }
      } finally {
        setIsLoadingProblemList(false);
      }
    };

    fetchProblemList();
  }, [isProblemListOpen]);

  const handleToggleBookmark = async () => {
    if (!id) return;
    try {
      const response = await problemApi.toggleBookmark(Number(id));
      setIsBookmarked(response.isBookmarked);
      toast.success(response.message);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Lỗi khi đánh dấu sao';
      toast.error(message);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Vui lòng nhập code');
      return;
    }
    if (!problem) return;

    const selectedLang = problem.languages.find(l => l.code === selectedLanguage);
    if (!selectedLang) {
      toast.error('Ngôn ngữ không hợp lệ');
      return;
    }

    try {
      setIsSubmitting(true);
      setRunResults(null);
      
      const response = await submissionApi.submitCode({
        problemId: problem.id,
        languageId: selectedLang.id,
        codeContent: code,
      });

      toast.success('Đã submit thành công! Đang chờ kết quả...');
      
      // Poll for submission result (vì submission được xử lý async)
      const pollSubmission = async (submissionId: number) => {
        let attempts = 0;
        const maxAttempts = 120; // 120 lần * 500ms = 60 giây timeout
        
        // Poll ngay lập tức lần đầu tiên (không đợi interval)
        const checkSubmission = async () => {
          attempts++;
          try {
            const submission = await submissionApi.getSubmissionById(submissionId);
            
            // Debug log
            console.log(`[Poll ${attempts}] Submission ${submissionId}: state=${submission.state}, statusCode=${submission.statusCode}, isAccepted=${submission.isAccepted}`);
            
            // Check state: Chỉ "PENDING" mới là đang chờ
            // Các state khác như ACCEPTED, WRONG_ANSWER, ERROR, COMPILE_ERROR đều là đã hoàn thành
            // Nếu không có state, check statusCode: 0 = PENDING, khác 0 = đã hoàn thành
            const isPending = submission.state === 'PENDING' || 
                             (submission.state === undefined && submission.statusCode === 0);
            
            if (!isPending) {
              console.log(`✅ Submission ${submissionId} completed! state=${submission.state}, statusCode=${submission.statusCode}`);
              setIsSubmitting(false);
              
              // Convert submission result to RunCodeResponse format để hiển thị trong tab Result
              const runResult: RunCodeResponse = {
                success: submission.isAccepted || false,
                message: submission.statusMsg || '',
                testResults: submission.testResults || [],
                totalPassed: submission.totalCorrect || 0,
                totalTests: submission.totalTestcases || 0,
                compileError: submission.compileError,
                fullCompileError: submission.fullCompileError,
              };
              
              setRunResults(runResult);
              
              // Tự động chuyển sang tab Result
              setActiveEditorTab('result');
              
              if (submission.isAccepted) {
                toast.success(`✅ Accepted! ${submission.totalCorrect}/${submission.totalTestcases} test cases passed`);
              } else {
                toast.error(`❌ ${submission.statusMsg}`);
              }
              
              return true; // Đã có kết quả
            } else if (attempts >= maxAttempts) {
              setIsSubmitting(false);
              toast.error('Timeout: Không nhận được kết quả sau 60 giây');
              return true; // Dừng polling
            }
            return false; // Chưa có kết quả, tiếp tục poll
          } catch (error) {
            // Ignore errors during polling, nhưng log để debug
            console.error('Error polling submission:', error);
            return false;
          }
        };
        
        // Poll ngay lập tức lần đầu
        const firstCheck = await checkSubmission();
        if (firstCheck) return; // Đã có kết quả ngay
        
        // Tiếp tục poll với interval 500ms (nhanh hơn 1 giây)
        const interval = setInterval(async () => {
          const hasResult = await checkSubmission();
          if (hasResult) {
            clearInterval(interval);
          }
        }, 500); // Poll mỗi 500ms để nhanh hơn
      };

      pollSubmission(response.id);
    } catch (error: any) {
      setIsSubmitting(false);
      const message = error.response?.data?.message || 'Lỗi khi submit code';
      toast.error(message);
    }
  };

  const handleTest = async () => {
    if (!code.trim()) {
      toast.error('Vui lòng nhập code');
      return;
    }
    if (!problem) return;

    const selectedLang = problem.languages.find(l => l.code === selectedLanguage);
    if (!selectedLang) {
      toast.error('Ngôn ngữ không hợp lệ');
      return;
    }

    try {
      setIsRunning(true);
      setRunResults(null);

      // Run với tất cả sample testcases + custom testcases
      const customCases = customTestCases.filter(tc => tc.input.trim());
      const response = await submissionApi.runCode({
        problemId: problem.id,
        languageId: selectedLang.id,
        codeContent: code,
        customTestCases: customCases.length > 0 ? customCases : undefined,
      });

      setRunResults(response);
      
      // Tự động chuyển sang tab Result để xem kết quả
      setActiveEditorTab('result');
      
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Lỗi khi chạy code';
      toast.error(message);
    } finally {
      setIsRunning(false);
    }
  };

  // Timer effect - chỉ chạy khi isTimerRunning = true
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const handleStartTimer = () => {
    setIsTimerRunning(true);
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    setTimer(0);
    setIsTimerRunning(false);
  };

  const formatTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      EASY: 'text-green-600 bg-green-50 border-green-200',
      MEDIUM: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      HARD: 'text-red-600 bg-red-50 border-red-200',
    };
    const labels = {
      EASY: 'Dễ',
      MEDIUM: 'Trung bình',
      HARD: 'Khó',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colors[level as keyof typeof colors] || 'text-gray-600 bg-gray-50'}`}>
        {labels[level as keyof typeof labels] || level}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!problem) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar - Run/Submit + Timer */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left: Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsProblemListOpen(!isProblemListOpen)}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Toggle Problem List"
            >
              <FiMenu className="w-4 h-4" />
            </button>
            <Link
              to={ROUTES.PROBLEMS}
              className="text-base font-bold text-gray-900 hover:text-gray-700 transition-colors"
            >
              Problem List
            </Link>
          </div>

               {/* Center: Run/Submit + Timer */}
               <div className="flex items-center gap-4">
                 <button
                   onClick={handleTest}
                   disabled={isRunning || isSubmitting}
                   className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isRunning ? (
                     <FiLoader className="w-4 h-4 animate-spin" />
                   ) : (
                     <FiPlay className="w-4 h-4" />
                   )}
                   Run
                 </button>
                 <button
                   onClick={handleSubmit}
                   disabled={isRunning || isSubmitting}
                   className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isSubmitting ? (
                     <span className="flex items-center gap-2">
                       <FiLoader className="w-4 h-4 animate-spin" />
                       Submitting...
                     </span>
                   ) : (
                     'Submit'
                   )}
                 </button>
            <div className="flex items-center gap-2">
              <button
                onClick={isTimerRunning ? handleStopTimer : handleStartTimer}
                className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                {isTimerRunning ? 'Pause' : 'Start'}
              </button>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${isTimerRunning ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-mono text-gray-700">{formatTimer(timer)}</span>
              </div>
              {timer > 0 && (
                <button
                  onClick={handleResetTimer}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                  title="Reset timer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Right: Bookmark */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked
                  ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiStar className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Problem List Sidebar */}
      {isProblemListOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Sidebar - Bên trái */}
          <div className="w-96 bg-white shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">Problem List</h2>
                <FiArrowRight className="w-4 h-4 text-gray-400" />
              </div>
              <button
                onClick={() => setIsProblemListOpen(false)}
                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions"
                  value={problemListSearchQuery}
                  onChange={(e) => setProblemListSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors" title="Sort">
                  <div className="flex flex-col">
                    <FiArrowUp className="w-3 h-3 -mb-0.5" />
                    <FiArrowDown className="w-3 h-3" />
                  </div>
                </button>
                <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors" title="Filter">
                  <FiFilter className="w-4 h-4" />
                </button>
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    {totalSolved}/{problemList.length} Solved
                  </span>
                </div>
              </div>
            </div>

            {/* Problem List */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingProblemList ? (
                <div className="flex items-center justify-center py-12">
                  <FiLoader className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : problemList.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  Không có problems nào
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {problemList
                    .filter((p) => {
                      if (!problemListSearchQuery) return true;
                      const query = problemListSearchQuery.toLowerCase();
                      return (
                        p.title.toLowerCase().includes(query) ||
                        p.code.toLowerCase().includes(query)
                      );
                    })
                    .map((p) => {
                      const isCurrent = p.id === Number(id);
                      const isSolved = p.status === 'COMPLETED';
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            navigate(`${ROUTES.PROBLEMS}/${p.id}`);
                            setIsProblemListOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                            isCurrent ? 'bg-gray-100' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isSolved && (
                              <FiCheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            )}
                            <span className={`text-sm font-medium ${isSolved ? 'text-gray-900' : 'text-gray-700'}`}>
                              {p.code || p.id}. {p.title}
                            </span>
                            <span className={`ml-auto text-xs font-medium ${
                              p.level === 'EASY' ? 'text-green-600' :
                              p.level === 'MEDIUM' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {p.level === 'EASY' ? 'Easy' :
                               p.level === 'MEDIUM' ? 'Med.' :
                               'Hard'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
          {/* Overlay - Bên phải sidebar */}
          <div
            className="flex-1 bg-black bg-opacity-50"
            onClick={() => setIsProblemListOpen(false)}
          />
        </div>
      )}

      {/* Main Content - 2 Columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 border-r border-gray-200 bg-white overflow-y-auto">
          <Container>
            <div className="py-6">
              {/* Tabs */}
              <div className="flex items-center border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'description'
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('editorial')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'editorial'
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Editorial
                </button>
                <button
                  onClick={() => setActiveTab('solutions')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'solutions'
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Solutions
                </button>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'submissions'
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Submissions
                </button>
              </div>

              {/* Problem Title */}
              <div className="mb-4">
                <h1 className="text-2xl font-semibold text-gray-900 mb-3">
                  {problem.title}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  {getLevelBadge(problem.level)}
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
                            // Xác định màu sắc cho status badge
                            const getStatusBadge = () => {
                              if (submission.state === 'ACCEPTED' || submission.isAccepted) {
                                return 'text-green-600 font-medium';
                              } else if (submission.state === 'COMPILE_ERROR' || submission.state === 'ERROR') {
                                return 'text-red-600 font-medium';
                              } else {
                                // WRONG_ANSWER hoặc các trạng thái khác
                                return 'text-yellow-600 font-medium';
                              }
                            };
                            
                            const statusColor = getStatusBadge();
                            const isSelected = selectedSubmission?.id === submission.id;
                            
                            return (
                              <tr
                                key={submission.id}
                                onClick={async () => {
                                  try {
                                    const detail = await submissionApi.getSubmissionById(submission.id);
                                    setSelectedSubmission(detail);
                                    // Hiển thị code trong editor
                                    setCode(detail.codeContent || '');
                                    // Set language nếu có
                                    if (detail.languageName && problem?.languages) {
                                      const lang = problem.languages.find(l => 
                                        l.name === detail.languageName || l.code === detail.languageName?.toLowerCase()
                                      );
                                      if (lang && lang.code) {
                                        setSelectedLanguage(lang.code);
                                      }
                                    }
                                    // Convert submission result to RunCodeResponse format
                                    const runResult: RunCodeResponse = {
                                      success: detail.isAccepted || false,
                                      message: detail.statusMsg || '',
                                      testResults: detail.testResults || [],
                                      totalPassed: detail.totalCorrect || 0,
                                      totalTests: detail.totalTestcases || 0,
                                      compileError: detail.compileError,
                                      fullCompileError: detail.fullCompileError,
                                    };
                                    setRunResults(runResult);
                                    // Chuyển sang tab Result để xem kết quả
                                    setActiveEditorTab('result');
                                  } catch (error: any) {
                                    toast.error('Không thể tải chi tiết submission');
                                  }
                                }}
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
            </div>
          </Container>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col bg-white border-l border-gray-200">
          {/* Editor Tabs */}
          <div className="flex items-center border-b border-gray-200">
            <button
              onClick={() => setActiveEditorTab('code')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeEditorTab === 'code'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Code
            </button>
            <button
              onClick={() => setActiveEditorTab('testcase')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeEditorTab === 'testcase'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Testcase
            </button>
            <button
              onClick={() => setActiveEditorTab('result')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeEditorTab === 'result'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Result
              {runResults && (
                <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                  runResults.success ? 'bg-green-500' : 'bg-red-500'
                }`} />
              )}
            </button>
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-hidden">
            {activeEditorTab === 'code' && (
              <div className="h-full flex flex-col">
                {/* Language Selector */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {problem.languages.map((lang) => (
                        <option key={lang.id} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                    <button className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      Auto
                    </button>
                  </div>
                </div>

                {/* Code Editor */}
                <div className="flex-1 bg-white">
                  <Editor
                    height="100%"
                    language={selectedLanguage}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 16,
                      lineHeight: 26,
                      wordWrap: 'on',
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      readOnly: false,
                      lineNumbers: 'on',
                      renderLineHighlight: 'all',
                      selectOnLineNumbers: true,
                      roundedSelection: true,
                      cursorStyle: 'line',
                      cursorBlinking: 'smooth',
                      fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                      fontLigatures: false,
                      letterSpacing: 0.5,
                      tabSize: 2,
                      insertSpaces: true,
                      detectIndentation: false,
                      bracketPairColorization: { enabled: true },
                      colorDecorators: true,
                      suggestOnTriggerCharacters: true,
                      quickSuggestions: true,
                      // Enable syntax validation
                      validate: true,
                      // Show errors and warnings
                      'editor.showFoldingControls': 'always',
                      'editor.parameterHints.enabled': true,
                      'editor.quickSuggestions': {
                        other: true,
                        comments: false,
                        strings: false,
                      },
                      // Enable semantic highlighting for better error detection
                      'editor.semanticHighlighting.enabled': true,
                      // Code folding (mũi tên thu gọn/mở rộng)
                      folding: true,
                      foldingStrategy: 'indentation',
                      showFoldingControls: 'always',
                      unfoldOnClickAfterEndOfLine: true,
                      // Syntax highlighting colors (light theme)
                      'editor.background': '#ffffff',
                      'editor.foreground': '#24292e',
                      'editor.lineHighlightBackground': '#f6f8fa',
                      'editor.selectionBackground': '#b3d4fc',
                      'editor.inactiveSelectionBackground': '#e5e5e5',
                      'editorCursor.foreground': '#24292e',
                      'editorWhitespace.foreground': '#d1d5da',
                      'editorIndentGuide.background': '#d1d5da',
                      'editorIndentGuide.activeBackground': '#6a737d',
                      'editorLineNumber.foreground': '#959da5',
                      'editorLineNumber.activeForeground': '#24292e',
                      // Folding colors
                      'editor.foldBackground': '#f6f8fa',
                      'editorGutter.foldingControlForeground': '#6a737d',
                      // Syntax colors (light theme)
                      'editor.tokenColorCustomizations': {
                        textMateRules: [
                          {
                            scope: ['comment'],
                            settings: {
                              foreground: '#6a737d',
                              fontStyle: 'italic'
                            }
                          },
                          {
                            scope: ['keyword', 'storage.type', 'storage.modifier'],
                            settings: {
                              foreground: '#d73a49',
                              fontStyle: 'bold'
                            }
                          },
                          {
                            scope: ['keyword.control', 'keyword.operator'],
                            settings: {
                              foreground: '#d73a49',
                              fontStyle: 'bold'
                            }
                          },
                          {
                            scope: ['meta.preprocessor', 'entity.name.function.preprocessor', 'punctuation.definition.directive'],
                            settings: {
                              foreground: '#6f42c1',
                              fontStyle: 'bold'
                            }
                          },
                          {
                            scope: ['string', 'string.quoted'],
                            settings: {
                              foreground: '#032f62'
                            }
                          },
                          {
                            scope: ['constant.numeric', 'constant.language'],
                            settings: {
                              foreground: '#005cc5'
                            }
                          },
                          {
                            scope: ['entity.name.function', 'entity.name.method'],
                            settings: {
                              foreground: '#6f42c1'
                            }
                          },
                          {
                            scope: ['entity.name.class', 'entity.name.type'],
                            settings: {
                              foreground: '#e36209'
                            }
                          },
                          {
                            scope: ['variable', 'variable.parameter'],
                            settings: {
                              foreground: '#e36209'
                            }
                          },
                          {
                            scope: ['punctuation', 'meta.brace'],
                            settings: {
                              foreground: '#24292e'
                            }
                          },
                          {
                            scope: ['support.type', 'support.class'],
                            settings: {
                              foreground: '#005cc5'
                            }
                          }
                        ]
                      }
                    }}
                  />
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                  <span>Saved</span>
                  <span>Ln 1, Col 1</span>
                </div>
              </div>
            )}
            
            {activeEditorTab === 'testcase' && (
              <div className="p-4 h-full overflow-y-auto bg-gray-50">
                {/* Test Case Tabs */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                  {/* Sample Test Cases - Hiển thị sẵn */}
                  {sampleTestCases.length > 0 ? (
                    sampleTestCases.map((testCase, index) => (
                      <button
                        key={`sample-${testCase.id}`}
                        onClick={() => setSelectedTestCaseIndex(index)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${
                          selectedTestCaseIndex === index
                            ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                        }`}
                      >
                        Case {index + 1}
                      </button>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">Chưa có sample testcases</div>
                  )}
                  
                  {/* Custom Test Cases */}
                  {customTestCases.map((_, index) => (
                    <button
                      key={`custom-${index}`}
                      onClick={() => setSelectedTestCaseIndex(sampleTestCases.length + index)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${
                        selectedTestCaseIndex === sampleTestCases.length + index
                          ? 'bg-green-500 text-white border-green-500 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-300'
                      }`}
                    >
                      Case {sampleTestCases.length + index + 1}
                    </button>
                  ))}
                  
                  {/* Add New Custom Test Case */}
                  <button
                    onClick={() => {
                      const newCase: CustomTestCase = { input: '', expectedOutput: '' };
                      setCustomTestCases([...customTestCases, newCase]);
                      setSelectedTestCaseIndex(sampleTestCases.length + customTestCases.length);
                    }}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors whitespace-nowrap flex items-center gap-1"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Thêm</span>
                  </button>
                </div>

                {/* Test Case Content */}
                <div className="space-y-4">
                  {selectedTestCaseIndex < sampleTestCases.length ? (
                    // Sample Test Case (read-only) - Hiển thị sẵn
                    <>
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Sample Testcase
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Input
                        </label>
                        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm bg-white text-gray-900 shadow-sm">
                          <pre className="whitespace-pre-wrap">{sampleTestCases[selectedTestCaseIndex]?.input || 'N/A'}</pre>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expected Output
                        </label>
                        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm bg-white text-gray-900 shadow-sm">
                          <pre className="whitespace-pre-wrap">{sampleTestCases[selectedTestCaseIndex]?.expectedOutput || 'N/A'}</pre>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Custom Test Case (editable)
                    (() => {
                      const customIndex = selectedTestCaseIndex - sampleTestCases.length;
                      const currentCase = customTestCases[customIndex] || { input: '', expectedOutput: '' };
                      
                      return (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Custom Testcase {customIndex + 1}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                const newCases = customTestCases.filter((_, i) => i !== customIndex);
                                setCustomTestCases(newCases);
                                if (newCases.length === 0) {
                                  setSelectedTestCaseIndex(0);
                                } else if (selectedTestCaseIndex >= sampleTestCases.length + newCases.length) {
                                  setSelectedTestCaseIndex(sampleTestCases.length + newCases.length - 1);
                                }
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Xóa testcase này"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Input
                            </label>
                            <textarea
                              value={currentCase.input}
                              onChange={(e) => {
                                const newCases = [...customTestCases];
                                if (!newCases[customIndex]) {
                                  newCases[customIndex] = { input: '', expectedOutput: '' };
                                }
                                newCases[customIndex] = {
                                  ...newCases[customIndex],
                                  input: e.target.value,
                                };
                                setCustomTestCases(newCases);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={6}
                              placeholder="Enter test case input..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Expected Output (optional)
                            </label>
                            <textarea
                              value={currentCase.expectedOutput || ''}
                              onChange={(e) => {
                                const newCases = [...customTestCases];
                                if (!newCases[customIndex]) {
                                  newCases[customIndex] = { input: '', expectedOutput: '' };
                                }
                                newCases[customIndex] = {
                                  ...newCases[customIndex],
                                  expectedOutput: e.target.value,
                                };
                                setCustomTestCases(newCases);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={6}
                              placeholder="Enter expected output (optional)..."
                            />
                          </div>
                        </>
                      );
                    })()
                  )}
                  
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                    <p>💡 Tip: Run sẽ chạy tất cả sample testcases ({sampleTestCases.length}) và {customTestCases.filter(tc => tc.input.trim()).length} custom testcase(s) bạn đã tạo.</p>
                  </div>
                </div>

                {/* Run Results - Hiển thị trong tab Testcase */}
                {runResults && activeEditorTab === 'testcase' && (
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">Kết quả</h3>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${
                        runResults.success 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {runResults.success ? (
                          <FiCheckCircle className="w-4 h-4" />
                        ) : (
                          <FiXCircle className="w-4 h-4" />
                        )}
                        {runResults.totalPassed}/{runResults.totalTests} passed
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {runResults.testResults.map((result, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${
                            result.isPassed
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            {result.isPassed ? (
                              <FiCheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <FiXCircle className="w-5 h-5 text-red-600" />
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              Test Case {index + 1}
                            </span>
                            <span className="text-xs text-gray-500 ml-auto">
                              {result.runtime} • {result.memory}
                            </span>
                          </div>
                          
                          {!result.isPassed && (
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Input:</span>
                                <pre className="mt-1 p-2 bg-white rounded border border-gray-200 text-xs font-mono overflow-x-auto">
                                  {result.input}
                                </pre>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="font-medium text-gray-700">Expected:</span>
                                  <pre className="mt-1 p-2 bg-white rounded border border-gray-200 text-xs font-mono overflow-x-auto">
                                    {result.expectedOutput}
                                  </pre>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Got:</span>
                                  <pre className="mt-1 p-2 bg-white rounded border border-gray-200 text-xs font-mono overflow-x-auto">
                                    {result.actualOutput || '(empty)'}
                                  </pre>
                                </div>
                              </div>
                              {result.errorMessage && (
                                <div>
                                  <span className="font-medium text-red-700">Error:</span>
                                  <pre className="mt-1 p-2 bg-red-100 rounded border border-red-200 text-xs font-mono text-red-800 overflow-x-auto">
                                    {result.errorMessage}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeEditorTab === 'result' && (
              // Result Tab
              <div className="p-4 h-full overflow-y-auto bg-gray-50">
                {runResults ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Kết quả</h3>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                        runResults.success 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {runResults.success ? (
                          <FiCheckCircle className="w-5 h-5" />
                        ) : (
                          <FiXCircle className="w-5 h-5" />
                        )}
                        <span className="font-semibold">
                          {runResults.totalPassed}/{runResults.totalTests} passed
                        </span>
                      </div>
                    </div>
                    
                    {/* Summary Message */}
                    {runResults.message && (
                      <div className={`mb-6 p-4 rounded-lg border ${
                        runResults.success 
                          ? 'bg-green-50 border-green-200 text-green-800' 
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}>
                        <p className="font-medium">{runResults.message}</p>
                      </div>
                    )}
                    
                    {/* Compile Error - Hiển thị chi tiết lỗi compile */}
                    {(runResults.compileError || runResults.fullCompileError) && (
                      <div className="mb-6 p-4 rounded-lg border-2 border-red-300 bg-red-50">
                        <div className="flex items-center gap-2 mb-3">
                          <FiXCircle className="w-5 h-5 text-red-600" />
                          <h4 className="text-base font-semibold text-red-900">Compilation Error</h4>
                        </div>
                        <div className="space-y-2">
                          {runResults.fullCompileError && (
                            <div>
                              <p className="text-sm font-medium text-red-800 mb-1">Full Error:</p>
                              <pre className="p-3 bg-white rounded border border-red-200 text-sm font-mono text-red-900 overflow-x-auto whitespace-pre-wrap">
                                {runResults.fullCompileError}
                              </pre>
                            </div>
                          )}
                          {runResults.compileError && !runResults.fullCompileError && (
                            <div>
                              <p className="text-sm font-medium text-red-800 mb-1">Error:</p>
                              <pre className="p-3 bg-white rounded border border-red-200 text-sm font-mono text-red-900 overflow-x-auto whitespace-pre-wrap">
                                {runResults.compileError}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Test Results Details */}
                    {runResults.testResults && runResults.testResults.length > 0 ? (
                      <div className="space-y-4">
                        {runResults.testResults.map((result, index) => (
                          <div
                            key={index}
                            className={`p-5 rounded-lg border-2 ${
                              result.isPassed
                                ? 'bg-green-50 border-green-300'
                                : 'bg-red-50 border-red-300'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-4">
                              {result.isPassed ? (
                                <FiCheckCircle className="w-6 h-6 text-green-600" />
                              ) : (
                                <FiXCircle className="w-6 h-6 text-red-600" />
                              )}
                              <span className="text-base font-semibold text-gray-900">
                                Test Case {index + 1}
                                {result.testCaseId === null && ' (Custom)'}
                              </span>
                              <span className="text-sm text-gray-600 ml-auto">
                                {result.runtime} • {result.memory}
                              </span>
                            </div>
                            
                            {!result.isPassed && (
                              <div className="space-y-3 text-sm">
                                <div>
                                  <span className="font-semibold text-gray-700">Input:</span>
                                  <pre className="mt-2 p-3 bg-white rounded-lg border border-gray-300 text-sm font-mono overflow-x-auto">
                                    {result.input || '(empty)'}
                                  </pre>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <span className="font-semibold text-gray-700">Expected:</span>
                                    <pre className="mt-2 p-3 bg-white rounded-lg border border-gray-300 text-sm font-mono overflow-x-auto">
                                      {result.expectedOutput || '(empty)'}
                                    </pre>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-gray-700">Got:</span>
                                    <pre className="mt-2 p-3 bg-white rounded-lg border border-gray-300 text-sm font-mono overflow-x-auto">
                                      {result.actualOutput || '(empty)'}
                                    </pre>
                                  </div>
                                </div>
                                {result.errorMessage && (
                                  <div>
                                    <span className="font-semibold text-red-700">Error:</span>
                                    <pre className="mt-2 p-3 bg-red-100 rounded-lg border border-red-300 text-sm font-mono text-red-800 overflow-x-auto">
                                      {result.errorMessage}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">Không có chi tiết test cases</p>
                        <p className="text-xs mt-2">Tổng kết: {runResults.totalPassed}/{runResults.totalTests} test cases passed</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <FiPlay className="w-16 h-16 mb-4 text-gray-400" />
                    <p className="text-lg font-medium">Chưa có kết quả</p>
                    <p className="text-sm mt-2">Nhấn "Run" hoặc "Submit" để chạy code và xem kết quả</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetailPage;

