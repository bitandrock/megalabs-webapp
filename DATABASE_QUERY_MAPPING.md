# Database Query Mapping: MySQL RDC → Supabase

## Overview
This document maps all original MySQL stored procedures and RDC calls to equivalent Supabase operations using the JavaScript client.

## Database Schema Requirements

### Core Tables Needed:
```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT,
  email TEXT,
  phone TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Areas
CREATE TABLE public.areas (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products/Categories
CREATE TABLE public.products (
  id SERIAL PRIMARY KEY,
  area_id INTEGER REFERENCES areas(id),
  name TEXT NOT NULL,
  description TEXT,
  has_video BOOLEAN DEFAULT FALSE,
  has_pdf BOOLEAN DEFAULT FALSE,
  video_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training Topics/Themes
CREATE TABLE public.training_topics (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  topic TEXT NOT NULL,
  info TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ Items
CREATE TABLE public.faqs (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Topics
CREATE TABLE public.chat_topics (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id INTEGER REFERENCES products(id),
  title TEXT NOT NULL,
  status TEXT DEFAULT 'open', -- 'open', 'closed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE public.chat_messages (
  id SERIAL PRIMARY KEY,
  chat_topic_id INTEGER REFERENCES chat_topics(id),
  sender_type TEXT NOT NULL, -- 'client', 'support'
  sender_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Query Mappings

### 1. Product Area Management

#### Original: `cargaAreas`
**MySQL RDC Call:**
```javascript
// B4X: CreateCommand("cargaAreas", Null)
```

**Supabase Equivalent:**
```javascript
// Load all product areas
export const loadAreas = async () => {
  const { data, error } = await supabase
    .from('areas')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
};
```

### 2. Training System

#### Original: `selectThemes(productId)`
**MySQL RDC Call:**
```javascript
// B4X: CreateCommand("selectThemes", Array(productId))
```

**Supabase Equivalent:**
```javascript
// Load training topics for a specific product
export const getTrainingTopics = async (productId) => {
  const { data, error } = await supabase
    .from('training_topics')
    .select('id, topic, info, content')
    .eq('product_id', productId)
    .order('topic');
  
  if (error) throw error;
  return data;
};
```

#### Original: `Search4Topics(searchText, productId)`
**MySQL RDC Call:**
```javascript
// B4X: CreateCommand("Search4Topics", Array(searchText, productId))
```

**Supabase Equivalent:**
```javascript
// Search training topics
export const searchTrainingTopics = async (searchText, productId) => {
  const { data, error } = await supabase
    .from('training_topics')
    .select('id, topic, info, content')
    .eq('product_id', productId)
    .or(`topic.ilike.%${searchText}%,info.ilike.%${searchText}%,content.ilike.%${searchText}%`)
    .order('topic');
  
  if (error) throw error;
  return data;
};
```

### 3. FAQ System

#### Original: `selectFAQS(productId)`
**MySQL RDC Call:**
```javascript
// B4X: CreateCommand("selectFAQS", Array(productId))
```

**Supabase Equivalent:**
```javascript
// Load FAQs for a specific product
export const getFAQs = async (productId) => {
  const { data, error } = await supabase
    .from('faqs')
    .select('id, question, answer')
    .eq('product_id', productId)
    .order('question');
  
  if (error) throw error;
  return data;
};
```

#### Original: `Search4Questions(searchText, productId)`
**MySQL RDC Call:**
```javascript
// B4X: CreateCommand("Search4Questions", Array(searchText, productId))
```

**Supabase Equivalent:**
```javascript
// Search FAQ questions
export const searchFAQs = async (searchText, productId) => {
  const { data, error } = await supabase
    .from('faqs')
    .select('id, question, answer')
    .eq('product_id', productId)
    .or(`question.ilike.%${searchText}%,answer.ilike.%${searchText}%`)
    .order('question');
  
  if (error) throw error;
  return data;
};
```

### 4. Chat System

#### Original: `Add_ChatTopic(userID, productID, firstMessage, username)`
**MySQL RDC Call:**
```javascript
// B4X: CreateCommand("Add_ChatTopic", Array(userID, productID, firstMessage, username))
```

**Supabase Equivalent:**
```javascript
// Create new chat topic with first message
export const createChatTopic = async (userId, productId, firstMessage, username) => {
  // Create chat topic
  const { data: topic, error: topicError } = await supabase
    .from('chat_topics')
    .insert([{
      user_id: userId,
      product_id: productId,
      title: firstMessage.substring(0, 50) + '...', // Create title from first message
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
};
```

#### Original: `Add_ChatMessage(chatId, sender, message)`
**MySQL RDC Call:**
```javascript
// B4X: CreateCommand("Add_ChatMessage", Array(chatId, sender, message))
```

**Supabase Equivalent:**
```javascript
// Add message to existing chat
export const addChatMessage = async (chatTopicId, senderType, senderId, message) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([{
      chat_topic_id: chatTopicId,
      sender_type: senderType, // 'client' or 'support'
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
};
```

#### Original: `GetClosedTopicsForProduct(productId)`
**MySQL RDC Call:**
```javascript
// B4X: CreateCommand("GetClosedTopicsForProduct", Array(productId))
```

**Supabase Equivalent:**
```javascript
// Get chat topics for a product (for current user)
export const getChatTopicsForProduct = async (productId, userId) => {
  const { data, error } = await supabase
    .from('chat_topics')
    .select(`
      id, 
      title, 
      status, 
      created_at,
      users!inner(username)
    `)
    .eq('product_id', productId)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data;
};
```

#### Original: `selectNombreClienteconIDTopic(topicId)`
**MySQL RDC Call:**
```javascript
// B4X: CreateCommand("selectNombreClienteconIDTopic", Array(topicId))
```

**Supabase Equivalent:**
```javascript
// Get client name for a chat topic
export const getClientNameForTopic = async (topicId) => {
  const { data, error } = await supabase
    .from('chat_topics')
    .select(`
      id,
      users!inner(username)
    `)
    .eq('id', topicId)
    .single();
  
  if (error) throw error;
  return data.users.username;
};
```

#### Original: `Search4ChatsTopics(searchText)`
**MySQL RDC Call:**
```javascript
// B4X: CreateCommand("Search4ChatsTopics", Array(searchText))
```

**Supabase Equivalent:**
```javascript
// Search chat topics
export const searchChatTopics = async (searchText, userId) => {
  const { data, error } = await supabase
    .from('chat_topics')
    .select(`
      id, 
      title, 
      status, 
      created_at,
      users!inner(username)
    `)
    .eq('user_id', userId)
    .ilike('title', `%${searchText}%`)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data;
};
```

### 5. Chat Message Loading

**New Function Needed:**
```javascript
// Load all messages for a chat topic
export const getChatMessages = async (chatTopicId) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      id,
      sender_type,
      message,
      created_at,
      users!inner(username)
    `)
    .eq('chat_topic_id', chatTopicId)
    .order('created_at');
  
  if (error) throw error;
  return data;
};
```

### 6. Real-time Subscriptions

**Chat Messages Real-time:**
```javascript
// Subscribe to new messages in a chat
export const subscribeToChatMessages = (chatTopicId, callback) => {
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
};
```

## Implementation Strategy

### 1. Database Manager Update
Replace the existing `DatabaseManager` class methods:

```typescript
// src/lib/database.ts
import { supabase } from './supabase';

export class DatabaseManager {
  // Areas
  static async loadAreas() {
    return await loadAreas();
  }
  
  // Training
  static async getTrainingTopics(productId: number) {
    return await getTrainingTopics(productId);
  }
  
  static async searchTrainingTopics(searchText: string, productId: number) {
    return await searchTrainingTopics(searchText, productId);
  }
  
  // FAQ
  static async getFAQs(productId: number) {
    return await getFAQs(productId);
  }
  
  static async searchFAQs(searchText: string, productId: number) {
    return await searchFAQs(searchText, productId);
  }
  
  // Chat
  static async createChatTopic(userId: string, productId: number, firstMessage: string, username: string) {
    return await createChatTopic(userId, productId, firstMessage, username);
  }
  
  static async addChatMessage(chatTopicId: number, senderType: string, senderId: string, message: string) {
    return await addChatMessage(chatTopicId, senderType, senderId, message);
  }
  
  static async getChatMessages(chatTopicId: number) {
    return await getChatMessages(chatTopicId);
  }
  
  static async getChatTopicsForProduct(productId: number, userId: string) {
    return await getChatTopicsForProduct(productId, userId);
  }
  
  // Real-time subscriptions
  static subscribeToChatMessages(chatTopicId: number, callback: Function) {
    return subscribeToChatMessages(chatTopicId, callback);
  }
}
```

### 2. Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Chat topics access control
CREATE POLICY "Users can view own chat topics" ON public.chat_topics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat topics" ON public.chat_topics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat messages access control
CREATE POLICY "Users can view messages from their topics" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_topics 
      WHERE id = chat_topic_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add messages to their topics" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_topics 
      WHERE id = chat_topic_id AND user_id = auth.uid()
    )
  );
```

This mapping provides a complete migration path from the original MySQL RDC architecture to modern Supabase operations while maintaining all functionality and adding real-time capabilities.