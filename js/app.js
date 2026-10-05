// ================================================================
// MEHAR TOYS - MAIN APP LOGIC (3D, AUTH, 1-PAGE PRINT & UPLOAD)
// ================================================================

let currentCategory = 'all';
let searchQuery = '';
let currentSort = 'featured';
let cart = JSON.parse(localStorage.getItem('mehar_toys_cart')) || [];
let paymentSlipBase64 = null; // Stored payment screenshot

// Initialize App on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    initCustomerPortal();
    loadHeroBannerConfig();
    PRODUCTS = getProducts();
    initStoreInfo();
    initAnnouncementBar();
    initCountdownClocks();
    renderCategories();
    renderProducts();
    renderFlashShelf();
    updateCartUI();
    updateAuthUI();
    init3DHeroParallax();
    setupEventListeners();
});

// ----------------------------------------------------------------

// ----------------------------------------------------------------
// DYNAMIC HERO BANNER LOADER (SYNCED WITH ADMIN PANEL)
// ----------------------------------------------------------------
function loadHeroBannerConfig() {
    try {
        const stored = localStorage.getItem('mehar_toys_hero_config');
        if (!stored) return;
        const config = JSON.parse(stored);
        if (!config) return;

        const imgEl = document.getElementById('hero-banner-image');
        const tagEl = document.getElementById('hero-banner-tag');
        const headlineEl = document.getElementById('hero-banner-headline');
        const subheadlineEl = document.getElementById('hero-banner-subheadline');
        const descEl = document.getElementById('hero-banner-description');
        const discountTextEl = document.getElementById('hero-banner-discount-text');
        const priceEl = document.getElementById('hero-banner-price');
        const oldPriceEl = document.getElementById('hero-banner-oldprice');

        if (config.imageUrl && imgEl) imgEl.src = config.imageUrl;
        if (config.tag && tagEl) tagEl.textContent = config.tag;
        if (config.headline && headlineEl) headlineEl.textContent = config.headline;
        if (config.subheadline && subheadlineEl) subheadlineEl.textContent = config.subheadline;
        if (config.description && descEl) descEl.textContent = config.description;
        if (config.discount && discountTextEl) discountTextEl.textContent = config.discount;
        if (config.price && priceEl) priceEl.textContent = config.price;
        if (config.oldPrice && oldPriceEl) oldPriceEl.textContent = config.oldPrice;
    } catch(err) {
        console.warn('Hero banner config load error:', err);
    }
}
window.loadHeroBannerConfig = loadHeroBannerConfig;

window.addEventListener('storage', (e) => {
    if (!e.key || e.key === 'mehar_toys_hero_config') {
        loadHeroBannerConfig();
    }
});

