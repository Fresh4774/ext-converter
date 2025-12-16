"use client";

import { useState, useRef } from 'react';
import { ArrowLeft, X, AlertCircle } from 'lucide-react';

import 'prismjs/themes/prism-coy.css';
import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/index';

loadLanguages([
  'javascript', 'typescript', 'python', 'cpp', 'c', 'java',
  'css', 'markup', 'json', 'bash', 'csharp', 'php', 'ruby',
  'go', 'rust', 'kotlin',
]);

// Language colors mapping
const LANGUAGE_COLORS: Record<string, string> = {
  '.js': '#f1e05a', '.jsx': '#f1e05a', '.ts': '#3178c6', '.tsx': '#3178c6',
  '.py': '#3572A5', '.java': '#b07219', '.cpp': '#f34b7d', '.c': '#555555',
  '.cs': '#178600', '.php': '#4F5D95', '.rb': '#701516', '.go': '#00ADD8',
  '.rs': '#dea584', '.swift': '#ffac45', '.kt': '#A97BFF', '.scala': '#c22d40',
  '.html': '#e34c26', '.css': '#563d7c', '.scss': '#c6538c', '.json': '#292929',
  '.md': '#083fa1', '.yaml': '#cb171e', '.yml': '#cb171e', '.xml': '#0060ac',
  '.sql': '#e38c00', '.sh': '#89e051', '.vue': '#41b883', '.dart': '#00B4AB',
  '.cjs': '#f1e05a', '.mjs': '#f1e05a', '(no-ext)': '#cccccc',
};

const EXT_TO_LANGUAGE: Record<string, string> = {
  '.js': 'JavaScript', '.jsx': 'JavaScript', '.ts': 'TypeScript', '.tsx': 'TypeScript',
  '.py': 'Python', '.java': 'Java', '.cpp': 'C++', '.c': 'C', '.cs': 'C#',
  '.php': 'PHP', '.rb': 'Ruby', '.go': 'Go', '.rs': 'Rust', '.swift': 'Swift',
  '.kt': 'Kotlin', '.scala': 'Scala', '.html': 'HTML', '.css': 'CSS',
  '.scss': 'SCSS', '.json': 'JSON', '.md': 'Markdown', '.yaml': 'YAML',
  '.yml': 'YAML', '.xml': 'XML', '.sql': 'SQL', '.sh': 'Shell',
  '.vue': 'Vue', '.dart': 'Dart', '.cjs': 'JavaScript', '.mjs': 'JavaScript',
  '(no-ext)': 'No Extension',
};

function walkFiles(files: File[]): string[] {
  return files.map(f => f.webkitRelativePath || f.name);
}

function LJS_analyze(files: File[]): Record<string, number> {
  const counts: Record<string, number> = {};
  let total = 0;

  for (const filePath of walkFiles(files)) {
    let ext = filePath.includes(".")
      ? "." + filePath.split(".").pop()!.toLowerCase()
      : "(no-ext)";

    if (!ext.startsWith(".") && filePath.startsWith(".")) ext = filePath;

    counts[ext] = (counts[ext] ?? 0) + 1;
    total++;
  }

  const result: Record<string, number> = {};
  for (const [label, count] of Object.entries(counts)) {
    result[label] = +(count / total * 100).toFixed(2);
  }

  return result;
}

