#!/usr/bin/env node
// Test admin sign-in against the live Supabase project using the anon key
// (i.e., exactly the same code path the browser uses). Prints the result.
//
// Usage: node scripts/admin-test-signin.mjs <password>

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const env = Object.fromEntries(
  envFile
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
);

const supa = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const password = process.argv[2];
if (!password) {
  console.error('Usage: admin-test-signin.mjs <password>');
  process.exit(1);
}

const { data, error } = await supa.auth.signInWithPassword({
  email: 'melvinmoralesx@gmail.com',
  password,
});

if (error) {
  console.log('FAIL:', error.message);
  process.exit(2);
}
console.log('OK: signed in as', data.user?.email, '— user_id', data.user?.id);
