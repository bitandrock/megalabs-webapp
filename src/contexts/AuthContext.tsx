'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithMicrosoft, signInWithGoogle, signOut } from '@/lib/firebase';
import axios from 'axios';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone?: string;
  isServiceCenter: boolean;
  isActivated: boolean;
  firebaseUid: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInMicrosoft: () => Promise<void>;
  signInGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from database
  const fetchUserProfile = async (firebaseUser: User) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      const response = await axios.get('/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      
      if (response.data.success) {
        setUserProfile(response.data.profile);
      } else {
        console.log('User not found in database, might need registration');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (axios.isAxiosError(error)) {
        console.error('Request URL:', error.config?.url);
        console.error('Status:', error.response?.status);
        console.error('Response:', error.response?.data);
        
        // If it's a 404, the profile API should have attempted auto-migration
        // Let's try once more after a short delay
        if (error.response?.status === 404) {
          console.log('🔄 Got 404, retrying profile fetch in 2 seconds...');
          setTimeout(async () => {
            try {
              const retryToken = await firebaseUser.getIdToken();
              const retryResponse = await axios.get('/api/auth/profile', {
                headers: { Authorization: `Bearer ${retryToken}` },
              });
              if (retryResponse.data.success) {
                setUserProfile(retryResponse.data.profile);
                console.log('✅ Profile fetch successful on retry!');
              }
            } catch {
              console.log('❌ Retry failed, user might need manual account linking');
            }
          }, 2000);
        }
      }
      setUserProfile(null);
    }
  };

  // Create or update user profile in database
  const createOrUpdateProfile = async (firebaseUser: User) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      const userData = {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        username: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
        phone: firebaseUser.phoneNumber,
      };

      const response = await axios.post('/api/auth/sync-user', userData, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (response.data.success) {
        setUserProfile(response.data.profile);
      }
    } catch (error) {
      console.error('Error creating/updating user profile:', error);
    }
  };

  const signInMicrosoft = async () => {
    try {
      setLoading(true);
      const result = await signInWithMicrosoft();
      if (result.user) {
        await createOrUpdateProfile(result.user);
      }
    } catch (error) {
      console.error('Microsoft sign-in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithGoogle();
      if (result.user) {
        await createOrUpdateProfile(result.user);
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signInMicrosoft,
    signInGoogle,
    logout,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};