export default function FileProcessor() {
  const [allFiles, setAllFiles] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [result, setResult] = useState<
    { filePath: string; extension: string; text: string }[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [hoveredLang, setHoveredLang] = useState<{ ext: string; percentage: number } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<{ filePath: string; extension: string; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dirInputRef = useRef<HTMLInputElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setAllFiles(files);
      setSelectedFiles([]);
      setError(null);
      setResult(null);
    }
  };

  const toggleFileSelection = (index: number) => {
    const file = allFiles[index];
    setSelectedFiles((prev) => {
      const isSelected = prev.includes(file);
      if (isSelected) return prev.filter((f) => f !== file);
      return [...prev, file];
    });
  };

  const selectAllFiles = () => setSelectedFiles(allFiles);
  const deselectAllFiles = () => setSelectedFiles([]);
  const clearSelection = () => {
    setAllFiles([]);
    setSelectedFiles([]);
    setResult(null);
    setError(null);
  };

  const openSidebar = (file: { filePath: string; extension: string; text: string }) => {
    setCurrentFile(file);
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleDownloadPlainText = () => {
    if (!result || result.length === 0) return;

    let plainTextContent = '';
    result.forEach((file, index) => {
      plainTextContent += `${'='.repeat(80)}\n`;
      plainTextContent += `FILE: ${file.filePath}\n`;
      if (file.extension) {
        plainTextContent += `EXTENSION: ${file.extension}\n`;
      }
      plainTextContent += `${'='.repeat(80)}\n\n`;
      plainTextContent += file.text;
      plainTextContent += '\n\n\n';
    });

    const blob = new Blob([plainTextContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `processed-files-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleProcess = async () => {
    if (allFiles.length === 0) {
      setError('Please select files first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const filesToProcess = selectedFiles.length > 0 ? selectedFiles : allFiles;

    try {
      const processedFiles = await Promise.all(
        filesToProcess.map(async (file) => {
          const text = await file.text();
          const extension = file.name.includes('.') ? '.' + file.name.split('.').pop() : '(no-ext)';
          const filePath = (file as any).webkitRelativePath || file.name;
          return { filePath, extension, text };
        })
      );

      setResult(processedFiles);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = (file: File, event: React.MouseEvent) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const fullPath = (file as any).webkitRelativePath || file.name;
    const { clientX, clientY } = event;
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredPath(fullPath);
      setTooltipPos({ x: clientX + 10, y: clientY + 10 });
    }, 500);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (hoveredPath && hoveredPath.length > 0) {
      setTooltipPos({ x: event.clientX + 10, y: event.clientY + 10 });
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredPath(null);
  };

  const getPrismLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const map: Record<string, string> = {
      js: 'javascript', ts: 'typescript', py: 'python', cpp: 'cpp',
      c: 'c', java: 'java', css: 'css', html: 'markup', htm: 'markup',
      json: 'json', sh: 'bash', cs: 'csharp', php: 'php', rb: 'ruby',
      go: 'go', rs: 'rust', kt: 'kotlin',
    };
    return map[ext] || 'markup';
  };

  // Language bar logic
  const analysis = allFiles.length > 0 ? LJS_analyze(selectedFiles.length > 0 ? selectedFiles : allFiles) : {};
  const sortedLanguages = Object.entries(analysis).sort((a, b) => b[1] - a[1]);

  const usedColors = new Set<string>();
  function stringToUniqueColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let hue = hash % 360;
    let attempt = 0;
    let color = `hsl(${hue}, 65%, 60%)`;
    while (usedColors.has(color) && attempt < 360) {
      hue = (hue + 30) % 360;
      color = `hsl(${hue}, 65%, 60%)`;
      attempt++;
    }
    usedColors.add(color);
    return color;
  }

  const getLanguageColor = (ext: string) => LANGUAGE_COLORS[ext] || stringToUniqueColor(ext);
  const getLanguageName = (ext: string) => EXT_TO_LANGUAGE[ext] || ext;

  return (
    <div className="min-h-screen bg-[#fafaf9] font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] overflow-x-hidden relative">
      
      {/* Top Gradient */}
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#fff4e6]/30 to-transparent pointer-events-none z-10" />
      
      {/* Bottom Gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fff4e6]/30 to-transparent pointer-events-none z-10" />
      
      {/* Sidebar */}
      <div 
        className={`fixed z-50 bg-[#fafaf9] shadow-2xl transition-all duration-300 ease-in-out
          sm:top-0 sm:right-0 sm:h-full sm:w-[60vw]
          max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:h-[95vh] max-sm:rounded-t-3xl
          ${sidebarOpen 
            ? 'sm:translate-x-0 max-sm:translate-y-0' 
            : 'sm:translate-x-full max-sm:translate-y-full'
          }`}
      >
        <div className="h-full overflow-y-auto p-8">
          <button 
            onClick={closeSidebar}
            className="flex items-center gap-2 text-gray-600 hover:text-black text-lg font-light mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>back</span>
          </button>
          
          {currentFile && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-2xl font-normal leading-10 tracking-tight text-black break-all" style={{ fontFamily: 'Georgia, serif' }}>
                  {currentFile.filePath}
                </h2>
                {currentFile.extension && (
                  <span className="text-sm font-light text-gray-500 px-2 py-0.5 border border-gray-200 shrink-0">
                    {currentFile.extension}
                  </span>
                )}
              </div>
              <pre className="text-xs font-mono bg-white p-4 border border-gray-200 overflow-x-auto">
                <code dangerouslySetInnerHTML={{ 
                  __html: Prism.highlight(
                    currentFile.text, 
                    Prism.languages[getPrismLanguage(currentFile.filePath)], 
                    getPrismLanguage(currentFile.filePath)
                  ) 
                }} />
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-12 px-6 sm:px-16 relative z-20">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-normal leading-10 tracking-tight text-black mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            ext, the file processor
          </h1>
          <p className="text-lg font-light leading-7 tracking-tight text-gray-700 mb-3">
            upload and process text-based files
          </p>
          <a 
            href="/letter" 
            className="text-base font-light text-gray-600 hover:text-black underline transition-colors"
          >
            read the letter
          </a>
        </div>

        {/* Upload Section */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 px-4 py-3 text-lg font-light text-black border border-gray-200 hover:border-gray-300 transition-colors"
            >
              select files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={() => dirInputRef.current?.click()}
              className="flex-1 px-4 py-3 text-lg font-light text-black border border-gray-200 hover:border-gray-300 transition-colors"
            >
              select directory
            </button>
            <input
              ref={dirInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* File List */}
        {allFiles.length > 0 && (
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-light text-gray-700">
                {selectedFiles.length > 0
                  ? `${selectedFiles.length} of ${allFiles.length} selected`
                  : `${allFiles.length} files (all will be processed)`}
              </p>
              <div className="flex gap-4">
                {allFiles.length > 1 && (
                  <>
                    <button
                      onClick={selectAllFiles}
                      className="text-sm font-light text-gray-600 hover:text-black transition-colors underline"
                    >
                      select all
                    </button>
                    <button
                      onClick={deselectAllFiles}
                      className="text-sm font-light text-gray-600 hover:text-black transition-colors underline"
                    >
                      deselect all
                    </button>
                  </>
                )}
                <button
                  onClick={clearSelection}
                  className="text-sm font-light text-gray-600 hover:text-black transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="border border-gray-200 relative max-h-[300px] overflow-y-auto">
              {hoveredPath && (
                <div
                  className="fixed z-50 bg-black text-white text-xs px-2 py-1 shadow-lg whitespace-nowrap pointer-events-none"
                  style={{ top: tooltipPos.y, left: tooltipPos.x }}
                >
                  {hoveredPath}
                </div>
              )}
              <div className="p-3 space-y-1 grid grid-cols-2">
                {allFiles.map((file, i) => {
                  const isSelected = selectedFiles.includes(file);
                  return (
                    <div
                      key={i}
                      onClick={() => toggleFileSelection(i)}
                      onMouseEnter={(e) => handleMouseEnter(file, e)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      className={`flex items-center gap-2 p-2 cursor-pointer transition-colors ${
                        isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 border-gray-300"
                      />
                      <span className="text-sm font-light text-gray-700 truncate flex-1">
                        {file.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Process Button */}
        {allFiles.length > 0 && (
          <button
            onClick={handleProcess}
            disabled={loading}
            className="w-full px-4 py-3 text-lg font-light text-black border border-gray-200 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-8"
          >
            {loading ? 'processing...' : 'process files'}
          </button>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="font-normal text-black">error</p>
                <p className="text-sm font-light text-gray-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-normal leading-10 tracking-tight text-black" style={{ fontFamily: 'Georgia, serif' }}>
                processed {result.length} {result.length === 1 ? 'file' : 'files'}
              </h2>
              <button
                onClick={handleDownloadPlainText}
                className="px-4 py-2 text-sm font-light text-black border border-gray-200 hover:border-gray-300 transition-colors"
              >
                download as .txt
              </button>
            </div>

            {/* Language Bar */}
            {sortedLanguages.length > 0 && (
              <div className="mb-6 relative">
                <div className="flex h-2 overflow-hidden bg-gray-200">
                  {sortedLanguages.map(([ext, percentage], index) => (
                    <div
                      key={index}
                      style={{ width: `${percentage}%`, backgroundColor: getLanguageColor(ext) }}
                      className="transition-all cursor-pointer hover:opacity-80"
                      onMouseEnter={(e) => {
                        setHoveredLang({ ext, percentage });
                        setTooltipPos({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setHoveredLang(null)}
                    />
                  ))}
                </div>

                {hoveredLang && (
                  <div
                    className="fixed z-50 px-3 py-2 text-xs font-light text-white bg-black shadow-lg pointer-events-none"
                    style={{ left: `${tooltipPos.x + 10}px`, top: `${tooltipPos.y + 10}px` }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3"
                        style={{ backgroundColor: getLanguageColor(hoveredLang.ext) }}
                      />
                      <span>{getLanguageName(hoveredLang.ext)}</span>
                      <span className="font-normal">{hoveredLang.percentage}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* File Contents */}
            <div className="space-y-2">
              {result.map((file, index) => (
                <button
                  key={index}
                  onClick={() => openSidebar(file)}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 hover:border-gray-300 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="font-normal text-black text-base truncate">
                      {file.filePath}
                    </span>
                    {file.extension && (
                      <span className="text-xs font-light text-gray-500 px-2 py-0.5 border border-gray-200 shrink-0">
                        {file.extension}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm ml-2">→</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}