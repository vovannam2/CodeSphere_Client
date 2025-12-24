import { useRef, useEffect, useState } from 'react';
import { Editor, DiffEditor } from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { aiApi } from '@/apis/ai.api';
import type { ProblemDetailResponse } from '@/types/problem.types';
import type { RunCodeResponse, CustomTestCase } from '@/apis/submission.api';
import type { EditorTabType } from '../types';
import { setupCppValidation } from '../cppValidation';
import TestCasePanel from './TestCasePanel';
import ResultPanel from './ResultPanel';
import ReviewPanel from './ReviewPanel';

interface CodeEditorPanelProps {
  problem: ProblemDetailResponse;
  code: string;
  onCodeChange: (code: string) => void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  activeEditorTab: EditorTabType;
  onEditorTabChange: (tab: EditorTabType) => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  runResults: RunCodeResponse | null;
  // Refactor state
  showDiff: boolean;
  originalCode: string;
  refactoredCode: string;
  isRefactoring: boolean;
  onRefactor: () => Promise<void>;
  onAcceptRefactor: () => void;
  onCancelRefactor: () => void;
  // Review state
  isReviewing: boolean;
  onReview: () => Promise<void>;
  reviewResult: string | null;
  onRefactorSuggestions: (suggestions: string[]) => Promise<void>;
  // TestCase state
  sampleTestCases: any[];
  customTestCases: CustomTestCase[];
  selectedTestCaseIndex: number;
  onSelectTestCase: (index: number) => void;
  onAddCustomTestCase: () => void;
  onDeleteCustomTestCase: (index: number) => void;
  onUpdateCustomTestCase: (index: number, testCase: CustomTestCase) => void;
  // Contest mode
  contestId?: string | null;
}

