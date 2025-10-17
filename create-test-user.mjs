// Create test user via Supabase Admin API
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

console.log('👤 Creating test user...\n');

// Read environment variables
const envContent = readFileSync('.env.local', 'utf8');
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const serviceKeyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);

const url = urlMatch?.[1]?.trim();
const serviceKey = serviceKeyMatch?.[1]?.trim();

if (!url || !serviceKey) {
  console.log('❌ Missing Supabase credentials');
  process.exit(1);
}

// Create admin client
const supabase = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  try {
    console.log('1️⃣ Creating auth user...');
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test@megalabs.com',
      password: 'test123456',
      email_confirm: true // Auto-confirm the email
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log('⚠️  User already exists, using existing user');
        
        // Get existing user
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        const testUser = existingUser.users.find(u => u.email === 'test@megalabs.com');
        
        if (testUser) {
          console.log('✅ Found existing user:', testUser.id);
          await createUserProfile(testUser.id);
        }
      } else {
        console.log('❌ Auth error:', authError.message);
        return;
      }
    } else {
      console.log('✅ Auth user created:', authData.user.id);
      await createUserProfile(authData.user.id);
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function createUserProfile(userId) {
  console.log('\n2️⃣ Creating user profile...');
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: userId,
      username: 'Test User',
      email: 'test@megalabs.com',
      phone: '+598 123456789', // Uruguay phone for flag testing
      country: 'UY',
      is_service_center: false
    }, { 
      onConflict: 'id',
      ignoreDuplicates: false 
    });

  if (error) {
    console.log('❌ Profile error:', error.message);
  } else {
    console.log('✅ User profile created/updated');
    console.log('\n🎉 Test user ready!');
    console.log('📧 Email: test@megalabs.com');
    console.log('🔑 Password: test123456');
    console.log('🌎 Country: Uruguay (flag will show)');
    console.log('\n🚀 You can now login at http://localhost:3000');
  }
}

createTestUser();