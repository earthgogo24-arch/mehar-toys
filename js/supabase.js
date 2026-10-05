// ================================================================
// MEHAR TOYS - SUPABASE CLOUD DATABASE INTEGRATION
// Seamless real-time sync with automatic localStorage fallback
// ================================================================

const SUPABASE_CONFIG_KEY = 'mehar_toys_supabase_config';

// Default Supabase project credentials for Mehar Toys
const DEFAULT_SUPABASE_URL = 'https://psvnweyfwyaqnjcsrnko.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzdm53ZXlmd3lhcW5qY3NybmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMzExOTksImV4cCI6MjEwNjcwNzE5OX0.--YkZTmdrgqh_8ggmopNEsrNMUdmH_WlndunLaK4DaA';

// Default / saved credentials
function getSupabaseCredentials() {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed && (parsed.url || parsed.anonKey)) {
                return parsed;
            }
        } catch (e) {}
    }
    return {
        url: DEFAULT_SUPABASE_URL,
        anonKey: DEFAULT_SUPABASE_ANON_KEY,
        connected: true
    };
}

function saveSupabaseCredentials(url, anonKey) {
    const config = {
        url: (url || DEFAULT_SUPABASE_URL).trim(),
        anonKey: (anonKey || DEFAULT_SUPABASE_ANON_KEY).trim(),
        connected: true,
        lastChecked: new Date().toISOString()
    };
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
    initSupabaseClient();
    return config;
}

// Global Supabase client instance
let supabaseClient = null;

function initSupabaseClient() {
    const creds = getSupabaseCredentials();
    if (creds.url && creds.anonKey && window.supabase && typeof window.supabase.createClient === 'function') {
        try {
            supabaseClient = window.supabase.createClient(creds.url, creds.anonKey);
            console.log("⚡ Supabase Client Initialized successfully for:", creds.url);
            return supabaseClient;
        } catch (err) {
            console.warn("⚠️ Failed to initialize Supabase client:", err);
            supabaseClient = null;
        }
    }
    supabaseClient = null;
    return null;
}

function isSupabaseActive() {
    const creds = getSupabaseCredentials();
    return Boolean(supabaseClient && creds.url && creds.anonKey);
}

// ----------------------------------------------------------------
// SOUND EFFECT: ORDER CASH CHIME (Web Audio API - No mp3 needed)
// ----------------------------------------------------------------
function playOrderChime() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }

        // Pleasant cash bell chime
        const now = ctx.currentTime;
        const notes = [587.33, 880, 1174.66]; // D5, A5, D6
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.12);

            gain.gain.setValueAtTime(0.3, now + idx * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + idx * 0.12);
            osc.stop(now + idx * 0.12 + 0.6);
        });
    } catch (e) {
        console.log("Audio alert not supported or blocked by user gesture:", e);
    }
}

// ----------------------------------------------------------------
// 1. ORDERS CLOUD OPERATIONS
// ----------------------------------------------------------------
async function cloudSaveOrder(order) {
    if (!isSupabaseActive()) {
        console.log("Supabase not active, saved in localStorage only.");
        return { success: true, source: 'localStorage' };
    }

    try {
        const orderRow = {
            id: order.id,
            date: order.date,
            timestamp: order.timestamp || Date.now(),
            customer_id: order.customerId || null,
            customer_name: order.customer ? order.customer.name : '',
            customer_phone: order.customer ? order.customer.phone : '',
            customer_city: order.customer ? order.customer.city : '',
            customer_address: order.customer ? order.customer.address : '',
            customer_notes: order.customer ? (order.customer.notes || '') : '',
            items: order.items || [],
            subtotal: order.subtotal || 0,
            shipping: order.shipping || 0,
            coupon_code: order.couponCode || null,
            discount_amount: order.discountAmount || 0,
            grand_total: order.grandTotal || 0,
            payment_method: order.paymentMethod || 'Cash on Delivery (COD)',
            payment_status: order.paymentStatus || 'Unpaid (COD)',
            is_paid: Boolean(order.isPaid),
            trx_id: order.trxId || null,
            payment_slip: order.paymentSlip || null,
            status: order.status || 'Pending'
        };

        const { data, error } = await supabaseClient
            .from('orders')
            .upsert(orderRow, { onConflict: 'id' });

        if (error) {
            console.warn("⚠️ Supabase order save error:", error.message);
            return { success: false, error: error.message };
        }

        console.log("✅ Order saved to Supabase Cloud:", order.id);
        return { success: true, source: 'supabase', data };
    } catch (err) {
        console.error("Supabase order exception:", err);
        return { success: false, error: err.message };
    }
}

async function cloudFetchOrders() {
    if (!isSupabaseActive()) {
        return JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    }

    try {
        const { data, error } = await supabaseClient
            .from('orders')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) {
            console.warn("⚠️ Failed to fetch orders from Supabase:", error.message);
            return JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
        }

        if (data && Array.isArray(data)) {
            // Map table fields back to app order structure
            const mapped = data.map(r => ({
                id: r.id,
                date: r.date,
                timestamp: r.timestamp,
                customerId: r.customer_id,
                customer: {
                    name: r.customer_name,
                    phone: r.customer_phone,
                    city: r.customer_city,
                    address: r.customer_address,
                    notes: r.customer_notes
                },
                items: r.items || [],
                subtotal: r.subtotal,
                shipping: r.shipping,
                couponCode: r.coupon_code,
                discountAmount: r.discount_amount,
                grandTotal: r.grand_total,
                paymentMethod: r.payment_method,
                paymentStatus: r.payment_status,
                isPaid: r.is_paid,
                trxId: r.trx_id,
                paymentSlip: r.payment_slip,
                status: r.status
            }));

            // Sync with local cache
            localStorage.setItem('mehar_toys_orders', JSON.stringify(mapped));
            return mapped;
        }
    } catch (err) {
        console.warn("Supabase fetch orders exception:", err);
    }

    return JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
}

