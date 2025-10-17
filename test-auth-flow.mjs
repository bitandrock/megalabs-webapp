import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jtpbxiqcqwzjjfzwbgxv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cGJ4aXFjcXd6ampmendiZ3h2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3NjMyOSwiZXhwIjoyMDc2MTUyMzI5fQ.ePwX_6QSs7lrj5_zXOnFPrFBnaki3q4AayqC6wJKcaY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 Testing complete authentication flow...\n');

// Step 1: Reset the user's Firebase UID to simulate the original state
console.log('1️⃣ Resetting Firebase UID to simulate fresh login...');
const { data: resetUser, error: resetError } = await supabase
  .from('users')
  .update({
    firebase_uid: null
  })
  .eq('email', 'test@megalabs.com')
  .select()
  .single();

if (resetError) {
  console.error('❌ Reset error:', resetError.message);
} else {
  console.log('✅ User reset:', resetUser.email, '- Firebase UID cleared');
}

// Step 2: Test sync-user API simulation
console.log('\n2️⃣ Simulating sync-user API call...');

// Mock Firebase token payload
const mockFirebaseUid = 'firebase-uid-12345';
const mockUserData = {
  firebaseUid: mockFirebaseUid,
  email: 'test@megalabs.com',
  username: 'Test User Updated',
  phone: '+598 987654321'
};

// Check if user exists with same email (migration scenario)
const { data: existingUser, error: existingError } = await supabase
  .from('users')
  .select('*')
  .eq('email', mockUserData.email)
  .single();

if (existingError) {
  console.log('❌ No existing user found');
} else if (existingUser && !existingUser.firebase_uid) {
  console.log('✅ Found existing user without Firebase UID - migrating...');
  
  // Migrate existing user
  const { data: migratedUser, error: migrateError } = await supabase
    .from('users')
    .update({
      firebase_uid: mockFirebaseUid,
      username: mockUserData.username || existingUser.username,
      phone: mockUserData.phone || existingUser.phone,
      updated_at: new Date().toISOString()
    })
    .eq('email', mockUserData.email)
    .select()
    .single();

  if (migrateError) {
    console.error('❌ Migration error:', migrateError.message);
  } else {
    console.log('✅ User migrated successfully:', migratedUser.email);
    console.log('   Firebase UID:', migratedUser.firebase_uid);
  }
}

// Step 3: Test getUserByFirebaseUid (profile API simulation)
console.log('\n3️⃣ Testing getUserByFirebaseUid (profile API)...');
const { data: userProfile, error: profileError } = await supabase
  .from('users')
  .select('*')
  .eq('firebase_uid', mockFirebaseUid)
  .single();

if (profileError) {
  if (profileError.code === 'PGRST116') {
    console.log('❌ No user profile found - would return 404');
  } else {
    console.error('❌ Profile error:', profileError.message);
  }
} else {
  console.log('✅ User profile found successfully!');
  console.log('   ID:', userProfile.id);
  console.log('   Email:', userProfile.email);
  console.log('   Username:', userProfile.username);
  console.log('   Firebase UID:', userProfile.firebase_uid);
  
  // Transform to API format
  const apiProfile = {
    id: userProfile.id,
    username: userProfile.username,
    email: userProfile.email,
    phone: userProfile.phone,
    isServiceCenter: userProfile.is_service_center === true,
    isActivated: true,
    firebaseUid: userProfile.firebase_uid,
  };
  
  console.log('✅ API would return:', JSON.stringify(apiProfile, null, 2));
}

console.log('\n🎉 Authentication flow test completed!');