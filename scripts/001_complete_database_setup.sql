-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- PROFILES & SHOP MANAGEMENT
-- ============================================

-- User profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('customer', 'shop_owner', 'mechanic', 'admin')) DEFAULT 'customer',
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shops table
CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shop staff table
CREATE TABLE IF NOT EXISTS shop_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'manager', 'mechanic', 'advisor')) DEFAULT 'mechanic',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shop_id, user_id)
);

-- ============================================
-- KNOWLEDGE BASE & RAG SYSTEM
-- ============================================

-- Repair knowledge base with vector embeddings for RAG
CREATE TABLE IF NOT EXISTS repair_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  make TEXT,
  model TEXT,
  year_start INTEGER,
  year_end INTEGER,
  symptoms TEXT[],
  repair_procedures TEXT[],
  parts_needed JSONB DEFAULT '[]',
  labor_hours DECIMAL,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'moderate', 'hard', 'expert')),
  embedding vector(768),
  metadata JSONB DEFAULT '{}',
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS repair_knowledge_embedding_idx ON repair_knowledge USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS repair_knowledge_category_idx ON repair_knowledge(category);
CREATE INDEX IF NOT EXISTS repair_knowledge_make_model_idx ON repair_knowledge(make, model);
CREATE INDEX IF NOT EXISTS repair_knowledge_symptoms_idx ON repair_knowledge USING gin(symptoms);

-- ============================================
-- CUSTOMER DIAGNOSTICS & FILE UPLOADS
-- ============================================

-- Customer diagnostic requests
CREATE TABLE IF NOT EXISTS customer_diagnostics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
  
  -- Vehicle information
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  vehicle_vin TEXT,
  mileage INTEGER,
  
  -- Issue description
  issue_description TEXT NOT NULL,
  symptoms TEXT[],
  
  -- File uploads (photos, audio, video)
  files JSONB DEFAULT '[]', -- Array of {url, type, filename, size}
  
  -- AI Analysis
  ai_diagnosis JSONB, -- {diagnosis, confidence, recommended_repairs, estimated_cost}
  rag_context JSONB, -- Similar cases and knowledge base matches
  related_videos JSONB DEFAULT '[]', -- YouTube videos
  
  -- Status tracking
  status TEXT CHECK (status IN ('pending', 'analyzing', 'diagnosed', 'work_order_created', 'completed', 'cancelled')) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  
  -- Work order connection
  work_order_id UUID,
  
  -- Metadata
  customer_email TEXT,
  customer_phone TEXT,
  customer_name TEXT,
  notes TEXT,
  internal_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS customer_diagnostics_customer_idx ON customer_diagnostics(customer_id);
CREATE INDEX IF NOT EXISTS customer_diagnostics_shop_idx ON customer_diagnostics(shop_id);
CREATE INDEX IF NOT EXISTS customer_diagnostics_status_idx ON customer_diagnostics(status);
CREATE INDEX IF NOT EXISTS customer_diagnostics_created_idx ON customer_diagnostics(created_at DESC);

-- ============================================
-- WORK ORDERS & INVENTORY
-- ============================================

-- Work orders
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  diagnostic_id UUID REFERENCES customer_diagnostics(id) ON DELETE SET NULL,
  
  -- Vehicle info
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  vehicle_vin TEXT,
  mileage INTEGER,
  license_plate TEXT,
  
  -- Work order details
  status TEXT CHECK (status IN ('draft', 'pending', 'approved', 'in_progress', 'completed', 'cancelled')) DEFAULT 'draft',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  
  -- Customer info
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  
  -- Job details
  description TEXT,
  diagnosis TEXT,
  recommended_services JSONB DEFAULT '[]',
  
  -- Financial
  labor_cost DECIMAL DEFAULT 0,
  parts_cost DECIMAL DEFAULT 0,
  tax_amount DECIMAL DEFAULT 0,
  total_cost DECIMAL DEFAULT 0,
  deposit_amount DECIMAL DEFAULT 0,
  
  -- Scheduling
  assigned_to UUID REFERENCES profiles(id),
  scheduled_date DATE,
  estimated_completion TIMESTAMPTZ,
  actual_completion TIMESTAMPTZ,
  
  -- Notes
  customer_notes TEXT,
  internal_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS work_orders_shop_idx ON work_orders(shop_id);
CREATE INDEX IF NOT EXISTS work_orders_customer_idx ON work_orders(customer_id);
CREATE INDEX IF NOT EXISTS work_orders_status_idx ON work_orders(status);
CREATE INDEX IF NOT EXISTS work_orders_diagnostic_idx ON work_orders(diagnostic_id);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  
  -- Part info
  part_number TEXT NOT NULL,
  part_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  manufacturer TEXT,
  
  -- Inventory
  quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 0,
  unit_cost DECIMAL,
  retail_price DECIMAL,
  
  -- Location
  location TEXT,
  bin_number TEXT,
  
  -- Metadata
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(shop_id, part_number)
);

CREATE INDEX IF NOT EXISTS inventory_shop_idx ON inventory(shop_id);
CREATE INDEX IF NOT EXISTS inventory_part_number_idx ON inventory(part_number);
CREATE INDEX IF NOT EXISTS inventory_category_idx ON inventory(category);

