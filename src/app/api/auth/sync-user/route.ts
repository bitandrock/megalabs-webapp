import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import DatabaseManager from '@/lib/database';

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
    let userProfile = await DatabaseManager.getUserByFirebaseUid(firebaseUid);

    if (userProfile) {
      // Update existing user
      userProfile = await DatabaseManager.updateUser(firebaseUid, {
        email: body.email,
        username: body.username,
        phone: body.phone,
      });
    } else {
      // Check if user exists with same email (for migration from old system)
      const existingUser = await DatabaseManager.getUserByEmail(body.email);
      
      if (existingUser && !existingUser.firebase_uid) {
        // Migrate existing user to Firebase
        userProfile = await DatabaseManager.updateUser(firebaseUid, {
          email: body.email,
          username: body.username,
          phone: body.phone,
        });
      } else {
        // Create new user
        userProfile = await DatabaseManager.createUser({
          firebaseUid: firebaseUid,
          email: body.email,
          username: body.username,
          phone: body.phone,
        });
      }
    }

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'Failed to create/update user profile' },
        { status: 500 }
      );
    }

    // Transform database result to match expected interface
    const profile = {
      id: userProfile.id,
      username: userProfile.username,
      email: userProfile.email,
      phone: userProfile.phone,
      isServiceCenter: userProfile.is_service_center === 1,
      isActivated: userProfile.is_activated === 1,
      firebaseUid: userProfile.firebase_uid,
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