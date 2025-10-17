import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jtpbxiqcqwzjjfzwbgxv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cGJ4aXFjcXd6ampmendiZ3h2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3NjMyOSwiZXhwIjoyMDc2MTUyMzI5fQ.ePwX_6QSs7lrj5_zXOnFPrFBnaki3q4AayqC6wJKcaY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Checking existing user and table structure...\n');

// Check the existing user
console.log('1️⃣ Existing user details:');
const { data: users, error } = await supabase
  .from('users')
  .select('*');

if (error) {
  console.error('❌ Error:', error.message);
} else {
  users.forEach(user => {
    console.log('User details:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Firebase UID: ${user.firebase_uid || 'NOT SET'}`);
    console.log(`   Is Service Center: ${user.is_service_center}`);
    console.log(`   Created: ${user.created_at}`);
    console.log('');
  });
}

// Try to update the existing user with a Firebase UID
console.log('2️⃣ Updating user with Firebase UID...');
const { data: updated, error: updateError } = await supabase
  .from('users')
  .update({
    firebase_uid: 'test-firebase-uid-for-testing'
  })
  .eq('email', 'test@megalabs.com')
  .select()
  .single();

if (updateError) {
  console.error('❌ Update error:', updateError.message);
} else {
  console.log('✅ User updated:', updated);
}

console.log('\n🏁 Check completed!');