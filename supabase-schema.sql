-- Megalabs Web Application Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  firebase_uid VARCHAR(255) UNIQUE,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  is_service_center BOOLEAN DEFAULT FALSE,
  is_activated BOOLEAN DEFAULT TRUE,
  password VARCHAR(255), -- For legacy migration, will be deprecated
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trainings table
CREATE TABLE IF NOT EXISTS trainings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_url VARCHAR(500),
  duration INTEGER, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_trainings table (junction table)
CREATE TABLE IF NOT EXISTS user_trainings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  training_id INTEGER REFERENCES trainings(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, training_id)
);

-- Create product categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES product_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  pdf_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create FAQ categories table
CREATE TABLE IF NOT EXISTS faq_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES faq_categories(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat topics table (support tickets)
CREATE TABLE IF NOT EXISTS chat_topics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER REFERENCES chat_topics(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_trainings_user_id ON user_trainings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trainings_training_id ON user_trainings(training_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_faqs_category_id ON faqs(category_id);
CREATE INDEX IF NOT EXISTS idx_faqs_order_index ON faqs(order_index);
CREATE INDEX IF NOT EXISTS idx_chat_topics_user_id ON chat_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_topics_assigned_to ON chat_topics(assigned_to);
CREATE INDEX IF NOT EXISTS idx_chat_messages_topic_id ON chat_messages(topic_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON trainings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_trainings_updated_at BEFORE UPDATE ON user_trainings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faq_categories_updated_at BEFORE UPDATE ON faq_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_topics_updated_at BEFORE UPDATE ON chat_topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your security requirements)

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (firebase_uid = auth.uid()::text);

-- Service role can manage all users
CREATE POLICY "Service role full access" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- Anyone can view trainings and products (adjust as needed)
CREATE POLICY "Everyone can view trainings" ON trainings
  FOR SELECT USING (true);

CREATE POLICY "Everyone can view product categories" ON product_categories
  FOR SELECT USING (true);

CREATE POLICY "Everyone can view products" ON products
  FOR SELECT USING (true);

-- Users can view their own training progress
CREATE POLICY "Users can view own training progress" ON user_trainings
  FOR SELECT USING (user_id IN (
    SELECT id FROM users WHERE firebase_uid = auth.uid()::text
  ));

-- Everyone can view FAQs
CREATE POLICY "Everyone can view FAQ categories" ON faq_categories
  FOR SELECT USING (true);

CREATE POLICY "Everyone can view FAQs" ON faqs
  FOR SELECT USING (true);

-- Users can manage their own chat topics
CREATE POLICY "Users can view own chat topics" ON chat_topics
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text)
    OR assigned_to IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text)
  );

-- Users can view messages in their topics
CREATE POLICY "Users can view messages in own topics" ON chat_messages
  FOR SELECT USING (
    topic_id IN (
      SELECT id FROM chat_topics 
      WHERE user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text)
         OR assigned_to IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text)
    )
  );

-- Insert sample data (optional)
INSERT INTO product_categories (name, description) VALUES
  ('Medicamentos', 'Productos farmacéuticos y medicamentos'),
  ('Equipos Médicos', 'Equipamiento y dispositivos médicos'),
  ('Suplementos', 'Suplementos nutricionales y vitaminas')
ON CONFLICT DO NOTHING;

INSERT INTO trainings (title, description, duration) VALUES
  ('Seguridad Básica', 'Curso básico de seguridad en el trabajo', 60),
  ('Productos Avanzados', 'Capacitación sobre productos especializados', 120),
  ('Atención al Cliente', 'Técnicas de atención y servicio al cliente', 90)
ON CONFLICT DO NOTHING;

INSERT INTO faq_categories (name) VALUES
  ('General'),
  ('Productos'),
  ('Soporte Técnico')
ON CONFLICT DO NOTHING;

INSERT INTO faqs (category_id, question, answer, order_index) VALUES
  (1, '¿Cómo creo una cuenta?', 'Puedes crear una cuenta utilizando tu email corporativo de Microsoft.', 1),
  (1, '¿Cómo recupero mi contraseña?', 'Usa el enlace "Olvidé mi contraseña" en la página de inicio de sesión.', 2),
  (2, '¿Dónde encuentro la documentación de productos?', 'En la sección de Productos puedes encontrar manuales y documentación técnica.', 1),
  (3, '¿Cómo contacto soporte técnico?', 'Puedes crear un ticket de soporte desde la sección de Soporte.', 1)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE users IS 'User accounts and profiles';
COMMENT ON TABLE trainings IS 'Available training courses';
COMMENT ON TABLE user_trainings IS 'User training progress and completion';
COMMENT ON TABLE product_categories IS 'Product category organization';
COMMENT ON TABLE products IS 'Product catalog with documentation';
COMMENT ON TABLE faq_categories IS 'FAQ organization categories';
COMMENT ON TABLE faqs IS 'Frequently asked questions and answers';
COMMENT ON TABLE chat_topics IS 'Support ticket topics';
COMMENT ON TABLE chat_messages IS 'Messages within support tickets';