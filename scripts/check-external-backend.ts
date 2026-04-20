import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

function loadEnvFile(filename: string) {
  const filePath = path.resolve(process.cwd(), filename);

  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();

    if (!key || process.env[key]) {
      continue;
    }

    process.env[key] = rawValue.replace(/^"(.*)"$/, '$1');
  }
}

function readEnv(name: string) {
  return String(process.env[name] || '').trim();
}

async function checkEndpoint(baseUrl: string, path: string, token: string) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });

  const body = await response.text().catch(() => '');
  const preview = body.replace(/\s+/g, ' ').trim().slice(0, 180);

  return {
    path,
    status: response.status,
    ok: response.ok,
    preview,
  };
}

async function main() {
  loadEnvFile('.env');
  loadEnvFile('.env.local');

  const baseUrl = readEnv('EXTERNAL_API_BASE_URL') || readEnv('NEXT_PUBLIC_EXTERNAL_API_BASE_URL');
  const token = readEnv('EXTERNAL_API_BEARER_TOKEN') || readEnv('API_BEARER_TOKEN');

  if (!baseUrl) {
    console.error('Missing EXTERNAL_API_BASE_URL or NEXT_PUBLIC_EXTERNAL_API_BASE_URL.');
    process.exit(1);
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const endpoints = [
    '/api/product',
    '/api/maincategory',
    '/api/setting',
    '/api/contactus',
  ];

  console.log(`Checking external backend: ${normalizedBaseUrl}`);
  console.log(`Bearer token configured: ${token ? 'yes' : 'no'}`);

  for (const path of endpoints) {
    try {
      const result = await checkEndpoint(normalizedBaseUrl, path, token);
      console.log(`${result.ok ? 'OK' : 'FAIL'} ${result.status} ${path}`);
      if (result.preview) {
        console.log(`  ${result.preview}`);
      }
    } catch (error) {
      console.log(`FAIL request ${path}`);
      console.log(
        `  ${error instanceof Error ? error.message : 'Unknown request error'}`
      );
    }
  }
}

void main();
