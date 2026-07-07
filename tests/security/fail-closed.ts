// tests/security/fail-closed.ts
import fs from 'fs';
import path from 'path';
import { createClient as createBrowserClient } from '../../src/lib/supabase/client';
import { createClient as createServerClient } from '../../src/lib/supabase/server';
import { createAdminClient } from '../../src/lib/supabase/admin';

async function runTests() {
  console.log('--- STARTING FAIL-CLOSED REGRESSION TESTS ---');

  let failed = false;
  const assert = (condition: boolean, message: string) => {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      failed = true;
    } else {
      console.log(`✅ PASS: ${message}`);
    }
  };

  // Test 1: Browser client fails closed when env vars are missing
  try {
    // Temporarily clear environment variables
    const oldUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const oldKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const client = createBrowserClient();
    const { data: userData } = await client.auth.getUser();
    
    assert(userData.user === null, 'Browser client must not fabricate a user when environment variables are missing');

    const result = client.from('profiles').select('*') as any;
    let dbData = null;
    if (result && typeof result.then === 'function') {
      const res = await result;
      dbData = res.data;
    } else if (result && typeof result.single === 'function') {
      const res = await result.single();
      dbData = res.data;
    } else {
      // It returned a chain builder object, which has no actual data
      dbData = null;
    }
    
    assert(dbData === null, 'Browser client must return null data when environment variables are missing');

    // Restore env vars
    process.env.NEXT_PUBLIC_SUPABASE_URL = oldUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = oldKey;
  } catch (err: any) {
    assert(false, `Browser client threw unexpected error: ${err.message}`);
  }

  // Test 2: Server client fails closed when env vars are missing
  try {
    const oldUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const oldKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let threw = false;
    try {
      await createServerClient();
    } catch {
      threw = true;
    }

    assert(threw, 'Server client must throw or fail to initialize when environment variables are missing');

    // Restore env vars
    process.env.NEXT_PUBLIC_SUPABASE_URL = oldUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = oldKey;
  } catch (err: any) {
    assert(false, `Server client test threw unexpected error: ${err.message}`);
  }

  // Test 3: Admin client fails closed when env vars are missing
  try {
    const oldUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const oldKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    let threw = false;
    try {
      createAdminClient();
    } catch {
      threw = true;
    }

    assert(threw, 'Admin client must throw when service-role key is missing');

    // Restore env vars
    process.env.NEXT_PUBLIC_SUPABASE_URL = oldUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = oldKey;
  } catch (err: any) {
    assert(false, `Admin client test threw unexpected error: ${err.message}`);
  }

  // Test 4: Verify proxy and middleware have no mock auth or nanoplay-session references
  try {
    const srcDir = path.resolve(__dirname, '../../src');
    const proxyContent = fs.readFileSync(path.join(srcDir, 'proxy.ts'), 'utf8');
    const middlewareContent = fs.readFileSync(path.join(srcDir, 'lib/supabase/middleware.ts'), 'utf8');

    assert(!proxyContent.includes('nanoplay-session'), 'proxy.ts must not contain nanoplay-session cookie check');
    assert(!proxyContent.includes('mockUser'), 'proxy.ts must not contain mockUser references');
    assert(!proxyContent.includes('mockAdmin'), 'proxy.ts must not contain mockAdmin references');

    assert(!middlewareContent.includes('nanoplay-session'), 'middleware.ts must not contain nanoplay-session cookie check');
    assert(!middlewareContent.includes('mockUser'), 'middleware.ts must not contain mockUser references');
    assert(!middlewareContent.includes('mockAdmin'), 'middleware.ts must not contain mockAdmin references');
  } catch (err: any) {
    assert(false, `Verification of source files threw unexpected error: ${err.message}`);
  }

  // Test 5: Verify no production code imports mock or test files
  try {
    const srcDir = path.resolve(__dirname, '../../src');
    const allFiles = getAllFiles(srcDir);
    
    let mockImportFound = false;
    for (const file of allFiles) {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('/mock') || content.includes('mock.ts') || content.includes('mockUser') || content.includes('mockAdmin')) {
          // Exclude comments or self imports
          if (!file.includes('fail-closed.ts')) {
            console.error(`Found mock reference in production file: ${file}`);
            mockImportFound = true;
          }
        }
      }
    }
    assert(!mockImportFound, 'Production code must not contain references or imports to mock / test fixture files');
  } catch (err: any) {
    assert(false, `Import audit threw unexpected error: ${err.message}`);
  }

  if (failed) {
    console.error('❌ FAIL-CLOSED TESTS FAILED');
    process.exit(1);
  } else {
    console.log('✅ ALL FAIL-CLOSED TESTS PASSED');
  }
}

function getAllFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

runTests();
