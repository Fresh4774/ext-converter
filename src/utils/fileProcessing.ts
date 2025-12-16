import fs from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

/* Types */

export enum FSContentType
{
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
    return `[Error processing PDF: ${error instanceof Error ? error.message : String(error)}]`;
  }
}

export async function extractTextFromDocx(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error(`DOCX error (${filePath})`, error);
    return `[Error processing DOCX: ${error instanceof Error ? error.message : String(error)}]`;
  }
}

export async function extractTextFromExcel(filePath: string): Promise<string> {
  try {
    const buffer = await fs.readFile(filePath);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    let text = '';
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      text += `\n=== Sheet: ${sheetName} ===\n`;
      text += XLSX.utils.sheet_to_txt(sheet);
    });
    
    return text;
  } catch (error) {
    console.error(`Excel error (${filePath})`, error);
    return `[Error processing Excel: ${error instanceof Error ? error.message : String(error)}]`;
  }
}

export async function extractTextFromFile(filePath: string): Promise<string> {
  try {
    // Try to read as UTF-8 text first
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    console.error(`Text extraction error (${filePath})`, error);
    return `[Error processing file: ${error instanceof Error ? error.message : String(error)}]`;
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

    switch (ext) {
      case '.pdf':
        text = await extractTextFromPdf(filePath);
        break;

      case '.doc':
      case '.docx':
        text = await extractTextFromDocx(filePath);
        break;

      case '.xls':
      case '.xlsx':
      case '.xlsm':
      case '.xlsb':
        text = await extractTextFromExcel(filePath);
        break;

      case '.txt':
      case '.js':
      case '.jsx':
      case '.ts':
      case '.tsx':
      case '.py':
      case '.java':
      case '.c':
      case '.cpp':
      case '.cs':
      case '.html':
      case '.css':
      case '.json':
      case '.md':
      case '.xml':
      case '.csv':
      case '.yml':
      case '.yaml':
      case '.toml':
      case '.ini':
      case '.sh':
      case '.bash':
      case '.sql':
      case '.php':
      case '.rb':
      case '.go':
      case '.rs':
      case '.swift':
      case '.kt':
      case '.scala':
        text = await fs.readFile(filePath, 'utf8');
        break;

      default:
        text = await extractTextFromFile(filePath);
    }

    return { filePath, text, extension: ext };
  } catch (error) {
    console.error(`File error (${filePath})`, error);
    return {
      filePath,
      text: `[Error processing file: ${error instanceof Error ? error.message : String(error)}]`,
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