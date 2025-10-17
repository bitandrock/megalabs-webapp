import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabaseUrl = 'https://jtpbxiqcqwzjjfzwbgxv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cGJ4aXFjcXd6ampmendiZ3h2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3NjMyOSwiZXhwIjoyMDc2MTUyMzI5fQ.ePwX_6QSs7lrj5_zXOnFPrFBnaki3q4AayqC6wJKcaY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Creating user for juampi@bitandrock.com...');

const newUserId = randomUUID();
const firebaseUid = '0pnER8QyBtValTbvFcOgHamifo93';
const email = 'juampi@bitandrock.com';
const username = 'Juan Pablo Norverto';

try {
  // Use a proper UUID like the existing user
  const userId = newUserId;
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      username: username,
      email: email,
      firebase_uid: firebaseUid,
      is_service_center: false
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error:', error.message);
    console.error('❌ Details:', error);
  } else {
    console.log('✅ User created successfully:');
    console.log('   ID:', data.id);
    console.log('   Email:', data.email);
    console.log('   Username:', data.username);
    console.log('   Firebase UID:', data.firebase_uid);
    console.log('   Service Center:', data.is_service_center);
    
    console.log('\n🎉 You can now sign in at http://localhost:3000/dashboard');
    console.log('   The 404 error should be resolved!');
  }
} catch (error) {
  console.error('❌ Unexpected error:', error.message);
}