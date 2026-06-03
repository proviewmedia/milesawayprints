#!/usr/bin/env node
// One-off: list / create / confirm the admin Supabase auth user.
// Usage:
//   node scripts/admin-provision.mjs check
//   node scripts/admin-provision.mjs create <password>
//   node scripts/admin-provision.mjs confirm
//   node scripts/admin-provision.mjs reset-password <password>

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const env = Object.fromEntries(
  envFile
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = 'melvinmoralesx@gmail.com';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supa = createClient(SUPABASE_URL, SERVICE_KEY);
const [, , action, ...rest] = process.argv;

async function findByEmail(email) {
  // The admin listUsers API doesn't filter; we paginate and find.
  let page = 1;
  while (true) {
    const { data, error } = await supa.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => (u.email ?? '').toLowerCase() === email.toLowerCase());
    if (hit) return hit;
    if (data.users.length < 200) return null;
    page++;
  }
}

async function check() {
  const u = await findByEmail(ADMIN_EMAIL);
  if (!u) {
    console.log(`No user found for ${ADMIN_EMAIL}`);
    return;
  }
  console.log(JSON.stringify(
    {
      id: u.id,
      email: u.email,
      confirmed_at: u.email_confirmed_at,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      providers: u.app_metadata?.providers,
    },
    null,
    2,
  ));
}

async function create(password) {
  if (!password) {
    console.error('Usage: create <password>');
    process.exit(1);
  }
  const { data, error } = await supa.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  console.log('Created user:', data.user.id);
}

async function confirm() {
  const u = await findByEmail(ADMIN_EMAIL);
  if (!u) {
    console.error('No user to confirm — run create first');
    process.exit(1);
  }
  const { error } = await supa.auth.admin.updateUserById(u.id, { email_confirm: true });
  if (error) throw error;
  console.log('Confirmed user:', u.id);
}

async function resetPassword(password) {
  if (!password) {
    console.error('Usage: reset-password <password>');
    process.exit(1);
  }
  const u = await findByEmail(ADMIN_EMAIL);
  if (!u) {
    console.error('No user to update — run create first');
    process.exit(1);
  }
  const { error } = await supa.auth.admin.updateUserById(u.id, {
    password,
    email_confirm: true,
  });
  if (error) throw error;
  console.log('Updated password for user:', u.id);
}

const map = { check, create, confirm, 'reset-password': resetPassword };
const fn = map[action];
if (!fn) {
  console.error('Usage: admin-provision.mjs <check|create|confirm|reset-password> [...args]');
  process.exit(1);
}
fn(...rest).catch((e) => {
  console.error('Failed:', e.message ?? e);
  process.exit(1);
});
