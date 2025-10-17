-- Create test user profile
-- Run this in Supabase SQL Editor AFTER creating the auth user

-- First, get the user ID from the auth.users table
-- Replace 'test@megalabs.com' with the email you used
-- Replace the UUID below with the actual UUID from your auth.users table

-- Example: If your test user has UUID: 12345678-1234-1234-1234-123456789012
-- Replace that UUID in the INSERT below

INSERT INTO public.users (
  id,
  username,
  email,
  phone,
  country,
  is_service_center,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@megalabs.com' LIMIT 1),
  'Test User',
  'test@megalabs.com', 
  '+598 123456789',  -- Uruguay phone for country flag testing
  'UY',
  false,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  country = EXCLUDED.country,
  updated_at = NOW();