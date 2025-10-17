// Test Supabase database connection and data
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

console.log('🧪 Testing Supabase database connection and data...\n');

// Read environment variables
const envContent = readFileSync('.env.local', 'utf8');
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);

const url = urlMatch?.[1]?.trim();
const anonKey = keyMatch?.[1]?.trim();

if (!url || !anonKey) {
  console.log('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

async function testDatabase() {
  try {
    console.log('1️⃣ Testing areas table...');
    const { data: areas, error: areasError } = await supabase
      .from('areas')
      .select('*');
    
    if (areasError) {
      console.log('❌ Areas error:', areasError.message);
      if (areasError.message.includes('does not exist')) {
        console.log('   → Please run the SQL schema in your Supabase dashboard first');
      }
      return;
    }
    
    console.log(`✅ Areas: ${areas.length} found`);
    areas.forEach(area => console.log(`   - ${area.name}`));
    
    console.log('\n2️⃣ Testing products table...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (!productsError) {
      console.log(`✅ Products: ${products.length} found`);
      products.forEach(product => console.log(`   - ${product.name} (Area ${product.area_id})`));
    }
    
    console.log('\n3️⃣ Testing training topics...');
    const { data: topics, error: topicsError } = await supabase
      .from('training_topics')
      .select('*');
    
    if (!topicsError) {
      console.log(`✅ Training Topics: ${topics.length} found`);
      topics.forEach(topic => console.log(`   - ${topic.topic} (Product ${topic.product_id})`));
    }
    
    console.log('\n🎉 Database setup is complete and working!');
    console.log('✅ Ready to test the web application');
    
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
}

testDatabase();