async function cloudUpdateOrderStatus(orderId, newStatus) {
    if (!isSupabaseActive()) return;

    try {
        await supabaseClient
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);
        console.log(`✅ Order ${orderId} status updated to ${newStatus} on Supabase`);
    } catch (e) {
        console.warn("Supabase update status failed:", e);
    }
}

// ----------------------------------------------------------------
// 2. REALTIME ORDERS LISTENER (FOR ADMIN PANEL)
// ----------------------------------------------------------------
let realtimeOrdersChannel = null;

function subscribeToRealtimeOrders(onNewOrderCallback) {
    if (!isSupabaseActive() || !supabaseClient) return null;

    if (realtimeOrdersChannel) {
        try { supabaseClient.removeChannel(realtimeOrdersChannel); } catch (e) {}
    }

    try {
        realtimeOrdersChannel = supabaseClient
            .channel('realtime-mehar-orders')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                (payload) => {
                    console.log("🔔 REALTIME ORDER RECEIVED FROM SUPABASE:", payload);
                    playOrderChime();
                    if (typeof onNewOrderCallback === 'function') {
                        onNewOrderCallback(payload.new);
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'orders' },
                (payload) => {
                    console.log("🔄 Realtime Order Update:", payload);
                    if (typeof onNewOrderCallback === 'function') {
                        onNewOrderCallback(payload.new, true);
                    }
                }
            )
            .subscribe((status) => {
                console.log("Supabase Realtime Status:", status);
            });

        return realtimeOrdersChannel;
    } catch (e) {
        console.warn("Could not subscribe to Supabase Realtime:", e);
        return null;
    }
}

// ----------------------------------------------------------------
// 3. PRODUCTS CLOUD OPERATIONS
// ----------------------------------------------------------------
async function cloudSaveProduct(prod) {
    if (!isSupabaseActive()) return;

    try {
        const prodRow = {
            id: prod.id,
            name: prod.name,
            category: prod.category,
            price: prod.price,
            original_price: prod.originalPrice || prod.price,
            discount: prod.discount || 0,
            rating: prod.rating || 5.0,
            reviews_count: prod.reviewsCount || 1,
            in_stock: Boolean(prod.inStock),
            stock_count: prod.stockCount || 20,
            badge: prod.badge || '',
            image: prod.image,
            video_url: prod.videoUrl || '',
            description: prod.description || '',
            features: prod.features || []
        };

        await supabaseClient.from('products').upsert(prodRow, { onConflict: 'id' });
        console.log("✅ Product saved to Supabase:", prod.name);
    } catch (err) {
        console.warn("Supabase product save error:", err);
    }
}

async function cloudDeleteProduct(prodId) {
    if (!isSupabaseActive()) return;

    try {
        await supabaseClient.from('products').delete().eq('id', prodId);
        console.log("✅ Product deleted from Supabase:", prodId);
    } catch (err) {
        console.warn("Supabase product delete error:", err);
    }
}

// ----------------------------------------------------------------
// 4. TEST CONNECTION HELPER
// ----------------------------------------------------------------
async function testSupabaseConnection(url, anonKey) {
    if (!url || !anonKey) {
        return { success: false, message: "URL aur Anon Public Key dono likhna zaroori hain!" };
    }

    try {
        if (!window.supabase || typeof window.supabase.createClient !== 'function') {
            return { success: false, message: "Supabase JS SDK load nahi hui. Internet connection check karein." };
        }

        const tempClient = window.supabase.createClient(url.trim(), anonKey.trim());
        // Simple test query to check connection
        const { data, error } = await tempClient.from('orders').select('id').limit(1);

        if (error) {
            // If table doesn't exist yet, but credentials are valid:
            if (error.code === '42P01' || error.code === 'PGRST205' || error.message.includes('relation "orders" does not exist') || error.message.includes('schema cache')) {
                return { 
                    success: true, 
                    tableMissing: true,
                    message: "Connected to Supabase! Lekin 'orders' table abhi create nahi hui (Supabase SQL Editor me supabase-schema.sql run karein)." 
                };
            }
            return { success: false, message: "Supabase Error: " + error.message };
        }

        return { success: true, message: "🟢 Mashallah! Supabase Cloud Database kamyabi se connect ho gaya hai!" };
    } catch (e) {
        return { success: false, message: "Connection error: " + e.message };
    }
}

// ----------------------------------------------------------------
// 5. BULK SYNC EXISTING DATA TO SUPABASE
// ----------------------------------------------------------------
async function syncAllDataToSupabase() {
    if (!isSupabaseActive()) {
        alert("Pehle Supabase URL aur Key daal kar save karein!");
        return { success: false };
    }

    try {
        let localProducts = [];
        if (typeof getProducts === 'function') {
            localProducts = getProducts();
        } else if (localStorage.getItem('mehar_toys_products')) {
            try { localProducts = JSON.parse(localStorage.getItem('mehar_toys_products')) || []; } catch(e){}
        } else if (typeof PRODUCTS_DATA !== 'undefined' && Array.isArray(PRODUCTS_DATA)) {
            localProducts = PRODUCTS_DATA;
        }
        const localOrders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];

        // Upload products
        for (const p of localProducts) {
            await cloudSaveProduct(p);
        }

        // Upload orders
        for (const ord of localOrders) {
            await cloudSaveOrder(ord);
        }

        return { success: true, productsCount: localProducts.length, ordersCount: localOrders.length };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initSupabaseClient();
});
