-- Megalabs Web Application Database Schema (Updated for B4i Migration)
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT,
  email TEXT,
  phone TEXT,
  country TEXT,
  is_service_center BOOLEAN DEFAULT FALSE,
  firebase_uid TEXT, -- For migration compatibility
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Areas (Main categories like in menup.bas)
CREATE TABLE IF NOT EXISTS public.areas (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products/Categories (Sub-categories within areas)
CREATE TABLE IF NOT EXISTS public.products (
  id SERIAL PRIMARY KEY,
  area_id INTEGER REFERENCES areas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  has_video BOOLEAN DEFAULT FALSE,
  has_pdf BOOLEAN DEFAULT FALSE,
  video_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training Topics/Themes (like capacitaciones.bas)
CREATE TABLE IF NOT EXISTS public.training_topics (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  info TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQ Items (like faq.bas)
CREATE TABLE IF NOT EXISTS public.faqs (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Topics (like chat_topics.bas)
CREATE TABLE IF NOT EXISTS public.chat_topics (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id INTEGER REFERENCES products(id),
  title TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages (like Chat.bas)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id SERIAL PRIMARY KEY,
  chat_topic_id INTEGER REFERENCES chat_topics(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'support')),
  sender_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON public.users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_products_area_id ON public.products(area_id);
CREATE INDEX IF NOT EXISTS idx_training_topics_product_id ON public.training_topics(product_id);
CREATE INDEX IF NOT EXISTS idx_faqs_product_id ON public.faqs(product_id);
CREATE INDEX IF NOT EXISTS idx_chat_topics_user_id ON public.chat_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_topics_product_id ON public.chat_topics(product_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_topic_id ON public.chat_messages(chat_topic_id);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_training_topics_search ON public.training_topics USING gin(to_tsvector('spanish', topic || ' ' || COALESCE(info, '') || ' ' || COALESCE(content, '')));
CREATE INDEX IF NOT EXISTS idx_faqs_search ON public.faqs USING gin(to_tsvector('spanish', question || ' ' || answer));

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_areas_updated_at BEFORE UPDATE ON public.areas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_topics_updated_at BEFORE UPDATE ON public.training_topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_topics_updated_at BEFORE UPDATE ON public.chat_topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Everyone can view areas, products, training, and FAQs (public content)
CREATE POLICY "Everyone can view areas" ON public.areas FOR SELECT USING (true);
CREATE POLICY "Everyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Everyone can view training topics" ON public.training_topics FOR SELECT USING (true);
CREATE POLICY "Everyone can view FAQs" ON public.faqs FOR SELECT USING (true);

-- Chat topics access control
CREATE POLICY "Users can view own chat topics" ON public.chat_topics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat topics" ON public.chat_topics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat topics" ON public.chat_topics
  FOR UPDATE USING (auth.uid() = user_id);

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

-- Insert sample data
INSERT INTO public.areas (name, description) VALUES
  ('Medicamentos', 'Productos farmacéuticos y medicamentos especializados'),
  ('Equipos Médicos', 'Equipamiento médico y dispositivos especializados'),
  ('Nutrición', 'Suplementos nutricionales y productos de bienestar'),
  ('Dermatología', 'Productos para el cuidado de la piel')
ON CONFLICT DO NOTHING;

INSERT INTO public.products (area_id, name, description, has_video, has_pdf, video_url, pdf_url) VALUES
  (1, 'Antibióticos Avanzados', 'Línea completa de antibióticos de última generación', true, true, 'https://example.com/video1.mp4', 'https://example.com/manual1.pdf'),
  (1, 'Analgésicos Especializados', 'Analgésicos para tratamientos específicos', false, true, null, 'https://example.com/manual2.pdf'),
  (2, 'Monitores Cardíacos', 'Equipos de monitoreo cardiovascular', true, true, 'https://example.com/video2.mp4', 'https://example.com/manual3.pdf'),
  (2, 'Respiradores Móviles', 'Equipos de asistencia respiratoria portátil', true, false, 'https://example.com/video3.mp4', null),
  (3, 'Vitaminas Premium', 'Línea premium de vitaminas y minerales', false, true, null, 'https://example.com/manual4.pdf'),
  (4, 'Cremas Terapéuticas', 'Tratamientos dermatológicos especializados', false, true, null, 'https://example.com/manual5.pdf')
ON CONFLICT DO NOTHING;

-- Insert sample training topics
INSERT INTO public.training_topics (product_id, topic, info, content) VALUES
  (1, 'Uso Correcto de Antibióticos', 'Protocolo de administración', 'Información detallada sobre el uso correcto y dosificación de antibióticos avanzados...'),
  (1, 'Efectos Secundarios', 'Identificación y manejo', 'Guía completa para identificar y manejar efectos secundarios...'),
  (3, 'Instalación del Monitor', 'Pasos de configuración', 'Procedimiento paso a paso para la correcta instalación del monitor cardíaco...'),
  (3, 'Interpretación de Datos', 'Lectura de resultados', 'Como interpretar correctamente los datos del monitor...'),
  (5, 'Beneficios Nutricionales', 'Propiedades de las vitaminas', 'Información sobre los beneficios de cada vitamina y mineral...')
ON CONFLICT DO NOTHING;

-- Insert sample FAQs
INSERT INTO public.faqs (product_id, question, answer) VALUES
  (1, '¿Cuál es la dosis recomendada?', 'La dosis varía según el peso del paciente y la gravedad de la infección. Consulte la tabla de dosificación en el manual.'),
  (1, '¿Se puede usar con otros medicamentos?', 'Consulte siempre con el médico antes de combinar con otros tratamientos.'),
  (3, '¿Qué hacer si el monitor no se enciende?', 'Verifique la conexión de la batería y asegúrese de que esté completamente cargada.'),
  (3, '¿Con qué frecuencia se debe calibrar?', 'Se recomienda calibrar el equipo cada 30 días o según indicaciones del manual.'),
  (5, '¿Pueden tomarse con el estómago vacío?', 'Se recomienda tomar con alimentos para mejorar la absorción y evitar molestias estomacales.')
ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Extended user profiles linked to Supabase auth';
COMMENT ON TABLE public.areas IS 'Main product areas/categories (like menup.bas)';
COMMENT ON TABLE public.products IS 'Products within areas with media content';
COMMENT ON TABLE public.training_topics IS 'Training topics per product (like capacitaciones.bas)';
COMMENT ON TABLE public.faqs IS 'Frequently asked questions per product (like faq.bas)';
COMMENT ON TABLE public.chat_topics IS 'Support chat conversations (like chat_topics.bas)';
COMMENT ON TABLE public.chat_messages IS 'Messages within chat conversations (like Chat.bas)';