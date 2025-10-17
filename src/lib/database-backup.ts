import { supabaseAdmin } from './supabase';
import type { Tables, Updates } from './supabase';

export interface DBResult {
  rows: unknown[];
  columns: string[];
}

export class DatabaseManager {

  // User authentication queries
  static async getUserByFirebaseUid(firebaseUid: string): Promise<Tables<'users'> | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user by Firebase UID:', error);
        throw error;
      }
      
      return data || null;
    } catch (error) {
      console.error('Error in getUserByFirebaseUid:', error);
      return null;
    }
  }

  static async getUserByEmail(email: string): Promise<Tables<'users'> | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user by email:', error);
        throw error;
      }
      
      return data || null;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      return null;
    }
  }

  static async createUser(userData: {
    firebaseUid: string;
    email: string;
    username: string;
    phone?: string;
  }): Promise<Tables<'users'> | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          firebase_uid: userData.firebaseUid,
          email: userData.email,
          username: userData.username,
          phone: userData.phone || null,
          is_activated: true,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in createUser:', error);
      return null;
    }
  }

  static async updateUser(firebaseUid: string, userData: {
    email?: string;
    username?: string;
    phone?: string;
  }): Promise<Tables<'users'> | null> {
    try {
      const updateData: Updates<'users'> = {
        updated_at: new Date().toISOString(),
      };

      if (userData.email) updateData.email = userData.email;
      if (userData.username) updateData.username = userData.username;
      if (userData.phone !== undefined) updateData.phone = userData.phone;

      const { data, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('firebase_uid', firebaseUid)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in updateUser:', error);
      return await this.getUserByFirebaseUid(firebaseUid);
    }
  }

  // Legacy login support (for migration from B4A/B4i)
  static async getUserByEmailAndPassword(email: string, encodedPassword: string): Promise<Tables<'users'> | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', encodedPassword)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user by email and password:', error);
        throw error;
      }
      
      return data || null;
    } catch (error) {
      console.error('Error in getUserByEmailAndPassword:', error);
      return null;
    }
  }

  // Training and product queries
  static async getUserTrainings(userId: number) {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_trainings')
        .select(`
          *,
          trainings:training_id (
            id,
            title,
            description,
            content_url,
            duration,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user trainings:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getUserTrainings:', error);
      return [];
    }
  }

  static async getProductCategories() {
    try {
      const { data, error } = await supabaseAdmin
        .from('product_categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching product categories:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getProductCategories:', error);
      return [];
    }
  }

  static async getProductsByCategory(categoryId: number) {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .order('name');
      
      if (error) {
        console.error('Error fetching products by category:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getProductsByCategory:', error);
      return [];
    }
  }

  // FAQ queries
  static async getFAQs(categoryId?: number) {
    try {
      let query = supabaseAdmin
        .from('faqs')
        .select(`
          *,
          faq_categories:category_id (
            id,
            name
          )
        `);
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query.order('order_index').order('created_at');
      
      if (error) {
        console.error('Error fetching FAQs:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getFAQs:', error);
      return [];
    }
  }

  // Support center queries
  static async getChatTopics(userId: number) {
    try {
      const { data, error } = await supabaseAdmin
        .from('chat_topics')
        .select(`
          *,
          chat_messages (
            id,
            created_at
          )
        `)
        .or(`user_id.eq.${userId},assigned_to.eq.${userId}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching chat topics:', error);
        throw error;
      }
      
      // Transform data to include message count and last message time
      const transformedData = data?.map(topic => {
        const messages = (topic.chat_messages as { id: string; created_at: string }[]) || [];
        return {
          ...topic,
          message_count: messages.length,
          last_message_at: messages.length > 0 
            ? Math.max(...messages.map(m => new Date(m.created_at).getTime()))
            : null
        };
      }) || [];
      
      return transformedData;
    } catch (error) {
      console.error('Error in getChatTopics:', error);
      return [];
    }
  }
}

export default DatabaseManager;