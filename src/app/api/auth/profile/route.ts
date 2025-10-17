import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // For now, we'll extract the UID from the token client-side
    // In production, you should verify the token server-side
    // This is a simplified approach for development
    let firebaseUid: string;
    
    try {
      // Basic token parsing (not secure for production)
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      firebaseUid = payload.user_id || payload.sub;
      
      console.log('🔍 Debug - Extracted Firebase UID:', firebaseUid);
      console.log('🔍 Debug - Full payload:', JSON.stringify(payload, null, 2));
      
      if (!firebaseUid) {
        throw new Error('Invalid token structure');
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user profile from database using admin client
    console.log('🔍 Debug - Searching for user with Firebase UID:', firebaseUid);
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();
      
    console.log('🔍 Debug - Database result:', userProfile);
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Database error:', profileError);
    }

    if (!userProfile) {
      console.log('⚠️ User not found with Firebase UID. Attempting auto-migration...');
      
      // Try to find user by email from token payload
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      if (payload.email) {
        console.log('🔍 Attempting to find user by email:', payload.email);
        const { data: existingUser, error: emailError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', payload.email)
          .single();
        
        if (existingUser && !existingUser.firebase_uid && !emailError) {
          console.log('✨ Found existing user without Firebase UID. Migrating...');
          
          // Migrate the user by adding Firebase UID
          const { data: migratedUser, error: migrateError } = await supabaseAdmin
            .from('users')
            .update({
              firebase_uid: firebaseUid,
              username: payload.name || existingUser.username,
              updated_at: new Date().toISOString()
            })
            .eq('email', payload.email)
            .select()
            .single();
          
          if (migratedUser && !migrateError) {
            console.log('✅ User migration successful!');
            // Use the migrated user as the profile
            const profile = {
              id: migratedUser.id,
              username: migratedUser.username,
              email: migratedUser.email,
              phone: migratedUser.phone,
              isServiceCenter: migratedUser.is_service_center === true,
              isActivated: true,
              firebaseUid: migratedUser.firebase_uid,
            };
            
            return NextResponse.json({
              success: true,
              profile,
            });
          }
        } else {
          console.log('🆕 No existing user found. Creating new user...');
          
          // Create new user with Firebase data
          const { data: newUser, error: createError } = await supabaseAdmin
            .from('users')
            .insert({
              firebase_uid: firebaseUid,
              email: payload.email,
              username: payload.name || payload.email.split('@')[0],
              phone: payload.phone_number,
              is_service_center: false
            })
            .select()
            .single();
          
          if (newUser && !createError) {
            console.log('✅ New user created successfully!');
            
            const profile = {
              id: newUser.id,
              username: newUser.username,
              email: newUser.email,
              phone: newUser.phone,
              isServiceCenter: newUser.is_service_center === true,
              isActivated: true,
              firebaseUid: newUser.firebase_uid,
            };
            
            return NextResponse.json({
              success: true,
              profile,
            });
          }
        }
      }
      
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Transform database result to match expected interface
    const profile = {
      id: userProfile.id,
      username: userProfile.username,
      email: userProfile.email,
      phone: userProfile.phone,
      isServiceCenter: userProfile.is_service_center === true,
      isActivated: true, // Default to activated for existing users
      firebaseUid: userProfile.firebase_uid,
    };

    return NextResponse.json({
      success: true,
      profile,
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}