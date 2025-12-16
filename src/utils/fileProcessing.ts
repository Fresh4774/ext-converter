import fs from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/* Types */

export enum FSContentType {
  Dir,
  File
}

export interface ProcessOptions {
  includeExtensions?: string[];
  excludeExtensions?: string[];
  excludeDirs?: (string | RegExp)[];
}

export interface ProcessedFile {
  filePath: string;
  text: string;
  extension?: string;
}

export type ProgressCallback = (processed: number, total: number) => void;

/* ZIP Extraction */

export async function extractZip(
  zipFilePath: string,
  extractPath: string
): Promise<string> {
  const zip = new AdmZip(zipFilePath);
  zip.extractAllTo(extractPath, true);
  return extractPath;
}

/* File Extractors */

export async function extractTextFromPdf(filePath: string): Promise<string> {
  try {
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error(`PDF error (${filePath})`, error);
    return `[Error processing PDF: ${error instanceof Error ? error.message : 'Unknown error'}]`;
  }
}

export async function extractTextFromDocx(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error(`DOCX error (${filePath})`, error);
    return `[Error processing DOCX: ${error instanceof Error ? error.message : 'Unknown error'}]`;
  }
}

// Supported text-based file extensions (binary formats like images, xlsx, pptx handled separately)
const TEXT_EXTENSIONS = [
  // Basic text files
  '.txt', '.md', '.csv', '.tsv', '.log',
  
  // Data & Config
  '.json', '.xml', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.env',
  
  // JavaScript/TypeScript
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  
  // Web & Markup
  '.html', '.htm', '.css', '.scss', '.sass', '.less', '.svg',
  '.vue', '.svelte', '.pug', '.jade', '.slim', '.haml',
  '.ejs', '.handlebars', '.hbs', '.mustache', '.twig', '.blade', '.erb', '.asp', '.aspx', '.jsp',
  
  // Python
  '.py', '.pyw', '.pyx', '.pyi',
  
  // Java & JVM
  '.java', '.kt', '.scala', '.clj', '.gradle', '.maven',
  
  // C/C++
  '.c', '.cpp', '.cc', '.cxx', '.h', '.hpp', '.hh', '.hxx',
  
  // C# & .NET
  '.cs', '.vb', '.vbs', '.fs',
  
  // Go
  '.go',
  
  // Rust
  '.rs',
  
  // Ruby
  '.rb', '.erb',
  
  // PHP
  '.php', '.phtml',
  
  // Swift
  '.swift',
  
  // Shell scripts
  '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd',
  
  // Other programming languages
  '.r', '.m', '.matlab', '.sql', '.pl', '.perl', '.lua', '.dart', '.elm',
  '.ex', '.exs', '.cr', '.nim', '.zig', '.v', '.hx', '.purs', '.reason', '.re', '.rescript',
  '.coffee', '.ls', '.asm', '.s', '.f', '.f90', '.pas', '.dpr', '.ml',
  
  // Build & Config files
  '.cmake', '.makefile', '.dockerfile', '.webpack', '.gulpfile', '.gruntfile', '.sbt',
  '.gitignore', '.gitattributes', '.editorconfig', '.npmrc', '.yarnrc', '.babelrc', '.eslintrc',
  '.prettierrc', '.stylelintrc', '.dockerignore',
  
  // Other
  '.vim', '.proto', '.graphql', '.gql', '.prisma', '.tf', '.tfvars'
];

export async function extractTextFromPlainFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    console.error(`Plain file error (${filePath})`, error);
    return `[Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}]`;
  }
}

/* Filters */

function shouldProcessFile(
  filePath: string,
  options: ProcessOptions = {}
): boolean {
  const ext = path.extname(filePath).toLowerCase();

  if (options.includeExtensions?.length) {
    return options.includeExtensions.includes(ext);
  }

  if (options.excludeExtensions?.length) {
    return !options.excludeExtensions.includes(ext);
  }

  return true;
}

function shouldSkipDirectory(
  dirPath: string,
  options: ProcessOptions = {}
): boolean {
  if (!options.excludeDirs?.length) return false;

  const dirName = path.basename(dirPath);

  return options.excludeDirs.some(pattern =>
    pattern instanceof RegExp
      ? pattern.test(dirPath)
      : dirName === pattern || dirPath.includes(pattern)
  );
}

/* File Processor */

export async function processFile(
  filePath: string,
  options: ProcessOptions = {}
): Promise<ProcessedFile> {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (!shouldProcessFile(filePath, options)) {
      return {
        filePath,
        text: '[File skipped based on extension filters]',
        extension: ext
      };
    }

    let text: string;

    // Handle specific binary formats
    if (ext === '.pdf') {
      text = await extractTextFromPdf(filePath);
    } else if (ext === '.doc' || ext === '.docx') {
      text = await extractTextFromDocx(filePath);
    } 
    // Handle text-based files
    else if (TEXT_EXTENSIONS.includes(ext)) {
      text = await extractTextFromPlainFile(filePath);
    }
    // Try to read as text for unknown extensions
    else {
      try {
        text = await fs.readFile(filePath, 'utf8');
        // Check if it's actually text (simple heuristic)
        if (text.includes('\0')) {
          text = `[Binary file - cannot extract text]`;
        }
      } catch {
        text = `[Unsupported file type: ${ext}]`;
      }
    }

    return { filePath, text, extension: ext };
  } catch (error) {
    console.error(`File error (${filePath})`, error);
    return {
      filePath,
      text: `[Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}]`,
      extension: ext
    };
  }
}

/* Directory Processor */

export async function processDirectory(
  dirPath: string,
  options: ProcessOptions = {},
  progressCallback?: ProgressCallback
): Promise<ProcessedFile[]> {
  const results: ProcessedFile[] = [];
  const files = await fs.readdir(dirPath);
  let processed = 0;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = await fs.stat(filePath);

    if (stats.isDirectory()) {
      if (!shouldSkipDirectory(filePath, options)) {
        results.push(
          ...(await processDirectory(filePath, options, progressCallback))
        );
      }
    } else {
      results.push(await processFile(filePath, options));
    }

    processed++;
    progressCallback?.(processed, files.length);
  }

  return results;
}

/* ZIP Processor */

export async function extractTextFromZip(
  zipFilePath: string,
  options: ProcessOptions = {},
  progressCallback?: ProgressCallback
): Promise<ProcessedFile[]> {
  const tempDir = path.join(
    path.dirname(zipFilePath),
    `temp_${Date.now()}`
  );

  try {
    await extractZip(zipFilePath, tempDir);
    return await processDirectory(tempDir, options, progressCallback);
  } finally {
    if (await fs.pathExists(tempDir)) {
      await fs.remove(tempDir);
    }
  }
}

/* Stats */

export function getFileStats(results: ProcessedFile[]) {
  const stats: {
    totalFiles: number;
    byExtension: Record<string, number>;
  } = {
    totalFiles: results.length,
    byExtension: {}
  };

  for (const file of results) {
    const ext = path.extname(file.filePath).toLowerCase() || 'unknown';
    stats.byExtension[ext] = (stats.byExtension[ext] ?? 0) + 1;
  }

  return stats;
}