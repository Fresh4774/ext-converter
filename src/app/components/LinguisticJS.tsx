"use client";

import { useState } from 'react';

interface HoveredLang {
  ext: string;
  percentage: number;
}

interface LinguisticJSProps {
  files: File[];
}

// Language colors mapping (GitHub-style)
const LANGUAGE_COLORS: Record<string, string> = {
  '.js': '#f1e05a',
  '.jsx': '#f1e05a',
  '.ts': '#3178c6',
  '.tsx': '#3178c6',
  '.py': '#3572A5',
  '.java': '#b07219',
  '.cpp': '#f34b7d',
  '.c': '#555555',
  '.cs': '#178600',
  '.php': '#4F5D95',
  '.rb': '#701516',
  '.go': '#00ADD8',
  '.rs': '#dea584',
  '.swift': '#ffac45',
  '.kt': '#A97BFF',
  '.scala': '#c22d40',
  '.html': '#e34c26',
  '.css': '#563d7c',
  '.scss': '#c6538c',
  '.json': '#292929',
  '.md': '#083fa1',
  '.yaml': '#cb171e',
  '.yml': '#cb171e',
  '.xml': '#0060ac',
  '.sql': '#e38c00',
  '.sh': '#89e051',
  '.vue': '#41b883',
  '.dart': '#00B4AB',
  '.cjs': '#f1e05a',
  '.mjs': '#f1e05a',
  '(no-ext)': '#cccccc',
};

// Extension to language name mapping
const EXT_TO_LANGUAGE: Record<string, string> = {
  '.js': 'JavaScript',
  '.jsx': 'JavaScript',
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.py': 'Python',
  '.java': 'Java',
  '.cpp': 'C++',
  '.c': 'C',
  '.cs': 'C#',
  '.php': 'PHP',
  '.rb': 'Ruby',
  '.go': 'Go',
  '.rs': 'Rust',
  '.swift': 'Swift',
  '.kt': 'Kotlin',
  '.scala': 'Scala',
  '.html': 'HTML',
  '.css': 'CSS',
  '.scss': 'SCSS',
  '.json': 'JSON',
  '.md': 'Markdown',
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.xml': 'XML',
  '.sql': 'SQL',
  '.sh': 'Shell',
  '.vue': 'Vue',
  '.dart': 'Dart',
  '.cjs': 'JavaScript',
  '.mjs': 'JavaScript',
  '(no-ext)': 'No Extension',
};

// Walk files (browser only)
function walkFiles(files: File[]): string[] {
  return files.map(f => f.webkitRelativePath || f.name);
}

// Analyze file extensions
export function LJS_analyze(
  files: File[],
  extMap: Record<string, string> | null = null
): Record<string, number> {
  const counts: Record<string, number> = {};
  let total = 0;

  for (const filePath of walkFiles(files)) {
    let ext = filePath.includes(".")
      ? "." + filePath.split(".").pop()!.toLowerCase()
      : "(no-ext)";

    if (!ext.startsWith(".") && filePath.startsWith(".")) ext = filePath;

    if (extMap && !(ext in extMap)) continue;

    const label = extMap ? extMap[ext] ?? ext : ext;
    counts[label] = (counts[label] ?? 0) + 1;
    total++;
  }

  const result: Record<string, number> = {};
  for (const [label, count] of Object.entries(counts)) {
    result[label] = +(count / total * 100).toFixed(2);
  }

  return result;
}

// Main component
export default function LinguisticJS({ files }: LinguisticJSProps) {
  const [hoveredLang, setHoveredLang] = useState<HoveredLang | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const analysis = files && files.length > 0 ? LJS_analyze(files) : {};
  const sortedLanguages = Object.entries(analysis).sort((a, b) => b[1] - a[1]);

  // Generate a "nice" color from a string (consistent)
  const usedColors = new Set<string>();

  function stringToUniqueColor(str: string): string {
  	  let hash = 0;
  	  for (let i = 0; i < str.length; i++) {
    	  hash = str.charCodeAt(i) + ((hash << 5) - hash);
  	  }
  	  let hue = hash % 360;

  	  // Avoid duplicates by shifting the hue
  	  let attempt = 0;
  	  let color = `hsl(${hue}, 65%, 60%)`;
  	  while (usedColors.has(color) && attempt < 360) {
    	  hue = (hue + 30) % 360; // shift hue by 30 degrees
    	  color = `hsl(${hue}, 65%, 60%)`;
    	  attempt++;
  	  }
  	  usedColors.add(color);
  	  return color;
  }

  const getLanguageColor = (ext: string) => {
  	  if (LANGUAGE_COLORS[ext]) return LANGUAGE_COLORS[ext];
  	  return stringToUniqueColor(ext);
  };

  const getLanguageName = (ext: string) => EXT_TO_LANGUAGE[ext] || ext;

  const handleMouseEnter = (lang: HoveredLang, e: React.MouseEvent<HTMLDivElement>) => {
    setHoveredLang(lang);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredLang(null);
  };

  if (sortedLanguages.length === 0) return null;

  return (
    <div className="relative">
      {/* Language Bar */}
      <div className="flex h-2 rounded-full overflow-hidden bg-slate-200">
        {sortedLanguages.map(([ext, percentage], index) => (
          <div
            key={index}
            style={{ width: `${percentage}%`, backgroundColor: getLanguageColor(ext) }}
            className="transition-all cursor-pointer hover:opacity-80"
            onMouseEnter={(e) => handleMouseEnter({ ext, percentage }, e)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>

      {/* Tooltip */}
      {hoveredLang && (
        <div
          className="fixed z-50 px-3 py-2 text-xs font-medium text-white bg-slate-900 rounded-md shadow-lg pointer-events-none"
          style={{ left: `${mousePos.x + 10}px`, top: `${mousePos.y + 10}px` }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getLanguageColor(hoveredLang.ext) }}
            />
            <span>{getLanguageName(hoveredLang.ext)}</span>
            <span className="font-semibold">{hoveredLang.percentage}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