const CodeEditorPanel = ({
  problem,
  code,
  onCodeChange,
  selectedLanguage,
  onLanguageChange,
  activeEditorTab,
  onEditorTabChange,
  isChatOpen,
  onToggleChat,
  runResults,
  showDiff,
  originalCode,
  refactoredCode,
  isRefactoring,
  onRefactor,
  onAcceptRefactor,
  onCancelRefactor,
  isReviewing,
  onReview,
  reviewResult,
  onRefactorSuggestions,
  sampleTestCases,
  customTestCases,
  selectedTestCaseIndex,
  onSelectTestCase,
  onAddCustomTestCase,
  onDeleteCustomTestCase,
  onUpdateCustomTestCase,
  contestId,
}: CodeEditorPanelProps) => {
  const editorRef = useRef<any>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = useState('100%');

  useEffect(() => {
    const updateHeight = () => {
      if (editorContainerRef.current) {
        const height = editorContainerRef.current.offsetHeight;
        if (height > 0) {
          setEditorHeight(`${height}px`);
        }
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [activeEditorTab]);

  const getMonacoLanguage = (lang: string) => {
    if (lang === 'cpp' || lang === 'c') return 'cpp';
    if (lang === 'python' || lang === 'py') return 'python';
    if (lang === 'java') return 'java';
    return lang;
  };

  const getEditorOptions = () => ({
    minimap: { enabled: false },
    fontSize: 16,
    lineHeight: 26,
    wordWrap: 'on' as const,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    readOnly: false,
    lineNumbers: 'on' as const,
    renderLineHighlight: 'all' as const,
    selectOnLineNumbers: true,
    roundedSelection: true,
    cursorStyle: 'line' as const,
    cursorBlinking: 'smooth' as const,
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
    validate: true,
    glyphMargin: true,
    renderValidationDecorations: 'on' as const,
    folding: true,
    foldingStrategy: 'indentation' as const,
    showFoldingControls: 'always' as const,
    unfoldOnClickAfterEndOfLine: true,
    'editor.showFoldingControls': 'always' as const,
    'editor.parameterHints.enabled': true,
    'editor.quickSuggestions': {
      other: true,
      comments: false,
      strings: false,
    },
    'editor.semanticHighlighting.enabled': true,
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
    'editor.foldBackground': '#f6f8fa',
    'editorGutter.foldingControlForeground': '#6a737d',
    'editor.tokenColorCustomizations': {
      textMateRules: [
        {
          scope: ['comment'],
          settings: { foreground: '#6a737d', fontStyle: 'italic' }
        },
        {
          scope: ['keyword', 'storage.type', 'storage.modifier'],
          settings: { foreground: '#d73a49', fontStyle: 'bold' }
        },
        {
          scope: ['keyword.control', 'keyword.operator'],
          settings: { foreground: '#d73a49', fontStyle: 'bold' }
        },
        {
          scope: ['meta.preprocessor', 'entity.name.function.preprocessor', 'punctuation.definition.directive'],
          settings: { foreground: '#6f42c1', fontStyle: 'bold' }
        },
        {
          scope: ['string', 'string.quoted'],
          settings: { foreground: '#032f62' }
        },
        {
          scope: ['constant.numeric', 'constant.language'],
          settings: { foreground: '#005cc5' }
        },
        {
          scope: ['entity.name.function', 'entity.name.method'],
          settings: { foreground: '#6f42c1' }
        },
        {
          scope: ['entity.name.class', 'entity.name.type'],
          settings: { foreground: '#e36209' }
        },
        {
          scope: ['variable', 'variable.parameter'],
          settings: { foreground: '#e36209' }
        },
        {
          scope: ['punctuation', 'meta.brace'],
          settings: { foreground: '#24292e' }
        },
        {
          scope: ['support.type', 'support.class'],
          settings: { foreground: '#005cc5' }
        }
      ]
    }
  });

  return (
    <div className="flex flex-col bg-white border-l border-gray-200 h-full">
      {/* Editor Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center">
          <button
            onClick={() => onEditorTabChange('code')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              activeEditorTab === 'code'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => onEditorTabChange('testcase')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              activeEditorTab === 'testcase'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Testcase
          </button>
          <button
            onClick={() => onEditorTabChange('result')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors relative ${
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
          {!contestId && (
            <button
              onClick={() => onEditorTabChange('review')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors relative ${
                activeEditorTab === 'review'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Review
              {reviewResult && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>
          )}
        </div>
        {/* AI Chat Button - Ẩn khi đang trong contest */}
        {!contestId && (
          <button
            onClick={onToggleChat}
            className={`px-3 py-1.5 text-sm font-medium transition-colors mr-2 ${
              isChatOpen
                ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            AI Chat
          </button>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeEditorTab === 'code' && (
          <div className="h-full flex flex-col min-h-0">
            {/* Language Selector */}
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <select
                  value={selectedLanguage}
                  onChange={(e) => onLanguageChange(e.target.value)}
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
              {/* Ẩn các nút AI khi đang trong contest */}
              {!contestId && (
                <div className="flex items-center gap-2">
                  {showDiff ? (
                    <>
                      <button
                        onClick={onAcceptRefactor}
                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Accept Changes
                      </button>
                      <button
                        onClick={onCancelRefactor}
                        className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={onReview}
                        disabled={isReviewing || isRefactoring}
                        className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isReviewing ? 'Reviewing...' : 'Review Code'}
                      </button>
                      <button
                        onClick={onRefactor}
                        disabled={isRefactoring || isReviewing}
                        className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRefactoring ? 'Refactoring...' : 'Refactor'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Code Editor */}
            <div ref={editorContainerRef} className="flex-1 bg-white min-h-0 relative" style={{ minHeight: '400px' }}>
              {showDiff ? (
                <DiffEditor
                  height={editorHeight}
                  language={getMonacoLanguage(selectedLanguage)}
                  original={originalCode}
                  modified={refactoredCode}
                  theme="vs"
                  options={{
                    readOnly: true,
                    renderSideBySide: false,
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                  }}
                />
              ) : (
                <Editor
                  height={editorHeight}
                  language={getMonacoLanguage(selectedLanguage)}
                  value={code}
                  onChange={(value) => onCodeChange(value || '')}
                  theme="vs"
                  onMount={(editor, monaco) => {
                    editorRef.current = editor;
                    // Đảm bảo editor không bị readOnly
                    editor.updateOptions({ readOnly: false });
                    // Force layout update
                    setTimeout(() => {
                      editor.layout();
                    }, 100);
                    if (selectedLanguage === 'cpp' || selectedLanguage === 'c') {
                      setupCppValidation(editor, monaco);
                    }
                  }}
                  options={getEditorOptions()}
                />
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
              <span>Saved</span>
              <span>Ln 1, Col 1</span>
            </div>
          </div>
        )}
        
        {activeEditorTab === 'testcase' && (
          <TestCasePanel
            sampleTestCases={sampleTestCases}
            customTestCases={customTestCases}
            selectedTestCaseIndex={selectedTestCaseIndex}
            onSelectTestCase={onSelectTestCase}
            onAddCustomTestCase={onAddCustomTestCase}
            onDeleteCustomTestCase={onDeleteCustomTestCase}
            onUpdateCustomTestCase={onUpdateCustomTestCase}
            runResults={runResults}
          />
        )}
        
        {activeEditorTab === 'result' && (
          <ResultPanel runResults={runResults} />
        )}
        
        {activeEditorTab === 'review' && (
          <ReviewPanel 
            reviewResult={reviewResult}
            isReviewing={isReviewing}
            code={code}
            problemId={problem.id}
            language={selectedLanguage}
            onRefactorSuggestions={onRefactorSuggestions}
            isRefactoring={isRefactoring}
          />
        )}
      </div>
    </div>
  );
};

export default CodeEditorPanel;

