const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envPath = '.env.local';
const env = fs.readFileSync(envPath, 'utf8');
const get = (key) => {
  const match = env.match(new RegExp(`^${key}="([^"]*)"`, 'm'));
  return match ? match[1] : undefined;
};

const url = get('NEXT_PUBLIC_SUPABASE_URL');
const anon = get('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!url || !anon) {
  console.error('Missing Supabase env values');
  process.exit(1);
}

const supabase = createClient(url, anon, { auth: { persistSession: false } });

(async () => {
  const email = 'adhambnsayed2005hanafi@gmail.com';
  const password = 'adham.20250003@GEI';
  const fullName = 'Adham';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        is_verified: true,
        verification_code: null,
      },
    },
  });

  if (error) {
    console.log('signup result', error.message);
  } else {
    console.log('signup ok', data.user?.id || 'no-user');
  }

  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
  if (loginError) {
    console.log('login error', loginError.message);
    process.exit(1);
  }

  console.log('login ok', !!loginData.session);
})();
