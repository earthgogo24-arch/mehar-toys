// ================================================================
// MEHAR TOYS - PRODUCT DATABASE & STORE CONFIGURATION
// ================================================================

const DEFAULT_STORE_CONFIG = {
    storeName: "MEHAR TOYS",
    tagline: "Khushion Ka Jahan - Best Toys for Happy Kids!",
    displayPhone: "0322-8482860",
    email: "contact@mehartoys.pk",
    address: "Main Market, Gulberg, Lahore, Pakistan",
    currency: "Rs.",
    freeDeliveryThreshold: 5999, // 5999 ya us se zyada order par free delivery
    deliveryCharges: 250, // Standard shipping charges
    accountTitle: "Muhammad Jameel",
    accountNumber: "03228482860"
};

// Load saved store config or use default
function getStoreConfig() {
    const saved = localStorage.getItem('mehar_toys_config');
    if (saved) {
        try { return JSON.parse(saved); } catch(e) {}
    }
    return DEFAULT_STORE_CONFIG;
}

const STORE_CONFIG = getStoreConfig();

// Check if an order has been paid online (JazzCash, Easypaisa, Slip attached, or status === 'Paid')
function isOrderPaid(ord) {
    if (!ord) return false;
    if (ord.paymentStatus === 'Paid' || ord.isPaid === true) return true;
    if (ord.paymentStatus === 'Unpaid (COD)' || ord.paymentStatus === 'Unpaid' || ord.isPaid === false) return false;

    // Check payment method string
    const pm = (ord.paymentMethod || '').toLowerCase();
    if (pm.includes('cash on delivery') || pm.includes('cod')) {
        return false;
    }
    if (pm.includes('jazzcash') || pm.includes('easypaisa') || pm.includes('online') || pm.includes('prepaid') || pm.includes('bank') || ord.trxId || ord.paymentSlip) {
        return true;
    }
    return false;
}

