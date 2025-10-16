import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import DatabaseManager from '@/lib/database';

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
      
      if (!firebaseUid) {
        throw new Error('Invalid token structure');
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user profile from database
    const userProfile = await DatabaseManager.getUserByFirebaseUid(firebaseUid);

    if (!userProfile) {
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
      isServiceCenter: userProfile.is_service_center === 1,
      isActivated: userProfile.is_activated === 1,
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