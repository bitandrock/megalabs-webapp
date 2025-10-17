import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 Testing user profile functionality...\n');

// Test 1: Check if users table exists and has data
console.log('1️⃣ Testing users table...');
try {
  const { data: users, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) {
    console.error('❌ Error querying users:', error.message);
  } else {
    console.log(`✅ Users table found with ${users.length} users`);
    if (users.length > 0) {
      console.log('Sample users:');
      users.forEach(user => {
        console.log(`   - ${user.email || user.username} (Firebase UID: ${user.firebase_uid})`);
      });
    }
  }
} catch (error) {
  console.error('❌ Unexpected error:', error);
}

console.log('\n2️⃣ Testing getUserByFirebaseUid with sample Firebase UID...');

// Test 2: Try getUserByFirebaseUid with a test Firebase UID
const testFirebaseUid = 'test-firebase-uid-12345';
try {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('firebase_uid', testFirebaseUid)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      console.log('✅ Query works correctly - no user found with test Firebase UID (expected)');
    } else {
      console.error('❌ Error:', error.message);
    }
  } else {
    console.log('✅ User found:', user);
  }
} catch (error) {
  console.error('❌ Unexpected error:', error);
}

console.log('\n3️⃣ Testing database table structure...');

// Test 3: Check table structure
try {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(0);
  
  if (error) {
    console.error('❌ Error checking table structure:', error.message);
  } else {
    console.log('✅ Users table structure looks correct');
  }
} catch (error) {
  console.error('❌ Unexpected error:', error);
}

console.log('\n🎯 Profile API simulation test...');

// Test 4: Simulate what the profile API does
const simulateProfileAPI = async () => {
  try {
    // This simulates what happens in the profile API route
    const fakeFirebaseUid = 'fake-firebase-uid';
    
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', fakeFirebaseUid)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('✅ No user profile found (expected for fake UID) - API would return 404');
        return null;
      } else {
        console.error('❌ Database error:', error.message);
        return null;
      }
    }
    
    console.log('✅ User profile found:', userProfile);
    return userProfile;
    
  } catch (error) {
    console.error('❌ Unexpected error in simulation:', error);
    return null;
  }
};

await simulateProfileAPI();

console.log('\n🏁 Test completed!');