// ----------------------------------------------------------------
// YOUTUBE VIDEO LINK PARSER & EMBED URL HELPER
// Supports: watch?v=ID, youtu.be/ID, shorts/ID, embed/ID, or plain ID
// ----------------------------------------------------------------
function getYouTubeEmbedUrl(url, autoplay = false) {
    if (!url || typeof url !== 'string') return null;
    url = url.trim();
    if (!url) return null;

    let videoId = null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (match) {
        videoId = match[1];
    } else if (/^[\w-]{11}$/.test(url)) {
        videoId = url;
    }

    if (videoId) {
        const autoParam = autoplay ? '&autoplay=1&mute=0' : '';
        return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1${autoParam}`;
    }
    return null;
}

function getYouTubeThumbnail(url) {
    if (!url || typeof url !== 'string') return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    const videoId = match ? match[1] : (/^[\w-]{11}$/.test(url.trim()) ? url.trim() : null);
    if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return null;
}

const CATEGORIES = [
    { id: "all", name: "All Toys (Tamam Toys)", icon: "fa-shapes" },
    { id: "rc-cars", name: "RC & Diecast Cars", icon: "fa-car-side" },
    { id: "educational", name: "Learning & Education", icon: "fa-brain" },
    { id: "dolls-figures", name: "Dolls & Action Figures", icon: "fa-robot" },
    { id: "building-blocks", name: "Blocks & Puzzles", icon: "fa-cubes" },
    { id: "ride-ons", name: "Ride-ons & Outdoor", icon: "fa-bicycle" },
    { id: "baby-toddler", name: "Baby & Toddlers", icon: "fa-baby" }
];

const DEFAULT_PRODUCTS = [
    {
        id: 1,
        name: "4WD High-Speed Monster RC Stunt Car",
        category: "rc-cars",
        price: 3499,
        originalPrice: 4500,
        discount: 22,
        rating: 4.9,
        reviewsCount: 38,
        inStock: true,
        stockCount: 18,
        badge: "Bestseller",
        image: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=0W1yL9nQk7g",
        description: "Rechargeable 4x4 Monster Truck with 360-degree stunt capability, high shock absorption suspension, durable rubber wheels, and a long-range 2.4GHz remote controller.",
        features: ["360° Stunt Flip & Roll", "Rechargeable Li-ion Battery included", "2.4GHz High Range Remote", "Age: 4+ Years", "Unbreakable ABS Plastic Body"]
    },
    {
        id: 2,
        name: "STEM 500-Piece Creative Architecture Building Bricks",
        category: "building-blocks",
        price: 2799,
        originalPrice: 3500,
        discount: 20,
        rating: 4.8,
        reviewsCount: 45,
        inStock: true,
        stockCount: 24,
        badge: "Educational",
        image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=kXYiU_JCYtU",
        description: "Engage your child's imagination with 500 colorful, high-grade interlocking building bricks. Helps build problem-solving skills, spatial awareness, and creative thinking.",
        features: ["500+ High Quality Bricks", "Compatible with major brands", "Includes Storage Box", "Non-Toxic & BPA Free", "Age: 3-10 Years"]
    },
    {
        id: 3,
        name: "Smart Talking & Dancing Cactus with Voice Recording",
        category: "baby-toddler",
        price: 1499,
        originalPrice: 2200,
        discount: 32,
        rating: 4.7,
        reviewsCount: 89,
        inStock: true,
        stockCount: 35,
        badge: "Trending",
        image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=b4dKzK4yV0w",
        description: "World-famous entertaining plush toy that mimics what you say, dances with cheerful LED lights, and plays over 120 fun English and nursery songs.",
        features: ["Voice Repeat / Recording Function", "120+ Built-in Melodies & Songs", "Soft Plush Safe Material", "USB Rechargeable", "Age: 6 Months+"]
    },
    {
        id: 4,
        name: "Montessori Wooden Sorting & Number Puzzle Board",
        category: "educational",
        price: 1899,
        originalPrice: 2499,
        discount: 24,
        rating: 4.9,
        reviewsCount: 62,
        inStock: true,
        stockCount: 15,
        badge: "Top Rated",
        image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=L_LUpnjgPso",
        description: "Natural organic wooden learning puzzle featuring shapes, counting rings, numbers, and magnetic fishing game. Ideal for preschool cognitive development.",
        features: ["100% Solid Natural Wood", "Water-based safe organic colors", "Count & Stack rings", "Magnetic fishing pole included", "Age: 2-6 Years"]
    },
    {
        id: 5,
        name: "Super Mech Titan Fighting Action Robot with LED & Sound",
        category: "dolls-figures",
        price: 2999,
        originalPrice: 3800,
        discount: 21,
        rating: 4.8,
        reviewsCount: 29,
        inStock: true,
        stockCount: 12,
        badge: "Hot",
        image: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=rT1w0l7z7Y4",
        description: "Futuristic battle mech robot with moveable joints, laser sound effects, chest combat light, and detachable shield and sword for superhero action roleplay.",
        features: ["Moveable Joints & Armor", "Sound & Battle Light Effects", "Includes Battle Weapons", "Heavy-Duty build quality", "Age: 4+ Years"]
    },
    {
        id: 6,
        name: "Kids 8.5-Inch LCD Magic Writing & Drawing Tablet",
        category: "educational",
        price: 899,
        originalPrice: 1299,
        discount: 30,
        rating: 4.6,
        reviewsCount: 110,
        inStock: true,
        stockCount: 40,
        badge: "Value Deal",
        image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
        description: "Paperless writing and drawing tablet. Eye-protection LCD screen with one-touch erase button and screen lock switch. Saves paper and keeps kids creative.",
        features: ["One-Click Instant Erase", "Screen Lock switch", "Ultra Lightweight & Portable", "Stylus Pen Included", "Battery lasts up to 1 year"]
    },
    {
        id: 7,
        name: "Deluxe Princess Dream Dollhouse with Furniture Set",
        category: "dolls-figures",
        price: 4999,
        originalPrice: 6500,
        discount: 23,
        rating: 5.0,
        reviewsCount: 24,
        inStock: true,
        stockCount: 8,
        badge: "Premium",
        image: "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
        description: "Multi-storey fairytale villa dollhouse with bedrooms, living room, balcony, 2 dolls, and 24 miniature furniture accessories for endless pretend play.",
        features: ["3 Storey Luxury Villa", "24 Pieces Detailed Furniture", "2 Princess Dolls Included", "Easy Snap-fit Assembly", "Age: 3+ Years"]
    },
    {
        id: 8,
        name: "Electric Gesture Sensing Drift Car with Smoke Effect",
        category: "rc-cars",
        price: 4299,
        originalPrice: 5500,
        discount: 22,
        rating: 4.9,
        reviewsCount: 51,
        inStock: true,
        stockCount: 14,
        badge: "Super Cool",
        image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=K4DyBUG242c",
        description: "Control this car with hand gesture watch or handheld remote! Features real cold water mist smoke exhaust, sideways drift wheels, music, and flash lights.",
        features: ["Hand Gesture Sensor Watch Control", "Rear Steam / Mist Exhaust", "Multi-directional Mecanum Wheels", "Dynamic Lights & Sound", "Age: 6+ Years"]
    },
    {
        id: 9,
        name: "Interactive Master Chef Little Kitchen Cooking Set",
        category: "educational",
        price: 3199,
        originalPrice: 4200,
        discount: 24,
        rating: 4.7,
        reviewsCount: 36,
        inStock: true,
        stockCount: 16,
        badge: "Popular",
        image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=lTRiuFIWV54",
        description: "Realistic play kitchen with running water tap, stove with simulated cooking sounds and steam, utensils, pots, pans, and play food items.",
        features: ["Real Working Water Circulation Tap", "Stove Steam & Sound Simulation", "32+ Kitchen Utensils & Food", "Safe Rounded Edges", "Age: 3+ Years"]
    },
    {
        id: 10,
        name: "Foldable 3-Wheel Kick Scooter with LED Light Wheels",
        category: "ride-ons",
        price: 3899,
        originalPrice: 4999,
        discount: 22,
        rating: 4.8,
        reviewsCount: 42,
        inStock: true,
        stockCount: 10,
        badge: "Outdoor",
        image: "https://images.unsplash.com/photo-1516981879613-9f5da904015f?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=sOnqjkJTMaA",
        description: "Adjustable 4-level height handlebar kick scooter. Self-balancing lean-to-steer design with extra-wide rear foot brake and flashing magnetic LED wheels.",
        features: ["Magnetic LED Flashing Wheels (No battery needed)", "Adjustable Height (4 Levels)", "Sturdy Lean-to-Steer Tech", "Foldable for easy travel", "Age: 3-10 Years (Max 50kg)"]
    },
    {
        id: 11,
        name: "Classic Wooden Magnetic Chess & Checkers 2-in-1 Set",
        category: "building-blocks",
        price: 2199,
        originalPrice: 2800,
        discount: 21,
        rating: 4.9,
        reviewsCount: 19,
        inStock: true,
        stockCount: 22,
        badge: "Family Game",
        image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=fCg8V_Z5x7E",
        description: "Handcrafted magnetic wooden folding board game. Magnetic pieces stay intact even while traveling. Great for developing logic, memory, and patience.",
        features: ["Folding Chessboard with velvet slots", "Magnetic pieces prevent dropping", "2 Games in 1 (Chess & Checkers)", "Premium Wood Craftsmanship", "All Ages (6+)"]
    },
    {
        id: 12,
        name: "Electric High-Pressure Automatic Water Blaster Gun",
        category: "ride-ons",
        price: 2499,
        originalPrice: 3200,
        discount: 22,
        rating: 4.7,
        reviewsCount: 31,
        inStock: true,
        stockCount: 25,
        badge: "Summer Hit",
        image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=kXYiU_JCYtU",
        description: "Automatic burst motorized water gun with long shooting range up to 30 feet! Includes rechargeable battery, transparent water clip, and waterproof compartment.",
        features: ["Fully Automatic Electric Burst", "Shooting range up to 30ft / 10m", "High capacity water clip", "Rechargeable Battery Included", "Age: 6+ Years"]
    }
];

// Helper functions to get and set products from LocalStorage
function getProducts() {
    const saved = localStorage.getItem('mehar_toys_products');
    if (saved) {
        try {
            let list = JSON.parse(saved);
            let updated = false;
            list.forEach(p => {
                const def = DEFAULT_PRODUCTS.find(d => d.id === p.id);
                if (def && def.videoUrl && !p.videoUrl) {
                    p.videoUrl = def.videoUrl;
                    updated = true;
                }
            });
            if (updated) {
                localStorage.setItem('mehar_toys_products', JSON.stringify(list));
            }
            return list;
        } catch(e) {}
    }
    // Initialize with default products
    localStorage.setItem('mehar_toys_products', JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
}

function saveProducts(products) {
    localStorage.setItem('mehar_toys_products', JSON.stringify(products));
}

// Global products reference
let PRODUCTS = getProducts();

// ----------------------------------------------------------------
// 1. PROMO VOUCHERS & DISCOUNT COUPONS SYSTEM
// ----------------------------------------------------------------
const DEFAULT_COUPONS = [
    {
        code: "WELCOME10",
        type: "percent", // 'percent' or 'flat' or 'freeship'
        value: 10,
        minOrder: 0,
        maxDiscount: 1500,
        description: "10% OFF on all toys (No minimum order required)"
    },
    {
        code: "MEHAR500",
        type: "flat",
        value: 500,
        minOrder: 3000,
        maxDiscount: 500,
        description: "Flat Rs. 500 OFF on orders above Rs. 3,000"
    },
    {
        code: "SUPERTOY",
        type: "percent",
        value: 15,
        minOrder: 2000,
        maxDiscount: 1000,
        description: "15% OFF for orders above Rs. 2,000"
    },
    {
        code: "FREESHIP",
        type: "freeship",
        value: 0,
        minOrder: 0,
        maxDiscount: 0,
        description: "100% Free Shipping Delivery anywhere in Pakistan"
    }
];

function getCoupons() {
    const saved = localStorage.getItem('mehar_toys_coupons');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {}
    }
    localStorage.setItem('mehar_toys_coupons', JSON.stringify(DEFAULT_COUPONS));
    return DEFAULT_COUPONS;
}

function saveCoupons(coupons) {
    localStorage.setItem('mehar_toys_coupons', JSON.stringify(coupons));
}

function validateCoupon(code, subtotal, shipping) {
    if (!code || typeof code !== 'string') {
        return { valid: false, message: "Please enter a coupon code!" };
    }
    const cleanCode = code.trim().toUpperCase();
    const coupons = getCoupons();
    const coupon = coupons.find(c => c.code.toUpperCase() === cleanCode);

    if (!coupon) {
        return { valid: false, message: `Invalid voucher "${cleanCode}". Try WELCOME10 or MEHAR500!` };
    }

    if (coupon.minOrder && subtotal < coupon.minOrder) {
        return { 
            valid: false, 
            message: `Coupon "${coupon.code}" requires minimum order of Rs. ${coupon.minOrder.toLocaleString()}!` 
        };
    }

    let discount = 0;
    if (coupon.type === 'percent') {
        discount = Math.round((subtotal * coupon.value) / 100);
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
        }
    } else if (coupon.type === 'flat') {
        discount = Math.min(coupon.value, subtotal);
    } else if (coupon.type === 'freeship') {
        discount = shipping;
    }

    return {
        valid: true,
        coupon,
        discount,
        code: coupon.code,
        description: coupon.description,
        message: `🎉 Coupon "${coupon.code}" applied! You saved Rs. ${discount.toLocaleString()}`
    };
}

// ----------------------------------------------------------------
// 2. PRODUCT CUSTOMER REVIEWS & FEEDBACK SYSTEM
// ----------------------------------------------------------------
function getProductReviews(productId) {
    const all = JSON.parse(localStorage.getItem('mehar_toys_reviews')) || {};
    if (all[productId] && all[productId].length > 0) {
        return all[productId];
    }

    // Default seeded authentic Pakistani reviews for realism
    const defaultSampleReviews = [
        {
            id: 101,
            author: "Muhammad Hamza",
            city: "Lahore",
            rating: 5,
            date: "2 days ago",
            comment: "Bohat zabardast toy hai! Video demo jaisa dekha tha bilkul wesa hi aya. Beta bohat khush hai.",
            verified: true
        },
        {
            id: 102,
            author: "Ayesha Malik",
            city: "Karachi",
            rating: 5,
            date: "4 days ago",
            comment: "Fast delivery by Mehar Toys, packaging bhi bohat achi thi. High quality toy!",
            verified: true
        },
        {
            id: 103,
            author: "Usman Ghani",
            city: "Islamabad",
            rating: 4.8,
            date: "1 week ago",
            comment: "Original quality product. Cash on delivery par deliver hua, highly recommended.",
            verified: true
        }
    ];

    all[productId] = defaultSampleReviews;
    localStorage.setItem('mehar_toys_reviews', JSON.stringify(all));
    return defaultSampleReviews;
}

function addProductReview(productId, reviewData) {
    const all = JSON.parse(localStorage.getItem('mehar_toys_reviews')) || {};
    if (!all[productId]) {
        all[productId] = getProductReviews(productId);
    }

    const newRev = {
        id: Date.now(),
        author: reviewData.author || "Valued Customer",
        city: reviewData.city || "Pakistan",
        rating: parseFloat(reviewData.rating) || 5,
        date: "Just now",
        comment: reviewData.comment || "Great product!",
        verified: true
    };

    all[productId].unshift(newRev);
    localStorage.setItem('mehar_toys_reviews', JSON.stringify(all));

    // Recalculate average rating & reviews count on product
    let products = getProducts();
    const pIdx = products.findIndex(p => p.id === productId);
    if (pIdx !== -1) {
        const revs = all[productId];
        const sum = revs.reduce((acc, r) => acc + (parseFloat(r.rating) || 5), 0);
        const avg = (sum / revs.length).toFixed(1);
        products[pIdx].rating = parseFloat(avg);
        products[pIdx].reviewsCount = revs.length;
        saveProducts(products);
    }

    return all[productId];
}

// ----------------------------------------------------------------
// 3. WHATSAPP INSTANT ORDER ALERT GENERATOR
// ----------------------------------------------------------------
function generateWhatsAppOrderUrl(order, storeConfig) {
    const config = storeConfig || getStoreConfig();
    const phone = (config.accountNumber || "03228482860").replace(/[^0-9]/g, '');
    const waPhone = phone.startsWith('0') ? '92' + phone.substring(1) : (phone.startsWith('92') ? phone : '923228482860');

    const isPaid = isOrderPaid(order);
    const itemsListText = (order.items || []).map((it, idx) => 
        `${idx + 1}. *${it.name}* (x${it.quantity}) - Rs. ${(it.price * it.quantity).toLocaleString()}`
    ).join('\n');

    const couponLine = order.couponCode ? `🎟️ *Voucher (${order.couponCode}):* -Rs. ${(order.discountAmount || 0).toLocaleString()}\n` : '';
    const paymentStatusLine = isPaid 
        ? `✅ *Payment:* PAID ONLINE (${order.paymentMethod})${order.trxId ? `\n🔖 *TID / Sender:* ${order.trxId}` : ''}\n💵 *Doorstep Cash to Collect:* RS. 0 (ALREADY PAID)`
        : `💵 *Payment:* Cash on Delivery (COD)\n💵 *Doorstep Cash to Collect:* Rs. ${order.grandTotal.toLocaleString()}`;

    const text = 
`*Assalam-o-Alaikum MEHAR TOYS!* 🧸
Maine aapki website se naya order place kiya hai. Tafseel:

📦 *Order ID:* #${order.id}
📅 *Order Date:* ${order.date || 'Today'}

👤 *Customer:* ${order.customer ? order.customer.name : 'Customer'}
📱 *Phone:* ${order.customer ? order.customer.phone : ''}
📍 *City:* ${order.customer ? order.customer.city : ''}
🏠 *Delivery Address:* ${order.customer ? order.customer.address : ''}
${order.customer && order.customer.notes ? `📝 *Special Note:* ${order.customer.notes}\n` : ''}
🛍️ *Order Items:*
${itemsListText}

💰 *Subtotal:* Rs. ${(order.subtotal || 0).toLocaleString()}
🚚 *Shipping Fee:* ${order.shipping === 0 ? 'FREE' : 'Rs. ' + order.shipping}
${couponLine}🧾 *Total Order Value:* Rs. ${(order.grandTotal || 0).toLocaleString()}
${paymentStatusLine}

Barah-e-karam mera order confirm karein aur dispatch updates dein. Shukriya!`;

    return `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`;
}
