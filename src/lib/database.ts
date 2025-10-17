import { supabase } from './supabase';

// Types based on the B4i/B4A architecture
export interface Area {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  area_id: number;
  name: string;
  description?: string;
  has_video: boolean;
  has_pdf: boolean;
  video_url?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
  area?: Area;
}

export interface TrainingTopic {
  id: number;
  product_id: number;
  topic: string;
  info?: string;
  content?: string;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface FAQ {
  id: number;
  product_id: number;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface ChatTopic {
  id: number;
  user_id: string;
  product_id: number;
  title: string;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface ChatMessage {
  id: number;
  chat_topic_id: number;
  sender_type: 'client' | 'support';
  sender_id: string;
  message: string;
  created_at: string;
}

export interface User {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  country?: string;
  is_service_center?: boolean;
  firebase_uid?: string;
  created_at: string;
  updated_at: string;
}

export class DatabaseManager {
  
  // ===== PRODUCT AREAS (like menup.bas) =====
  
  static async loadAreas(): Promise<Area[]> {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading areas:', error);
      return [];
    }
  }

  // ===== PRODUCTS (like categoriaProducto.bas) =====
  
  static async getProductsByArea(areaId: number): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          area:areas(*)
        `)
        .eq('area_id', areaId)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting products by area:', error);
      return [];
    }
  }

  static async getProductById(productId: number): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          area:areas(*)
        `)
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting product by ID:', error);
      return null;
    }
  }

  static async searchProducts(searchText: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          area:areas(*)
        `)
        .or(`name.ilike.%${searchText}%,description.ilike.%${searchText}%`)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // ===== TRAINING TOPICS (like capacitaciones.bas) =====
  
  static async getTrainingTopics(productId: number): Promise<TrainingTopic[]> {
    try {
      const { data, error } = await supabase
        .from('training_topics')
        .select(`
          *,
          product:products(*)
        `)
        .eq('product_id', productId)
        .order('topic');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting training topics:', error);
      return [];
    }
  }

  static async searchTrainingTopics(searchText: string, productId: number): Promise<TrainingTopic[]> {
    try {
      const { data, error } = await supabase
        .from('training_topics')
        .select(`
          *,
          product:products(*)
        `)
        .eq('product_id', productId)
        .or(`topic.ilike.%${searchText}%,info.ilike.%${searchText}%,content.ilike.%${searchText}%`)
        .order('topic');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching training topics:', error);
      return [];
    }
  }

  static async getTrainingTopicById(topicId: number): Promise<TrainingTopic | null> {
    try {
      const { data, error } = await supabase
        .from('training_topics')
        .select(`
          *,
          product:products(
            *,
            area:areas(*)
          )
        `)
        .eq('id', topicId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting training topic by ID:', error);
      return null;
    }
  }

  // ===== FAQ SYSTEM (like faq.bas) =====
  
  static async getFAQs(productId: number): Promise<FAQ[]> {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select(`
          *,
          product:products(*)
        `)
        .eq('product_id', productId)
        .order('question');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting FAQs:', error);
      return [];
    }
  }

  static async searchFAQs(searchText: string, productId: number): Promise<FAQ[]> {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select(`
          *,
          product:products(*)
        `)
        .eq('product_id', productId)
        .or(`question.ilike.%${searchText}%,answer.ilike.%${searchText}%`)
        .order('question');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching FAQs:', error);
      return [];
    }
  }

  static async getFAQById(faqId: number): Promise<FAQ | null> {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select(`
          *,
          product:products(
            *,
            area:areas(*)
          )
        `)
        .eq('id', faqId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting FAQ by ID:', error);
      return null;
    }
  }

  // ===== CHAT SYSTEM (like chat_topics.bas and Chat.bas) =====
  
  static async createChatTopic(userId: string, productId: number, firstMessage: string): Promise<ChatTopic | null> {
    try {
      // Create chat topic
      const { data: topic, error: topicError } = await supabase
        .from('chat_topics')
        .insert([{
          user_id: userId,
          product_id: productId,
          title: firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : ''),
          status: 'open'
        }])
        .select()
        .single();
      
      if (topicError) throw topicError;
      
      // Add first message
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert([{
          chat_topic_id: topic.id,
          sender_type: 'client',
          sender_id: userId,
          message: firstMessage
        }]);
      
      if (messageError) throw messageError;
      
      return topic;
    } catch (error) {
      console.error('Error creating chat topic:', error);
      return null;
    }
  }

  static async addChatMessage(chatTopicId: number, senderType: 'client' | 'support', senderId: string, message: string): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{
          chat_topic_id: chatTopicId,
          sender_type: senderType,
          sender_id: senderId,
          message: message
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Update topic timestamp
      await supabase
        .from('chat_topics')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatTopicId);
      
      return data;
    } catch (error) {
      console.error('Error adding chat message:', error);
      return null;
    }
  }

  static async getChatMessages(chatTopicId: number): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_topic_id', chatTopicId)
        .order('created_at');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting chat messages:', error);
      return [];
    }
  }

  static async getChatTopicsForProduct(productId: number, userId: string): Promise<ChatTopic[]> {
    try {
      const { data, error } = await supabase
        .from('chat_topics')
        .select(`
          *,
          product:products(*)
        `)
        .eq('product_id', productId)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting chat topics for product:', error);
      return [];
    }
  }

  static async searchChatTopics(searchText: string, userId: string): Promise<ChatTopic[]> {
    try {
      const { data, error } = await supabase
        .from('chat_topics')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', userId)
        .ilike('title', `%${searchText}%`)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching chat topics:', error);
      return [];
    }
  }

  // ===== USER MANAGEMENT =====
  
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  static async getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No user found
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error getting user by Firebase UID:', error);
      return null;
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No user found
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  static async updateUser(firebaseUid: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          firebase_uid: firebaseUid,
          updated_at: new Date().toISOString()
        })
        .eq('firebase_uid', firebaseUid)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user by firebase UID:', error);
      return null;
    }
  }

  static async updateUserByEmail(email: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user by email:', error);
      return null;
    }
  }

  static async createUser(userData: {
    firebaseUid: string;
    email: string;
    username?: string;
    phone?: string;
  }): Promise<User | null> {
    try {
      console.log('🔑 Creating user with client...');
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          firebase_uid: userData.firebaseUid,
          email: userData.email,
          username: userData.username || userData.email.split('@')[0],
          phone: userData.phone,
          is_service_center: false
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating user (will retry with generated ID):', error);
        
        // If that fails, try with a generated UUID
        const { randomUUID } = await import('crypto');
        const userId = randomUUID();
        
        const { data: data2, error: error2 } = await supabase
          .from('users')
          .insert({
            id: userId,
            firebase_uid: userData.firebaseUid,
            email: userData.email,
            username: userData.username || userData.email.split('@')[0],
            phone: userData.phone,
            is_service_center: false
          })
          .select()
          .single();
        
        if (error2) throw error2;
        return data2;
      }
      
      return data;
    } catch (error) {
      console.error('Error creating user (final):', error);
      return null;
    }
  }

  // ===== REAL-TIME SUBSCRIPTIONS =====
  
  static subscribeToChatMessages(chatTopicId: number, callback: (payload: unknown) => void) {
    return supabase
      .channel(`chat-${chatTopicId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_topic_id=eq.${chatTopicId}`
        },
        callback
      )
      .subscribe();
  }

  static unsubscribeFromChannel(subscription: unknown) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }

  // ===== UTILITY FUNCTIONS =====
  
  static async getCountryFromPhone(phone: string): Promise<string> {
    // Extract country code from phone number and return flag emoji
    const phoneClean = phone.replace(/\s+/g, '');
    
    const countryMapping: { [key: string]: string } = {
      '+598': '🇺🇾', // Uruguay
      '+54': '🇦🇷',  // Argentina
      '+56': '🇨🇱',  // Chile
      '+595': '🇵🇾', // Paraguay
      '+591': '🇧🇴', // Bolivia
      '+51': '🇵🇪',  // Perú
      '+593': '🇪🇨', // Ecuador
      '+57': '🇨🇴',  // Colombia
      '+58': '🇻🇪',  // Venezuela
      '+502': '🇬🇹', // Guatemala
      '+52': '🇲🇽',  // México
      '+506': '🇨🇷', // Costa Rica
      '+505': '🇳🇮', // Nicaragua
      '+503': '🇸🇻', // El Salvador
      '+504': '🇭🇳', // Honduras
      '+507': '🇵🇦', // Panamá
    };

    // Find matching country code
    for (const [code, flag] of Object.entries(countryMapping)) {
      if (phoneClean.startsWith(code)) {
        return flag;
      }
    }

    return '🏳️'; // Default flag
  }
}

export default DatabaseManager;