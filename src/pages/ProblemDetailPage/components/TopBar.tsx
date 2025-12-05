import { Link } from 'react-router-dom';
import { FiMenu, FiPlay, FiLoader, FiStar } from 'react-icons/fi';
import { ROUTES } from '@/utils/constants';
import { formatTimer } from '../utils';

interface TopBarProps {
  onToggleProblemList: () => void;
  onRun: () => void;
  onSubmit: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
  timer: number;
  isTimerRunning: boolean;
  onStartTimer: () => void;
  onStopTimer: () => void;
  onResetTimer: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

const TopBar = ({
  onToggleProblemList,
  onRun,
  onSubmit,
  isRunning,
  isSubmitting,
  timer,
  isTimerRunning,
  onStartTimer,
  onStopTimer,
  onResetTimer,
  isBookmarked,
  onToggleBookmark,
}: TopBarProps) => {
  return (
    <div className="bg-white border-b border-gray-200 flex-shrink-0">
      <div className="flex items-center justify-between px-6 py-2">
        {/* Left: Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleProblemList}
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
            onClick={onRun}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              <FiPlay className="w-4 h-4" />
            )}
            Run
          </button>
          <button
            onClick={onSubmit}
            disabled={isRunning || isSubmitting}
            className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="flex items-center gap-1.5">
            <button
              onClick={isTimerRunning ? onStopTimer : onStartTimer}
              className="px-2.5 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              {isTimerRunning ? 'Pause' : 'Start'}
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${isTimerRunning ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-mono text-gray-700">{formatTimer(timer)}</span>
            </div>
            {timer > 0 && (
              <button
                onClick={onResetTimer}
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
            onClick={onToggleBookmark}
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
  );
};

export default TopBar;

