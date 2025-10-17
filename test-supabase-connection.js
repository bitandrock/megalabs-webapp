// Simple test script to verify Supabase connection
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key exists:', supabaseKey ? '✅ Yes' : '❌ No');

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('areas').select('count');
    
    if (error) {
      if (error.message.includes('relation "public.areas" does not exist')) {
        console.log('⚠️  Connection successful but database schema not set up yet');
        console.log('   Please run the SQL from supabase-schema-updated.sql in your Supabase dashboard');
      } else {
        console.log('❌ Database error:', error.message);
      }
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('✅ Database schema is set up correctly');
    }
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
  }
}

testConnection();