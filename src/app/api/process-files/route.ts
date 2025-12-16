import { NextRequest } from 'next/server';
import * as AquinFileProcessing from '@/utils/fileProcessing';

export async function POST(request: NextRequest) {
  try {
    const { path, type } = await request.json();

    console.log('=== API Route Called ===');
    console.log('Path:', path);
    console.log('Type:', type);

    if (!path) {
      return Response.json({ error: 'Path is required' }, { status: 400 });
    }

    let result;

    if (type === AquinFileProcessing.FSContentType.Dir) {
      console.log('Processing directory...');
      result = await AquinFileProcessing.processDirectory(path);
    } else if (type === AquinFileProcessing.FSContentType.File) {
      console.log('Processing file...');
      result = await AquinFileProcessing.processFile(path);
    } else {
      return Response.json({ error: 'Invalid type' }, { status: 400 });
    }

    console.log('Result:', result);
    return Response.json(result);
  } catch (error) {
    console.error('=== API Error ===');
    console.error(error);
    return Response.json(
      { error: error.message || 'Processing failed' },
      { status: 500 }
    );
  }
}
