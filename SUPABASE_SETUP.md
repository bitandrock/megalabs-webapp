# Supabase Setup Guide

This guide will help you set up Supabase as the database service for the Megalabs web application.

## Why Supabase?

Supabase offers several advantages over direct MySQL connections:

- **🚀 Real-time capabilities** - Live updates and subscriptions
- **🔒 Built-in authentication** - Can complement Firebase Auth
- **⚡ Auto-generated APIs** - REST and GraphQL APIs
- **🛡️ Row Level Security** - Fine-grained access control
- **📊 Built-in dashboard** - Database management UI
- **🔄 Real-time sync** - Automatic data synchronization
- **🎯 TypeScript support** - Auto-generated types

## Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up or log in
4. Click "New Project"
5. Choose your organization
6. Fill in project details:
   - **Project Name**: `megalabs-webapp`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Start with Free tier

### 2. Get API Keys

Once your project is created:

1. Go to **Settings** > **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiI...`
   - **service_role secret key**: `eyJhbGciOiJIUzI1NiI...` (keep this secret!)

### 3. Update Environment Variables

Update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
```

### 4. Set Up Database Schema

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase-schema.sql`
4. Paste into the SQL Editor
5. Click **Run**

This will create:
- All necessary tables
- Indexes for performance
- Row Level Security policies
- Sample data for testing

### 5. Configure Row Level Security

The schema automatically sets up RLS policies, but you may want to customize them:

```sql
-- Example: Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (firebase_uid = auth.uid()::text);

-- Example: Allow service center users to view all users
CREATE POLICY "Service center can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE firebase_uid = auth.uid()::text 
      AND is_service_center = true
    )
  );
```

### 6. Test the Connection

Run the development server:

```bash
npm run dev
```

Check the browser console for any Supabase connection errors.

## Migration from MySQL

If you're migrating from an existing MySQL database:

### 1. Export Data from MySQL

```sql
-- Export users
SELECT * FROM users 
INTO OUTFILE '/tmp/users.csv' 
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\n';

-- Repeat for other tables...
```

### 2. Import to Supabase

1. Go to **Table Editor** in Supabase dashboard
2. Select your table
3. Click **Insert** > **Import data from CSV**
4. Upload your CSV files

### 3. Update Firebase UIDs

If you have existing users without Firebase UIDs:

```sql
-- Add Firebase UID for existing users during migration
UPDATE users 
SET firebase_uid = 'temp_' || id::text 
WHERE firebase_uid IS NULL;
```

### 4. Migrate Legacy Passwords

For users with encoded passwords, you'll need a migration script:

```sql
-- Keep password field for gradual migration
-- Users will be migrated to Firebase Auth on their next login
UPDATE users 
SET password = NULL, firebase_uid = $1 
WHERE email = $2;
```

## Advanced Configuration

### Real-time Subscriptions

Enable real-time for tables that need live updates:

```sql
-- Enable real-time for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
```

### Custom Functions

Create custom functions for complex operations:

```sql
-- Function to get user training progress
CREATE OR REPLACE FUNCTION get_user_training_progress(user_id_param INTEGER)
RETURNS TABLE (
  training_id INTEGER,
  title VARCHAR,
  progress INTEGER,
  completed_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    COALESCE(ut.progress, 0),
    ut.completed_at
  FROM trainings t
  LEFT JOIN user_trainings ut ON t.id = ut.training_id AND ut.user_id = user_id_param
  ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql;
```

### Backup and Recovery

Set up automated backups:

1. Go to **Settings** > **Database**
2. Enable **Point-in-Time Recovery**
3. Configure backup retention period

## Security Best Practices

### 1. Environment Variables

- Never commit `.env.local` to version control
- Use different projects for development/production
- Rotate API keys regularly

### 2. Row Level Security

- Always enable RLS on tables with sensitive data
- Test policies with different user roles
- Use `auth.uid()` to reference the current user

### 3. Service Role Key

- Only use service role key on the server-side
- Never expose it to client-side code
- Consider using JWT tokens for API access

## Troubleshooting

### Connection Issues

```bash
# Test connection
curl -X GET 'https://your-project.supabase.co/rest/v1/users?select=*' \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

### RLS Policy Issues

```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- View existing policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Performance Issues

```sql
-- Check for missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE schemaname = 'public' 
ORDER BY n_distinct DESC;
```

## Production Deployment

### 1. Upgrade Plan

Consider upgrading to Pro plan for:
- Increased database size
- More concurrent connections
- Priority support
- Advanced metrics

### 2. Connection Pooling

Enable connection pooling for better performance:

1. Go to **Settings** > **Database**
2. Enable **Connection pooling**
3. Use the pooled connection string in production

### 3. Custom Domain

Set up a custom domain for your API:

1. Go to **Settings** > **API**
2. Configure custom domain
3. Update environment variables

## Monitoring

### 1. Built-in Analytics

Supabase provides built-in analytics:
- API usage
- Database performance
- Real-time connections
- Storage usage

### 2. Logs

Monitor logs for issues:
- Database logs
- Auth logs
- API logs
- Function logs

### 3. Alerts

Set up alerts for:
- High API usage
- Database connection limits
- Storage quota
- Performance issues

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## Next Steps

After setting up Supabase:

1. ✅ Test user authentication flow
2. ✅ Verify database operations
3. ✅ Test real-time features
4. ✅ Set up monitoring
5. ✅ Plan migration strategy
6. ✅ Configure backups
7. ✅ Set up production environment