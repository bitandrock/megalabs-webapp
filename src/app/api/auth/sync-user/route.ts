import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const body = await request.json();
    
    // Basic token parsing (not secure for production)
    let firebaseUid: string;
    
    try {
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      firebaseUid = payload.user_id || payload.sub;
      
      if (!firebaseUid) {
        throw new Error('Invalid token structure');
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Validate that the Firebase UID matches
    if (firebaseUid !== body.firebaseUid) {
      return NextResponse.json(
        { success: false, error: 'Token mismatch' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();

    let finalUserProfile = null;
    
    if (userProfile && !profileError) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          email: body.email,
          username: body.username,
          phone: body.phone,
          firebase_uid: firebaseUid,
          updated_at: new Date().toISOString()
        })
        .eq('firebase_uid', firebaseUid)
        .select()
        .single();
      
      finalUserProfile = updatedUser;
    } else {
      // Check if user exists with same email (for migration from old system)
      const { data: existingUser, error: existingError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', body.email)
        .single();
      
      if (existingUser && !existingUser.firebase_uid && !existingError) {
        // Migrate existing user to Firebase by updating their firebase_uid
        const { data: migratedUser, error: migrateError } = await supabaseAdmin
          .from('users')
          .update({
            firebase_uid: firebaseUid,
            username: body.username || existingUser.username,
            phone: body.phone || existingUser.phone,
            updated_at: new Date().toISOString()
          })
          .eq('email', body.email)
          .select()
          .single();
        
        finalUserProfile = migratedUser;
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabaseAdmin
          .from('users')
          .insert({
            firebase_uid: firebaseUid,
            email: body.email,
            username: body.username,
            phone: body.phone,
            is_service_center: false
          })
          .select()
          .single();
        
        finalUserProfile = newUser;
      }
    }

    if (!finalUserProfile) {
      return NextResponse.json(
        { success: false, error: 'Failed to create/update user profile' },
        { status: 500 }
      );
    }

    // Transform database result to match expected interface
    const profile = {
      id: finalUserProfile.id,
      username: finalUserProfile.username,
      email: finalUserProfile.email,
      phone: finalUserProfile.phone,
      isServiceCenter: finalUserProfile.is_service_center === true,
      isActivated: true, // Default to activated for new users
      firebaseUid: finalUserProfile.firebase_uid,
    };

    return NextResponse.json({
      success: true,
      profile,
    });

  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}