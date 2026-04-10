import 'server-only';

import { readFile } from 'fs/promises';
import path from 'path';

interface MockDatabase {
  products?: unknown[];
  siteContent?: unknown;
}

let mockDbPromise: Promise<MockDatabase> | null = null;

export async function readMockDatabase() {
  if (!mockDbPromise) {
    const filePath = path.join(process.cwd(), 'mock-api', 'db.json');
    mockDbPromise = readFile(filePath, 'utf8').then((file) => JSON.parse(file) as MockDatabase);
  }

  return mockDbPromise;
}
