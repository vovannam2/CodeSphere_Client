import { Editor } from '@monaco-editor/react';
import { useState } from 'react';
import { FiPlay, FiSettings, FiMaximize2, FiBell, FiUser } from 'react-icons/fi';
import type { LanguageResponse } from '@/types/common.types';

interface ProblemCodeEditorProps {
  languages: LanguageResponse[];
  defaultLanguage?: string;
  initialCode?: string;
  onSubmit?: (code: string, language: string) => void;
  onTest?: (code: string, language: string) => void;
}

const ProblemCodeEditor = ({
  languages,
  defaultLanguage = 'cpp',
  initialCode = '',
  onSubmit,
  onTest,
}: ProblemCodeEditorProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(defaultLanguage);
  const [code, setCode] = useState<string>(initialCode);
  const [activeTab, setActiveTab] = useState<'code' | 'testcase'>('code');

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
  };

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(code, selectedLanguage);
    }
  };

  const handleTest = () => {
    if (onTest) {
      onTest(code, selectedLanguage);
    }
  };

  const getLanguageName = (code: string) => {
    const lang = languages.find(l => l.code === code);
    return lang ? lang.name : code.toUpperCase();
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Submit
          </button>
          <button
            onClick={handleTest}
            className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            Test
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">
            <FiMaximize2 className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">
            <FiSettings className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">
            <FiBell className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <FiUser className="w-4 h-4 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200">
        <button
          onClick={() => setActiveTab('code')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'code'
              ? 'text-gray-900 border-b-2 border-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Code
        </button>
        <button
          onClick={() => setActiveTab('testcase')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'testcase'
              ? 'text-gray-900 border-b-2 border-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Testcase
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'code' ? (
          <div className="h-full flex flex-col">
            {/* Language Selector */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <select
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.code}>
                      {lang.name} {lang.version && `(${lang.version})`}
                    </option>
                  ))}
                </select>
                <button className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Auto
                </button>
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1">
              <Editor
                height="100%"
                language={selectedLanguage}
                value={code}
                onChange={handleCodeChange}
                theme="vs-light"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                  selectOnLineNumbers: true,
                  roundedSelection: false,
                  cursorStyle: 'line',
                  fontFamily: 'Monaco, Menlo, "Courier New", monospace',
                }}
              />
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
              <span>Saved</span>
              <span>Ln 1, Col 1</span>
            </div>
          </div>
        ) : (
          <div className="p-4 h-full overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <button className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg border border-blue-200">
                Case 1
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50">
                Case 2
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50">
                Case 3
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50">
                +
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Input</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Enter test case input..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Output</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Enter expected output..."
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemCodeEditor;