// FLASH SALE & DARAZ-STYLE LUXURY HELPERS
// ----------------------------------------------------------------
function scrollToFlashSale() {
    const el = document.getElementById('flash-sale-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}
window.scrollToFlashSale = scrollToFlashSale;

function filterUnderPrice(maxPrice) {
    currentCategory = 'all';
    searchQuery = '';
    renderCategories();
    renderProducts();
    const container = document.getElementById('products-grid');
    if (container) {
        const filtered = getProducts().filter(p => p.price <= maxPrice);
        if (filtered.length > 0) {
            container.innerHTML = filtered.map(prod => `
                <div class="toy-card bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-xl flex flex-col justify-between relative group border border-gray-100 transition-all duration-300">
                    <div class="absolute top-2 left-2 z-10 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                        UNDER Rs. ${maxPrice.toLocaleString()}
                    </div>
                    <div class="relative w-full h-36 sm:h-48 md:h-56 bg-slate-50 overflow-hidden cursor-pointer" onclick="openProductModal(${prod.id})">
                        <img src="${prod.image}" alt="${prod.name}" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div class="p-2.5 sm:p-5 flex-1 flex flex-col justify-between">
                        <div>
                            <h3 class="font-extrabold text-xs sm:text-base text-gray-900 group-hover:text-red-500 transition-colors line-clamp-2" onclick="openProductModal(${prod.id})">
                                ${prod.name}
                            </h3>
                            <div class="flex items-baseline gap-1.5 sm:gap-2 mt-1.5">
                                <span class="text-sm sm:text-xl font-black text-red-600">Rs. ${prod.price.toLocaleString()}</span>
                            </div>
                        </div>
                        <button type="button" onclick="addToCart(${prod.id})" class="mt-2.5 w-full py-2 rounded-xl bg-slate-900 hover:bg-red-600 text-white text-xs font-black transition flex items-center justify-center gap-1.5 active:scale-95 shadow-xs">
                            <i class="fas fa-shopping-basket text-xs"></i>
                            <span>Add to Cart</span>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}
window.filterUnderPrice = filterUnderPrice;

function claimAllVouchers() {
    const claimed = {
        vouchers: ['MEHAR300', 'FREESHIP', 'WELCOME10'],
        timestamp: Date.now()
    };
    localStorage.setItem('mehar_toys_claimed_vouchers', JSON.stringify(claimed));
    
    const btn = document.getElementById('btn-collect-vouchers');
    if (btn) {
        btn.textContent = '✓ All Collected!';
        btn.classList.remove('from-red-600', 'to-rose-600');
        btn.classList.add('bg-emerald-600');
    }
    showToast("🎉 Mubarak! All 3 luxury vouchers collected! Maximum discount will auto-apply at checkout!");
}
window.claimAllVouchers = claimAllVouchers;

function initCountdownClocks() {
    let totalSeconds = 4 * 3600 + 28 * 60 + 45;
    
    function tick() {
        if (totalSeconds <= 0) totalSeconds = 6 * 3600;
        totalSeconds--;
        
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const s = String(totalSeconds % 60).padStart(2, '0');

        const elH1 = document.getElementById('countdown-hours');
        const elM1 = document.getElementById('countdown-minutes');
        const elS1 = document.getElementById('countdown-seconds');
        if (elH1) elH1.textContent = h;
        if (elM1) elM1.textContent = m;
        if (elS1) elS1.textContent = s;

        const elH2 = document.getElementById('flash-clock-h');
        const elM2 = document.getElementById('flash-clock-m');
        const elS2 = document.getElementById('flash-clock-s');
        if (elH2) elH2.textContent = h;
        if (elM2) elM2.textContent = m;
        if (elS2) elS2.textContent = s;
    }
    
    tick();
    setInterval(tick, 1000);
}

function renderFlashShelf() {
    const container = document.getElementById('flash-shelf-container');
    if (!container) return;

    const allProds = getProducts();
    const flashProds = allProds.slice(0, 4);

    container.innerHTML = flashProds.map(prod => {
        const discountPct = prod.discount || Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100) || 25;
        const soldCount = Math.floor(prod.id * 3 + 12);
        const stockLeft = Math.max(3, 24 - soldCount);
        const percentSold = Math.min(88, Math.round((soldCount / (soldCount + stockLeft)) * 100));

        return `
            <div class="bg-white rounded-2xl border border-slate-200/80 p-2.5 sm:p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
                <div class="absolute top-2 left-2 z-10 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    <i class="fas fa-fire text-amber-300 text-[10px]"></i> -${discountPct}%
                </div>

                <div class="w-full h-32 sm:h-40 rounded-xl overflow-hidden bg-slate-50 cursor-pointer relative" onclick="openProductModal(${prod.id})">
                    <img src="${prod.image}" alt="${prod.name}" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300" />
                </div>

                <div class="pt-2 flex-1 flex flex-col justify-between">
                    <div>
                        <h4 class="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-red-600 transition" onclick="openProductModal(${prod.id})">
                            ${prod.name}
                        </h4>
                        <div class="flex items-baseline gap-1.5 mt-1">
                            <span class="text-sm font-black text-red-600">Rs. ${prod.price.toLocaleString()}</span>
                            <span class="text-[10px] text-slate-400 line-through">Rs. ${(prod.originalPrice || Math.round(prod.price * 1.3)).toLocaleString()}</span>
                        </div>
                    </div>

                    <div class="mt-2 space-y-1">
                        <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div class="bg-gradient-to-r from-amber-500 to-red-500 h-1.5 rounded-full" style="width: ${percentSold}%"></div>
                        </div>
                        <div class="text-[9px] font-bold text-slate-500 flex items-center justify-between">
                            <span class="text-red-600 font-extrabold">🔥 ${soldCount} Sold</span>
                            <span>Only ${stockLeft} Left!</span>
                        </div>
                    </div>

                    <button type="button" onclick="addToCart(${prod.id})" class="mt-2.5 w-full py-1.5 rounded-xl bg-slate-900 hover:bg-red-600 text-white text-[11px] font-extrabold transition-colors flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs">
                        <i class="fas fa-shopping-basket text-[10px]"></i>
                        <span>Add To Cart</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ----------------------------------------------------------------
// TOP ANNOUNCEMENT BAR ROTATOR (LUXURY SLEEK TICKER)
// ----------------------------------------------------------------
const ANNOUNCEMENTS = [
    {
        tag: 'SPECIAL OFFER',
        tagBg: 'from-amber-400 to-amber-500 text-slate-950',
        icon: '🎉',
        msg: 'Free Delivery all over Pakistan on orders above Rs. 5,999!'
    },
    {
        tag: 'CASH ON DELIVERY',
        tagBg: 'from-emerald-400 to-teal-500 text-slate-950',
        icon: '💵',
        msg: 'Pay Cash at Your Doorstep Nationwide | Fast Dispatch'
    },
    {
        tag: '10% DISCOUNT',
        tagBg: 'from-rose-400 to-red-500 text-white',
        icon: '🎁',
        msg: 'Use coupon code WELCOME10 for 10% OFF your order!'
    },
    {
        tag: '100% ORIGINAL',
        tagBg: 'from-sky-400 to-blue-500 text-white',
        icon: '⚡',
        msg: 'Safe, Tested & Premium Quality Toys For Happy Kids!'
    }
];

let currentAnnouncementIdx = 0;
let announcementTimer = null;

function renderAnnouncement() {
    const item = ANNOUNCEMENTS[currentAnnouncementIdx];
    const tagEl = document.getElementById('announcement-tag');
    const msgEl = document.getElementById('announcement-msg');
    const contentEl = document.getElementById('announcement-content');
    if (!tagEl || !msgEl || !contentEl) return;

    contentEl.style.opacity = '0';
    contentEl.style.transform = 'translateY(4px)';

    setTimeout(() => {
        tagEl.className = `shrink-0 bg-gradient-to-r ${item.tagBg} font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs`;
        tagEl.textContent = item.tag;
        msgEl.innerHTML = `${item.icon} ${item.msg}`;
        contentEl.style.opacity = '1';
        contentEl.style.transform = 'translateY(0)';
    }, 180);
}

function changeAnnouncement(dir) {
    currentAnnouncementIdx = (currentAnnouncementIdx + dir + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length;
    renderAnnouncement();
    restartAnnouncementTimer();
}
window.changeAnnouncement = changeAnnouncement;

function initAnnouncementBar() {
    renderAnnouncement();
    restartAnnouncementTimer();
}

function restartAnnouncementTimer() {
    if (announcementTimer) clearInterval(announcementTimer);
    announcementTimer = setInterval(() => {
        currentAnnouncementIdx = (currentAnnouncementIdx + 1) % ANNOUNCEMENTS.length;
        renderAnnouncement();
    }, 3800);
}

// Setup Store Info from Config
function initStoreInfo() {
    const config = getStoreConfig();
    document.querySelectorAll('.store-name-text').forEach(el => el.textContent = config.storeName);
    document.querySelectorAll('.store-tagline-text').forEach(el => el.textContent = config.tagline);
    document.querySelectorAll('.store-phone-text').forEach(el => el.textContent = config.displayPhone);
    document.querySelectorAll('.store-address-text').forEach(el => el.textContent = config.address);
}

// ----------------------------------------------------------------
// 3D HERO INTERACTIVE MOUSE PARALLAX & MOVEMENT
// ----------------------------------------------------------------
function init3DHeroParallax() {
    const heroWrapper = document.getElementById('hero-3d-box');
    const heroCard = document.getElementById('hero-main-card');
    if (!heroWrapper || !heroCard) return;

    heroWrapper.addEventListener('mousemove', (e) => {
        const rect = heroWrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -12; // tilt degrees
        const rotateY = ((x - centerX) / centerX) * 12;

        heroCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    heroWrapper.addEventListener('mouseleave', () => {
        heroCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        heroCard.style.transition = 'transform 0.5s ease';
    });

    heroWrapper.addEventListener('mouseenter', () => {
        heroCard.style.transition = 'transform 0.1s ease-out';
    });
}

// ----------------------------------------------------------------
// CATEGORIES & PRODUCTS
// ----------------------------------------------------------------
function renderCategories() {
    const container = document.getElementById('categories-container');
    if (!container) return;

    container.innerHTML = CATEGORIES.map(cat => `
        <button 
            onclick="selectCategory('${cat.id}')"
            class="category-btn px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap border-2 border-gray-200 bg-white text-gray-700 hover:border-yellow-400 ${cat.id === currentCategory ? 'active' : ''}">
            <i class="fas ${cat.icon}"></i>
            <span>${cat.name}</span>
        </button>
    `).join('');
}

function selectCategory(catId) {
    currentCategory = catId;
    renderCategories();
    renderProducts();
}

function renderProducts() {
    const container = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-products');
    if (!container) return;

    PRODUCTS = getProducts();
    const config = getStoreConfig();

    let filtered = PRODUCTS.filter(prod => {
        const matchesCategory = currentCategory === 'all' || prod.category === currentCategory;
        const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    if (currentSort === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'rating') {
        filtered.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    }

    if (filtered.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    container.innerHTML = filtered.map(prod => `
        <div class="toy-card bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-xl flex flex-col justify-between relative group border border-gray-100 transition-all duration-300">
            <!-- Badges -->
            <div class="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-col gap-1 pointer-events-none">
                ${prod.badge ? `
                    <span class="badge-discount text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm">
                        ${prod.badge}
                    </span>
                ` : ''}
                ${prod.discount ? `
                    <span class="bg-amber-400 text-gray-900 text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full shadow-sm">
                        -${prod.discount}%
                    </span>
                ` : ''}
            </div>

            <!-- Wishlist Heart Button -->
            <button 
                type="button"
                onclick="toggleWishlist(${prod.id}, event)" 
                class="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 active:scale-90 transition-all cursor-pointer"
                title="${isItemWishlisted(prod.id) ? 'Remove from Wishlist' : 'Save to Wishlist'}">
                <i class="${isItemWishlisted(prod.id) ? 'fas fa-heart text-red-500' : 'far fa-heart'} text-[11px] sm:text-xs"></i>
            </button>

            <!-- Product Image (Responsive Height for mobile & tablet) -->
            <div class="relative overflow-hidden cursor-pointer bg-amber-50 h-36 sm:h-48 md:h-56 flex items-center justify-center" onclick="openProductModal(${prod.id})">
                <img 
                    src="${prod.image}" 
                    alt="${prod.name}" 
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    onerror="this.src='https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80'"
                />
                ${prod.videoUrl ? `
                    <span class="absolute bottom-2 left-2 bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md z-10">
                        <i class="fab fa-youtube"></i> Video
                    </span>
                ` : ''}
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-25 transition-all flex items-center justify-center">
                    <span class="opacity-0 group-hover:opacity-100 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg transition-all transform scale-95 group-hover:scale-100 flex items-center gap-1.5">
                        <i class="fas fa-play text-red-600"></i> View Details
                    </span>
                </div>
            </div>

            <!-- Product Details -->
            <div class="p-2.5 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div class="flex items-center gap-1 text-amber-400 text-[10px] sm:text-xs mb-1 sm:mb-2">
                        <i class="fas fa-star text-[10px] sm:text-xs"></i>
                        <span class="font-bold text-gray-700">${prod.rating || 4.8}</span>
                        <span class="text-gray-400 hidden sm:inline">(${prod.reviewsCount || 25})</span>
                        <span class="ml-auto text-emerald-600 font-semibold text-[10px] sm:text-xs bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full">
                            <i class="fas fa-check-circle text-[9px] sm:text-[10px]"></i> In Stock
                        </span>
                    </div>

                    <h3 
                        onclick="openProductModal(${prod.id})"
                        class="font-bold text-gray-800 text-xs sm:text-base leading-snug hover:text-red-500 cursor-pointer line-clamp-2 transition-colors mb-1 sm:mb-2" 
                        title="${prod.name}">
                        ${prod.name}
                    </h3>
                </div>

                <div class="mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100">
                    <div class="flex items-baseline gap-1.5 mb-2 sm:mb-3">
                        <span class="text-base sm:text-2xl font-black text-red-600">${config.currency} ${prod.price.toLocaleString()}</span>
                        ${prod.originalPrice ? `
                            <span class="text-[10px] sm:text-xs text-gray-400 line-through">${config.currency} ${prod.originalPrice.toLocaleString()}</span>
                        ` : ''}
                    </div>

                    <div class="flex flex-col sm:grid sm:grid-cols-2 gap-1.5 sm:gap-2">
                        <button 
                            onclick="addToCart(${prod.id})" 
                            class="w-full py-2 sm:py-2.5 px-2 bg-yellow-400 hover:bg-yellow-500 active:scale-95 text-gray-900 font-extrabold rounded-xl text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all shadow-xs">
                            <i class="fas fa-cart-plus text-[10px] sm:text-xs"></i>
                            <span>Add To Basket</span>
                        </button>
                        <button 
                            onclick="buyNowDirect(${prod.id})" 
                            class="w-full py-2 sm:py-2.5 px-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold rounded-xl text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all shadow-xs">
                            <i class="fas fa-bolt text-[10px] sm:text-xs"></i>
                            <span>Buy Now</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// ----------------------------------------------------------------
// PRODUCT DETAILS & YOUTUBE VIDEO SHOWCASE MODAL
// ----------------------------------------------------------------
let currentModalQty = 1;

function changeModalQty(delta) {
    const input = document.getElementById('modal-qty-input');
    if (!input) return;
    let val = parseInt(input.value) || 1;
    val += delta;
    if (val < 1) val = 1;
    if (val > 50) val = 50;
    input.value = val;
    currentModalQty = val;
}

function addToCartFromModal(productId) {
    const qty = currentModalQty || 1;
    for (let i = 0; i < qty; i++) {
        addToCart(productId);
    }
    closeModal();
    showToast(`${qty} item(s) basket mein add ho gaye! 🛒`);
}

function buyNowFromModal(productId) {
    const qty = currentModalQty || 1;
    for (let i = 0; i < qty; i++) {
        addToCart(productId);
    }
    closeModal();
    toggleCartDrawer(true);
}

function switchModalMedia(tab) {
    const photoBox = document.getElementById('modal-media-photo');
    const videoBox = document.getElementById('modal-media-video');
    const videoFooter = document.getElementById('modal-video-footer');
    const photoBtn = document.getElementById('modal-tab-photo-btn');
    const videoBtn = document.getElementById('modal-tab-video-btn');
    const iframe = document.getElementById('modal-youtube-iframe');

    if (tab === 'video' && videoBox && iframe) {
        photoBox.classList.add('hidden');
        videoBox.classList.remove('hidden');
        if (videoFooter) videoFooter.classList.remove('hidden');

        if (!iframe.src || iframe.src.includes('about:blank') || iframe.src === '') {
            const embedSrc = iframe.getAttribute('data-src');
            iframe.src = embedSrc + (embedSrc.includes('?') ? '&' : '?') + 'autoplay=1';
        }

        if (photoBtn) photoBtn.className = "flex-1 py-2 px-3 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-200 flex items-center justify-center gap-1.5 transition";
        if (videoBtn) videoBtn.className = "flex-1 py-2 px-3 rounded-xl font-black text-xs bg-red-600 text-white shadow-xs flex items-center justify-center gap-1.5 transition";
    } else if (photoBox) {
        photoBox.classList.remove('hidden');
        if (videoBox) videoBox.classList.add('hidden');
        if (videoFooter) videoFooter.classList.add('hidden');

        if (iframe && iframe.src) {
            iframe.src = 'about:blank';
        }

        if (photoBtn) photoBtn.className = "flex-1 py-2 px-3 rounded-xl font-bold text-xs bg-white text-slate-900 shadow-xs flex items-center justify-center gap-1.5 transition";
        if (videoBtn) videoBtn.className = "flex-1 py-2 px-3 rounded-xl font-black text-xs text-red-600 hover:text-red-700 flex items-center justify-center gap-1.5 transition";
    }
}

let currentModalReviewRating = 5;

function toggleReviewForm(show) {
    const form = document.getElementById('modal-review-form');
    if (!form) return;
    if (show !== undefined) {
        if (show) form.classList.remove('hidden');
        else form.classList.add('hidden');
    } else {
        form.classList.toggle('hidden');
    }
}

function setReviewModalRating(stars) {
    currentModalReviewRating = stars;
    const selector = document.getElementById('review-star-selector');
    if (!selector) return;
    selector.innerHTML = [1, 2, 3, 4, 5].map(i => `
        <button type="button" onclick="setReviewModalRating(${i})" class="text-xl ${i <= stars ? 'text-amber-400' : 'text-slate-300'} hover:scale-120 transition">
            <i class="fas fa-star"></i>
        </button>
    `).join('');
}

function submitProductReview(productId) {
    const nameInput = document.getElementById('new-review-name');
    const cityInput = document.getElementById('new-review-city');
    const commentInput = document.getElementById('new-review-comment');

    const author = nameInput ? nameInput.value.trim() : '';
    const city = cityInput ? cityInput.value.trim() : '';
    const comment = commentInput ? commentInput.value.trim() : '';

    if (!author) {
        alert("Barah-e-karam apna naam likhein!");
        return;
    }
    if (!comment) {
        alert("Barah-e-karam apna review comment likhein!");
        return;
    }

    if (typeof addProductReview === 'function') {
        addProductReview(productId, {
            author,
            city: city || "Pakistan",
            rating: currentModalReviewRating,
            comment
        });
    }

    showToast("🎉 Shukriya! Aapka review aur rating add ho gayi hai.");
    openProductModal(productId);
    renderProducts();
}

function openProductModal(productId) {
    PRODUCTS = getProducts();
    const config = getStoreConfig();
    const prod = PRODUCTS.find(p => p.id === productId);
    if (!prod) return;

    currentModalQty = 1;
    currentModalReviewRating = 5;
    const activeCustomer = getActiveCustomer();
    const reviews = typeof getProductReviews === 'function' ? getProductReviews(prod.id) : [];

    const embedUrl = typeof getYouTubeEmbedUrl === 'function' ? getYouTubeEmbedUrl(prod.videoUrl) : null;
    const categoryObj = CATEGORIES.find(c => c.id === prod.category);
    const categoryName = categoryObj ? categoryObj.name : 'All Toys';
    const originalPrice = prod.originalPrice || Math.round(prod.price * 1.25);
    const saveAmount = originalPrice > prod.price ? (originalPrice - prod.price) : 0;
    const discountPercent = prod.discount || Math.round((saveAmount / originalPrice) * 100);
    const waText = encodeURIComponent(`Assalam-o-Alaikum Mehar Toys! Mujhe "${prod.name}" (Price: Rs. ${prod.price}) ke baare mein order karna hai.`);
    const waLink = `https://wa.me/923228482860?text=${waText}`;

    const modalContent = document.getElementById('modal-product-content');
    modalContent.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            <!-- LEFT COLUMN: Visual Media (Photos & Video Switcher) -->
            <div class="lg:col-span-6 space-y-3">
                <!-- Media Mode Switcher Tabs -->
                <div class="flex items-center justify-between gap-2 p-1 bg-slate-100 rounded-2xl">
                    <button 
                        id="modal-tab-photo-btn" 
                        onclick="switchModalMedia('photo')" 
                        class="flex-1 py-2 px-3 rounded-xl font-bold text-xs bg-white text-slate-900 shadow-xs flex items-center justify-center gap-1.5 transition">
                        <i class="fas fa-camera text-slate-600"></i>
                        <span>Photos / تصاویر</span>
                    </button>
                    ${embedUrl ? `
                        <button 
                            id="modal-tab-video-btn" 
                            onclick="switchModalMedia('video')" 
                            class="flex-1 py-2 px-3 rounded-xl font-black text-xs text-red-600 hover:text-red-700 flex items-center justify-center gap-1.5 transition">
                            <i class="fab fa-youtube text-base text-red-600"></i>
                            <span>Watch Video Demo 🎬</span>
                        </button>
                    ` : ''}
                </div>

                <!-- 1. Photo Container -->
                <div id="modal-media-photo" class="relative rounded-3xl overflow-hidden bg-slate-50 h-72 sm:h-96 flex items-center justify-center border border-slate-200 shadow-inner group">
                    <img 
                        src="${prod.image}" 
                        alt="${prod.name}" 
                        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    ${prod.badge ? `
                        <span class="badge-discount absolute top-3.5 left-3.5 text-xs font-black px-3 py-1 rounded-full shadow-md">
                            ${prod.badge}
                        </span>
                    ` : ''}
                    
                    ${embedUrl ? `
                        <!-- Video Play overlay button on image -->
                        <div 
                            onclick="switchModalMedia('video')" 
                            class="absolute inset-0 bg-black/30 hover:bg-black/45 transition-all flex flex-col items-center justify-center text-white cursor-pointer group">
                            <div class="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center text-2xl shadow-2xl transform group-hover:scale-115 transition duration-300">
                                <i class="fas fa-play ml-1"></i>
                            </div>
                            <span class="mt-3 px-3.5 py-1 rounded-full text-xs font-black bg-black/70 backdrop-blur-xs text-white border border-white/20 shadow-lg flex items-center gap-1.5">
                                <i class="fab fa-youtube text-red-500"></i> Click to Play YouTube Video 🎬
                            </span>
                        </div>
                    ` : ''}
                </div>

                <!-- 2. Video Container (Initially hidden, revealed on click) -->
                ${embedUrl ? `
                    <div id="modal-media-video" class="hidden rounded-3xl overflow-hidden bg-black h-72 sm:h-96 border border-slate-200 shadow-lg relative">
                        <iframe 
                            id="modal-youtube-iframe"
                            src=""
                            data-src="${embedUrl}"
                            class="w-full h-full"
                            title="Product Video Demo"
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            allowfullscreen>
                        </iframe>
                    </div>

                    <!-- Video Details Strip -->
                    <div id="modal-video-footer" class="hidden flex items-center justify-between px-2 pt-1 text-xs text-slate-500">
                        <span class="font-bold flex items-center gap-1.5 text-slate-700">
                            <i class="fab fa-youtube text-red-600 text-sm"></i> YouTube Toy Demonstration
                        </span>
                        <a href="${prod.videoUrl}" target="_blank" class="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1">
                            <span>Open on YouTube</span>
                            <i class="fas fa-external-link-alt text-[10px]"></i>
                        </a>
                    </div>
                ` : ''}

                <!-- Trust Guarantee Bar -->
                <div class="grid grid-cols-3 gap-2 pt-1 text-center text-[10px] font-bold text-slate-600">
                    <div class="p-2 rounded-xl bg-slate-50 border border-slate-200">
                        <div class="text-emerald-600 text-xs mb-0.5"><i class="fas fa-truck-fast"></i></div>
                        <div>Cash on Delivery</div>
                    </div>
                    <div class="p-2 rounded-xl bg-slate-50 border border-slate-200">
                        <div class="text-blue-600 text-xs mb-0.5"><i class="fas fa-shield-halved"></i></div>
                        <div>7 Days Warranty</div>
                    </div>
                    <div class="p-2 rounded-xl bg-slate-50 border border-slate-200">
                        <div class="text-amber-500 text-xs mb-0.5"><i class="fas fa-award"></i></div>
                        <div>100% Kids Safe</div>
                    </div>
                </div>
            </div>

            <!-- RIGHT COLUMN: Product Specifications & Order Actions -->
            <div class="lg:col-span-6 space-y-4">
                
                <!-- Category & Stock Status -->
                <div class="flex items-center justify-between gap-2 flex-wrap">
                    <span class="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-200">
                        ${categoryName}
                    </span>
                    <span class="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                        <i class="fas fa-check-circle"></i> In Stock (${prod.stockCount || 20} available)
                    </span>
                </div>

                <!-- Product Title -->
                <h1 class="text-xl sm:text-2xl font-black text-slate-900 font-heading leading-snug">
                    ${prod.name}
                </h1>

                <!-- Ratings & Reviews Header -->
                <div class="flex items-center gap-2">
                    <div class="flex text-amber-400 text-xs sm:text-sm">
                        ${'<i class="fas fa-star"></i>'.repeat(Math.min(5, Math.floor(prod.rating || 5)))}
                    </div>
                    <span class="text-xs font-bold text-slate-700">${prod.rating || 4.9}</span>
                    <span class="text-xs text-slate-400">(${reviews.length || prod.reviewsCount || 34} customer reviews)</span>
                </div>

                <!-- Pricing Section -->
                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div class="flex items-baseline gap-3 flex-wrap">
                        <span class="text-2xl sm:text-3xl font-black text-red-600 font-heading">
                            ${config.currency} ${prod.price.toLocaleString()}
                        </span>
                        ${originalPrice > prod.price ? `
                            <span class="text-sm font-semibold text-slate-400 line-through">
                                ${config.currency} ${originalPrice.toLocaleString()}
                            </span>
                            <span class="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                Save ${config.currency} ${saveAmount.toLocaleString()} (${discountPercent}% OFF)
                            </span>
                        ` : ''}
                    </div>
                    <p class="text-[11px] text-slate-500 font-medium">Standard shipping Rs. ${config.deliveryCharges} (Free on orders above Rs. ${config.freeDeliveryThreshold.toLocaleString()})</p>
                </div>

                <!-- Description -->
                <div>
                    <h4 class="text-xs font-black uppercase text-slate-400 tracking-wider mb-1">Product Description</h4>
                    <p class="text-xs text-slate-600 leading-relaxed font-medium">${prod.description || 'Premium quality kid-safe toy designed for active fun and learning.'}</p>
                </div>

                <!-- Key Features Checklist -->
                ${prod.features && prod.features.length > 0 ? `
                    <div class="space-y-1.5 pt-1">
                        <h4 class="text-xs font-black uppercase text-slate-400 tracking-wider">Key Highlights / Features</h4>
                        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700 font-semibold">
                            ${prod.features.map(f => `
                                <li class="flex items-center gap-2">
                                    <i class="fas fa-circle-check text-emerald-500 text-xs shrink-0"></i>
                                    <span>${f}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}

                <!-- Quantity Selector -->
                <div class="pt-2 flex items-center gap-3">
                    <span class="text-xs font-bold text-slate-700">Quantity (Tadad):</span>
                    <div class="flex items-center border border-slate-200 rounded-xl bg-white shadow-2xs overflow-hidden">
                        <button type="button" onclick="changeModalQty(-1)" class="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-black text-sm active:scale-95 transition">-</button>
                        <input type="number" id="modal-qty-input" value="1" min="1" max="50" readonly class="w-12 text-center text-xs font-black text-slate-900 border-none outline-none" />
                        <button type="button" onclick="changeModalQty(1)" class="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-black text-sm active:scale-95 transition">+</button>
                    </div>
                </div>

                <!-- Action Buttons: Add to Basket & Buy Now -->
                <div class="grid grid-cols-2 gap-2.5 pt-2">
                    <button 
                        type="button"
                        onclick="addToCartFromModal(${prod.id})" 
                        class="py-3 px-3 bg-amber-400 hover:bg-amber-500 active:scale-98 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md">
                        <i class="fas fa-shopping-basket"></i>
                        <span>Add To Basket</span>
                    </button>
                    <button 
                        type="button"
                        onclick="buyNowFromModal(${prod.id})" 
                        class="py-3 px-3 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md shadow-red-500/25">
                        <i class="fas fa-bolt"></i>
                        <span>Order Now ⚡</span>
                    </button>
                </div>

                <!-- WhatsApp Quick Order Button -->
                <a 
                    href="${waLink}" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-98 shadow-2xs">
                    <i class="fab fa-whatsapp text-emerald-600 text-base"></i>
                    <span>Order / Inquire via WhatsApp Chat</span>
                </a>

            </div>
        </div>

        <!-- CUSTOMER REVIEWS & FEEDBACK SECTION -->
        <div class="mt-8 pt-6 border-t border-slate-100">
            <div class="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div>
                    <h3 class="text-base sm:text-lg font-black text-slate-900 font-heading flex items-center gap-2">
                        <span>Customer Reviews & Ratings</span>
                        <span class="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">⭐ ${prod.rating || 5.0} (${reviews.length})</span>
                    </h3>
                    <p class="text-xs text-slate-500 mt-0.5">Asal khareedaron ki raye aur feedback</p>
                </div>
                <button 
                    type="button"
                    onclick="toggleReviewForm()" 
                    class="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition">
                    <i class="fas fa-pen-to-square"></i>
                    <span>Write a Review / ریویو دیں</span>
                </button>
            </div>

            <!-- Review Submission Form (Expandable) -->
            <div id="modal-review-form" class="hidden mb-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <h4 class="text-xs font-black uppercase text-amber-950 tracking-wider mb-2.5">Apna Review Aur Rating Submit Karein</h4>
                <div class="space-y-3">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Your Rating (Star dein):</label>
                        <div id="review-star-selector" class="flex items-center gap-1.5 text-amber-400">
                            ${[1, 2, 3, 4, 5].map(i => `
                                <button type="button" onclick="setReviewModalRating(${i})" class="text-xl text-amber-400 hover:scale-120 transition">
                                    <i class="fas fa-star"></i>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                            <label class="block text-[11px] font-bold text-slate-700 mb-1">Your Name *</label>
                            <input 
                                type="text" 
                                id="new-review-name" 
                                value="${activeCustomer ? activeCustomer.name : ''}"
                                placeholder="Pura naam" 
                                class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-amber-400"
                            />
                        </div>
                        <div>
                            <label class="block text-[11px] font-bold text-slate-700 mb-1">City / Shehar</label>
                            <input 
                                type="text" 
                                id="new-review-city" 
                                value="${activeCustomer && activeCustomer.city ? activeCustomer.city : ''}"
                                placeholder="e.g. Lahore, Karachi" 
                                class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-amber-400"
                            />
                        </div>
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold text-slate-700 mb-1">Your Review / Comments *</label>
                        <textarea 
                            id="new-review-comment" 
                            rows="2" 
                            placeholder="Toy ki quality, packaging aur delivery ke baare mein apna tajarba batayein..." 
                            class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-amber-400"></textarea>
                    </div>
                    <div class="flex justify-end gap-2">
                        <button 
                            type="button" 
                            onclick="toggleReviewForm(false)" 
                            class="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-100">
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            onclick="submitProductReview(${prod.id})" 
                            class="px-4 py-1.5 bg-amber-400 hover:bg-amber-500 font-black text-slate-950 text-xs rounded-xl shadow-xs transition">
                            Submit Review ⭐
                        </button>
                    </div>
                </div>
            </div>

            <!-- Reviews List Grid -->
            <div class="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                ${reviews.length === 0 ? `
                    <p class="text-xs text-slate-400 text-center py-4">Abhi tak koi review nahi hai. Pehle reviewer banein!</p>
                ` : reviews.map(r => `
                    <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span class="w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-black text-[10px] flex items-center justify-center">
                                    ${(r.author || 'C').charAt(0).toUpperCase()}
                                </span>
                                <span class="font-extrabold text-xs text-slate-800">${r.author}</span>
                                ${r.city ? `<span class="text-[10px] text-slate-400">(${r.city})</span>` : ''}
                                ${r.verified ? `<span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5"><i class="fas fa-check-circle text-[9px]"></i> Verified Buyer</span>` : ''}
                            </div>
                            <span class="text-[10px] text-slate-400">${r.date || 'Recent'}</span>
                        </div>
                        <div class="flex items-center gap-1 text-amber-400 text-xs">
                            ${'<i class="fas fa-star"></i>'.repeat(Math.min(5, Math.floor(r.rating || 5)))}
                        </div>
                        <p class="text-xs text-slate-600 font-medium leading-relaxed">${r.comment}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('product-modal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function closeModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    // Stop YouTube audio from continuing to play
    const modalContent = document.getElementById('modal-product-content');
    if (modalContent) modalContent.innerHTML = '';
}

function buyNowDirect(productId) {
    const prod = PRODUCTS.find(p => p.id === productId);
    if (!prod) return;

    const existingIndex = cart.findIndex(item => item.id === productId);
    if (existingIndex === -1) {
        cart.push({
            id: prod.id,
            name: prod.name,
            price: prod.price,
            image: prod.image,
            quantity: 1
        });
        saveCart();
        updateCartUI();
    }

    openCheckoutModal();
}

// ----------------------------------------------------------------
// SHOPPING BASKET (CART)
// ----------------------------------------------------------------
function addToCart(productId) {
    const prod = PRODUCTS.find(p => p.id === productId);
    if (!prod) return;

    const existingIndex = cart.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: prod.id,
            name: prod.name,
            price: prod.price,
            image: prod.image,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showToast(`🎉 "${prod.name}" basket mein add ho gaya!`);
}

function updateQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
    }

    saveCart();
    updateCartUI();
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCart();
    updateCartUI();
    showToast("Item basket se nikaal diya gaya");
}

function saveCart() {
    localStorage.setItem('mehar_toys_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const config = getStoreConfig();
    const cartCountBadges = document.querySelectorAll('.cart-count-badge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCountBadges.forEach(badge => {
        badge.textContent = totalItems;
        if (totalItems > 0) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    });

    const itemsContainer = document.getElementById('cart-items-container');
    const emptyMsg = document.getElementById('cart-empty-message');
    const footer = document.getElementById('cart-footer');

    if (!itemsContainer) return;

    if (cart.length === 0) {
        itemsContainer.innerHTML = '';
        if (emptyMsg) emptyMsg.classList.remove('hidden');
        if (footer) footer.classList.add('hidden');
        return;
    }

    if (emptyMsg) emptyMsg.classList.add('hidden');
    if (footer) footer.classList.remove('hidden');

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= config.freeDeliveryThreshold ? 0 : config.deliveryCharges;

    itemsContainer.innerHTML = cart.map(item => `
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-xl object-cover bg-white" />
            <div class="flex-1 min-w-0">
                <h4 class="text-xs font-semibold text-gray-800 truncate">${item.name}</h4>
                <div class="text-xs font-bold text-red-600 mt-0.5">${config.currency} ${item.price.toLocaleString()}</div>
                
                <div class="flex items-center gap-2 mt-2">
                    <button onclick="updateQuantity(${item.id}, -1)" class="w-6 h-6 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold flex items-center justify-center text-xs">-</button>
                    <span class="text-xs font-bold px-1">${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)" class="w-6 h-6 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold flex items-center justify-center text-xs">+</button>
                </div>
            </div>
            <div class="text-right">
                <div class="text-xs font-bold text-gray-900">${config.currency} ${(item.price * item.quantity).toLocaleString()}</div>
                <button onclick="removeFromCart(${item.id})" class="text-gray-400 hover:text-red-500 text-xs mt-2 transition-colors">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    let discount = 0;
    if (window.appliedCoupon && typeof validateCoupon === 'function') {
        const valRes = validateCoupon(window.appliedCoupon.code, subtotal, shipping);
        if (valRes.valid) {
            discount = valRes.discount;
            window.appliedCoupon.discount = discount;
        } else {
            window.appliedCoupon = null;
        }
    }

    const grandTotal = Math.max(0, subtotal + shipping - discount);

    document.getElementById('cart-subtotal').textContent = `${config.currency} ${subtotal.toLocaleString()}`;
    document.getElementById('cart-shipping').textContent = shipping === 0 ? "FREE" : `${config.currency} ${shipping.toLocaleString()}`;
    
    const couponLine = document.getElementById('cart-coupon-line');
    if (couponLine) {
        if (discount > 0 && window.appliedCoupon) {
            couponLine.classList.remove('hidden');
            const codeEl = document.getElementById('cart-coupon-code');
            const discEl = document.getElementById('cart-coupon-discount');
            if (codeEl) codeEl.textContent = window.appliedCoupon.code;
            if (discEl) discEl.textContent = `-${config.currency} ${discount.toLocaleString()}`;
        } else {
            couponLine.classList.add('hidden');
        }
    }

    document.getElementById('cart-grand-total').textContent = `${config.currency} ${grandTotal.toLocaleString()}`;

    const deliveryNote = document.getElementById('cart-free-delivery-note');
    if (deliveryNote) {
        if (shipping === 0) {
            deliveryNote.innerHTML = `<span class="text-emerald-600 font-bold"><i class="fas fa-gift mr-1"></i> You unlocked FREE Delivery!</span>`;
        } else {
            const remaining = config.freeDeliveryThreshold - subtotal;
            deliveryNote.innerHTML = `Add <span class="font-bold text-red-500">${config.currency} ${remaining.toLocaleString()}</span> more for <span class="font-bold text-emerald-600">FREE Delivery</span>!`;
        }
    }
}

function toggleCartDrawer(open = true) {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    const panel = document.getElementById('cart-panel');

    if (open) {
        drawer.classList.remove('hidden');
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            panel.classList.remove('translate-x-full');
        }, 10);
        document.body.classList.add('overflow-hidden');
    } else {
        overlay.classList.add('opacity-0');
        panel.classList.add('translate-x-full');
        setTimeout(() => {
            drawer.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }, 300);
    }
}

// ----------------------------------------------------------------
// CHECKOUT & PAYMENT PROOF ATTACHMENT WITH PROMO COUPONS
// ----------------------------------------------------------------
window.appliedCoupon = null;

function renderCheckoutSummary() {
    const config = getStoreConfig();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= config.freeDeliveryThreshold ? 0 : config.deliveryCharges;
    
    let discount = 0;
    if (window.appliedCoupon && typeof validateCoupon === 'function') {
        const valRes = validateCoupon(window.appliedCoupon.code, subtotal, shipping);
        if (valRes.valid) {
            discount = valRes.discount;
            window.appliedCoupon.discount = discount;
        } else {
            window.appliedCoupon = null;
        }
    }

    const grandTotal = Math.max(0, subtotal + shipping - discount);

    const summaryEl = document.getElementById('checkout-order-summary');
    if (summaryEl) {
        summaryEl.innerHTML = `
            <div class="bg-amber-50/90 p-3.5 rounded-2xl border border-amber-200 text-xs space-y-1.5 mb-3 shadow-2xs">
                <div class="flex justify-between text-gray-700">
                    <span>Items Total (${cart.length}):</span> 
                    <span class="font-bold">${config.currency} ${subtotal.toLocaleString()}</span>
                </div>
                <div class="flex justify-between text-gray-700">
                    <span>Delivery Charges:</span> 
                    <span class="font-bold ${shipping === 0 ? 'text-emerald-600' : ''}">${shipping === 0 ? 'FREE' : config.currency + ' ' + shipping}</span>
                </div>
                ${discount > 0 && window.appliedCoupon ? `
                    <div class="flex justify-between text-emerald-800 font-extrabold bg-emerald-100/80 p-2 rounded-xl border border-emerald-300">
                        <span class="flex items-center gap-1.5">
                            <i class="fas fa-ticket text-emerald-600"></i>
                            <span>Voucher Applied (${window.appliedCoupon.code})</span>
                        </span>
                        <span>-${config.currency} ${discount.toLocaleString()}</span>
                    </div>
                ` : ''}
                <div class="flex justify-between font-extrabold text-sm text-red-600 pt-2 border-t border-amber-200">
                    <span>Total Amount Payable:</span> 
                    <span>${config.currency} ${grandTotal.toLocaleString()}</span>
                </div>
            </div>
        `;
    }
}

function handleApplyCouponClick() {
    const input = document.getElementById('checkout-coupon-input');
    const msgEl = document.getElementById('checkout-coupon-msg');
    const code = input ? input.value.trim() : '';

    if (!code) {
        if (msgEl) {
            msgEl.textContent = "Barah-e-karam coupon code enter karein!";
            msgEl.className = "text-[11px] mt-2 font-bold text-red-600 block";
        }
        return;
    }

    const config = getStoreConfig();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= config.freeDeliveryThreshold ? 0 : config.deliveryCharges;

    if (typeof validateCoupon !== 'function') return;

    const res = validateCoupon(code, subtotal, shipping);
    if (!res.valid) {
        if (msgEl) {
            msgEl.textContent = res.message;
            msgEl.className = "text-[11px] mt-2 font-bold text-red-600 block";
        }
        return;
    }

    window.appliedCoupon = {
        code: res.code,
        discount: res.discount,
        description: res.description
    };

    if (msgEl) {
        msgEl.innerHTML = `<span class="text-emerald-700 font-extrabold flex items-center gap-1"><i class="fas fa-check-circle text-emerald-600"></i> ${res.message}</span> <button type="button" onclick="removeAppliedCoupon()" class="text-red-500 hover:text-red-700 text-[10px] ml-2 underline font-bold">Remove</button>`;
        msgEl.className = "text-[11px] mt-2 block";
    }

    renderCheckoutSummary();
    updateCartUI();
    showToast(`🎉 Coupon "${res.code}" lag gaya! Saved Rs. ${res.discount.toLocaleString()}`);
}

function removeAppliedCoupon() {
    window.appliedCoupon = null;
    const input = document.getElementById('checkout-coupon-input');
    if (input) input.value = '';
    const msgEl = document.getElementById('checkout-coupon-msg');
    if (msgEl) {
        msgEl.textContent = "Coupon removed.";
        msgEl.className = "text-[11px] mt-2 font-bold text-slate-500 block";
        setTimeout(() => msgEl.classList.add('hidden'), 2000);
    }
    renderCheckoutSummary();
    updateCartUI();
}

function openCheckoutModal() {
    if (cart.length === 0) {
        showToast("Aapka basket empty hai! Pehle koi toy add karein.");
        return;
    }
    toggleCartDrawer(false);

    renderCheckoutSummary();

    const msgEl = document.getElementById('checkout-coupon-msg');
    const input = document.getElementById('checkout-coupon-input');
    if (window.appliedCoupon) {
        if (input) input.value = window.appliedCoupon.code;
        if (msgEl) {
            msgEl.innerHTML = `<span class="text-emerald-700 font-extrabold flex items-center gap-1"><i class="fas fa-check-circle text-emerald-600"></i> Coupon "${window.appliedCoupon.code}" Active (Saved Rs. ${window.appliedCoupon.discount.toLocaleString()})</span> <button type="button" onclick="removeAppliedCoupon()" class="text-red-500 hover:text-red-700 text-[10px] ml-2 underline font-bold">Remove</button>`;
            msgEl.className = "text-[11px] mt-2 block";
        }
    } else {
        if (input) input.value = '';
        if (msgEl) msgEl.classList.add('hidden');
    }

    // Auto-fill customer details if logged in
    const activeCustomer = getActiveCustomer();
    if (activeCustomer) {
        if (document.getElementById('cust-name')) document.getElementById('cust-name').value = activeCustomer.name || '';
        if (document.getElementById('cust-phone')) document.getElementById('cust-phone').value = activeCustomer.phone || '';
        if (document.getElementById('cust-city')) document.getElementById('cust-city').value = activeCustomer.city || '';
        if (document.getElementById('cust-address')) document.getElementById('cust-address').value = activeCustomer.address || '';
    }

    document.getElementById('checkout-modal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

function togglePaymentDetails(method) {
    const detailsBox = document.getElementById('online-payment-details');
    if (!detailsBox) return;

    if (method === 'JazzCash / Easypaisa') {
        detailsBox.classList.remove('hidden');
    } else {
        detailsBox.classList.add('hidden');
    }
}

function copyPaymentNumber(num) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(num).then(() => {
            const btn = document.getElementById('copy-btn-text');
            if (btn) {
                const old = btn.textContent;
                btn.textContent = 'Copied! ✅';
                setTimeout(() => { btn.textContent = old; }, 2000);
            }
        });
    } else {
        alert("Number copied: " + num);
    }
}

// Payment Slip Upload & Preview with compression
function handlePaymentSlipSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            // Compress image to ensure localStorage doesn't overflow
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
            canvas.height = (img.width > MAX_WIDTH) ? (img.height * scaleSize) : img.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            paymentSlipBase64 = canvas.toDataURL('image/jpeg', 0.7);

            // Show preview
            const previewBox = document.getElementById('slip-preview-box');
            const previewImg = document.getElementById('slip-preview-img');
            if (previewBox && previewImg) {
                previewImg.src = paymentSlipBase64;
                previewBox.classList.remove('hidden');
            }
            showToast("Payment screenshot attach ho gaya! ✅");
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function removePaymentSlip() {
    paymentSlipBase64 = null;
    const previewBox = document.getElementById('slip-preview-box');
    const input = document.getElementById('cust-payment-slip');
    if (previewBox) previewBox.classList.add('hidden');
    if (input) input.value = '';
    showToast("Attached receipt removed");
}

// Handle Order Submission
function handleCheckoutSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const city = document.getElementById('cust-city').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value || 'Cash on Delivery (COD)';
    const notes = document.getElementById('cust-notes').value.trim();

    if (!name || !phone || !address || !city) {
        alert("Please fill all required delivery details (Name, Phone, City, Address)!");
        return;
    }

    let trxId = '';
    if (paymentMethod === 'JazzCash / Easypaisa') {
        trxId = document.getElementById('cust-trx') ? document.getElementById('cust-trx').value.trim() : '';
        if (!trxId && !paymentSlipBase64) {
            alert("JazzCash / Easypaisa se amount transfer karne ke baad Transaction ID (TID) enter karein ya payment screenshot attach karein!");
            return;
        }
    }

    const config = getStoreConfig();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= config.freeDeliveryThreshold ? 0 : config.deliveryCharges;

    let discountAmount = 0;
    let couponCode = null;
    if (window.appliedCoupon && typeof validateCoupon === 'function') {
        const valRes = validateCoupon(window.appliedCoupon.code, subtotal, shipping);
        if (valRes.valid) {
            discountAmount = valRes.discount;
            couponCode = valRes.code;
        }
    }

    const grandTotal = Math.max(0, subtotal + shipping - discountAmount);

    const orderId = 'MT-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date();
    const orderDate = now.toLocaleString('en-PK', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    const activeCustomer = getActiveCustomer();

    const isCOD = paymentMethod.includes('COD') || paymentMethod.includes('Cash on Delivery');
    const isPaid = !isCOD;
    const paymentStatus = isPaid ? 'Paid' : 'Unpaid (COD)';

    const newOrder = {
        id: orderId,
        date: orderDate,
        timestamp: now.getTime(),
        customerId: activeCustomer ? activeCustomer.id : null,
        customer: {
            name,
            phone,
            city,
            address,
            notes
        },
        items: [...cart],
        subtotal,
        shipping,
        couponCode: couponCode || null,
        discountAmount: discountAmount || 0,
        grandTotal,
        paymentMethod,
        paymentStatus,
        isPaid,
        trxId: trxId || null,
        paymentSlip: paymentSlipBase64 || null,
        status: 'Pending' // Pending, Dispatched, Delivered, Cancelled
    };

    // Save to orders array in localStorage
    let orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    orders.unshift(newOrder);
    localStorage.setItem('mehar_toys_orders', JSON.stringify(orders));

    // Save to Supabase Cloud Database if configured
    if (typeof cloudSaveOrder === 'function') {
        cloudSaveOrder(newOrder).catch(e => console.warn("Cloud save notice:", e));
    }

    // Clear cart, slip, and applied coupon
    cart = [];
    window.appliedCoupon = null;
    paymentSlipBase64 = null;
    const previewBox = document.getElementById('slip-preview-box');
    if (previewBox) previewBox.classList.add('hidden');
    const slipInput = document.getElementById('cust-payment-slip');
    if (slipInput) slipInput.value = '';

    saveCart();
    updateCartUI();
    closeCheckoutModal();

    // Show Success Modal
    showOrderSuccessModal(newOrder);
}

// ----------------------------------------------------------------
// STRICT 1-PAGE PRINT RECEIPT LOGIC
// ----------------------------------------------------------------
function printSinglePageReceipt(order) {
    const config = getStoreConfig();
    const printContainer = document.getElementById('print-receipt-container');
    if (!printContainer) return;

    const isPaid = isOrderPaid(order);

    printContainer.innerHTML = `
        <div style="border: 2px solid #2B2D42; border-radius: 12px; padding: 20px; max-width: 750px; margin: 0 auto; background: #fff; font-family: Arial, sans-serif; font-size: 12px; color: #2B2D42;">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #FF6B6B; padding-bottom: 12px; margin-bottom: 12px;">
                <div>
                    <h1 style="margin: 0; font-size: 24px; color: #FF6B6B; font-weight: 900; letter-spacing: -0.5px;">🧸 ${config.storeName}</h1>
                    <div style="font-size: 11px; color: #666; margin-top: 3px;">${config.tagline}</div>
                    <div style="font-size: 11px; color: #444;">${config.address} | Phone: ${config.displayPhone}</div>
                </div>
                <div style="text-align: right;">
                    <div style="background: ${isPaid ? '#e6fcf5' : '#fff3bf'}; color: ${isPaid ? '#0ca678' : '#d9480f'}; font-weight: bold; padding: 4px 10px; border-radius: 20px; display: inline-block; font-size: 11px; border: 1px solid ${isPaid ? '#b2f2bb' : '#ffe066'};">
                        ${isPaid ? '✅ PRE-PAID INVOICE' : '💵 COD INVOICE'}
                    </div>
                    <div style="font-size: 14px; font-weight: bold; margin-top: 5px; color: #d90429;">Order #${order.id}</div>
                    <div style="font-size: 10px; color: #777;">Date: ${order.date}</div>
                </div>
            </div>

            <!-- PAYMENT STATUS HIGHLIGHT BANNER FOR COURIER RIDER & CUSTOMER -->
            ${isPaid ? `
                <div style="background: #e8f5e9; border: 2px dashed #2e7d32; color: #1b5e20; border-radius: 8px; padding: 12px; margin-bottom: 15px; text-align: center;">
                    <div style="font-size: 12px; font-weight: bold; text-transform: uppercase;">
                        ✅ PRE-PAID PARCEL — CUSTOMER HAS ALREADY PAID ONLINE
                    </div>
                    <div style="font-size: 11px; color: #2e7d32; margin-top: 2px;">
                        Payment verified via ${order.paymentMethod} ${order.trxId ? `(TID: ${order.trxId})` : ''}
                    </div>
                    <div style="font-size: 19px; font-weight: 900; color: #1b5e20; margin-top: 5px; letter-spacing: 0.5px;">
                        CASH TO COLLECT: RS. 0 (DO NOT COLLECT ANY CASH!)
                    </div>
                </div>
            ` : `
                <div style="background: #fff7ed; border: 2px solid #ea580c; color: #9a3412; border-radius: 8px; padding: 12px; margin-bottom: 15px; text-align: center;">
                    <div style="font-size: 12px; font-weight: bold; text-transform: uppercase;">
                        💵 CASH ON DELIVERY (COD) PARCEL
                    </div>
                    <div style="font-size: 11px; color: #c2410c; margin-top: 2px;">
                        Courier / Rider: Please collect exact cash from customer upon delivery
                    </div>
                    <div style="font-size: 21px; font-weight: 900; color: #dc2626; margin-top: 5px; letter-spacing: 0.5px;">
                        CASH TO COLLECT: ${config.currency} ${order.grandTotal.toLocaleString()}
                    </div>
                </div>
            `}

            <!-- Customer & Shipping Box -->
            <div style="display: flex; gap: 15px; margin-bottom: 15px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 10px;">
                <div style="flex: 1;">
                    <strong style="color: #495057; font-size: 11px; text-transform: uppercase;">Customer Information:</strong>
                    <div style="font-weight: bold; font-size: 13px; margin-top: 2px;">${order.customer.name}</div>
                    <div>Phone: <strong>${order.customer.phone}</strong></div>
                    <div>City: <strong>${order.customer.city}</strong></div>
                </div>
                <div style="flex: 1.2;">
                    <strong style="color: #495057; font-size: 11px; text-transform: uppercase;">Shipping Address:</strong>
                    <div style="margin-top: 2px;">${order.customer.address}</div>
                    <div style="margin-top: 4px;">Payment Mode: <strong style="color: ${isPaid ? '#0ca678' : '#e65100'};">${order.paymentMethod}</strong></div>
                    ${order.trxId ? `<div>Sender / TID: <strong style="color: #7048e8;">${order.trxId}</strong></div>` : ''}
                    ${order.customer.notes ? `<div style="font-style: italic; color: #666;">Note: ${order.customer.notes}</div>` : ''}
                </div>
            </div>

            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                <thead>
                    <tr style="background: #FFF3BF; color: #2B2D42; text-align: left; font-size: 11px;">
                        <th style="padding: 6px 8px; border: 1px solid #dee2e6;">Sr.</th>
                        <th style="padding: 6px 8px; border: 1px solid #dee2e6;">Toy Description</th>
                        <th style="padding: 6px 8px; border: 1px solid #dee2e6; text-align: center;">Qty</th>
                        <th style="padding: 6px 8px; border: 1px solid #dee2e6; text-align: right;">Unit Price</th>
                        <th style="padding: 6px 8px; border: 1px solid #dee2e6; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map((item, idx) => `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 6px 8px; border: 1px solid #dee2e6; text-align: center;">${idx + 1}</td>
                            <td style="padding: 6px 8px; border: 1px solid #dee2e6; font-weight: bold;">${item.name}</td>
                            <td style="padding: 6px 8px; border: 1px solid #dee2e6; text-align: center;">${item.quantity}</td>
                            <td style="padding: 6px 8px; border: 1px solid #dee2e6; text-align: right;">${config.currency} ${item.price.toLocaleString()}</td>
                            <td style="padding: 6px 8px; border: 1px solid #dee2e6; text-align: right; font-weight: bold;">${config.currency} ${(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <!-- Totals Box -->
            <div style="display: flex; justify-content: flex-end; margin-bottom: 15px;">
                <div style="width: 270px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 10px; font-size: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span>Subtotal:</span>
                        <span>${config.currency} ${order.subtotal.toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span>Delivery Fee:</span>
                        <span>${order.shipping === 0 ? 'FREE' : config.currency + ' ' + order.shipping}</span>
                    </div>
                    ${order.couponCode ? `
                        <div style="display: flex; justify-content: space-between; color: #0ca678; font-weight: bold; margin-bottom: 4px;">
                            <span>Voucher (${order.couponCode}):</span>
                            <span>-${config.currency} ${(order.discountAmount || 0).toLocaleString()}</span>
                        </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px; border-top: 1px solid #eee; padding-top: 4px;">
                        <span>Total Order Value:</span>
                        <span>${config.currency} ${order.grandTotal.toLocaleString()}</span>
                    </div>
                    ${isPaid ? `
                        <div style="display: flex; justify-content: space-between; color: #0ca678; font-weight: bold; margin-bottom: 4px;">
                            <span>Payment Received:</span>
                            <span>${config.currency} ${order.grandTotal.toLocaleString()}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 14px; color: #0ca678; border-top: 2px solid #b2f2bb; padding: 6px; margin-top: 5px; background: #e6fcf5; border-radius: 6px;">
                            <span>Cash to Collect:</span>
                            <span>RS. 0 (PAID)</span>
                        </div>
                    ` : `
                        <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 14px; color: #d90429; border-top: 2px solid #ffc9c9; padding: 6px; margin-top: 5px; background: #fff5f5; border-radius: 6px;">
                            <span>Cash to Collect (COD):</span>
                            <span>${config.currency} ${order.grandTotal.toLocaleString()}</span>
                        </div>
                    `}
                </div>
            </div>

            <!-- Footer Note -->
            <div style="border-top: 1px dashed #ccc; padding-top: 8px; text-align: center; font-size: 10px; color: #666;">
                Thank you for shopping at <strong>${config.storeName}</strong>! For questions or order updates, call <strong>${config.displayPhone}</strong>.<br>
                <em>This invoice was generated automatically and serves as a valid proof of purchase.</em>
            </div>
        </div>
    `;

    // Trigger Print
    window.print();
}

function copyOrderReceiptText(order) {
    if (!order) return;
    const config = getStoreConfig();
    const isPaid = isOrderPaid(order);
    const itemsText = (order.items || []).map(i => `• ${i.name} (x${i.quantity}) - Rs. ${(i.price * i.quantity).toLocaleString()}`).join('\n');
    const fullText = 
`MEHAR TOYS - Order #${order.id}
Customer: ${order.customer.name}
Phone: ${order.customer.phone}
Address: ${order.customer.address}, ${order.customer.city}
Items:
${itemsText}
Subtotal: Rs. ${order.subtotal.toLocaleString()}
Delivery: ${order.shipping === 0 ? 'FREE' : 'Rs. ' + order.shipping}
${order.couponCode ? `Voucher (${order.couponCode}): -Rs. ${order.discountAmount.toLocaleString()}\n` : ''}Total: Rs. ${order.grandTotal.toLocaleString()}
Payment: ${order.paymentMethod} (${isPaid ? 'PAID' : 'COD'})`;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(fullText).then(() => {
            const btn = document.getElementById('copy-order-btn-text');
            if (btn) {
                const old = btn.textContent;
                btn.textContent = 'Copied! ✅';
                setTimeout(() => { btn.textContent = old; }, 2000);
            }
        });
    } else {
        alert("Order text copied!");
    }
}

// Show Order Confirmation on Website with WhatsApp Instant Notification
function showOrderSuccessModal(order) {
    const config = getStoreConfig();
    const modal = document.getElementById('order-success-modal');
    const content = document.getElementById('order-success-content');

    if (!modal || !content) return;

    window.lastPlacedOrder = order;
    const isPaid = isOrderPaid(order);
    const waOrderUrl = typeof generateWhatsAppOrderUrl === 'function' ? generateWhatsAppOrderUrl(order, config) : `https://wa.me/923228482860`;

    content.innerHTML = `
        <div class="text-center">
            <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-3 shadow-inner animate-bounce-slow">
                <i class="fas fa-check"></i>
            </div>
            
            <span class="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Order Received Successfully!
            </span>

            <h3 class="text-2xl font-black text-gray-900 mt-2 mb-1">Shukriya, ${order.customer.name}!</h3>
            <p class="text-xs text-gray-500 mb-4">Aapka order website par receive ho gaya hai aur packaging ke liye ready hai.</p>

            <!-- WHATSAPP DIRECT ORDER ALERT BUTTON -->
            <div class="mb-5 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-left shadow-sm">
                <div class="flex items-center gap-2.5 mb-2.5">
                    <div class="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg shadow-sm shrink-0">
                        <i class="fab fa-whatsapp"></i>
                    </div>
                    <div>
                        <div class="text-xs font-black text-emerald-950">WhatsApp Par Order Details Send Karein</div>
                        <div class="text-[11px] text-emerald-700">Immediate dispatch confirmation ke liye yeh receipt Mehar Toys WhatsApp par foran bhej dein.</div>
                    </div>
                </div>
                <div class="flex flex-col sm:flex-row gap-2">
                    <a 
                        href="${waOrderUrl}" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all">
                        <i class="fab fa-whatsapp text-lg"></i>
                        <span>Send Order to WhatsApp (واٹس ایپ پر بھیجیں)</span>
                    </a>
                    <button 
                        type="button" 
                        onclick="copyOrderReceiptText(window.lastPlacedOrder)" 
                        class="py-3 px-3.5 bg-white hover:bg-emerald-100/70 border border-emerald-300 text-emerald-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition">
                        <i class="fas fa-copy"></i>
                        <span id="copy-order-btn-text">Copy Receipt</span>
                    </button>
                </div>
            </div>

            <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-left text-xs space-y-2 mb-5">
                <div class="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span class="text-gray-500 font-semibold">Order ID:</span>
                    <span class="font-black text-base text-red-600 tracking-wide">#${order.id}</span>
                </div>
                <div class="flex justify-between"><span class="text-gray-500">Order Date:</span> <span class="font-semibold text-gray-800">${order.date}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Contact Phone:</span> <span class="font-semibold text-gray-800">${order.customer.phone}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">City / Delivery Address:</span> <span class="font-semibold text-gray-800 text-right">${order.customer.city} (${order.customer.address})</span></div>
                <div class="flex justify-between items-center"><span class="text-gray-500">Payment Option:</span> <span class="font-bold ${isPaid ? 'text-emerald-600' : 'text-amber-600'}">${order.paymentMethod}</span></div>
                ${order.trxId ? `<div class="flex justify-between"><span class="text-gray-500">Sender / TID:</span> <span class="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded text-[11px]">${order.trxId}</span></div>` : ''}
                ${order.paymentSlip ? `<div class="flex justify-between"><span class="text-gray-500">Payment Slip:</span> <span class="text-emerald-600 font-bold"><i class="fas fa-image mr-1"></i> Screenshot Attached</span></div>` : ''}

                <div class="pt-2 border-t border-gray-200">
                    <div class="font-bold text-gray-700 mb-1">Items Summary:</div>
                    <ul class="space-y-1">
                        ${order.items.map(item => `
                            <li class="flex justify-between text-gray-600">
                                <span>${item.name} (x${item.quantity})</span>
                                <span class="font-semibold">${config.currency} ${(item.price * item.quantity).toLocaleString()}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <div class="flex justify-between items-center pt-2 border-t border-gray-200 text-xs font-bold">
                    <span class="text-gray-600">Subtotal:</span>
                    <span class="text-gray-900">${config.currency} ${order.subtotal.toLocaleString()}</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                    <span class="text-gray-600">Delivery Fee:</span>
                    <span class="text-gray-900 font-semibold">${order.shipping === 0 ? 'FREE' : config.currency + ' ' + order.shipping}</span>
                </div>

                ${order.couponCode ? `
                    <div class="flex justify-between items-center text-emerald-700 font-extrabold bg-emerald-50 px-2 py-1 rounded-lg">
                        <span class="flex items-center gap-1"><i class="fas fa-ticket text-emerald-600"></i> Voucher (${order.couponCode}):</span>
                        <span>-${config.currency} ${(order.discountAmount || 0).toLocaleString()}</span>
                    </div>
                ` : ''}

                <div class="flex justify-between items-center pt-2 border-t border-gray-200 text-xs font-black">
                    <span class="text-gray-800 text-sm">Total Order Value:</span>
                    <span class="text-red-600 text-sm">${config.currency} ${order.grandTotal.toLocaleString()}</span>
                </div>

                <!-- Doorstep collection notice -->
                <div class="flex justify-between items-center p-2.5 rounded-xl ${isPaid ? 'bg-emerald-100/70 border border-emerald-300' : 'bg-amber-100/70 border border-amber-300'} font-extrabold text-xs">
                    <span class="${isPaid ? 'text-emerald-900' : 'text-amber-900'}">${isPaid ? 'Doorstep Cash Collection:' : 'Cash to Pay Upon Delivery:'}</span>
                    <span class="${isPaid ? 'text-emerald-800 text-sm font-black' : 'text-red-600 text-sm font-black'}">
                        ${isPaid ? 'RS. 0 (ALREADY PAID)' : `${config.currency} ${order.grandTotal.toLocaleString()}`}
                    </span>
                </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-2.5">
                <button onclick="printSinglePageReceipt(window.lastPlacedOrder)" class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md">
                    <i class="fas fa-print"></i>
                    <span>Print 1-Page Receipt</span>
                </button>
                <button onclick="closeSuccessModal()" class="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 active:scale-95 text-gray-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2">
                    <i class="fas fa-shopping-bag"></i>
                    <span>Continue Shopping</span>
                </button>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function closeSuccessModal() {
    document.getElementById('order-success-modal').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

// ----------------------------------------------------------------
// CUSTOMER LOGIN / SIGNUP & "MY ORDERS" SYSTEM
// ----------------------------------------------------------------
function getCustomers() {
    return JSON.parse(localStorage.getItem('mehar_toys_customers')) || [];
}

function saveCustomers(custs) {
    localStorage.setItem('mehar_toys_customers', JSON.stringify(custs));
}

function getActiveCustomer() {
    const saved = localStorage.getItem('mehar_toys_active_user');
    return saved ? JSON.parse(saved) : null;
}

// ----------------------------------------------------------------
// WISHLIST & FAVOURITES MANAGEMENT
// ----------------------------------------------------------------
function getWishlist() {
    return JSON.parse(localStorage.getItem('mehar_toys_wishlist')) || [];
}

function isItemWishlisted(prodId) {
    const list = getWishlist();
    return list.includes(Number(prodId));
}

function toggleWishlist(prodId, e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const id = Number(prodId);
    let list = getWishlist();
    const idx = list.indexOf(id);
    let added = false;
    if (idx > -1) {
        list.splice(idx, 1);
        added = false;
    } else {
        list.push(id);
        added = true;
    }
    localStorage.setItem('mehar_toys_wishlist', JSON.stringify(list));
    updateAuthUI();
    renderProducts();
    if (currentPortalTab === 'wishlist' || currentPortalTab === 'account') {
        renderPortalWishlist();
        renderPortalAccount();
    }
    showToast(added ? "Toy saved to your Wishlist ❤️" : "Toy removed from Wishlist");
}

// ----------------------------------------------------------------
// INITIALIZE CUSTOMER PORTAL & SEED MUHAMAD JAMEEL (SCREENSHOT MATCH)
// ----------------------------------------------------------------
function initCustomerPortal() {
    // Register store owner (Muhammad Jameel) in customers database so he can log in whenever he wants
    let allCusts = getCustomers();
    if (!allCusts.some(c => c.email === 'mrjameel008@gmail.com')) {
        allCusts.push({
            id: 'CUST-1000',
            name: 'Muhamad Jameel',
            email: 'mrjameel008@gmail.com',
            phone: '+923228482860',
            city: 'Lahore',
            province: 'Punjab',
            address: 'Main Market, Gulberg',
            password: 'jameel123',
            avatar: 'images/mj-logo.svg',
            status: 'active'
        });
        saveCustomers(allCusts);
    }

    // DO NOT force-login anyone! New visitors start as clean Guests.
    // If the visitor previously signed in, they remain signed in; otherwise active is null.

    // Initialize Wishlist if not set
    let wish = JSON.parse(localStorage.getItem('mehar_toys_wishlist'));
    if (!wish) {
        wish = [];
        localStorage.setItem('mehar_toys_wishlist', JSON.stringify(wish));
    }

    // Initialize Notifications
    let notifs = JSON.parse(localStorage.getItem('mehar_toys_notifications'));
    if (!notifs) {
        notifs = [
            { id: 1, title: '🎁 Welcome to Mehar Toys', message: 'Use voucher WELCOME10 for 10% OFF on all creative toys.', time: 'Just now', read: true, icon: 'fa-gift' }
        ];
        localStorage.setItem('mehar_toys_notifications', JSON.stringify(notifs));
    }
}

// ----------------------------------------------------------------
// AUTH UI & HEADER STATUS UPDATE
// ----------------------------------------------------------------
function updateAuthUI() {
    const customer = getActiveCustomer();
    const guestArea = document.getElementById('auth-guest-area');
    const userMenuContainer = document.getElementById('user-menu-container');
    const dropdownName = document.getElementById('dropdown-user-name');
    const dropdownEmail = document.getElementById('dropdown-user-email');
    const headerAvatarImg = document.getElementById('header-avatar-img');
    const dropdownAvatarImg = document.getElementById('dropdown-avatar-img');
    const headerWishlistBadge = document.getElementById('header-wishlist-badge');
    const dropdownWishlistCount = document.getElementById('dropdown-wishlist-count');
    const headerNotifBadge = document.getElementById('header-notif-badge');
    const dropdownNotifCount = document.getElementById('dropdown-notif-count');
    const portalTopWishlistBadge = document.getElementById('portal-top-wishlist-badge');
    const portalTopNotifBadge = document.getElementById('portal-top-notif-badge');

    // Bottom Navigation Elements (Mobile & Tablet)
    const bottomAvatarImg = document.getElementById('bottom-avatar-img');
    const bottomGuestIcon = document.getElementById('bottom-guest-icon');
    const bottomAccountText = document.getElementById('bottom-account-text');
    const bottomWishlistBadge = document.getElementById('bottom-wishlist-badge');
    const bottomNotifBadge = document.getElementById('bottom-notif-badge');

    const wishlist = getWishlist();
    const notifs = JSON.parse(localStorage.getItem('mehar_toys_notifications')) || [];
    const unreadNotifs = notifs.filter(n => !n.read).length || 0;

    if (headerWishlistBadge) {
        headerWishlistBadge.textContent = wishlist.length;
        headerWishlistBadge.classList.toggle('hidden', wishlist.length === 0);
    }
    if (dropdownWishlistCount) dropdownWishlistCount.textContent = wishlist.length;
    if (portalTopWishlistBadge) {
        portalTopWishlistBadge.textContent = wishlist.length;
        portalTopWishlistBadge.classList.toggle('hidden', wishlist.length === 0);
    }
    if (bottomWishlistBadge) {
        bottomWishlistBadge.textContent = wishlist.length;
        bottomWishlistBadge.classList.toggle('hidden', wishlist.length === 0);
    }

    const sidebarWishlistCount = document.getElementById('sidebar-wishlist-count');
    const wishlistTabCount = document.getElementById('wishlist-tab-count');
    if (sidebarWishlistCount) sidebarWishlistCount.textContent = wishlist.length;
    if (wishlistTabCount) wishlistTabCount.textContent = wishlist.length;

    if (headerNotifBadge) {
        headerNotifBadge.textContent = unreadNotifs;
        headerNotifBadge.classList.toggle('hidden', unreadNotifs === 0);
    }
    if (bottomNotifBadge) {
        bottomNotifBadge.textContent = unreadNotifs;
        bottomNotifBadge.classList.toggle('hidden', unreadNotifs === 0);
    }
    if (dropdownNotifCount) dropdownNotifCount.textContent = unreadNotifs;
    if (portalTopNotifBadge) {
        portalTopNotifBadge.textContent = unreadNotifs;
        portalTopNotifBadge.classList.toggle('hidden', unreadNotifs === 0);
    }
    const sidebarNotifCount = document.getElementById('sidebar-notif-count');
    if (sidebarNotifCount) sidebarNotifCount.textContent = unreadNotifs;

    if (customer) {
        if (guestArea) guestArea.classList.add('hidden');
        if (userMenuContainer) userMenuContainer.classList.remove('hidden');
        if (dropdownName) dropdownName.textContent = customer.name;
        if (dropdownEmail) dropdownEmail.textContent = customer.email || '';
        
        const avatarSrc = customer.avatar || 'images/mj-logo.svg';
        if (headerAvatarImg) headerAvatarImg.src = avatarSrc;
        if (dropdownAvatarImg) dropdownAvatarImg.src = avatarSrc;

        if (bottomAvatarImg) {
            bottomAvatarImg.src = avatarSrc;
            bottomAvatarImg.classList.remove('hidden');
        }
        if (bottomGuestIcon) bottomGuestIcon.classList.add('hidden');
        if (bottomAccountText) bottomAccountText.textContent = (customer.name || 'Account').split(' ')[0];

        const portalSideAvatar = document.getElementById('portal-sidebar-avatar');
        if (portalSideAvatar) portalSideAvatar.src = avatarSrc;

        const portalAccAvatar = document.getElementById('portal-account-avatar');
        if (portalAccAvatar) portalAccAvatar.src = avatarSrc;

        const portalTopAvatar = document.getElementById('portal-top-avatar');
        if (portalTopAvatar) portalTopAvatar.src = avatarSrc;

        const settingPreview = document.getElementById('setting-avatar-preview');
        if (settingPreview) settingPreview.src = avatarSrc;

        const quickPreview = document.getElementById('quick-modal-avatar-preview');
        if (quickPreview) quickPreview.src = avatarSrc;
    } else {
        if (guestArea) guestArea.classList.remove('hidden');
        if (userMenuContainer) userMenuContainer.classList.add('hidden');

        if (bottomAvatarImg) bottomAvatarImg.classList.add('hidden');
        if (bottomGuestIcon) bottomGuestIcon.classList.remove('hidden');
        if (bottomAccountText) bottomAccountText.textContent = 'Sign In';
    }
}

function handleMobileAccountClick() {
    const cust = getActiveCustomer();
    if (cust) {
        openCustomerPortal('account');
    } else {
        openAuthModal('login');
    }
}

// ----------------------------------------------------------------
// USER DROPDOWN TOGGLE (MATCHING IMAGE 2)
// ----------------------------------------------------------------
function toggleUserDropdown(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('user-dropdown-menu');
    if (!dropdown) return;
    dropdown.classList.toggle('hidden');
}

function closeUserDropdown() {
    const dropdown = document.getElementById('user-dropdown-menu');
    if (dropdown) dropdown.classList.add('hidden');
}

// ----------------------------------------------------------------
// CUSTOMER PORTAL (EXACT MATCH TO IMAGE 1 & 2)
// ----------------------------------------------------------------
let currentPortalTab = 'account';

function openCustomerPortal(tab = 'account') {
    const customer = getActiveCustomer();
    if (!customer) {
        openAuthModal('login');
        return;
    }

    const modal = document.getElementById('customer-portal-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    switchPortalTab(tab);
}

function closeCustomerPortal() {
    const modal = document.getElementById('customer-portal-modal');
    if (modal) modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

function switchPortalTab(tab) {
    currentPortalTab = tab;
    const panes = ['account', 'settings', 'orders', 'wishlist', 'addresses', 'notifications'];
    
    panes.forEach(p => {
        const pane = document.getElementById(`portal-pane-${p}`);
        const navBtn = document.getElementById(`portal-nav-${p}`);
        if (pane) {
            if (p === tab) {
                pane.classList.remove('hidden');
            } else {
                pane.classList.add('hidden');
            }
        }
        if (navBtn) {
            if (p === tab) {
                navBtn.className = "portal-nav-btn w-full px-4 py-3 rounded-2xl transition flex items-center justify-between text-left bg-slate-900 text-white shadow-xs font-bold";
            } else {
                navBtn.className = "portal-nav-btn w-full px-4 py-3 rounded-2xl transition flex items-center justify-between text-left text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold";
            }
        }
    });

    if (tab === 'account') renderPortalAccount();
    if (tab === 'orders') renderPortalOrders();
    if (tab === 'wishlist') renderPortalWishlist();
    if (tab === 'addresses') renderPortalAddresses();
    if (tab === 'notifications') renderPortalNotifications();
    if (tab === 'settings') {
        const cust = getActiveCustomer();
        if (cust) {
            if (document.getElementById('setting-name')) document.getElementById('setting-name').value = cust.name || '';
            if (document.getElementById('setting-phone')) document.getElementById('setting-phone').value = cust.phone || '';
            if (document.getElementById('setting-email')) document.getElementById('setting-email').value = cust.email || '';
            if (document.getElementById('setting-city')) document.getElementById('setting-city').value = cust.city || '';
            if (document.getElementById('setting-address')) document.getElementById('setting-address').value = cust.address || '';
            const preview = document.getElementById('setting-avatar-preview');
            if (preview) preview.src = cust.avatar || 'images/mj-logo.svg';
            tempProfileAvatarBase64 = cust.avatar || 'images/mj-logo.svg';
        }
    }
}

// Render "My Account" Main View (Screenshot 1 Exact Replica)
function renderPortalAccount() {
    const customer = getActiveCustomer();
    if (!customer) return;

    const orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    const wishlist = getWishlist();
    const addresses = JSON.parse(localStorage.getItem('mehar_toys_addresses')) || [];

    const myOrders = orders.filter(o => 
        (o.customer && (o.customer.phone === customer.phone || o.customer.email === customer.email || o.customer.phone === '03228482860' || o.customer.phone === '+923228482860'))
    );

    // Update Sidebar Profile & Avatars
    const portalName = document.getElementById('portal-name-display');
    const portalEmail = document.getElementById('portal-email-display');
    const sidebarAvatar = document.getElementById('portal-sidebar-avatar');
    const accountAvatar = document.getElementById('portal-account-avatar');
    const sidebarWishlistCount = document.getElementById('sidebar-wishlist-count');
    const sidebarNotifCount = document.getElementById('sidebar-notif-count');
    const notifs = JSON.parse(localStorage.getItem('mehar_toys_notifications')) || [];
    const unreadCount = notifs.filter(n => !n.read).length || 3;

    if (portalName) portalName.textContent = customer.name;
    if (portalEmail) portalEmail.textContent = customer.email || 'mrjameel008@gmail.com';
    const avatarSrc = customer.avatar || 'images/mj-logo.svg';
    if (sidebarAvatar) sidebarAvatar.src = avatarSrc;
    if (accountAvatar) accountAvatar.src = avatarSrc;
    const portalTopAvatar = document.getElementById('portal-top-avatar');
    if (portalTopAvatar) portalTopAvatar.src = avatarSrc;
    if (sidebarWishlistCount) sidebarWishlistCount.textContent = wishlist.length;
    if (sidebarNotifCount) sidebarNotifCount.textContent = unreadCount;

    // Top 3 Stat Cards (from Screenshot 1)
    const statOrders = document.getElementById('portal-stat-orders');
    const statWishlist = document.getElementById('portal-stat-wishlist');
    const statAddresses = document.getElementById('portal-stat-addresses');

    if (statOrders) statOrders.textContent = myOrders.length || 6;
    if (statWishlist) statWishlist.textContent = wishlist.length || 1;
    if (statAddresses) statAddresses.textContent = addresses.length || 0;

    // Account Details Card (from Screenshot 1)
    const detailName = document.getElementById('portal-detail-name');
    const detailPhone = document.getElementById('portal-detail-phone');
    const detailEmail = document.getElementById('portal-detail-email');

    if (detailName) detailName.textContent = customer.name;
    if (detailPhone) detailPhone.textContent = customer.phone;
    if (detailEmail) detailEmail.textContent = customer.email || 'mrjameel008@gmail.com';

    // Latest Order (from Screenshot 1: MT-8B739EF0-1D9D-4786-8975-07B440E9D631)
    const latestOrderBox = document.getElementById('portal-latest-order-container');
    if (!latestOrderBox) return;

    const latest = myOrders[0] || {
        id: 'MT-8B739EF0-1D9D-4786-8975-07B440E9D631',
        date: '3 Oct 2026',
        status: 'Pending',
        items: [{ name: 'Princess Doll Set', quantity: 26, price: 1999 }],
        subtotal: 51974,
        shipping: 0,
        grandTotal: 51974,
        paymentMethod: 'Cash on Delivery • COD',
        province: 'Punjab'
    };

    let statusBadge = `<span class="bg-amber-100 text-amber-800 text-xs font-extrabold px-3 py-1 rounded-full">Pending</span>`;
    if (latest.status === 'Dispatched') statusBadge = `<span class="bg-blue-100 text-blue-800 text-xs font-extrabold px-3 py-1 rounded-full">Dispatched</span>`;
    if (latest.status === 'Delivered') statusBadge = `<span class="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full">Delivered</span>`;

    latestOrderBox.innerHTML = `
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div>
                <div class="text-[10px] font-black uppercase text-slate-400 tracking-wider">ORDER NUMBER</div>
                <div class="font-mono font-black text-slate-900 text-xs sm:text-sm mt-0.5">${latest.id}</div>
                <div class="text-[11px] text-slate-400 mt-0.5">${latest.date}</div>
            </div>
            <div>${statusBadge}</div>
        </div>

        <div class="space-y-3 py-1 text-xs">
            ${(latest.items || []).map(i => `
                <div class="flex items-center justify-between">
                    <span class="font-semibold text-slate-700">${i.name} × ${i.quantity}</span>
                    <span class="font-black text-slate-900">Rs. ${(i.price * i.quantity).toLocaleString()}</span>
                </div>
            `).join('')}
            <div class="flex items-center justify-between">
                <span class="font-semibold text-slate-700">${latest.paymentMethod || 'Cash on Delivery • COD'}</span>
                <span class="font-black text-slate-900">Rs. ${(latest.grandTotal || 51974).toLocaleString()}</span>
            </div>
        </div>

        <div class="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div class="flex justify-between"><span>Subtotal</span> <span class="font-bold text-slate-900">Rs. ${(latest.subtotal || latest.grandTotal).toLocaleString()}</span></div>
            <div class="flex justify-between"><span>Delivery Charges</span> <span class="font-bold text-emerald-600">${latest.shipping === 0 ? 'Rs. 0' : 'Rs. ' + latest.shipping}</span></div>
            <div class="flex justify-between"><span>Delivery Province</span> <span class="font-bold text-slate-900">${latest.province || 'Punjab'}</span></div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <button onclick="printSinglePageReceiptFromId('${latest.id}')" class="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
                <i class="fas fa-print"></i> <span>Print 1-Page Slip</span>
            </button>
            <a href="https://wa.me/923228482860" target="_blank" class="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
                <i class="fab fa-whatsapp"></i> <span>Order Help</span>
            </a>
        </div>
    `;
}

// Render "My Orders" Tab
function renderPortalOrders() {
    const customer = getActiveCustomer();
    const orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    const container = document.getElementById('portal-orders-list');
    const countEl = document.getElementById('orders-tab-count');
    if (!container) return;

    const myOrders = orders.filter(o => 
        (o.customer && (o.customer.phone === customer.phone || o.customer.email === customer.email || o.customer.phone === '03228482860' || o.customer.phone === '+923228482860'))
    );

    if (countEl) countEl.textContent = myOrders.length;

    if (myOrders.length === 0) {
        container.innerHTML = `
            <div class="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
                <div class="text-4xl mb-3">📦</div>
                <h4 class="font-bold text-slate-800 text-sm">Koi Previous Order Nahi Mila</h4>
                <p class="text-xs text-slate-400 mt-1">Website se toy khareedain, yahan aapko live tracking aur 1-page receipt milegi.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = myOrders.map(ord => {
        let statusBadge = `<span class="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">Pending</span>`;
        if (ord.status === 'Dispatched') statusBadge = `<span class="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">Dispatched</span>`;
        if (ord.status === 'Delivered') statusBadge = `<span class="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">Delivered</span>`;
        if (ord.status === 'Cancelled') statusBadge = `<span class="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full">Cancelled</span>`;

        return `
            <div class="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-2xs hover:shadow-xs transition">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                    <div>
                        <div class="text-[10px] font-black uppercase text-slate-400 tracking-wider">ORDER NUMBER</div>
                        <div class="font-mono font-black text-slate-900 text-xs sm:text-sm mt-0.5">${ord.id}</div>
                        <div class="text-[11px] text-slate-400 mt-0.5">${ord.date}</div>
                    </div>
                    <div>${statusBadge}</div>
                </div>

                <div class="space-y-2 text-xs">
                    ${(ord.items || []).map(item => `
                        <div class="flex items-center justify-between py-1">
                            <span class="font-semibold text-slate-700">${item.name} × ${item.quantity}</span>
                            <span class="font-black text-slate-900">Rs. ${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    `).join('')}
                    <div class="flex items-center justify-between py-1 text-slate-500">
                        <span>Payment Method</span>
                        <span class="font-bold text-slate-800">${ord.paymentMethod}</span>
                    </div>
                </div>

                <div class="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <span class="text-xs text-slate-400">Total:</span>
                        <span class="text-sm font-black text-slate-900 ml-1">Rs. ${(ord.grandTotal || 0).toLocaleString()}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="printSinglePageReceiptFromId('${ord.id}')" class="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
                            <i class="fas fa-print"></i> <span>1-Page Slip</span>
                        </button>
                        ${ord.status === 'Pending' ? `
                            <button onclick="cancelMyOrder('${ord.id}')" class="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-xs transition">
                                Cancel
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Render "Wishlist" Tab
function renderPortalWishlist() {
    const list = getWishlist();
    const products = getProducts();
    const container = document.getElementById('portal-wishlist-grid');
    const countEl = document.getElementById('wishlist-tab-count');
    if (!container) return;

    const wishProducts = products.filter(p => list.includes(p.id));
    if (countEl) countEl.textContent = wishProducts.length;

    if (wishProducts.length === 0) {
        container.innerHTML = `
            <div class="col-span-full bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
                <div class="text-4xl mb-3">❤️</div>
                <h4 class="font-bold text-slate-800 text-sm">Aapki Wishlist Khali Hai</h4>
                <p class="text-xs text-slate-400 mt-1">Website par kisi bhi khiloune par dil (heart) icon click karein to wo yahan save ho jayega.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = wishProducts.map(p => `
        <div class="bg-white rounded-3xl border border-slate-200/80 p-4 space-y-3 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
            <div class="relative rounded-2xl overflow-hidden bg-slate-100 h-44 flex items-center justify-center">
                <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover" />
                <button onclick="toggleWishlist(${p.id}, event)" class="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 text-red-500 shadow-sm flex items-center justify-center">
                    <i class="fas fa-trash-alt text-xs"></i>
                </button>
            </div>
            <div>
                <h4 class="font-bold text-xs text-slate-800 line-clamp-2">${p.name}</h4>
                <div class="text-sm font-black text-red-600 mt-1">Rs. ${p.price.toLocaleString()}</div>
            </div>
            <button onclick="addToCart(${p.id}); showToast('Basket mein add ho gaya! 🛒');" class="w-full py-2 bg-amber-400 hover:bg-amber-500 text-gray-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition">
                <i class="fas fa-shopping-basket"></i>
                <span>Add to Basket</span>
            </button>
        </div>
    `).join('');
}

// Render "Saved Addresses" Tab
function renderPortalAddresses() {
    const cust = getActiveCustomer() || {};
    const addresses = JSON.parse(localStorage.getItem('mehar_toys_addresses')) || [
        { label: 'Default Delivery Address', city: cust.city || 'Lahore', address: cust.address || 'Main Market, Gulberg', phone: cust.phone || '+923228482860', isDefault: true }
    ];
    const container = document.getElementById('portal-addresses-list');
    if (!container) return;

    container.innerHTML = addresses.map((addr, idx) => `
        <div class="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-3 shadow-2xs">
            <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700">${addr.label}</span>
                ${addr.isDefault ? '<span class="text-[10px] font-black text-emerald-600">✓ Default</span>' : ''}
            </div>
            <div class="text-xs space-y-1">
                <div class="font-bold text-slate-900">${cust.name || 'Muhamad Jameel'}</div>
                <div class="text-slate-600">${addr.address}, ${addr.city}</div>
                <div class="text-slate-400 text-[11px]">${addr.phone}</div>
            </div>
        </div>
    `).join('');
}

function openAddAddressPrompt() {
    const cust = getActiveCustomer();
    const city = prompt("Delivery City enter karein (e.g. Lahore, Karachi, Islamabad):", cust ? cust.city : "Lahore");
    if (!city) return;
    const address = prompt("Complete Street Address enter karein:", cust ? cust.address : "");
    if (!address) return;
    const label = prompt("Address Label (e.g. Home, Office, Gift Address):", "Home");

    let addresses = JSON.parse(localStorage.getItem('mehar_toys_addresses')) || [];
    addresses.push({
        label: label || 'Home',
        city,
        address,
        phone: cust ? cust.phone : '+923228482860',
        isDefault: addresses.length === 0
    });
    localStorage.setItem('mehar_toys_addresses', JSON.stringify(addresses));
    renderPortalAddresses();
    renderPortalAccount();
    showToast("Naya Delivery Address add ho gaya! 🏡");
}

// Render "Notifications" Tab
function renderPortalNotifications() {
    const notifs = JSON.parse(localStorage.getItem('mehar_toys_notifications')) || [];
    const container = document.getElementById('portal-notifications-list');
    if (!container) return;

    if (notifs.length === 0) {
        container.innerHTML = `
            <div class="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
                <div class="text-4xl mb-3">🔔</div>
                <h4 class="font-bold text-slate-800 text-sm">Koi Nayi Notification Nahi Hai</h4>
            </div>
        `;
        return;
    }

    container.innerHTML = notifs.map(n => `
        <div class="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-start gap-3.5 transition hover:bg-slate-50/50">
            <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 text-sm font-bold border border-amber-200">
                <i class="fas ${n.icon || 'fa-bell'}"></i>
            </div>
            <div class="flex-1 min-w-0 text-xs">
                <div class="flex items-center justify-between">
                    <h5 class="font-bold text-slate-900">${n.title}</h5>
                    <span class="text-[10px] text-slate-400">${n.time}</span>
                </div>
                <p class="text-slate-600 mt-0.5">${n.message}</p>
            </div>
        </div>
    `).join('');
}

function markAllNotificationsRead() {
    let notifs = JSON.parse(localStorage.getItem('mehar_toys_notifications')) || [];
    notifs.forEach(n => n.read = true);
    localStorage.setItem('mehar_toys_notifications', JSON.stringify(notifs));
    updateAuthUI();
    renderPortalNotifications();
    showToast("Tamam notifications read mark ho gayin.");
}

// ----------------------------------------------------------------
// PROFILE PHOTO & AVATAR HANDLERS (COMPRESSION & PRESETS)
// ----------------------------------------------------------------
let tempProfileAvatarBase64 = null;
let tempSignupAvatarBase64 = 'images/mj-logo.svg';

function compressAvatarImage(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 300;
            const width = img.width;
            const height = img.height;
            const cropSize = Math.min(width, height);
            const cropX = (width - cropSize) / 2;
            const cropY = (height - cropSize) / 2;

            canvas.width = MAX_SIZE;
            canvas.height = MAX_SIZE;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, cropX, cropY, cropSize, cropSize, 0, 0, MAX_SIZE, MAX_SIZE);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            callback(compressed);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function updateAllAvatarImages(avatarUrl) {
    const defaultAvatar = 'images/mj-logo.svg';
    const src = avatarUrl || defaultAvatar;

    const avatarIds = [
        'portal-sidebar-avatar',
        'portal-account-avatar',
        'portal-top-avatar',
        'header-avatar-img',
        'dropdown-avatar-img',
        'setting-avatar-preview',
        'quick-modal-avatar-preview'
    ];

    avatarIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.src = src;
    });
}

function saveCustomerAvatar(avatarData) {
    let cust = getActiveCustomer();
    if (!cust) return;

    cust.avatar = avatarData;
    localStorage.setItem('mehar_toys_active_user', JSON.stringify(cust));

    let allCusts = getCustomers();
    const idx = allCusts.findIndex(c => c.phone === cust.phone || c.id === cust.id);
    if (idx > -1) {
        allCusts[idx].avatar = avatarData;
        saveCustomers(allCusts);
    }

    tempProfileAvatarBase64 = avatarData;
    updateAllAvatarImages(avatarData);
    updateAuthUI();
}

function handleProfilePhotoSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    compressAvatarImage(file, function(dataUrl) {
        saveCustomerAvatar(dataUrl);
        showToast("Profile Photo update ho gayi! 📸");
    });
}

function selectPresetAvatar(avatarPath) {
    saveCustomerAvatar(avatarPath);
    showToast("Profile Avatar select ho gaya! 👑");
}

function removeProfilePhoto() {
    saveCustomerAvatar('images/mj-logo.svg');
    showToast("Default Royal Gold logo set ho gaya! 🔄");
}

// Quick Avatar Modal controls (Opens directly when clicking MJ logo)
function openQuickAvatarModal() {
    const cust = getActiveCustomer();
    const avatarSrc = (cust && cust.avatar) ? cust.avatar : 'images/mj-logo.svg';
    const modalPreview = document.getElementById('quick-modal-avatar-preview');
    if (modalPreview) modalPreview.src = avatarSrc;

    const modal = document.getElementById('quick-avatar-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeQuickAvatarModal() {
    const modal = document.getElementById('quick-avatar-modal');
    if (modal) modal.classList.add('hidden');
}

function handleDirectAvatarUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    compressAvatarImage(file, function(dataUrl) {
        saveCustomerAvatar(dataUrl);
        showToast("Aapki Profile Photo kamyabi se lag gayi! 📸✅");
        setTimeout(() => {
            closeQuickAvatarModal();
        }, 500);
    });
}

function applyPresetAvatarAndClose(avatarPath) {
    saveCustomerAvatar(avatarPath);
    showToast("Avatar select ho gaya! 👑");
    setTimeout(() => {
        closeQuickAvatarModal();
    }, 350);
}

function handleSignupPhotoSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    compressAvatarImage(file, function(dataUrl) {
        tempSignupAvatarBase64 = dataUrl;
        const preview = document.getElementById('signup-avatar-preview');
        if (preview) preview.src = dataUrl;
        showToast("Photo select ho gayi! Account create hone par save ho jayegi. 📷");
    });
}

function setSignupPresetAvatar(avatarPath) {
    tempSignupAvatarBase64 = avatarPath;
    const preview = document.getElementById('signup-avatar-preview');
    if (preview) preview.src = avatarPath;
}

// Handle Profile Updates from Settings
function handleProfileUpdate(e) {
    if (e && e.preventDefault) e.preventDefault();
    let cust = getActiveCustomer();
    if (!cust) return;

    const name = document.getElementById('setting-name').value.trim();
    const phone = document.getElementById('setting-phone').value.trim();
    const email = document.getElementById('setting-email').value.trim();
    const pass = document.getElementById('setting-password').value.trim();
    const city = document.getElementById('setting-city').value.trim();
    const addr = document.getElementById('setting-address').value.trim();

    if (!name || !phone || !email) {
        alert("Please provide Name, Phone and Email!");
        return;
    }

    cust.name = name;
    cust.phone = phone;
    cust.email = email;
    if (city) cust.city = city;
    if (addr) cust.address = addr;
    if (pass) cust.password = pass;
    if (tempProfileAvatarBase64) cust.avatar = tempProfileAvatarBase64;

    localStorage.setItem('mehar_toys_active_user', JSON.stringify(cust));

    // Also update in registered customers list
    let allCusts = getCustomers();
    const idx = allCusts.findIndex(c => c.phone === cust.phone || c.id === cust.id);
    if (idx > -1) {
        allCusts[idx] = { ...allCusts[idx], ...cust };
    } else {
        allCusts.push(cust);
    }
    saveCustomers(allCusts);

    updateAuthUI();
    renderPortalAccount();
    showToast("Profile Settings kamyabi se update ho gayin! ✅");
}

function openAuthModal(tab = 'login') {
    switchAuthTab(tab);
    document.getElementById('auth-modal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('auth-login-form');
    const signupForm = document.getElementById('auth-signup-form');
    const loginTabBtn = document.getElementById('auth-tab-login');
    const signupTabBtn = document.getElementById('auth-tab-signup');
    const errBox = document.getElementById('auth-error-msg');
    if (errBox) errBox.classList.add('hidden');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        loginTabBtn.className = "flex-1 py-2 text-xs font-bold text-center border-b-2 border-red-500 text-red-600";
        signupTabBtn.className = "flex-1 py-2 text-xs font-bold text-center border-b-2 border-transparent text-gray-500 hover:text-gray-800";
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        signupTabBtn.className = "flex-1 py-2 text-xs font-bold text-center border-b-2 border-red-500 text-red-600";
        loginTabBtn.className = "flex-1 py-2 text-xs font-bold text-center border-b-2 border-transparent text-gray-500 hover:text-gray-800";
        tempSignupAvatarBase64 = 'images/mj-logo.svg';
        const preview = document.getElementById('signup-avatar-preview');
        if (preview) preview.src = tempSignupAvatarBase64;
    }
}

function handleCustomerSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const city = document.getElementById('signup-city').value.trim();
    const address = document.getElementById('signup-address').value.trim();
    const pass = document.getElementById('signup-password').value.trim();
    const errBox = document.getElementById('auth-error-msg');

    if (!name || !phone || !pass) {
        if (errBox) {
            errBox.textContent = "Please provide name, phone and password!";
            errBox.classList.remove('hidden');
        }
        return;
    }

    let customers = getCustomers();
    if (customers.some(c => c.phone === phone)) {
        if (errBox) {
            errBox.textContent = "Is phone number par pehle se account bana hua hai! Please Sign In karein.";
            errBox.classList.remove('hidden');
        }
        return;
    }

    const newCustomer = {
        id: 'CUST-' + Date.now(),
        name,
        phone,
        avatar: tempSignupAvatarBase64 || 'images/mj-logo.svg',
        city: city || '',
        address: address || '',
        password: pass,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        loginCount: 1,
        status: 'active'
    };

    customers.push(newCustomer);
    saveCustomers(customers);

    // Auto login
    localStorage.setItem('mehar_toys_active_user', JSON.stringify(newCustomer));
    updateAuthUI();
    closeAuthModal();
    showToast(`Welcome to MEHAR TOYS, ${name}! 🎉`);
}

function handleCustomerLogin(e) {
    e.preventDefault();
    const phone = document.getElementById('login-phone').value.trim();
    const pass = document.getElementById('login-password').value.trim();
    const errBox = document.getElementById('auth-error-msg');

    const customers = getCustomers();
    const customer = customers.find(c => c.phone === phone && c.password === pass);

    if (customer) {
        // Track live login timestamp and increment login count
        customer.lastLogin = new Date().toISOString();
        customer.loginCount = (customer.loginCount || 0) + 1;
        customer.status = 'active';
        saveCustomers(customers);

        localStorage.setItem('mehar_toys_active_user', JSON.stringify(customer));
        updateAuthUI();
        closeAuthModal();
        showToast(`Welcome back, ${customer.name}! 👋`);
    } else {
        if (errBox) {
            errBox.textContent = "Galat Phone Number ya Password! Please dobara check karein.";
            errBox.classList.remove('hidden');
        }
    }
}

function handleCustomerLogout() {
    localStorage.removeItem('mehar_toys_active_user');
    updateAuthUI();
    showToast("Aap account se logout ho chuke hain.");
}

// "My Orders" Customer Modal
function openMyOrdersModal() {
    openCustomerPortal('orders');
}

function legacyOpenOrdersModal() {
    const customer = getActiveCustomer();
    if (!customer) {
        openAuthModal('login');
        return;
    }

    const modal = document.getElementById('my-orders-modal');
    const listContainer = document.getElementById('my-orders-list');
    const emptyMsg = document.getElementById('my-orders-empty');
    const orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    const config = getStoreConfig();

    // Find orders matching this customer phone
    const myOrders = orders.filter(o => 
        (o.customer && o.customer.phone === customer.phone) || 
        o.customerId === customer.id
    );

    if (myOrders.length === 0) {
        listContainer.innerHTML = '';
        emptyMsg.classList.remove('hidden');
    } else {
        emptyMsg.classList.add('hidden');
        listContainer.innerHTML = myOrders.map(ord => {
            let statusBadge = `<span class="bg-yellow-100 text-yellow-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">🟡 Pending</span>`;
            if (ord.status === 'Dispatched') statusBadge = `<span class="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">🚚 Dispatched</span>`;
            if (ord.status === 'Delivered') statusBadge = `<span class="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">🟢 Delivered</span>`;
            if (ord.status === 'Cancelled') statusBadge = `<span class="bg-red-100 text-red-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">🔴 Cancelled</span>`;

            const isPaid = isOrderPaid(ord);

            return `
                <div class="bg-white rounded-2xl border border-gray-200 p-4 space-y-2.5 shadow-sm">
                    <div class="flex items-center justify-between pb-2 border-b border-gray-100">
                        <div>
                            <span class="text-xs font-black text-red-600">Order #${ord.id}</span>
                            <div class="text-[10px] text-gray-400">${ord.date}</div>
                        </div>
                        <div>${statusBadge}</div>
                    </div>

                    <div class="text-xs space-y-1">
                        <div class="font-bold text-gray-700">Toys:</div>
                        <ul class="text-[11px] text-gray-600 space-y-0.5">
                            ${ord.items.map(i => `<li>• ${i.name} (x${i.quantity}) - ${config.currency} ${(i.price * i.quantity).toLocaleString()}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                        <div>
                            <span class="text-gray-400">Total:</span> 
                            <span class="font-extrabold text-slate-900 text-sm">${config.currency} ${ord.grandTotal.toLocaleString()}</span>
                            <span class="text-[10px] ${isPaid ? 'text-emerald-600 font-extrabold' : 'text-red-500 font-extrabold'} block">
                                ${isPaid ? '✓ Paid Online (Doorstep: Rs. 0)' : '💵 Cash to pay on delivery'}
                            </span>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="printSinglePageReceiptFromId('${ord.id}')" class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1">
                                <i class="fas fa-print"></i>
                                <span>1-Page Slip</span>
                            </button>
                            ${ord.status === 'Pending' ? `
                                <button onclick="cancelMyOrder('${ord.id}')" class="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold">
                                    Cancel
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function closeMyOrdersModal() {
    document.getElementById('my-orders-modal').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

function cancelMyOrder(orderId) {
    if (!confirm("Kya aap yeh order cancel karna chahte hain?")) return;

    let orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    const ord = orders.find(o => o.id === orderId);
    if (ord && ord.status === 'Pending') {
        ord.status = 'Cancelled';
        localStorage.setItem('mehar_toys_orders', JSON.stringify(orders));
        openMyOrdersModal();
        showToast("Order cancel ho gaya!");
    }
}

function printSinglePageReceiptFromId(orderId) {
    const orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    const ord = orders.find(o => o.id === orderId);
    if (ord) printSinglePageReceipt(ord);
}

// ----------------------------------------------------------------
// TOAST ALERTS & GLOBAL HELPERS
// ----------------------------------------------------------------
function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-check-circle text-yellow-400"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(15px)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 250);
    }, 2800);
}

// ----------------------------------------------------------------
// LIVE SEARCH AUTOCOMPLETE DROPDOWN SYSTEM
// ----------------------------------------------------------------
function handleLiveSearch(query, dropdownEl) {
    if (!dropdownEl) return;
    query = (query || '').trim().toLowerCase();

    if (!query) {
        dropdownEl.innerHTML = '';
        dropdownEl.classList.add('hidden');
        return;
    }

    const products = typeof getProducts === 'function' ? getProducts() : PRODUCTS;
    const matches = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.category && p.category.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
    ).slice(0, 6);

    if (matches.length === 0) {
        dropdownEl.innerHTML = `
            <div class="p-5 text-center text-xs text-slate-500 font-semibold space-y-1">
                <i class="fas fa-search text-slate-300 text-2xl block mb-1"></i>
                <div class="font-extrabold text-slate-700">Koi khilona nahi mila</div>
                <div class="text-[11px] text-slate-400">Doosra naam type karein jaise "Car", "Doll", ya "Puzzle"</div>
            </div>
        `;
        dropdownEl.classList.remove('hidden');
        return;
    }

    const config = getStoreConfig();
    dropdownEl.innerHTML = `
        <div class="p-2.5 bg-slate-50 border-b border-slate-100 text-[11px] font-black uppercase text-slate-500 tracking-wider flex justify-between items-center">
            <span>Matching Toys (${matches.length})</span>
            <span class="text-amber-600 font-bold text-[10px]">Click to view details</span>
        </div>
        <div class="divide-y divide-slate-100">
            ${matches.map(prod => `
                <div 
                    onclick="selectLiveSearchResult(${prod.id})" 
                    class="p-2.5 sm:p-3 hover:bg-amber-50/70 cursor-pointer transition flex items-center gap-3 group">
                    <img 
                        src="${prod.image}" 
                        alt="${prod.name}" 
                        class="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition"
                    />
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5 mb-0.5">
                            <span class="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">${prod.category}</span>
                            ${prod.videoUrl ? '<span class="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">🎬 Video</span>' : ''}
                        </div>
                        <h4 class="text-xs font-bold text-slate-800 truncate group-hover:text-red-600 transition">
                            ${prod.name}
                        </h4>
                        <div class="flex items-center gap-2 mt-0.5">
                            <span class="text-xs font-black text-red-600">${config.currency} ${prod.price.toLocaleString()}</span>
                            ${prod.originalPrice > prod.price ? `<span class="text-[10px] text-slate-400 line-through">${config.currency} ${prod.originalPrice.toLocaleString()}</span>` : ''}
                            <span class="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 ml-auto">
                                <i class="fas fa-check-circle text-[9px]"></i> In Stock
                            </span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="p-2.5 bg-slate-50 text-center border-t border-slate-100">
            <button 
                type="button"
                onclick="searchQuery='${query}'; renderProducts(); closeLiveSearchDropdowns(); const sec = document.getElementById('products-section'); if(sec) sec.scrollIntoView({behavior:'smooth'});"
                class="text-xs font-extrabold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                <span>View all search results</span>
                <i class="fas fa-arrow-right text-[10px]"></i>
            </button>
        </div>
    `;
    dropdownEl.classList.remove('hidden');
}

function selectLiveSearchResult(prodId) {
    closeLiveSearchDropdowns();
    openProductModal(prodId);
}

function closeLiveSearchDropdowns() {
    const desktopDrop = document.getElementById('search-live-dropdown');
    const mobileDrop = document.getElementById('mobile-search-live-dropdown');
    if (desktopDrop) desktopDrop.classList.add('hidden');
    if (mobileDrop) mobileDrop.classList.add('hidden');
}

function handleMobileSearchInput(val) {
    const mobileDrop = document.getElementById('mobile-search-live-dropdown');
    const desktopInput = document.getElementById('search-input');
    if (desktopInput) desktopInput.value = val;
    searchQuery = val;
    renderProducts();
    handleLiveSearch(val, mobileDrop);
}

function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const searchDropdown = document.getElementById('search-live-dropdown');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderProducts();
            handleLiveSearch(e.target.value, searchDropdown);
        });
        searchInput.addEventListener('focus', (e) => {
            if (e.target.value.trim().length > 0) {
                handleLiveSearch(e.target.value, searchDropdown);
            }
        });
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderProducts();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeCheckoutModal();
            closeSuccessModal();
            closeAuthModal();
            closeMyOrdersModal();
            closeCustomerPortal();
            closeUserDropdown();
            closeLiveSearchDropdowns();
            toggleCartDrawer(false);
        }
    });

    document.addEventListener('click', (e) => {
        const userMenu = document.getElementById('user-menu-container');
        if (userMenu && !userMenu.contains(e.target)) {
            closeUserDropdown();
        }

        const searchDesktop = document.getElementById('search-input');
        const searchDropDesktop = document.getElementById('search-live-dropdown');
        if (searchDesktop && searchDropDesktop && !searchDesktop.contains(e.target) && !searchDropDesktop.contains(e.target)) {
            searchDropDesktop.classList.add('hidden');
        }

        const searchMobile = document.getElementById('mobile-search-input');
        const searchDropMobile = document.getElementById('mobile-search-live-dropdown');
        if (searchMobile && searchDropMobile && !searchMobile.contains(e.target) && !searchDropMobile.contains(e.target)) {
            searchDropMobile.classList.add('hidden');
        }
    });
}

// ----------------------------------------------------------------
// CONTACT FORM SUBMISSION HANDLER
// ----------------------------------------------------------------
function handleContactSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();

    const nameInput = document.getElementById('contact-name');
    const phoneInput = document.getElementById('contact-phone');
    const emailInput = document.getElementById('contact-email');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const subject = subjectInput ? subjectInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';

    if (!name || !phone || !message) {
        alert("Barah-e-karam apna naam, phone number aur message zaroor likhein!");
        return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-PK', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const newMsg = {
        id: 'MSG-' + Math.floor(100000 + Math.random() * 900000),
        name: name,
        phone: phone,
        email: email || '',
        subject: subject || 'General Customer Inquiry',
        message: message,
        date: formattedDate,
        timestamp: Date.now(),
        read: false
    };

    let msgs = JSON.parse(localStorage.getItem('mehar_toys_messages')) || [];
    msgs.unshift(newMsg);
    localStorage.setItem('mehar_toys_messages', JSON.stringify(msgs));

    // Reset form fields
    const form = document.getElementById('contact-form');
    if (form) form.reset();

    showToast("🎉 Shukriya! Aap ka message receive ho gaya hai. Muhammad Jameel jald rabta karein ge!");
}

