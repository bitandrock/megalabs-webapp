// Client-side database service that uses client-only supabase
import { supabase } from './supabase-client';

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

export class ClientDatabaseManager {
  
  // ===== PRODUCT AREAS =====
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

  // ===== PRODUCTS =====
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

  // ===== TRAINING TOPICS =====
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

  static async getTrainingTopicById(topicId: number): Promise<TrainingTopic | null> {
    try {
      const { data, error } = await supabase
        .from('training_topics')
        .select(`
          *,
          product:products(*)
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
}

export default ClientDatabaseManager;