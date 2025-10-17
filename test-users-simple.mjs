import { createClient } from '@supabase/supabase-js';

// Hardcode values from .env.local for testing
const supabaseUrl = 'https://jtpbxiqcqwzjjfzwbgxv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cGJ4aXFjcXd6ampmendiZ3h2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3NjMyOSwiZXhwIjoyMDc2MTUyMzI5fQ.ePwX_6QSs7lrj5_zXOnFPrFBnaki3q4AayqC6wJKcaY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 Testing user table...\n');

try {
  // Test 1: Check users table
  console.log('1️⃣ Checking users table...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*');
  
  if (usersError) {
    console.error('❌ Error querying users:', usersError.message);
    console.error('❌ Error code:', usersError.code);
    console.error('❌ Error details:', usersError.details);
  } else {
    console.log(`✅ Users table found with ${users.length} users`);
    if (users.length > 0) {
      console.log('Sample users:');
      users.slice(0, 3).forEach(user => {
        console.log(`   - ${user.email || user.username} (ID: ${user.id})`);
      });
    } else {
      console.log('📝 No users found - this might explain the 404 error!');
    }
  }

  // Test 2: Try to create a test user 
  console.log('\n2️⃣ Testing user creation...');
  const testUser = {
    id: 'test-user-12345',
    username: 'testuser',
    email: 'test@example.com',
    firebase_uid: 'firebase-test-uid-12345',
    is_service_center: false,
    is_activated: true
  };

  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert(testUser)
    .select()
    .single();

  if (createError) {
    if (createError.code === '23505') {
      console.log('⚠️  Test user already exists (that\'s OK)');
    } else {
      console.error('❌ Error creating test user:', createError.message);
    }
  } else {
    console.log('✅ Test user created:', newUser);
  }

  // Test 3: Test getUserByFirebaseUid functionality
  console.log('\n3️⃣ Testing getUserByFirebaseUid...');
  const { data: foundUser, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('firebase_uid', 'firebase-test-uid-12345')
    .single();

  if (findError) {
    if (findError.code === 'PGRST116') {
      console.log('❌ No user found with Firebase UID - this would cause 404');
    } else {
      console.error('❌ Error finding user:', findError.message);
    }
  } else {
    console.log('✅ User found by Firebase UID:', foundUser);
  }

} catch (error) {
  console.error('❌ Unexpected error:', error);
}

console.log('\n🏁 Test completed!');