-- ============================================
-- REVIEWS & SHOP INTEGRATIONS
-- ============================================

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT,
  comment TEXT,
  
  customer_name TEXT,
  customer_email TEXT,
  
  is_verified BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  
  response TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reviews_shop_idx ON reviews(shop_id);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON reviews(rating);

-- Shop integrations (Mitchell 1, Tekmetric, Shop-Ware)
CREATE TABLE IF NOT EXISTS shop_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  
  integration_type TEXT CHECK (integration_type IN ('mitchell1', 'tekmetric', 'shopware', 'other')) NOT NULL,
  is_active BOOLEAN DEFAULT false,
  
  -- Encrypted credentials
  credentials JSONB,
  
  -- Sync settings
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  sync_frequency TEXT DEFAULT 'hourly',
  
  -- Configuration
  config JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(shop_id, integration_type)
);

-- ============================================
-- FUNCTIONS FOR VECTOR SEARCH
-- ============================================

-- Function to search repair knowledge using vector similarity
CREATE OR REPLACE FUNCTION search_repair_knowledge(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_make text DEFAULT NULL,
  filter_model text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  category text,
  make text,
  model text,
  symptoms text[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rk.id,
    rk.title,
    rk.content,
    rk.category,
    rk.make,
    rk.model,
    rk.symptoms,
    1 - (rk.embedding <=> query_embedding) as similarity
  FROM repair_knowledge rk
  WHERE 
    (filter_make IS NULL OR rk.make = filter_make)
    AND (filter_model IS NULL OR rk.model = filter_model)
    AND 1 - (rk.embedding <=> query_embedding) > match_threshold
  ORDER BY rk.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_integrations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can create profile" ON profiles FOR INSERT WITH CHECK (true);

-- Shops policies
CREATE POLICY "Shop owners can manage their shops" ON shops FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Shop staff can view their shop" ON shops FOR SELECT USING (
  EXISTS (SELECT 1 FROM shop_staff WHERE shop_id = shops.id AND user_id = auth.uid())
);
CREATE POLICY "Anyone can view active shops" ON shops FOR SELECT USING (is_active = true);

-- Customer diagnostics policies
CREATE POLICY "Customers can view own diagnostics" ON customer_diagnostics FOR SELECT USING (
  customer_id = auth.uid() OR 
  customer_email = (SELECT email FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Customers can create diagnostics" ON customer_diagnostics FOR INSERT WITH CHECK (
  customer_id = auth.uid() OR 
  customer_email = (SELECT email FROM profiles WHERE id = auth.uid()) OR
  customer_id IS NULL
);
CREATE POLICY "Shop staff can view shop diagnostics" ON customer_diagnostics FOR SELECT USING (
  EXISTS (SELECT 1 FROM shop_staff WHERE shop_id = customer_diagnostics.shop_id AND user_id = auth.uid())
);
CREATE POLICY "Shop staff can update shop diagnostics" ON customer_diagnostics FOR UPDATE USING (
  EXISTS (SELECT 1 FROM shop_staff WHERE shop_id = customer_diagnostics.shop_id AND user_id = auth.uid())
);

-- Repair knowledge policies (public read for RAG)
CREATE POLICY "Anyone can view repair knowledge" ON repair_knowledge FOR SELECT USING (true);
CREATE POLICY "Shop owners can manage knowledge" ON repair_knowledge FOR ALL USING (
  EXISTS (SELECT 1 FROM shops WHERE owner_id = auth.uid())
);

-- Work orders policies
CREATE POLICY "Shop staff can manage work orders" ON work_orders FOR ALL USING (
  EXISTS (SELECT 1 FROM shop_staff WHERE shop_id = work_orders.shop_id AND user_id = auth.uid())
);
CREATE POLICY "Customers can view own work orders" ON work_orders FOR SELECT USING (
  customer_id = auth.uid() OR 
  customer_email = (SELECT email FROM profiles WHERE id = auth.uid())
);

-- Inventory policies
CREATE POLICY "Shop staff can manage inventory" ON inventory FOR ALL USING (
  EXISTS (SELECT 1 FROM shop_staff WHERE shop_id = inventory.shop_id AND user_id = auth.uid())
);

-- Reviews policies
CREATE POLICY "Anyone can view published reviews" ON reviews FOR SELECT USING (is_published = true);
CREATE POLICY "Customers can create reviews" ON reviews FOR INSERT WITH CHECK (customer_id = auth.uid() OR customer_id IS NULL);
CREATE POLICY "Shop staff can manage reviews" ON reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM shop_staff WHERE shop_id = reviews.shop_id AND user_id = auth.uid())
);

-- Shop integrations policies
CREATE POLICY "Shop staff can manage integrations" ON shop_integrations FOR ALL USING (
  EXISTS (SELECT 1 FROM shop_staff WHERE shop_id = shop_integrations.shop_id AND user_id = auth.uid())
);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON shops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_diagnostics_updated_at BEFORE UPDATE ON customer_diagnostics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_repair_knowledge_updated_at BEFORE UPDATE ON repair_knowledge FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
