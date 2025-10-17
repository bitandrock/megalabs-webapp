// Simple Supabase connection test
import { readFileSync } from 'fs';

console.log('🔍 Checking Supabase configuration in .env.local...\n');

try {
  const envContent = readFileSync('.env.local', 'utf8');
  
  // Extract Supabase values
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
  const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);
  const serviceKeyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
  
  const url = urlMatch?.[1]?.trim();
  const anonKey = keyMatch?.[1]?.trim();
  const serviceKey = serviceKeyMatch?.[1]?.trim();
  
  console.log('📋 Current Configuration:');
  console.log('- SUPABASE_URL:', url || '❌ Not set');
  console.log('- ANON_KEY:', anonKey ? '✅ Set (' + anonKey.substring(0, 20) + '...)' : '❌ Not set');
  console.log('- SERVICE_KEY:', serviceKey ? '✅ Set (' + serviceKey.substring(0, 20) + '...)' : '❌ Not set');
  
  // Check if they're still placeholders
  const hasPlaceholders = url?.includes('your-project') || 
                         anonKey?.includes('your-anon-key') ||
                         url === 'https://your-project.supabase.co';
  
  if (hasPlaceholders) {
    console.log('\n⚠️  You still have placeholder values in .env.local');
    console.log('   Please update with your actual Supabase credentials');
  } else if (url && anonKey && serviceKey) {
    console.log('\n✅ Configuration looks good!');
    console.log('   Now run the database schema in your Supabase dashboard');
  } else {
    console.log('\n❌ Missing required Supabase credentials');
  }
  
} catch (error) {
  console.log('❌ Could not read .env.local file:', error.message);
}