-- ================================================================
-- MEHAR TOYS - SUPABASE DATABASE SETUP SCHEMA
-- Just copy and paste this entire code into Supabase SQL Editor and click RUN!
-- ================================================================

-- 1. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    date TEXT,
    timestamp BIGINT,
    customer_id TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    customer_city TEXT,
    customer_address TEXT,
    customer_notes TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC DEFAULT 0,
    shipping NUMERIC DEFAULT 0,
    coupon_code TEXT,
    discount_amount NUMERIC DEFAULT 0,
    grand_total NUMERIC DEFAULT 0,
    payment_method TEXT DEFAULT 'Cash on Delivery (COD)',
    payment_status TEXT DEFAULT 'Unpaid (COD)',
    is_paid BOOLEAN DEFAULT false,
    trx_id TEXT,
    payment_slip TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    discount NUMERIC DEFAULT 0,
    rating NUMERIC DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 1,
    in_stock BOOLEAN DEFAULT true,
    stock_count INTEGER DEFAULT 20,
    badge TEXT,
    image TEXT,
    video_url TEXT,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CUSTOMER REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id BIGINT PRIMARY KEY,
    product_id BIGINT,
    author TEXT,
    city TEXT,
    rating NUMERIC DEFAULT 5,
    date TEXT,
    comment TEXT,
    verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ENABLE REALTIME ON ORDERS TABLE (FOR LIVE SOUND & POPUPS)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- Allow public visitors to insert new orders and read products
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Orders policies: Anyone can place an order, anyone with public anon key can read & update
CREATE POLICY "Allow public insert on orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public update on orders" ON public.orders FOR UPDATE USING (true);

-- Products policies: Anyone can read products, anyone can update
CREATE POLICY "Allow public select on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert on products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on products" ON public.products FOR DELETE USING (true);

-- Reviews policies
CREATE POLICY "Allow public all on reviews" ON public.reviews FOR ALL USING (true);

-- ================================================================
-- Done! Tables created successfully with Realtime activated!
-- ================================================================
