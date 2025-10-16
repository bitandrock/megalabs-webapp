# Megalabs Web Application

A modern web application built with Next.js that migrates functionality from the original B4A/B4i mobile apps to a Progressive Web App (PWA).

## Features

- 🔐 **Firebase Authentication** with Microsoft OAuth
- 📱 **Progressive Web App** (PWA) capabilities
- 🎨 **Responsive Design** with Tailwind CSS
- 🔄 **Real-time Database** integration
- 🚀 **Modern Architecture** with React Server Components
- 🔔 **Push Notifications** support
- 📊 **Dashboard** with user activity tracking

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth with Microsoft OAuth
- **Database**: Supabase (PostgreSQL) with real-time capabilities
- **PWA**: next-pwa plugin
- **Icons**: Heroicons
- **State Management**: React Context API

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   └── layout.tsx        # Root layout
├── components/            # Reusable components
├── contexts/             # React contexts
├── lib/                  # Utilities and configurations
└── types/                # TypeScript type definitions
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Update `.env.local` with your actual values:

```env
# Firebase Configuration (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key

# Firebase Admin SDK (Server)
FIREBASE_CLIENT_EMAIL=service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Microsoft provider
3. Generate a service account key for Admin SDK
4. Configure your domain for OAuth redirects

### 4. Supabase Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Copy the project URL and API keys
3. Run the database schema:

```bash
# Copy the schema to your Supabase SQL Editor
cp supabase-schema.sql
# Then paste and run it in your Supabase dashboard > SQL Editor
```

Or run the schema directly:

```sql
-- The complete schema is in supabase-schema.sql
-- This includes all tables, indexes, RLS policies, and sample data
```

### 5. Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Migration from B4A/B4i

This web application replicates the core functionality of the original B4A/B4i mobile apps:

### Authentication Migration

| B4A/B4i Feature | Web App Implementation |
|------------------|------------------------|
| Microsoft OAuth WebView | Firebase Auth with Microsoft provider |
| Base64 password encoding | Firebase secure authentication |
| Local SQLite storage | Browser localStorage + Firebase |
| Auto-login functionality | Firebase persistence |

### Feature Mapping

| Original Feature | Web Implementation | Status |
|------------------|-------------------|----------|
| Login Screen | `/login` | ✅ Complete |
| Main Menu | Dashboard with sidebar | ✅ Complete |
| User Profile | Context + API | ✅ Complete |
| Capacitaciones | `/trainings` | 🚧 In Progress |
| Productos | `/products` | 🚧 In Progress |
| FAQ | `/faq` | 🚧 In Progress |
| Soporte/Chat | `/support` | 🚧 In Progress |
| Centro de Servicio | `/service-center` | 🚧 In Progress |
| Push Notifications | Firebase Messaging | 🚧 In Progress |

## PWA Configuration

The app is configured as a Progressive Web App with:

- Service Worker for offline functionality
- Web App Manifest for installation
- Push notification support
- Responsive design for mobile/desktop

To install on mobile:
1. Open the web app in a mobile browser
2. Use "Add to Home Screen" option
3. The app will behave like a native mobile app

## Migration Checklist

- [x] ✅ Project setup and basic structure
- [x] ✅ Firebase Authentication with Microsoft OAuth
- [x] ✅ Database connection and user management
- [x] ✅ Main dashboard and navigation
- [x] ✅ PWA configuration
- [ ] 🚧 Training modules migration
- [ ] 🚧 Product catalog implementation
- [ ] 🚧 FAQ system
- [ ] 🚧 Support/Chat system
- [ ] 🚧 Service center features
- [ ] 🚧 Push notifications
- [ ] 🚧 Production deployment
- [ ] 🚧 User migration scripts
- [ ] 🚧 Testing and QA

## License

This project is proprietary to Megalabs. All rights reserved.
