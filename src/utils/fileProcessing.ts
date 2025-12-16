import fs from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import textract from 'textract';
import { promisify } from 'util';

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

/* Textract promisified */

const textractPromise = promisify(textract.fromFileWithPath);

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
    return `[Error processing PDF: ${error.message}]`;
  }
}

export async function extractTextFromDocx(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error(`DOCX error (${filePath})`, error);
    return `[Error processing DOCX: ${error.message}]`;
  }
}

export async function extractTextFromFile(filePath: string): Promise<string> {
  try {
    return await textractPromise(filePath);
  } catch {
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch (error) {
      console.error(`Textract error (${filePath})`, error);
      return `[Error processing file: ${error.message}]`;
    }
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
      text: `[Error processing file: ${error.message}]`,
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

