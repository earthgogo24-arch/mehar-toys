// ================================================================
// MEHAR TOYS - FULL WORKSPACE ADMIN CONTROLLER (ALL 13 MODULES)
// ================================================================

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

const ALL_WORKSPACE_TABS = [
    'dashboard', 'analytics', 'reports', 'products', 'inventory', 
    'orders', 'categories', 'customers', 'reviews', 'messages', 
    'coupons', 'notifications', 'settings', 'hero-banner', 'vouchers-strip'
];

let currentAdminTab = 'dashboard';
let orderFilterStatus = 'all';
let orderSearchQuery = '';
let salesChartInstance = null;
let ordersChartInstance = null;
let categoryChartInstance = null;
let analyticsSalesChartInstance = null;
let currentAnalyticsPeriod = '7days';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupAdminEventListeners();
});

// Authentication System
function checkAuth() {
    const isAuth = sessionStorage.getItem('mehar_toys_admin_auth');
    const loginScreen = document.getElementById('login-screen');
    const adminDashboard = document.getElementById('admin-dashboard');

    if (isAuth === 'true') {
        if (loginScreen) loginScreen.classList.add('hidden');
        if (adminDashboard) adminDashboard.classList.remove('hidden');
        loadAllDashboardData();
    } else {
        if (loginScreen) loginScreen.classList.remove('hidden');
        if (adminDashboard) adminDashboard.classList.add('hidden');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('admin-username').value.trim();
    const pass = document.getElementById('admin-password').value.trim();
    const err = document.getElementById('login-error');

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        sessionStorage.setItem('mehar_toys_admin_auth', 'true');
        if (err) err.classList.add('hidden');
        checkAuth();
    } else {
        if (err) {
            err.textContent = "Invalid username or password! (Default: admin / admin123)";
            err.classList.remove('hidden');
        }
    }
}

function handleLogout() {
    sessionStorage.removeItem('mehar_toys_admin_auth');
    checkAuth();
}

// ----------------------------------------------------------------
// TAB SWITCHER FOR ALL 13 WORKSPACE MODULES
// ----------------------------------------------------------------
function switchAdminTab(tab) {
    if (!ALL_WORKSPACE_TABS.includes(tab)) tab = 'dashboard';
    currentAdminTab = tab;

    // Update Sidebar Navigation button styles
    document.querySelectorAll('.workspace-nav-btn').forEach(btn => {
        btn.classList.remove('active-tab', 'bg-slate-900', 'text-white', 'shadow-md', 'font-bold');
        btn.classList.add('text-slate-600', 'hover:bg-slate-100', 'font-medium');
        const dot = btn.querySelector('.active-dot');
        if (dot) dot.classList.add('hidden');
    });

    const activeBtn = document.getElementById(`nav-${tab}`);
    if (activeBtn) {
        activeBtn.classList.remove('text-slate-600', 'hover:bg-slate-100', 'font-medium');
        activeBtn.classList.add('active-tab', 'bg-slate-900', 'text-white', 'shadow-md', 'font-bold');
        const dot = activeBtn.querySelector('.active-dot');
        if (dot) dot.classList.remove('hidden');
    }

    // Toggle Content View Sections
    ALL_WORKSPACE_TABS.forEach(t => {
        const sec = document.getElementById(`view-${t}`);
        if (sec) sec.classList.toggle('hidden', t !== tab);
    });

    // Update Breadcrumb
    const breadcrumb = document.getElementById('top-breadcrumb');
    if (breadcrumb) {
        breadcrumb.textContent = `MEHAR TOYS / ${tab.toUpperCase()}`;
    }

    // Tab Specific Renderers
    switch(tab) {
        case 'dashboard':
            updateOverviewMetrics();
            renderDashboardCharts();
            renderRecentOrders();
            if (typeof isSupabaseActive === 'function' && isSupabaseActive() && typeof cloudFetchOrders === 'function') {
                cloudFetchOrders().then(() => {
                    updateOverviewMetrics();
                    renderRecentOrders();
                }).catch(() => {});
            }
            break;
        case 'analytics':
            renderAnalyticsTab();
            break;
        case 'reports':
            renderReportsTab();
            break;
        case 'products':
            renderProductsManager();
            break;
        case 'inventory':
            renderInventoryTab();
            break;
        case 'orders':
            renderFullOrdersTable();
            if (typeof isSupabaseActive === 'function' && isSupabaseActive() && typeof cloudFetchOrders === 'function') {
                cloudFetchOrders().then(() => {
                    renderFullOrdersTable();
                }).catch(() => {});
            }
            break;
        case 'categories':
            renderCategoriesTab();
            break;
        case 'customers':
            renderCustomersList();
            break;
        case 'reviews':
            renderReviewsTab();
            break;
        case 'messages':
            renderMessagesTab();
            break;
        case 'coupons':
            renderCouponsTab();
            break;
        case 'notifications':
            renderNotificationsTab();
            break;
        case 'settings':
            loadSettingsForm();
            break;
        case 'hero-banner':
            renderHeroBannerTab();
            break;
        case 'vouchers-strip':
            renderVouchersStripTab();
            break;
    }
}

// Master Data Loader
function loadAllDashboardData() {
    checkAndSeedSampleOrders();
    checkAndSeedCustomers();
    checkAndSeedCoupons();
    checkAndSeedMessages();
    checkAndSeedReviews();
    updateGreetingTime();
    updateOverviewMetrics();
    renderDashboardCharts();
    renderRecentOrders();
    updateNotificationBadge();

    // Pull latest live data from Supabase Cloud
    if (typeof isSupabaseActive === 'function' && isSupabaseActive() && typeof cloudFetchOrders === 'function') {
        cloudFetchOrders().then((orders) => {
            if (orders && orders.length) {
                updateOverviewMetrics();
                renderDashboardCharts();
                renderRecentOrders();
                if (currentAdminTab === 'orders') {
                    renderFullOrdersTable();
                }
            }
        }).catch(e => console.warn("Supabase loadAllDashboardData error:", e));
    }
}

// Time Greeting
function updateGreetingTime() {
    const greetingEl = document.getElementById('admin-greeting-text');
    if (!greetingEl) return;

    const hour = new Date().getHours();
    let greeting = "Good Morning";
    if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
    else if (hour >= 17) greeting = "Good Evening";

    greetingEl.innerHTML = `${greeting}, <span class="text-red-500 font-extrabold">Muhammad Jameel</span>`;
}

// ----------------------------------------------------------------
// SEEDING DATA FOR LIVELY STORE EXPERIENCE
// ----------------------------------------------------------------
function checkAndSeedSampleOrders() {
    let orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    
    const richSampleOrders = [
        {
            id: 'MT-984012',
            date: 'Today, 04:30 PM',
            timestamp: Date.now() - 3600000 * 2, // 2 hours ago (Today)
            customer: {
                name: 'Kashif Ali',
                phone: '0301-4455667',
                city: 'Lahore',
                address: 'House #14, Street 3, Model Town',
                notes: 'Call before delivery'
            },
            items: [
                { name: '4WD High-Speed Monster RC Stunt Car', quantity: 1, price: 3499, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80' },
                { name: 'Smart Talking & Dancing Cactus', quantity: 1, price: 1499, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 4998,
            shipping: 250,
            grandTotal: 5248,
            paymentMethod: 'Cash on Delivery (COD)',
            paymentStatus: 'Unpaid (COD)',
            isPaid: false,
            trxId: null,
            paymentSlip: null,
            status: 'Pending'
        },
        {
            id: 'MT-981290',
            date: 'Today, 01:15 PM',
            timestamp: Date.now() - 3600000 * 5, // 5 hours ago (Today)
            customer: {
                name: 'Bilal Farooq',
                phone: '0345-9876543',
                city: 'Rawalpindi',
                address: 'House 88, Street 4, Bahria Town Phase 7',
                notes: 'Doorbell is not working'
            },
            items: [
                { name: '4WD High-Speed Monster RC Stunt Car', quantity: 1, price: 3499, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 3499,
            shipping: 250,
            grandTotal: 3749,
            paymentMethod: 'JazzCash / Easypaisa',
            paymentStatus: 'Paid',
            isPaid: true,
            trxId: 'JC948102381',
            paymentSlip: null,
            status: 'Delivered'
        },
        {
            id: 'MT-829140',
            date: 'Yesterday, 08:30 PM',
            timestamp: Date.now() - 3600000 * 20, // 20 hours ago
            customer: {
                name: 'Dr. Sadia Fatima',
                phone: '0333-5566778',
                city: 'Islamabad',
                address: 'Sector F-8/2, Street 19',
                notes: 'Birthday gift packaging'
            },
            items: [
                { name: 'Montessori Wooden Sorting & Number Puzzle Board', quantity: 2, price: 1899, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 3798,
            shipping: 250,
            grandTotal: 4048,
            paymentMethod: 'JazzCash / Easypaisa',
            paymentStatus: 'Paid',
            isPaid: true,
            trxId: 'TID948271635',
            paymentSlip: null,
            status: 'Delivered'
        },
        {
            id: 'MT-719283',
            date: '2 days ago',
            timestamp: Date.now() - 86400000 * 2, // 2 days ago
            customer: {
                name: 'Tariq Naveed',
                phone: '0321-9988776',
                city: 'Karachi',
                address: 'Flat 4B, Gulshan-e-Iqbal Block 5',
                notes: ''
            },
            items: [
                { name: 'Deluxe Princess Dream Dollhouse', quantity: 1, price: 4999, image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 4999,
            shipping: 250,
            grandTotal: 5249,
            paymentMethod: 'Cash on Delivery (COD)',
            paymentStatus: 'Unpaid (COD)',
            isPaid: false,
            trxId: null,
            paymentSlip: null,
            status: 'Dispatched'
        },
        {
            id: 'MT-602914',
            date: '4 days ago',
            timestamp: Date.now() - 86400000 * 4, // 4 days ago
            customer: {
                name: 'Zainab Bibi',
                phone: '0312-3456789',
                city: 'Faisalabad',
                address: 'Madina Town, Main Bazar',
                notes: ''
            },
            items: [
                { name: '4WD High-Speed Monster RC Stunt Car', quantity: 1, price: 3499, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 3499,
            shipping: 250,
            grandTotal: 3749,
            paymentMethod: 'Cash on Delivery (COD)',
            paymentStatus: 'Unpaid (COD)',
            isPaid: false,
            trxId: null,
            paymentSlip: null,
            status: 'Confirmed'
        },
        {
            id: 'MT-589123',
            date: '6 days ago',
            timestamp: Date.now() - 86400000 * 6, // 6 days ago
            customer: {
                name: 'Usman Ghani',
                phone: '0302-8877665',
                city: 'Multan',
                address: 'Gulgasht Colony, House 12',
                notes: 'Cancelled by customer'
            },
            items: [
                { name: 'Smart Talking & Dancing Cactus', quantity: 1, price: 1499, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 1499,
            shipping: 250,
            grandTotal: 1749,
            paymentMethod: 'Cash on Delivery (COD)',
            paymentStatus: 'Cancelled',
            isPaid: false,
            trxId: null,
            paymentSlip: null,
            status: 'Cancelled'
        },
        {
            id: 'MT-571204',
            date: '9 days ago',
            timestamp: Date.now() - 86400000 * 9, // 9 days ago
            customer: {
                name: 'Imran Rafique',
                phone: '0300-4411223',
                city: 'Lahore',
                address: 'DHA Phase 5, Sector C',
                notes: ''
            },
            items: [
                { name: 'Deluxe Princess Dream Dollhouse', quantity: 1, price: 4999, image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80' },
                { name: 'Smart Talking & Dancing Cactus', quantity: 1, price: 1499, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 6498,
            shipping: 0,
            grandTotal: 6498,
            paymentMethod: 'JazzCash / Easypaisa',
            paymentStatus: 'Paid',
            isPaid: true,
            trxId: 'JC57120489',
            paymentSlip: null,
            status: 'Delivered'
        },
        {
            id: 'MT-549102',
            date: '13 days ago',
            timestamp: Date.now() - 86400000 * 13, // 13 days ago
            customer: {
                name: 'Hamza Qureshi',
                phone: '0334-1122998',
                city: 'Peshawar',
                address: 'Hayatabad Phase 2',
                notes: ''
            },
            items: [
                { name: 'Montessori Wooden Sorting & Number Puzzle Board', quantity: 2, price: 1899, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 3798,
            shipping: 250,
            grandTotal: 4048,
            paymentMethod: 'Cash on Delivery (COD)',
            paymentStatus: 'Paid on Delivery',
            isPaid: true,
            trxId: null,
            paymentSlip: null,
            status: 'Delivered'
        },
        {
            id: 'MT-532187',
            date: '19 days ago',
            timestamp: Date.now() - 86400000 * 19, // 19 days ago
            customer: {
                name: 'Maryam Siddiqui',
                phone: '0315-7766554',
                city: 'Karachi',
                address: 'Clifton Block 2',
                notes: ''
            },
            items: [
                { name: 'Deluxe Princess Dream Dollhouse', quantity: 1, price: 4999, image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 4999,
            shipping: 250,
            grandTotal: 5249,
            paymentMethod: 'JazzCash / Easypaisa',
            paymentStatus: 'Paid',
            isPaid: true,
            trxId: 'EP53218732',
            paymentSlip: null,
            status: 'Delivered'
        },
        {
            id: 'MT-518290',
            date: '27 days ago',
            timestamp: Date.now() - 86400000 * 27, // 27 days ago
            customer: {
                name: 'M. Rehan',
                phone: '0322-8811223',
                city: 'Sialkot',
                address: 'Kashmir Road, Cantt',
                notes: ''
            },
            items: [
                { name: '4WD High-Speed Monster RC Stunt Car', quantity: 1, price: 3499, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80' },
                { name: 'Montessori Wooden Sorting & Number Puzzle Board', quantity: 1, price: 1899, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 5398,
            shipping: 250,
            grandTotal: 5648,
            paymentMethod: 'Cash on Delivery (COD)',
            paymentStatus: 'Paid on Delivery',
            isPaid: true,
            trxId: null,
            paymentSlip: null,
            status: 'Delivered'
        },
        {
            id: 'MT-498212',
            date: '45 days ago',
            timestamp: Date.now() - 86400000 * 45, // 45 days ago
            customer: {
                name: 'Sana Tariq',
                phone: '0308-9944332',
                city: 'Lahore',
                address: 'Johar Town, Block G',
                notes: ''
            },
            items: [
                { name: 'Deluxe Princess Dream Dollhouse', quantity: 1, price: 4999, image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80' },
                { name: 'Smart Talking & Dancing Cactus', quantity: 1, price: 1499, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 6498,
            shipping: 0,
            grandTotal: 6498,
            paymentMethod: 'JazzCash / Easypaisa',
            paymentStatus: 'Paid',
            isPaid: true,
            trxId: 'JC49821290',
            paymentSlip: null,
            status: 'Delivered'
        },
        {
            id: 'MT-462100',
            date: '75 days ago',
            timestamp: Date.now() - 86400000 * 75, // 75 days ago
            customer: {
                name: 'Asad Mehmood',
                phone: '0344-5544332',
                city: 'Gujranwala',
                address: 'Satellite Town',
                notes: ''
            },
            items: [
                { name: '4WD High-Speed Monster RC Stunt Car', quantity: 2, price: 3499, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 6998,
            shipping: 0,
            grandTotal: 6998,
            paymentMethod: 'Cash on Delivery (COD)',
            paymentStatus: 'Paid on Delivery',
            isPaid: true,
            trxId: null,
            paymentSlip: null,
            status: 'Delivered'
        },
        {
            id: 'MT-432190',
            date: '110 days ago',
            timestamp: Date.now() - 86400000 * 110, // 110 days ago
            customer: {
                name: 'Farhan Akhtar',
                phone: '0305-6677889',
                city: 'Islamabad',
                address: 'G-11/3, Street 44',
                notes: ''
            },
            items: [
                { name: 'Deluxe Princess Dream Dollhouse', quantity: 1, price: 4999, image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80' },
                { name: 'Montessori Wooden Sorting & Number Puzzle Board', quantity: 1, price: 1899, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 6898,
            shipping: 0,
            grandTotal: 6898,
            paymentMethod: 'JazzCash / Easypaisa',
            paymentStatus: 'Paid',
            isPaid: true,
            trxId: 'JC43219088',
            paymentSlip: null,
            status: 'Delivered'
        },
        {
            id: 'MT-398102',
            date: '150 days ago',
            timestamp: Date.now() - 86400000 * 150, // 150 days ago
            customer: {
                name: 'Kamran Ali',
                phone: '0313-9988112',
                city: 'Karachi',
                address: 'DHA Phase 6, Bukhari Commercial',
                notes: ''
            },
            items: [
                { name: '4WD High-Speed Monster RC Stunt Car', quantity: 2, price: 3499, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80' },
                { name: 'Smart Talking & Dancing Cactus', quantity: 1, price: 1499, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 8497,
            shipping: 0,
            grandTotal: 8497,
            paymentMethod: 'Cash on Delivery (COD)',
            paymentStatus: 'Paid on Delivery',
            isPaid: true,
            trxId: null,
            paymentSlip: null,
            status: 'Delivered'
        },
        {
            id: 'MT-362145',
            date: '210 days ago',
            timestamp: Date.now() - 86400000 * 210, // 210 days ago
            customer: {
                name: 'Nida Yasir',
                phone: '0323-4455889',
                city: 'Lahore',
                address: 'Wapda Town, Block F1',
                notes: ''
            },
            items: [
                { name: 'Deluxe Princess Dream Dollhouse', quantity: 1, price: 4999, image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 4999,
            shipping: 250,
            grandTotal: 5249,
            paymentMethod: 'JazzCash / Easypaisa',
            paymentStatus: 'Paid',
            isPaid: true,
            trxId: 'EP36214512',
            paymentSlip: null,
            status: 'Delivered'
        },
        {
            id: 'MT-310294',
            date: '290 days ago',
            timestamp: Date.now() - 86400000 * 290, // 290 days ago
            customer: {
                name: 'Shahbaz Sharif',
                phone: '0300-8811776',
                city: 'Rawalpindi',
                address: 'Saddar, Bank Road',
                notes: ''
            },
            items: [
                { name: '4WD High-Speed Monster RC Stunt Car', quantity: 2, price: 3499, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80' },
                { name: 'Montessori Wooden Sorting & Number Puzzle Board', quantity: 1, price: 1899, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 8897,
            shipping: 0,
            grandTotal: 8897,
            paymentMethod: 'Cash on Delivery (COD)',
            paymentStatus: 'Paid on Delivery',
            isPaid: true,
            trxId: null,
            paymentSlip: null,
            status: 'Delivered'
        },
        {
            id: 'MT-284192',
            date: '340 days ago',
            timestamp: Date.now() - 86400000 * 340, // 340 days ago
            customer: {
                name: 'Dr. Munir Ahmed',
                phone: '0331-5544221',
                city: 'Multan',
                address: 'Nishtar Road',
                notes: ''
            },
            items: [
                { name: 'Deluxe Princess Dream Dollhouse', quantity: 1, price: 4999, image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80' },
                { name: 'Smart Talking & Dancing Cactus', quantity: 1, price: 1499, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 6498,
            shipping: 0,
            grandTotal: 6498,
            paymentMethod: 'JazzCash / Easypaisa',
            paymentStatus: 'Paid',
            isPaid: true,
            trxId: 'JC28419200',
            paymentSlip: null,
            status: 'Delivered'
        }
    ];

    // Seed or append missing sample orders while preserving user-created orders
    if (orders.length < 8) {
        const existingIds = new Set(orders.map(o => o.id));
        richSampleOrders.forEach(so => {
            if (!existingIds.has(so.id)) {
                orders.push(so);
            }
        });
        localStorage.setItem('mehar_toys_orders', JSON.stringify(orders));
    }
}

function checkAndSeedCoupons() {
    let coupons = JSON.parse(localStorage.getItem('mehar_toys_coupons'));
    if (!coupons || coupons.length === 0) {
        coupons = [
            { code: 'WELCOME10', discountPercent: 10, minSpend: 2000, active: true, usageCount: 14 },
            { code: 'EIDTOYS', discountPercent: 15, minSpend: 4000, active: true, usageCount: 29 },
            { code: 'HAPPYKIDS', discountPercent: 20, minSpend: 6000, active: true, usageCount: 8 }
        ];
        localStorage.setItem('mehar_toys_coupons', JSON.stringify(coupons));
    }
}

function checkAndSeedMessages() {
    let msgs = JSON.parse(localStorage.getItem('mehar_toys_messages'));
    if (!msgs || msgs.length === 0) {
        msgs = [
            { id: 1, name: 'Zeeshan Khan', phone: '0300-1122334', subject: 'Custom Birthday Toy Bundle', message: 'Assalam-o-Alaikum, mujhe apne bete ki 5th birthday ke liye RC car aur building block ka gift bundle chahiye.', date: 'Today, 11:45 AM', read: false },
            { id: 2, name: 'Ayesha Malik', phone: '0321-5544332', subject: 'Wholesale Toys Inquiry', message: 'Do you offer bulk discount if I order 10 sets of wooden puzzles for preschool?', date: 'Yesterday', read: true }
        ];
        localStorage.setItem('mehar_toys_messages', JSON.stringify(msgs));
    }
}

function checkAndSeedReviews() {
    let revs = JSON.parse(localStorage.getItem('mehar_toys_reviews'));
    if (!revs || revs.length === 0) {
        revs = [
            { id: 1, customer: 'Muhammad Kashif', toy: '4WD Monster RC Car', rating: 5, comment: 'Bohot zabardast car hai, beta bohot khush hai! Quality A1.', date: 'Oct 3, 2026', approved: true },
            { id: 2, customer: 'Dr. Sadia Fatima', toy: 'Montessori Wooden Sorting Puzzle', rating: 5, comment: 'Packaging bohot safe thi aur product bilkul original hai.', date: 'Oct 2, 2026', approved: true },
            { id: 3, customer: 'Tariq Naveed', toy: 'Deluxe Princess Dollhouse', rating: 5, comment: 'Same picture wala toy receive hua. Fast delivery!', date: 'Oct 1, 2026', approved: true }
        ];
        localStorage.setItem('mehar_toys_reviews', JSON.stringify(revs));
    }
}

// Overview Metrics & Counters
function updateOverviewMetrics() {
    const orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    const products = getProducts();
    const customers = JSON.parse(localStorage.getItem('mehar_toys_customers')) || [];
    const config = getStoreConfig();

    const totalOrders = orders.length;
    const totalSales = orders
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
    const dispatchedOrders = orders.filter(o => o.status === 'Dispatched').length;
    const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;
    const slipsAwaiting = orders.filter(o => o.paymentSlip && o.status === 'Pending').length;

    // Stat Cards
    setElText('stat-total-sales', `${config.currency} ${totalSales.toLocaleString()}`);
    setElText('stat-total-orders', totalOrders);
    setElText('stat-pending-orders', pendingOrders);
    setElText('stat-delivered-orders', deliveredOrders);
    setElText('stat-total-customers', Math.max(customers.length, new Set(orders.map(o => o.customer?.phone)).size));
    setElText('stat-total-products', products.length);

    // Secondary Alert Strip
    setElText('strip-new-orders', pendingOrders);
    setElText('strip-slips-awaiting', slipsAwaiting);
    setElText('strip-dispatched', dispatchedOrders);
    setElText('strip-cancelled', cancelledOrders);

    // Orders Breakdown Numbers
    setElText('count-pending', pendingOrders);
    setElText('count-dispatched', dispatchedOrders);
    setElText('count-delivered', deliveredOrders);
    setElText('count-cancelled', cancelledOrders);
    setElText('count-total-breakdown', totalOrders);

    // Progress Bars calculation
    const pct = (val) => totalOrders > 0 ? `${Math.round((val / totalOrders) * 100)}%` : '0%';
    setElStyleWidth('bar-pending', pct(pendingOrders));
    setElStyleWidth('bar-dispatched', pct(dispatchedOrders));
    setElStyleWidth('bar-delivered', pct(deliveredOrders));
    setElStyleWidth('bar-cancelled', pct(cancelledOrders));

    // Update pending badge in sidebar & topbar
    const sideBadge = document.getElementById('sidebar-order-badge');
    if (sideBadge) sideBadge.textContent = pendingOrders > 0 ? `${pendingOrders} New` : 'Live';
}

function setElText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function setElStyleWidth(id, width) {
    const el = document.getElementById(id);
    if (el) el.style.width = width;
}

function updateNotificationBadge() {
    const orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    const pending = orders.filter(o => o.status === 'Pending').length;
    const badge = document.getElementById('notif-badge-count');
    if (badge) {
        badge.textContent = pending;
        badge.classList.toggle('hidden', pending === 0);
    }
}

// ----------------------------------------------------------------
// 1. DASHBOARD CHARTS & RECENT ORDERS
// ----------------------------------------------------------------
function renderDashboardCharts() {
    const orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    const config = getStoreConfig();

    const salesCanvas = document.getElementById('salesOverviewChart');
    if (salesCanvas && window.Chart) {
        if (salesChartInstance) salesChartInstance.destroy();

        const days = [];
        const salesData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            days.push(dateStr);

            const dayOrders = orders.filter(o => {
                const od = new Date(o.timestamp || o.date);
                return od.toDateString() === d.toDateString() && o.status !== 'Cancelled';
            });
            const dayTotal = dayOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
            salesData.push(dayTotal);
        }

        const actualTotal = orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + (o.grandTotal || 0), 0);
        if (salesData.every(v => v === 0) && actualTotal > 0) {
            salesData[6] = actualTotal;
        }

        salesChartInstance = new Chart(salesCanvas, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Sales Revenue (Rs.)',
                    data: salesData,
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#EF4444',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` Revenue: Rs. ${ctx.raw.toLocaleString()}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.04)' },
                        ticks: {
                            callback: (val) => `Rs. ${val.toLocaleString()}`
                        }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }

    const ordersCanvas = document.getElementById('ordersDoughnutChart');
    if (ordersCanvas && window.Chart) {
        if (ordersChartInstance) ordersChartInstance.destroy();

        const pending = orders.filter(o => o.status === 'Pending').length;
        const dispatched = orders.filter(o => o.status === 'Dispatched').length;
        const delivered = orders.filter(o => o.status === 'Delivered').length;
        const cancelled = orders.filter(o => o.status === 'Cancelled').length;

        ordersChartInstance = new Chart(ordersCanvas, {
            type: 'doughnut',
            data: {
                labels: ['Pending', 'Dispatched', 'Delivered', 'Cancelled'],
                datasets: [{
                    data: orders.length === 0 ? [1, 0, 0, 0] : [pending, dispatched, delivered, cancelled],
                    backgroundColor: ['#F59E0B', '#3B82F6', '#10B981', '#EF4444'],
                    borderWidth: 3,
                    borderColor: '#FFFFFF'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11, weight: 'bold' } } }
                }
            }
        });
    }
}

function renderRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    const config = getStoreConfig();
    const tbody = document.getElementById('recent-orders-table-body');
    if (!tbody) return;

    const recent = orders.slice(0, 5);
    if (recent.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-400 text-xs font-semibold">Abhi tak koi naya order nahi aaya. Website par order place karein!</td></tr>`;
        return;
    }

    tbody.innerHTML = recent.map(ord => generateOrderRowHTML(ord, config)).join('');
}

// ----------------------------------------------------------------
// 2. ANALYTICS MODULE (MATCHING USER SCREENSHOT & PREMIER SPEC)
// ----------------------------------------------------------------

function setAnalyticsPeriod(period) {
    const validPeriods = ['today', '7days', '15days', '1month', '3months', '6months', '1year', 'lifetime'];
    if (!validPeriods.includes(period)) period = '7days';
    currentAnalyticsPeriod = period;

    // 1. Update filter pill buttons state
    document.querySelectorAll('.analytics-pill').forEach(btn => {
        const p = btn.getAttribute('data-period');
        if (p === period) {
            btn.className = 'analytics-pill px-3.5 py-1.5 rounded-xl text-xs font-bold transition bg-slate-900 text-white shadow-xs';
            if (p === 'today') {
                btn.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Daily Live (Today)`;
            }
        } else {
            btn.className = 'analytics-pill px-3.5 py-1.5 rounded-xl text-xs font-bold transition bg-transparent hover:bg-slate-100 text-slate-600';
            if (p === 'today') {
                btn.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Daily Live (Today)`;
            }
        }
    });

    // 2. Synchronize dropdowns in Sales Overview & Orders Overview
    const salesSelect = document.getElementById('analytics-sales-period-select');
    if (salesSelect) salesSelect.value = period;

    const ordersSelect = document.getElementById('analytics-orders-period-select');
    if (ordersSelect) ordersSelect.value = period;

    // 3. Update active filter badge in Daily Live Products section
    const liveBadge = document.getElementById('analytics-live-period-text');
    if (liveBadge) {
        const labels = {
            'today': 'Daily Live (Today)',
            '7days': '7 Days',
            '15days': '15 Days',
            '1month': '1 Month (30D)',
            '3months': '3 Months (90D)',
            '6months': '6 Months (180D)',
            '1year': '1 Year (365D)',
            'lifetime': 'Lifetime (All Time)'
        };
        liveBadge.textContent = `Active Filter: ${labels[period] || period}`;
    }

    renderAnalyticsTab();
}

function getPeriodTitle(period) {
    switch (period) {
        case 'today': return 'Today';
        case '7days': return '7 Days';
        case '15days': return '15 Days';
        case '1month': return '1 Month';
        case '3months': return '3 Months';
        case '6months': return '6 Months';
        case '1year': return '1 Year';
        case 'lifetime': return 'Lifetime';
        default: return '7 Days';
    }
}

function getOrdersForPeriod(orders, period) {
    const now = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return orders.filter(ord => {
        let ts = ord.timestamp;
        if (!ts && ord.date) {
            const parsed = Date.parse(ord.date);
            if (!isNaN(parsed)) ts = parsed;
        }
        if (!ts) ts = now;

        switch(period) {
            case 'today':
                return ts >= startOfToday.getTime();
            case '7days':
                return ts >= (now - 7 * 86400000);
            case '15days':
                return ts >= (now - 15 * 86400000);
            case '1month':
                return ts >= (now - 30 * 86400000);
            case '3months':
                return ts >= (now - 90 * 86400000);
            case '6months':
                return ts >= (now - 180 * 86400000);
            case '1year':
                return ts >= (now - 365 * 86400000);
            case 'lifetime':
            default:
                return true;
        }
    });
}

function formatAnalyticsDateStr(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function getAnalyticsDateIntervalText(period) {
    const now = new Date();
    const endStr = formatAnalyticsDateStr(now);

    switch(period) {
        case 'today':
            return `${endStr} → ${endStr} · hour intervals`;
        case '7days':
            return `${formatAnalyticsDateStr(new Date(Date.now() - 7 * 86400000))} → ${endStr} · day intervals`;
        case '15days':
            return `${formatAnalyticsDateStr(new Date(Date.now() - 15 * 86400000))} → ${endStr} · day intervals`;
        case '1month':
            return `${formatAnalyticsDateStr(new Date(Date.now() - 30 * 86400000))} → ${endStr} · 30 day intervals`;
        case '3months':
            return `${formatAnalyticsDateStr(new Date(Date.now() - 90 * 86400000))} → ${endStr} · month intervals`;
        case '6months':
            return `${formatAnalyticsDateStr(new Date(Date.now() - 180 * 86400000))} → ${endStr} · month intervals`;
        case '1year':
            return `${formatAnalyticsDateStr(new Date(Date.now() - 365 * 86400000))} → ${endStr} · monthly intervals`;
        case 'lifetime':
        default:
            return `All time records · lifetime intervals`;
    }
}

function renderAnalyticsTab() {
    checkAndSeedSampleOrders();
    const allOrders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    const config = getStoreConfig();

    const period = currentAnalyticsPeriod || '7days';
    const periodOrders = getOrdersForPeriod(allOrders, period);

    // Delivered orders in this period
    const deliveredOrders = periodOrders.filter(o => o.status === 'Delivered');
    const deliveredRevenue = deliveredOrders.reduce((s, o) => s + (o.grandTotal || 0), 0);

    // Unique customers in this period
    const customerKeys = new Set();
    periodOrders.forEach(o => {
        if (o.customer && o.customer.phone) customerKeys.add(o.customer.phone);
        else if (o.customer && o.customer.name) customerKeys.add(o.customer.name);
        else customerKeys.add(o.id);
    });
    const uniqueCustomersCount = customerKeys.size;

    // Units sold in delivered orders
    let unitsSold = 0;
    deliveredOrders.forEach(o => {
        if (Array.isArray(o.items)) {
            o.items.forEach(it => {
                unitsSold += (it.quantity || 1);
            });
        }
    });

    // 1. UPDATE TOP 4 METRIC CARDS (Exact match to screenshot)
    setElText('analytics-top-revenue', `${config.currency} ${deliveredRevenue.toLocaleString()}`);
    setElText('analytics-top-revenue-sub', `Delivered orders, including delivery`);

    setElText('analytics-top-orders', periodOrders.length);
    setElText('analytics-top-orders-sub', `All order statuses`);

    setElText('analytics-top-customers', uniqueCustomersCount);
    setElText('analytics-top-customers-sub', `Customers with orders`);

    setElText('analytics-top-products', unitsSold);
    setElText('analytics-top-products-sub', `Units in delivered orders`);

    // 2. UPDATE SALES OVERVIEW CARD
    setElText('analytics-sales-overview-amount', `${config.currency} ${deliveredRevenue.toLocaleString()}`);
    setElText('analytics-sales-overview-count', `${deliveredOrders.length} delivered order${deliveredOrders.length === 1 ? '' : 's'} in this period`);
    setElText('analytics-sales-overview-interval', getAnalyticsDateIntervalText(period));

    // Render Sales Line/Area Chart
    renderAnalyticsSalesChart(periodOrders, period, config);

    // 3. UPDATE ORDERS OVERVIEW CARD
    setElText('analytics-orders-overview-subtitle', `${getPeriodTitle(period)} · by order date · current status`);
    setElText('analytics-orders-overview-total', periodOrders.length);

    const pendingCount = periodOrders.filter(o => o.status === 'Pending').length;
    const confirmedCount = periodOrders.filter(o => o.status === 'Confirmed' || o.status === 'Processing').length;
    const shippedCount = periodOrders.filter(o => o.status === 'Shipped' || o.status === 'Dispatched').length;
    const deliveredCount = periodOrders.filter(o => o.status === 'Delivered').length;
    const cancelledCount = periodOrders.filter(o => o.status === 'Cancelled').length;

    const totalOrders = periodOrders.length;
    const calcPct = (cnt) => totalOrders > 0 ? `${Math.round((cnt / totalOrders) * 100)}%` : '0%';

    setElText('stat-count-pending', pendingCount);
    setElStyleWidth('stat-bar-pending', calcPct(pendingCount));

    setElText('stat-count-confirmed', confirmedCount);
    setElStyleWidth('stat-bar-confirmed', calcPct(confirmedCount));

    setElText('stat-count-shipped', shippedCount);
    setElStyleWidth('stat-bar-shipped', calcPct(shippedCount));

    setElText('stat-count-delivered', deliveredCount);
    setElStyleWidth('stat-bar-delivered', calcPct(deliveredCount));

    setElText('stat-count-cancelled', cancelledCount);
    setElStyleWidth('stat-bar-cancelled', calcPct(cancelledCount));

    // 4. UPDATE DAILY LIVE PRODUCTS TABLE
    renderDailyLiveProducts(periodOrders, config);
}

function renderAnalyticsSalesChart(periodOrders, period, config) {
    const canvas = document.getElementById('analyticsSalesChart');
    if (!canvas || !window.Chart) return;

    if (analyticsSalesChartInstance) {
        analyticsSalesChartInstance.destroy();
        analyticsSalesChartInstance = null;
    }

    const deliveredOrders = periodOrders.filter(o => o.status === 'Delivered');
    const now = new Date();
    let labels = [];
    let data = [];

    if (period === 'today') {
        labels = ['12 AM', '04 AM', '08 AM', '12 PM', '04 PM', '08 PM', 'Now'];
        data = [0, 0, 0, 0, 0, 0, 0];
        const startOfToday = new Date().setHours(0, 0, 0, 0);

        deliveredOrders.forEach(ord => {
            const ts = ord.timestamp || Date.now();
            if (ts >= startOfToday) {
                const hr = new Date(ts).getHours();
                const bucket = Math.min(Math.floor(hr / 4), 6);
                data[bucket] += (ord.grandTotal || 0);
            }
        });
    } else if (period === '7days') {
        for (let i = 6; i >= 0; i--) {
            const d = new Date(Date.now() - i * 86400000);
            labels.push(d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }));

            const dayStart = new Date(d).setHours(0, 0, 0, 0);
            const dayEnd = new Date(d).setHours(23, 59, 59, 999);

            const dayTotal = deliveredOrders.filter(o => {
                const ts = o.timestamp || Date.now();
                return ts >= dayStart && ts <= dayEnd;
            }).reduce((sum, o) => sum + (o.grandTotal || 0), 0);

            data.push(dayTotal);
        }
    } else if (period === '15days') {
        for (let i = 14; i >= 0; i -= 2) {
            const d = new Date(Date.now() - i * 86400000);
            labels.push(d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }));

            const winStart = new Date(Date.now() - (i + 1) * 86400000).setHours(0, 0, 0, 0);
            const winEnd = new Date(Date.now() - (i - 1) * 86400000).setHours(23, 59, 59, 999);

            const total = deliveredOrders.filter(o => {
                const ts = o.timestamp || Date.now();
                return ts >= winStart && ts <= winEnd;
            }).reduce((sum, o) => sum + (o.grandTotal || 0), 0);

            data.push(total);
        }
    } else if (period === '1month') {
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Recent'];
        data = [0, 0, 0, 0, 0];
        deliveredOrders.forEach(o => {
            const ts = o.timestamp || Date.now();
            const daysAgo = (Date.now() - ts) / 86400000;
            if (daysAgo <= 30) {
                const idx = Math.min(Math.floor((30 - daysAgo) / 6), 4);
                data[idx] += (o.grandTotal || 0);
            }
        });
    } else if (period === '3months') {
        labels = ['10 Wks Ago', '8 Wks Ago', '6 Wks Ago', '4 Wks Ago', '2 Wks Ago', 'This Week'];
        data = [0, 0, 0, 0, 0, 0];
        deliveredOrders.forEach(o => {
            const ts = o.timestamp || Date.now();
            const daysAgo = (Date.now() - ts) / 86400000;
            if (daysAgo <= 90) {
                const idx = Math.min(Math.floor((90 - daysAgo) / 15), 5);
                data[idx] += (o.grandTotal || 0);
            }
        });
    } else if (period === '6months') {
        data = [0, 0, 0, 0, 0, 0];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
        }
        deliveredOrders.forEach(o => {
            const ts = o.timestamp || Date.now();
            const d = new Date(ts);
            const mDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
            if (mDiff >= 0 && mDiff < 6) {
                const idx = 5 - mDiff;
                data[idx] += (o.grandTotal || 0);
            }
        });
    } else {
        // 1 Year or Lifetime (12 Months)
        data = Array(12).fill(0);
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
        }
        deliveredOrders.forEach(o => {
            const ts = o.timestamp || Date.now();
            const d = new Date(ts);
            const mDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
            if (mDiff >= 0 && mDiff < 12) {
                const idx = 11 - mDiff;
                data[idx] += (o.grandTotal || 0);
            }
        });
    }

    const ctx = canvas.getContext('2d');
    let gradient = null;
    try {
        gradient = ctx.createLinearGradient(0, 0, 0, 240);
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.18)');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0.01)');
    } catch(e) {
        gradient = 'rgba(37, 99, 235, 0.08)';
    }

    analyticsSalesChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Delivered Revenue',
                data: data,
                fill: true,
                backgroundColor: gradient,
                borderColor: '#2563EB',
                borderWidth: 2.5,
                tension: 0.35,
                pointBackgroundColor: '#2563EB',
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0F172A',
                    titleFont: { size: 12, weight: 'bold' },
                    bodyFont: { size: 12 },
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return ` Delivered: ${config.currency} ${Number(context.parsed.y).toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#F1F5F9', borderDash: [4, 4] },
                    ticks: {
                        font: { size: 11 },
                        color: '#94A3B8',
                        callback: function(val) {
                            if (val >= 1000) return `${config.currency} ${Math.round(val / 1000)}k`;
                            return `${config.currency} ${val}`;
                        }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 11 }, color: '#94A3B8' }
                }
            }
        }
    });
}

function renderDailyLiveProducts(periodOrders, config) {
    const tbody = document.getElementById('analytics-live-products-tbody');
    if (!tbody) return;

    const allProducts = typeof getProducts === 'function' ? getProducts() : [];

    // Map units sold and revenue from periodOrders
    const salesMap = {};
    periodOrders.forEach(ord => {
        if (ord.status === 'Cancelled') return;
        if (Array.isArray(ord.items)) {
            ord.items.forEach(it => {
                const name = it.name || 'Toy Product';
                if (!salesMap[name]) {
                    salesMap[name] = {
                        name: name,
                        unitsSold: 0,
                        revenue: 0,
                        image: it.image || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80',
                        category: 'Toys',
                        stock: 25,
                        price: it.price || 1999
                    };
                }
                salesMap[name].unitsSold += (it.quantity || 1);
                salesMap[name].revenue += ((it.quantity || 1) * (it.price || 0));
                if (it.image) salesMap[name].image = it.image;
            });
        }
    });

    // Cross-reference with store catalog products
    allProducts.forEach(prod => {
        if (salesMap[prod.name]) {
            salesMap[prod.name].category = prod.category || salesMap[prod.name].category;
            salesMap[prod.name].stock = prod.stock !== undefined ? prod.stock : salesMap[prod.name].stock;
            if (prod.image) salesMap[prod.name].image = prod.image;
            if (prod.price) salesMap[prod.name].price = prod.price;
        } else {
            // Also include catalog items so tracker always displays active product availability
            salesMap[prod.name] = {
                name: prod.name,
                unitsSold: 0,
                revenue: 0,
                image: prod.image,
                category: prod.category || 'General',
                stock: prod.stock !== undefined ? prod.stock : 20,
                price: prod.price || 2000
            };
        }
    });

    // Sort by units sold descending, then revenue descending
    const sorted = Object.values(salesMap).sort((a, b) => {
        if (b.unitsSold !== a.unitsSold) return b.unitsSold - a.unitsSold;
        return b.revenue - a.revenue;
    }).slice(0, 8); // Top 8 live velocity toys

    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400 text-xs">Koi product record nahi mila.</td></tr>`;
        return;
    }

    tbody.innerHTML = sorted.map((p, idx) => {
        let rankBadge = '';
        if (idx === 0) rankBadge = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black text-xs shadow-2xs">🥇 1</span>`;
        else if (idx === 1) rankBadge = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-black text-xs shadow-2xs">🥈 2</span>`;
        else if (idx === 2) rankBadge = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/10 text-amber-900 font-black text-xs shadow-2xs">🥉 3</span>`;
        else rankBadge = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">${idx + 1}</span>`;

        let velocityBadge = '';
        if (p.unitsSold >= 3) {
            velocityBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs"><i class="fas fa-fire text-rose-500"></i> Hot Velocity</span>`;
        } else if (p.unitsSold >= 1) {
            velocityBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs"><i class="fas fa-bolt text-amber-500"></i> Active Demand</span>`;
        } else {
            velocityBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600"><i class="fas fa-chart-line text-slate-400"></i> Ready Stock</span>`;
        }

        let stockBadge = '';
        if (p.stock <= 5) {
            stockBadge = `<span class="text-rose-600 font-extrabold flex items-center justify-center gap-1"><i class="fas fa-triangle-exclamation text-[10px]"></i> Low: ${p.stock} pcs</span>`;
        } else {
            stockBadge = `<span class="text-emerald-700 font-bold">${p.stock} in stock</span>`;
        }

        return `
            <tr class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3 px-3 font-mono font-bold">${rankBadge}</td>
                <td class="py-3 px-3">
                    <div class="flex items-center gap-3">
                        <img src="${p.image}" alt="${p.name}" class="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs">
                        <div class="min-w-0">
                            <div class="font-extrabold text-slate-900 truncate max-w-[220px] sm:max-w-xs text-xs">${p.name}</div>
                            <div class="text-[11px] text-slate-400 font-semibold">${config.currency} ${(p.price || 0).toLocaleString()}</div>
                        </div>
                    </div>
                </td>
                <td class="py-3 px-3">
                    <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200/60">${p.category}</span>
                </td>
                <td class="py-3 px-3 text-center">
                    <span class="inline-block px-2.5 py-1 rounded-xl ${p.unitsSold > 0 ? 'bg-slate-900 text-white font-black' : 'bg-slate-100 text-slate-400 font-bold'} text-xs">${p.unitsSold} sold</span>
                </td>
                <td class="py-3 px-3 text-center text-xs">
                    ${stockBadge}
                </td>
                <td class="py-3 px-3 text-right font-black text-slate-900 text-xs">
                    ${p.revenue > 0 ? `${config.currency} ${p.revenue.toLocaleString()}` : `<span class="text-slate-400 font-medium">Rs. 0</span>`}
                </td>
                <td class="py-3 px-3 text-center">
                    ${velocityBadge}
                </td>
            </tr>
        `;
    }).join('');
}

// ----------------------------------------------------------------
// 3. REPORTS MODULE
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 3. REPORTS MODULE (MATCHING USER SCREENSHOT EXACTLY)
// ----------------------------------------------------------------
let selectedReportType = 'products';
let currentGeneratedReportData = null;

function selectReportType(type) {
    const validTypes = ['sales', 'orders', 'products', 'inventory', 'customers'];
    if (!validTypes.includes(type)) type = 'products';
    selectedReportType = type;

    // Update Card UI Highlight Borders (matching screenshot red active border)
    validTypes.forEach(t => {
        const card = document.getElementById(`report-card-${t}`);
        if (!card) return;
        const arrow = card.querySelector('.fa-arrow-right');
        if (t === type) {
            card.classList.remove('border-slate-200', 'hover:border-slate-300');
            card.classList.add('border-2', 'border-red-500', 'bg-red-50/20');
            if (arrow) {
                arrow.classList.remove('text-slate-300');
                arrow.classList.add('text-red-500');
            }
        } else {
            card.classList.remove('border-2', 'border-red-500', 'bg-red-50/20');
            card.classList.add('border-slate-200', 'hover:border-slate-300');
            if (arrow) {
                arrow.classList.remove('text-red-500');
                arrow.classList.add('text-slate-300');
            }
        }
    });

    // Update bottom title
    const titleEl = document.getElementById('report-generate-title');
    if (titleEl) {
        titleEl.textContent = `Generate ${type} report`;
    }

    // Auto-generate report view
    executeGenerateReport();
}

function renderReportsTab() {
    selectReportType(selectedReportType || 'products');
}

function executeGenerateReport() {
    const config = getStoreConfig();
    const container = document.getElementById('report-output-container');
    if (!container) return;

    const fromVal = document.getElementById('report-date-from')?.value;
    const toVal = document.getElementById('report-date-to')?.value;

    let fromTime = fromVal ? new Date(fromVal).getTime() : 0;
    let toTime = toVal ? new Date(toVal + 'T23:59:59').getTime() : Infinity;

    // Filter orders by date range
    const allOrders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    const orders = allOrders.filter(o => {
        const t = o.timestamp || (o.date ? new Date(o.date).getTime() : 0);
        return (!fromTime || t >= fromTime) && (!toTime || t <= toTime);
    });

    const products = getProducts();
    const customers = JSON.parse(localStorage.getItem('mehar_toys_customers')) || [];

    let reportTitle = "";
    let kpiHTML = "";
    let tableHeaders = [];
    let tableRows = [];
    let csvData = [];

    const dateRangeLabel = (fromVal || toVal) ? 
        `Date Range: ${fromVal || 'Start'} to ${toVal || 'Today'}` : 
        `All Available Records (Lifetime)`;

    // 1. PRODUCTS REPORT
    if (selectedReportType === 'products') {
        reportTitle = "Products & Catalog Performance Report";
        
        let totalSoldUnits = 0;
        let totalProductRevenue = 0;

        const prodStats = products.map(prod => {
            let soldQty = 0;
            orders.forEach(o => {
                if (o.status !== 'Cancelled') {
                    o.items.forEach(i => {
                        if (i.name.toLowerCase() === prod.name.toLowerCase() || i.id === prod.id) {
                            soldQty += i.quantity;
                        }
                    });
                }
            });
            const rev = soldQty * prod.price;
            totalSoldUnits += soldQty;
            totalProductRevenue += rev;
            return { ...prod, soldQty, revenue: rev };
        });

        kpiHTML = `
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-slate-50 border-b border-slate-200 text-xs">
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Active Toys</span>
                    <strong class="text-base text-slate-900">${products.length} toys</strong>
                </div>
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Total Units Sold</span>
                    <strong class="text-base text-indigo-600">${totalSoldUnits} units</strong>
                </div>
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Delivered Revenue</span>
                    <strong class="text-base text-emerald-600">${config.currency} ${totalProductRevenue.toLocaleString()}</strong>
                </div>
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Filtered Orders</span>
                    <strong class="text-base text-slate-800">${orders.length} orders</strong>
                </div>
            </div>
        `;

        tableHeaders = ["Toy Product", "Category", "Price", "In Stock", "Units Sold", "Revenue Generated", "Rating"];
        tableRows = prodStats.map(p => `
            <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs">
                <td class="px-4 py-3 flex items-center gap-3">
                    <img src="${p.image}" class="w-9 h-9 rounded-lg object-cover bg-slate-100" />
                    <div>
                        <div class="font-extrabold text-slate-800">${p.name}</div>
                        <div class="text-[10px] text-slate-400">ID: #${p.id}</div>
                    </div>
                </td>
                <td class="px-4 py-3 font-semibold text-slate-600 uppercase text-[10px]">${p.category}</td>
                <td class="px-4 py-3 font-bold">${config.currency} ${p.price.toLocaleString()}</td>
                <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full font-bold text-[10px] ${p.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">${p.inStock ? (p.stockCount || 15) + ' units' : 'Out of Stock'}</span></td>
                <td class="px-4 py-3 font-black text-slate-900">${p.soldQty} units</td>
                <td class="px-4 py-3 font-black text-emerald-600">${config.currency} ${p.revenue.toLocaleString()}</td>
                <td class="px-4 py-3 text-amber-500 font-bold">★ ${p.rating || 5.0}</td>
            </tr>
        `);

        csvData = prodStats.map(p => [
            p.id,
            `"${p.name.replace(/"/g, '""')}"`,
            p.category,
            p.price,
            p.stockCount || 15,
            p.soldQty,
            p.revenue,
            p.rating || 5.0
        ]);
        csvData.unshift(["Product ID", "Product Name", "Category", "Price (Rs)", "Stock Units", "Units Sold", "Total Revenue (Rs)", "Rating"]);
    }

    // 2. SALES REPORT
    else if (selectedReportType === 'sales') {
        reportTitle = "Delivered Revenue & Sales Report";

        const deliveredOrders = orders.filter(o => o.status === 'Delivered');
        const deliveredRev = deliveredOrders.reduce((s, o) => s + (o.grandTotal || 0), 0);
        const pendingRev = orders.filter(o => o.status === 'Pending').reduce((s, o) => s + (o.grandTotal || 0), 0);
        const codSales = orders.filter(o => !isOrderPaid(o)).reduce((s, o) => s + (o.grandTotal || 0), 0);
        const onlinePaidSales = orders.filter(o => isOrderPaid(o)).reduce((s, o) => s + (o.grandTotal || 0), 0);

        kpiHTML = `
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-slate-50 border-b border-slate-200 text-xs">
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Delivered Revenue</span>
                    <strong class="text-base text-emerald-600">${config.currency} ${deliveredRev.toLocaleString()}</strong>
                </div>
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Pending Inflow</span>
                    <strong class="text-base text-amber-600">${config.currency} ${pendingRev.toLocaleString()}</strong>
                </div>
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Paid Online (Prepaid)</span>
                    <strong class="text-base text-blue-600">${config.currency} ${onlinePaidSales.toLocaleString()}</strong>
                </div>
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Cash on Delivery (COD)</span>
                    <strong class="text-base text-purple-600">${config.currency} ${codSales.toLocaleString()}</strong>
                </div>
            </div>
        `;

        tableHeaders = ["Order ID", "Date", "Customer", "City", "Payment Status", "Subtotal", "Delivery Fee", "Grand Total", "Status"];
        tableRows = orders.map(o => {
            const isPaid = isOrderPaid(o);
            return `
                <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs">
                    <td class="px-4 py-3 font-black text-red-600">#${o.id}</td>
                    <td class="px-4 py-3">${o.date}</td>
                    <td class="px-4 py-3 font-bold text-slate-800">${o.customer.name}</td>
                    <td class="px-4 py-3 text-slate-600">${o.customer.city}</td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                            ${isPaid ? '✓ Paid Online (Collect: Rs. 0)' : '💵 COD (Cash Due)'}
                        </span>
                    </td>
                    <td class="px-4 py-3 font-semibold">${config.currency} ${o.subtotal.toLocaleString()}</td>
                    <td class="px-4 py-3 text-slate-500">${o.shipping === 0 ? 'FREE' : config.currency + ' ' + o.shipping}</td>
                    <td class="px-4 py-3 font-black text-slate-900">${config.currency} ${o.grandTotal.toLocaleString()}</td>
                    <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : (o.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700')}">${o.status}</span></td>
                </tr>
            `;
        });

        csvData = orders.map(o => [
            o.id,
            `"${o.date}"`,
            `"${o.customer.name.replace(/"/g, '""')}"`,
            `"${o.customer.city}"`,
            isOrderPaid(o) ? "Paid Online (Rs. 0 to collect)" : "Cash on Delivery",
            o.subtotal,
            o.shipping,
            o.grandTotal,
            o.status
        ]);
        csvData.unshift(["Order ID", "Date", "Customer Name", "City", "Payment Status", "Subtotal (Rs)", "Shipping (Rs)", "Grand Total (Rs)", "Order Status"]);
    }

    // 3. ORDERS REPORT
    else if (selectedReportType === 'orders') {
        reportTitle = "Store Orders & Dispatch Details Report";

        const pendingCount = orders.filter(o => o.status === 'Pending').length;
        const dispatchedCount = orders.filter(o => o.status === 'Dispatched').length;
        const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
        const cancelledCount = orders.filter(o => o.status === 'Cancelled').length;

        kpiHTML = `
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-slate-50 border-b border-slate-200 text-xs">
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Total Orders</span>
                    <strong class="text-base text-slate-900">${orders.length}</strong>
                </div>
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Pending</span>
                    <strong class="text-base text-amber-600">${pendingCount} orders</strong>
                </div>
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Dispatched</span>
                    <strong class="text-base text-blue-600">${dispatchedCount} orders</strong>
                </div>
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Delivered</span>
                    <strong class="text-base text-emerald-600">${deliveredCount} orders</strong>
                </div>
            </div>
        `;

        tableHeaders = ["Order ID", "Date", "Customer Name", "Phone", "Delivery Address", "Items", "Bill", "Payment Mode", "Status", "Slip"];
        tableRows = orders.map(o => {
            const isPaid = isOrderPaid(o);
            return `
                <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs">
                    <td class="px-4 py-3 font-black text-red-600">#${o.id}</td>
                    <td class="px-4 py-3">${o.date}</td>
                    <td class="px-4 py-3 font-bold text-slate-900">${o.customer.name}</td>
                    <td class="px-4 py-3 font-semibold text-slate-700">${o.customer.phone}</td>
                    <td class="px-4 py-3 text-slate-500 max-w-xs truncate">${o.customer.city}, ${o.customer.address}</td>
                    <td class="px-4 py-3 font-extrabold">${o.items.reduce((s, i) => s + i.quantity, 0)} toys</td>
                    <td class="px-4 py-3 font-black text-slate-900">${config.currency} ${o.grandTotal.toLocaleString()}</td>
                    <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${isPaid ? '✓ Paid Online' : '💵 COD'}</span></td>
                    <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${o.status}</span></td>
                    <td class="px-4 py-3 text-right">
                        <button onclick="printOrderSlip('${o.id}')" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px]"><i class="fas fa-print"></i></button>
                    </td>
                </tr>
            `;
        });

        csvData = orders.map(o => [
            o.id,
            `"${o.date}"`,
            `"${o.customer.name.replace(/"/g, '""')}"`,
            `"${o.customer.phone}"`,
            `"${o.customer.city}"`,
            `"${o.customer.address.replace(/"/g, '""')}"`,
            o.items.reduce((s, i) => s + i.quantity, 0),
            o.grandTotal,
            isOrderPaid(o) ? "Paid Online (Rs. 0 collect)" : "COD",
            o.status
        ]);
        csvData.unshift(["Order ID", "Date", "Customer Name", "Phone", "City", "Address", "Items Count", "Grand Total (Rs)", "Payment Mode", "Status"]);
    }

    // 4. INVENTORY REPORT
    else if (selectedReportType === 'inventory') {
        reportTitle = "Current Inventory & Stock Snapshot";

        let totalStockUnits = 0;
        let totalInventoryValue = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;

        products.forEach(p => {
            const stock = p.stockCount !== undefined ? p.stockCount : 15;
            totalStockUnits += stock;
            totalInventoryValue += (stock * p.price);
            if (stock <= 5 && stock > 0) lowStockCount++;
            if (stock === 0) outOfStockCount++;
        });

        kpiHTML = `
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-slate-50 border-b border-slate-200 text-xs">
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Total Stock Units</span>
                    <strong class="text-base text-slate-900">${totalStockUnits} units</strong>
                </div>
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Inventory Retail Worth</span>
                    <strong class="text-base text-emerald-600">${config.currency} ${totalInventoryValue.toLocaleString()}</strong>
                </div>
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Low Stock Alert (<= 5)</span>
                    <strong class="text-base text-amber-600">${lowStockCount} items</strong>
                </div>
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Out of Stock</span>
                    <strong class="text-base text-red-600">${outOfStockCount} items</strong>
                </div>
            </div>
        `;

        tableHeaders = ["Toy Product", "Category", "Retail Price", "Available Stock", "Stock Health", "Stock Retail Value"];
        tableRows = products.map(p => {
            const stock = p.stockCount !== undefined ? p.stockCount : 15;
            let badge = `<span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">In Stock</span>`;
            if (stock <= 5 && stock > 0) badge = `<span class="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Low Stock</span>`;
            if (stock === 0) badge = `<span class="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Out of Stock</span>`;

            return `
                <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs">
                    <td class="px-4 py-3 flex items-center gap-3">
                        <img src="${p.image}" class="w-9 h-9 rounded-lg object-cover bg-slate-100" />
                        <span class="font-extrabold text-slate-800">${p.name}</span>
                    </td>
                    <td class="px-4 py-3 font-semibold text-slate-600 uppercase text-[10px]">${p.category}</td>
                    <td class="px-4 py-3 font-bold">${config.currency} ${p.price.toLocaleString()}</td>
                    <td class="px-4 py-3 font-black text-slate-900">${stock} units</td>
                    <td class="px-4 py-3">${badge}</td>
                    <td class="px-4 py-3 font-black text-emerald-600">${config.currency} ${(stock * p.price).toLocaleString()}</td>
                </tr>
            `;
        });

        csvData = products.map(p => {
            const stock = p.stockCount !== undefined ? p.stockCount : 15;
            return [
                p.id,
                `"${p.name.replace(/"/g, '""')}"`,
                p.category,
                p.price,
                stock,
                stock > 5 ? "In Stock" : (stock > 0 ? "Low Stock" : "Out of Stock"),
                stock * p.price
            ];
        });
        csvData.unshift(["Product ID", "Product Name", "Category", "Price (Rs)", "Stock Units", "Stock Health", "Total Value (Rs)"]);
    }

    // 5. CUSTOMERS REPORT
    else if (selectedReportType === 'customers') {
        reportTitle = "Customer Spending & Order History Report";

        const customerMap = new Map();
        customers.forEach(c => {
            customerMap.set(c.phone, {
                name: c.name,
                phone: c.phone,
                city: c.city || 'Pakistan',
                registered: true,
                orderCount: 0,
                totalSpent: 0
            });
        });

        orders.forEach(o => {
            if (!o.customer || !o.customer.phone) return;
            const p = o.customer.phone;
            if (!customerMap.has(p)) {
                customerMap.set(p, {
                    name: o.customer.name,
                    phone: p,
                    city: o.customer.city || '',
                    registered: false,
                    orderCount: 0,
                    totalSpent: 0
                });
            }
            const record = customerMap.get(p);
            record.orderCount += 1;
            record.totalSpent += (o.grandTotal || 0);
        });

        const list = Array.from(customerMap.values());
        const totalCustSpent = list.reduce((s, c) => s + c.totalSpent, 0);

        kpiHTML = `
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-slate-50 border-b border-slate-200 text-xs">
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Total Customers</span>
                    <strong class="text-base text-slate-900">${list.length} buyers</strong>
                </div>
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Registered Accounts</span>
                    <strong class="text-base text-emerald-600">${customers.length}</strong>
                </div>
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Total Customer Spend</span>
                    <strong class="text-base text-indigo-600">${config.currency} ${totalCustSpent.toLocaleString()}</strong>
                </div>
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Avg Customer Lifetime</span>
                    <strong class="text-base text-slate-800">${list.length > 0 ? config.currency + ' ' + Math.round(totalCustSpent / list.length).toLocaleString() : 'Rs. 0'}</strong>
                </div>
            </div>
        `;

        tableHeaders = ["Customer Name", "Phone", "City", "Account Type", "Orders Placed", "Total Amount Spent"];
        tableRows = list.map(c => `
            <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs">
                <td class="px-4 py-3 font-extrabold text-slate-900">${c.name}</td>
                <td class="px-4 py-3 font-bold text-slate-700">${c.phone}</td>
                <td class="px-4 py-3 text-slate-600">${c.city || 'Pakistan'}</td>
                <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${c.registered ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">${c.registered ? 'Registered Account' : 'Guest Buyer'}</span></td>
                <td class="px-4 py-3 font-black text-slate-900">${c.orderCount} orders</td>
                <td class="px-4 py-3 font-black text-red-600">${config.currency} ${c.totalSpent.toLocaleString()}</td>
            </tr>
        `);

        csvData = list.map(c => [
            `"${c.name.replace(/"/g, '""')}"`,
            `"${c.phone}"`,
            `"${c.city}"`,
            c.registered ? "Registered" : "Guest",
            c.orderCount,
            c.totalSpent
        ]);
        csvData.unshift(["Customer Name", "Phone Number", "City", "Account Type", "Orders Count", "Total Spent (Rs)"]);
    }

    currentGeneratedReportData = {
        type: selectedReportType,
        title: reportTitle,
        dateRange: dateRangeLabel,
        csv: csvData
    };

    container.innerHTML = `
        <!-- Report Header Bar with Action Buttons -->
        <div class="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
            <div>
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-red-600 block">Generated Report</span>
                <h4 class="text-lg font-black text-slate-900 font-heading">${reportTitle}</h4>
                <p class="text-xs text-slate-400 mt-0.5">${dateRangeLabel}</p>
            </div>
            
            <div class="flex items-center gap-2 self-start sm:self-auto">
                <button 
                    onclick="downloadReportCSV()" 
                    class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all">
                    <i class="fas fa-file-csv text-emerald-400 text-sm"></i>
                    <span>Download CSV</span>
                </button>
                <button 
                    onclick="printGeneratedReport()" 
                    class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs flex items-center gap-1.5 active:scale-95 transition-all">
                    <i class="fas fa-print"></i>
                    <span>Print Report</span>
                </button>
            </div>
        </div>

        <!-- KPI Strip -->
        ${kpiHTML}

        <!-- Report Table -->
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <tr>
                        ${tableHeaders.map((h, i) => `<th class="px-4 py-3.5 ${i === tableHeaders.length - 1 ? 'text-right' : ''}">${h}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${tableRows.length > 0 ? tableRows.join('') : `<tr><td colspan="${tableHeaders.length}" class="text-center py-10 text-slate-400 text-xs font-semibold">No records found for the selected date range.</td></tr>`}
                </tbody>
            </table>
        </div>
    `;
}

function downloadReportCSV() {
    if (!currentGeneratedReportData || !currentGeneratedReportData.csv) {
        alert("Please generate a report first!");
        return;
    }

    const rows = currentGeneratedReportData.csv;
    const csvContent = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `MEHAR-TOYS-${currentGeneratedReportData.type.toUpperCase()}-REPORT.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function printGeneratedReport() {
    const reportBox = document.getElementById('report-output-container');
    if (!reportBox) return;

    const config = getStoreConfig();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${currentGeneratedReportData ? currentGeneratedReportData.title : 'Store Report'} - ${config.storeName}</title>
            <style>
                @page { size: A4 landscape; margin: 10mm; }
                body { font-family: Arial, sans-serif; padding: 20px; color: #222; font-size: 12px; }
                .header { border-bottom: 2px solid #222; padding-bottom: 12px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
                .store-title { font-size: 22px; font-weight: bold; color: #e63946; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; font-size: 11px; }
                th { background: #f8f9fa; text-transform: uppercase; font-size: 10px; }
                .footer { margin-top: 25px; font-size: 10px; text-align: center; color: #777; border-top: 1px dashed #ccc; padding-top: 8px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <div class="store-title">🧸 ${config.storeName}</div>
                    <div style="font-size: 11px; color: #555;">${config.address} | Phone: ${config.displayPhone}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 15px; font-weight: bold;">${currentGeneratedReportData ? currentGeneratedReportData.title : 'Store Report'}</div>
                    <div style="font-size: 10px; color: #777;">${currentGeneratedReportData ? currentGeneratedReportData.dateRange : ''}</div>
                </div>
            </div>

            ${reportBox.querySelector('table') ? reportBox.querySelector('table').outerHTML : ''}

            <div class="footer">
                Report generated from ${config.storeName} Live Store Records on ${new Date().toLocaleString()}.
            </div>
            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// ----------------------------------------------------------------
// 4. PRODUCTS & TOYS CATALOG
// ----------------------------------------------------------------
function renderProductsManager() {
    const products = getProducts();
    const config = getStoreConfig();
    const container = document.getElementById('products-manager-grid');
    if (!container) return;

    container.innerHTML = products.map(prod => `
        <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between p-4 group">
            <div class="relative h-44 rounded-2xl overflow-hidden bg-slate-100 mb-3 flex items-center justify-center">
                <img src="${prod.image}" alt="${prod.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span class="absolute top-2 left-2 text-[10px] font-extrabold uppercase text-blue-700 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
                    ${prod.category}
                </span>
                ${prod.videoUrl ? `
                    <span class="absolute top-2 right-2 text-[10px] font-black text-white bg-red-600/95 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <i class="fab fa-youtube"></i> Video
                    </span>
                ` : ''}
            </div>
            <div>
                <h4 class="font-extrabold text-sm text-slate-800 line-clamp-1">${prod.name}</h4>
                <div class="flex items-baseline gap-2 mt-1.5">
                    <span class="text-base font-black text-red-600">${config.currency} ${prod.price.toLocaleString()}</span>
                    ${prod.originalPrice ? `<span class="text-xs text-slate-400 line-through">${config.currency} ${prod.originalPrice.toLocaleString()}</span>` : ''}
                </div>
            </div>
            <div class="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                <button onclick="openEditProductModal(${prod.id})" class="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors">
                    <i class="fas fa-edit"></i> Edit & Video
                </button>
                <button onclick="deleteProduct(${prod.id})" class="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold rounded-xl text-xs transition-colors">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function handleAddProduct(e) {
    e.preventDefault();

    const name = document.getElementById('new-toy-name').value.trim();
    const category = document.getElementById('new-toy-category').value;
    const price = parseInt(document.getElementById('new-toy-price').value);
    const originalPrice = parseInt(document.getElementById('new-toy-orig-price').value) || price;
    const image = document.getElementById('new-toy-image').value.trim();
    const videoUrl = document.getElementById('new-toy-video') ? document.getElementById('new-toy-video').value.trim() : '';
    const description = document.getElementById('new-toy-desc').value.trim();

    if (!name || isNaN(price) || !image) {
        alert("Please provide toy name, valid price and image URL!");
        return;
    }

    let products = getProducts();
    const newId = Date.now();

    products.unshift({
        id: newId,
        name,
        category,
        price,
        originalPrice,
        discount: originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
        rating: 5.0,
        reviewsCount: 1,
        inStock: true,
        stockCount: 20,
        badge: "New Arrival",
        image,
        videoUrl: videoUrl || '',
        description: description || "Top quality kid-safe toy.",
        features: ["Child safe material", "Recommended for kids", "Fast dispatch"]
    });

    saveProducts(products);
    closeAddProductModal();
    renderProductsManager();
    updateOverviewMetrics();
    alert("🎉 Naya Toy video link ke sath kamyabi se add ho gaya!");
}

function openAddProductModal() {
    document.getElementById('add-product-modal').classList.remove('hidden');
}

function closeAddProductModal() {
    document.getElementById('add-product-modal').classList.add('hidden');
}

function openEditProductModal(prodId) {
    const products = getProducts();
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    document.getElementById('edit-toy-id').value = prod.id;
    document.getElementById('edit-toy-name').value = prod.name;
    document.getElementById('edit-toy-category').value = prod.category;
    document.getElementById('edit-toy-stock').value = prod.stockCount || 20;
    document.getElementById('edit-toy-price').value = prod.price;
    document.getElementById('edit-toy-orig-price').value = prod.originalPrice || prod.price;
    document.getElementById('edit-toy-image').value = prod.image || '';
    document.getElementById('edit-toy-video').value = prod.videoUrl || '';
    document.getElementById('edit-toy-desc').value = prod.description || '';

    const testLink = document.getElementById('edit-toy-video-test');
    if (testLink) {
        if (prod.videoUrl) {
            testLink.href = prod.videoUrl;
            testLink.classList.remove('hidden');
        } else {
            testLink.classList.add('hidden');
        }
    }

    document.getElementById('edit-product-modal').classList.remove('hidden');
}

function closeEditProductModal() {
    const modal = document.getElementById('edit-product-modal');
    if (modal) modal.classList.add('hidden');
}

function handleEditProductSubmit(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('edit-toy-id').value);
    let products = getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return;

    const name = document.getElementById('edit-toy-name').value.trim();
    const category = document.getElementById('edit-toy-category').value;
    const stockCount = parseInt(document.getElementById('edit-toy-stock').value) || 0;
    const price = parseInt(document.getElementById('edit-toy-price').value);
    const originalPrice = parseInt(document.getElementById('edit-toy-orig-price').value) || price;
    const image = document.getElementById('edit-toy-image').value.trim();
    const videoUrl = document.getElementById('edit-toy-video').value.trim();
    const description = document.getElementById('edit-toy-desc').value.trim();

    if (!name || isNaN(price) || !image) {
        alert("Please provide valid Name, Price and Image!");
        return;
    }

    products[idx].name = name;
    products[idx].category = category;
    products[idx].stockCount = stockCount;
    products[idx].inStock = stockCount > 0;
    products[idx].price = price;
    products[idx].originalPrice = originalPrice;
    products[idx].discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
    products[idx].image = image;
    products[idx].videoUrl = videoUrl;
    products[idx].description = description;

    saveProducts(products);
    closeEditProductModal();
    renderProductsManager();
    updateOverviewMetrics();
    alert("Toy details aur YouTube video link kamyabi se save ho gaye! ✅");
}

function editProductPrice(prodId) {
    let products = getProducts();
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    const newPrice = prompt(`Enter new price in Rs. for "${prod.name}":`, prod.price);
    if (newPrice !== null && !isNaN(parseInt(newPrice)) && parseInt(newPrice) > 0) {
        prod.price = parseInt(newPrice);
        saveProducts(products);
        renderProductsManager();
        alert(`Price updated to Rs. ${prod.price}!`);
    }
}

function deleteProduct(prodId) {
    if (!confirm("Are you sure you want to remove this toy from the store?")) return;

    let products = getProducts();
    products = products.filter(p => p.id !== prodId);
    saveProducts(products);
    renderProductsManager();
    updateOverviewMetrics();
}

function resetProductsToDefault() {
    if (!confirm("Kya aap tamam default toys wapas lana chahte hain?")) return;
    localStorage.removeItem('mehar_toys_products');
    renderProductsManager();
    updateOverviewMetrics();
    alert("Default toys restored!");
}

// ----------------------------------------------------------------
// 5. INVENTORY & STOCK MANAGEMENT
// ----------------------------------------------------------------
function renderInventoryTab() {
    const products = getProducts();
    const container = document.getElementById('inventory-table-body');
    if (!container) return;

    container.innerHTML = products.map(prod => {
        const stock = prod.stockCount !== undefined ? prod.stockCount : 15;
        let badge = `<span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">In Stock</span>`;
        if (stock <= 5 && stock > 0) badge = `<span class="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Low Stock</span>`;
        if (stock === 0) badge = `<span class="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Out of Stock</span>`;

        return `
            <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs">
                <td class="px-4 py-3 flex items-center gap-3">
                    <img src="${prod.image}" class="w-10 h-10 rounded-lg object-cover" />
                    <div>
                        <div class="font-bold text-slate-800">${prod.name}</div>
                        <div class="text-[10px] text-slate-400">${prod.category}</div>
                    </div>
                </td>
                <td class="px-4 py-3 font-bold">${prod.price}</td>
                <td class="px-4 py-3 font-extrabold text-sm">${stock} units</td>
                <td class="px-4 py-3">${badge}</td>
                <td class="px-4 py-3 text-right">
                    <button onclick="adjustStock(${prod.id}, 1)" class="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs mr-1">+</button>
                    <button onclick="adjustStock(${prod.id}, -1)" class="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs">-</button>
                </td>
            </tr>
        `;
    }).join('');
}

function adjustStock(prodId, delta) {
    let products = getProducts();
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    if (prod.stockCount === undefined) prod.stockCount = 15;
    prod.stockCount = Math.max(0, prod.stockCount + delta);
    prod.inStock = prod.stockCount > 0;
    saveProducts(products);
    renderInventoryTab();
}

// ----------------------------------------------------------------
// 6. FULL ORDERS MANAGEMENT
// ----------------------------------------------------------------
function renderFullOrdersTable() {
    const orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    const config = getStoreConfig();
    const tbody = document.getElementById('orders-table-body');
    const emptyOrders = document.getElementById('empty-orders-view');

    let filtered = orders.filter(ord => {
        const matchesStatus = orderFilterStatus === 'all' || ord.status === orderFilterStatus;
        const q = orderSearchQuery.toLowerCase();
        const matchesSearch = !q || 
            ord.id.toLowerCase().includes(q) || 
            ord.customer.name.toLowerCase().includes(q) || 
            ord.customer.phone.includes(q) ||
            ord.customer.city.toLowerCase().includes(q);

        return matchesStatus && matchesSearch;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        if (emptyOrders) emptyOrders.classList.remove('hidden');
        return;
    }

    if (emptyOrders) emptyOrders.classList.add('hidden');
    tbody.innerHTML = filtered.map(ord => generateOrderRowHTML(ord, config)).join('');
}

function generateOrderRowHTML(ord, config) {
    let statusBadgeClass = 'bg-amber-50 text-amber-700 border-amber-300';
    if (ord.status === 'Dispatched') statusBadgeClass = 'bg-blue-50 text-blue-700 border-blue-300';
    if (ord.status === 'Delivered') statusBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-300';
    if (ord.status === 'Cancelled') statusBadgeClass = 'bg-red-50 text-red-700 border-red-300';

    const totalItemsCount = ord.items.reduce((s, i) => s + i.quantity, 0);
    const isPaid = isOrderPaid(ord);

    return `
        <tr class="hover:bg-slate-50/80 border-b border-slate-100 transition-colors text-xs">
            <td class="px-4 py-3.5 font-black text-red-600 tracking-wide">
                #${ord.id}
                <div class="text-[10px] text-slate-400 font-normal mt-0.5">${ord.date}</div>
            </td>
            <td class="px-4 py-3.5">
                <div class="font-extrabold text-slate-900">${ord.customer.name}</div>
                <div class="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5"><i class="fas fa-phone text-slate-400 text-[10px]"></i> ${ord.customer.phone}</div>
            </td>
            <td class="px-4 py-3.5">
                <div class="font-bold text-slate-800">${ord.customer.city}</div>
                <div class="text-[10px] text-slate-400 truncate max-w-xs" title="${ord.customer.address}">${ord.customer.address}</div>
            </td>
            <td class="px-4 py-3.5">
                <span class="font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">${totalItemsCount} toys</span>
                <div class="text-[10px] text-slate-400 truncate max-w-[140px] mt-0.5">
                    ${ord.items.map(i => i.name).join(', ')}
                </div>
            </td>
            <td class="px-4 py-3.5">
                ${isPaid ? `
                    <span class="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-emerald-300">
                        <i class="fas fa-check-circle"></i> PAID ONLINE
                    </span>
                    <div class="text-xs font-black text-slate-800 mt-1">Total: ${config.currency} ${ord.grandTotal.toLocaleString()}</div>
                    <div class="text-[11px] font-extrabold text-emerald-700">Cash to Collect: <span class="bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Rs. 0</span></div>
                    <span class="text-[10px] text-slate-400 font-semibold block">${ord.paymentMethod}</span>
                ` : `
                    <span class="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-amber-300">
                        <i class="fas fa-hand-holding-dollar"></i> CASH ON DELIVERY (COD)
                    </span>
                    <div class="font-black text-red-600 text-sm mt-1">Collect: ${config.currency} ${ord.grandTotal.toLocaleString()}</div>
                    <span class="text-[10px] text-amber-700 font-bold block">Collect from customer upon delivery</span>
                `}
                ${ord.trxId ? `<span class="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded inline-block mt-0.5">TID: ${ord.trxId}</span>` : ''}
                ${ord.paymentSlip ? `<button onclick="openSlipModal('${ord.id}')" class="text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-0.5 transition-all"><i class="fas fa-image"></i> View Slip</button>` : ''}
                ${ord.couponCode ? `<div class="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded mt-1 inline-block"><i class="fas fa-ticket text-emerald-600 mr-0.5"></i> Voucher: ${ord.couponCode} (-Rs. ${(ord.discountAmount || 0).toLocaleString()})</div>` : ''}
            </td>
            <td class="px-4 py-3.5">
                <select 
                    onchange="changeOrderStatus('${ord.id}', this.value)"
                    class="px-2.5 py-1.5 rounded-xl text-xs font-bold border ${statusBadgeClass} outline-none cursor-pointer shadow-sm">
                    <option value="Pending" ${ord.status === 'Pending' ? 'selected' : ''}>🟡 Pending</option>
                    <option value="Dispatched" ${ord.status === 'Dispatched' ? 'selected' : ''}>🚚 Dispatched</option>
                    <option value="Delivered" ${ord.status === 'Delivered' ? 'selected' : ''}>🟢 Delivered</option>
                    <option value="Cancelled" ${ord.status === 'Cancelled' ? 'selected' : ''}>🔴 Cancelled</option>
                </select>
            </td>
            <td class="px-4 py-3.5 text-right">
                <div class="flex items-center justify-end gap-1.5">
                    <button onclick="togglePaymentStatus('${ord.id}')" title="${isPaid ? 'Switch to COD' : 'Mark as Paid (Rs. 0 to collect)'}" class="p-2 rounded-xl ${isPaid ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'} text-xs transition-colors">
                        <i class="fas ${isPaid ? 'fa-arrow-rotate-left' : 'fa-circle-check'}"></i>
                    </button>
                    <button onclick="viewOrderDetails('${ord.id}')" title="View Full Details" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="printOrderSlip('${ord.id}')" title="Print Shipping Label / Slip" class="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs transition-colors">
                        <i class="fas fa-print"></i>
                    </button>
                    <button onclick="deleteOrder('${ord.id}')" title="Delete Order" class="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs transition-colors">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function changeOrderStatus(orderId, newStatus) {
    let orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    const index = orders.findIndex(o => o.id === orderId);
    if (index > -1) {
        orders[index].status = newStatus;
        localStorage.setItem('mehar_toys_orders', JSON.stringify(orders));
        
        if (typeof cloudUpdateOrderStatus === 'function') {
            cloudUpdateOrderStatus(orderId, newStatus);
        }

        updateOverviewMetrics();
        renderDashboardCharts();
        if (currentAdminTab === 'dashboard') renderRecentOrders();
        if (currentAdminTab === 'orders') renderFullOrdersTable();
    }
}

function deleteOrder(orderId) {
    if (!confirm(`Are you sure you want to delete order #${orderId}?`)) return;

    let orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    orders = orders.filter(o => o.id !== orderId);
    localStorage.setItem('mehar_toys_orders', JSON.stringify(orders));

    updateOverviewMetrics();
    renderDashboardCharts();
    if (currentAdminTab === 'dashboard') renderRecentOrders();
    if (currentAdminTab === 'orders') renderFullOrdersTable();
}

function viewOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    const ord = orders.find(o => o.id === orderId);
    if (!ord) return;

    const config = getStoreConfig();
    const isPaid = isOrderPaid(ord);
    const modal = document.getElementById('admin-modal');
    const content = document.getElementById('admin-modal-content');

    content.innerHTML = `
        <div class="space-y-4">
            <div class="flex justify-between items-start border-b pb-3">
                <div>
                    <span class="text-xs font-bold text-red-500 uppercase">Order Details</span>
                    <h3 class="text-2xl font-black text-slate-900">#${ord.id}</h3>
                    <div class="text-xs text-slate-400 mt-0.5">${ord.date}</div>
                </div>
                <div class="flex flex-col items-end gap-1">
                    <span class="px-3 py-1 rounded-full text-xs font-black ${ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">
                        ${ord.status}
                    </span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                        ${isPaid ? '✓ Paid Online' : '💵 Cash on Delivery'}
                    </span>
                </div>
            </div>

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div class="font-extrabold text-slate-900 text-sm mb-1">Customer & Delivery Info:</div>
                <div class="grid grid-cols-2 gap-2">
                    <div><span class="text-slate-500">Name:</span> <span class="font-bold text-slate-800">${ord.customer.name}</span></div>
                    <div><span class="text-slate-500">Phone:</span> <span class="font-bold text-slate-800">${ord.customer.phone}</span></div>
                    <div><span class="text-slate-500">City:</span> <span class="font-bold text-slate-800">${ord.customer.city}</span></div>
                    <div><span class="text-slate-500">Payment:</span> <span class="font-extrabold ${isPaid ? 'text-emerald-700' : 'text-amber-700'}">${ord.paymentMethod}</span></div>
                </div>
                <div><span class="text-slate-500">Address:</span> <span class="font-semibold text-slate-800">${ord.customer.address}</span></div>
                ${ord.trxId ? `<div class="bg-purple-50 p-2.5 rounded-xl border border-purple-200"><span class="text-purple-700 font-bold block">Easypaisa / JazzCash Transaction ID (TID):</span> <span class="text-sm font-black text-purple-900">${ord.trxId}</span></div>` : ''}
                ${ord.paymentSlip ? `
                    <div class="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-300">
                        <span class="text-xs font-bold text-emerald-800 block mb-1.5"><i class="fas fa-image mr-1"></i>Customer's Payment Screenshot:</span>
                        <a href="${ord.paymentSlip}" target="_blank" title="Click to view full image">
                            <img src="${ord.paymentSlip}" alt="Payment Proof" class="max-h-56 rounded-lg object-contain mx-auto border border-emerald-200 shadow-sm" />
                        </a>
                        <span class="text-[10px] text-emerald-600 block text-center mt-1">(Click image to view full size)</span>
                    </div>
                ` : ''}
                ${ord.customer.notes ? `<div><span class="text-slate-500">Special Notes:</span> <span class="font-semibold text-blue-600">${ord.customer.notes}</span></div>` : ''}
            </div>

            <div>
                <div class="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2">Order Items (${ord.items.length}):</div>
                <div class="space-y-2 max-h-48 overflow-y-auto">
                    ${ord.items.map(item => `
                        <div class="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200">
                            <img src="${item.image}" alt="${item.name}" class="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                            <div class="flex-1 min-w-0">
                                <div class="font-bold text-xs text-slate-800 truncate">${item.name}</div>
                                <div class="text-[11px] text-slate-500">Qty: ${item.quantity} x ${config.currency} ${item.price.toLocaleString()}</div>
                            </div>
                            <div class="font-black text-xs text-slate-900">${config.currency} ${(item.price * item.quantity).toLocaleString()}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Financial Totals Box with Doorstep Collection Status -->
            <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div class="flex justify-between text-slate-600"><span>Subtotal:</span> <span>${config.currency} ${ord.subtotal.toLocaleString()}</span></div>
                <div class="flex justify-between text-slate-600"><span>Shipping:</span> <span>${ord.shipping === 0 ? 'FREE' : config.currency + ' ' + ord.shipping}</span></div>
                ${ord.couponCode ? `
                    <div class="flex justify-between text-emerald-700 font-extrabold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                        <span class="flex items-center gap-1"><i class="fas fa-ticket text-emerald-600"></i> Voucher Applied (${ord.couponCode}):</span>
                        <span>-${config.currency} ${(ord.discountAmount || 0).toLocaleString()}</span>
                    </div>
                ` : ''}
                <div class="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Order Value:</span>
                    <span>${config.currency} ${ord.grandTotal.toLocaleString()}</span>
                </div>
                
                ${isPaid ? `
                    <div class="p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-xl space-y-1">
                        <div class="flex justify-between text-emerald-900 font-bold">
                            <span>Payment Received:</span>
                            <span>${config.currency} ${ord.grandTotal.toLocaleString()} (PAID)</span>
                        </div>
                        <div class="flex justify-between items-center text-emerald-900 font-black text-sm pt-1 border-t border-emerald-200">
                            <span>Cash to Collect at Doorstep:</span>
                            <span class="text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">RS. 0 (DO NOT COLLECT)</span>
                        </div>
                    </div>
                ` : `
                    <div class="p-2.5 bg-amber-100/70 border border-amber-300 rounded-xl space-y-1">
                        <div class="flex justify-between text-amber-900 font-bold">
                            <span>Payment Mode:</span>
                            <span>Cash on Delivery (COD)</span>
                        </div>
                        <div class="flex justify-between items-center text-amber-900 font-black text-sm pt-1 border-t border-amber-200">
                            <span>Cash to Collect at Doorstep:</span>
                            <span class="text-red-600 bg-white px-2 py-0.5 rounded border border-amber-300">${config.currency} ${ord.grandTotal.toLocaleString()}</span>
                        </div>
                    </div>
                `}
            </div>

            <!-- Quick Payment Status Toggle for Admin -->
            <div class="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                <div class="text-xs">
                    <span class="text-slate-500 font-semibold">Payment Status:</span>
                    <strong class="${isPaid ? 'text-emerald-700' : 'text-amber-700'} ml-1">${isPaid ? '✓ Paid Online (Collect: Rs. 0)' : '💵 Cash on Delivery'}</strong>
                </div>
                <button onclick="togglePaymentStatus('${ord.id}')" class="px-3 py-1.5 rounded-xl text-xs font-bold ${isPaid ? 'bg-amber-100 hover:bg-amber-200 text-amber-800' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'} transition-all">
                    ${isPaid ? 'Switch to COD' : '✓ Mark as Paid (Rs. 0 to collect)'}
                </button>
            </div>

            <div class="flex gap-2 pt-2">
                <button onclick="printOrderSlip('${ord.id}')" class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md">
                    <i class="fas fa-print"></i>
                    <span>Print 1-Page Shipping Slip</span>
                </button>
                <button onclick="closeAdminModal()" class="py-3 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs">
                    Close
                </button>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
}

function togglePaymentStatus(orderId) {
    let orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    const ord = orders.find(o => o.id === orderId);
    if (!ord) return;

    const currentlyPaid = isOrderPaid(ord);
    if (currentlyPaid) {
        ord.paymentStatus = 'Unpaid (COD)';
        ord.paymentMethod = 'Cash on Delivery (COD)';
        ord.isPaid = false;
    } else {
        ord.paymentStatus = 'Paid';
        ord.isPaid = true;
        if (ord.paymentMethod.toLowerCase().includes('cod')) {
            ord.paymentMethod = 'Paid Online / Cash Received';
        }
    }

    localStorage.setItem('mehar_toys_orders', JSON.stringify(orders));
    updateOverviewMetrics();
    renderDashboardCharts();
    if (currentAdminTab === 'dashboard') renderRecentOrders();
    if (currentAdminTab === 'orders') renderFullOrdersTable();
    if (currentAdminTab === 'reports') renderReportsTab();

    const adminModal = document.getElementById('admin-modal');
    if (adminModal && !adminModal.classList.contains('hidden')) {
        viewOrderDetails(orderId);
    }
}

function openSlipModal(orderId) {
    const orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    const ord = orders.find(o => o.id === orderId);
    if (!ord || !ord.paymentSlip) return;

    const modal = document.getElementById('slip-view-modal');
    const img = document.getElementById('slip-modal-img');
    const title = document.getElementById('slip-modal-title');

    if (modal && img) {
        img.src = ord.paymentSlip;
        if (title) title.textContent = `Order #${ord.id} - ${ord.customer.name} (${ord.paymentMethod})`;
        modal.classList.remove('hidden');
    }
}

function closeSlipModal() {
    const modal = document.getElementById('slip-view-modal');
    if (modal) modal.classList.add('hidden');
}

function printOrderSlip(orderId) {
    const orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    const ord = orders.find(o => o.id === orderId);
    if (!ord) return;

    const config = getStoreConfig();
    const isPaid = isOrderPaid(ord);

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Shipping Label #${ord.id} - ${config.storeName}</title>
            <style>
                @page { size: A4 portrait; margin: 8mm; }
                body { font-family: Arial, sans-serif; padding: 15px; color: #222; font-size: 12px; }
                .header { border-bottom: 2px solid #222; padding-bottom: 12px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
                .store-title { font-size: 22px; font-weight: bold; color: #e63946; }
                .badge { padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 11px; }
                .badge-paid { background: #e8f5e9; color: #2e7d32; border: 1px solid #a3e635; }
                .badge-cod { background: #fff3cd; color: #b45309; border: 1px solid #fde047; }
                .box { border: 1px solid #ddd; padding: 12px; border-radius: 6px; margin-bottom: 12px; background: #fafafa; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 15px; }
                th, td { border: 1px solid #ddd; padding: 7px 10px; text-align: left; font-size: 12px; }
                th { background: #f8f9fa; }
                .footer { margin-top: 25px; font-size: 10px; text-align: center; color: #777; border-top: 1px dashed #ccc; padding-top: 8px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <div class="store-title">🧸 ${config.storeName}</div>
                    <div style="font-size: 11px; color: #555;">${config.address} | Phone: ${config.displayPhone}</div>
                </div>
                <div style="text-align: right;">
                    <span class="badge ${isPaid ? 'badge-paid' : 'badge-cod'}">${isPaid ? '✅ PRE-PAID (PAID ONLINE)' : '💵 CASH ON DELIVERY (COD)'}</span>
                    <div style="font-size: 13px; font-weight: bold; margin-top: 5px;">Order #${ord.id}</div>
                    <div style="font-size: 10px; color: #777;">${ord.date}</div>
                </div>
            </div>

            <!-- PARCEL DISPATCH BANNER -->
            ${isPaid ? `
                <div style="background: #e8f5e9; border: 2px dashed #2e7d32; color: #1b5e20; border-radius: 8px; padding: 12px; margin-bottom: 15px; text-align: center;">
                    <div style="font-size: 12px; font-weight: bold; text-transform: uppercase;">
                        ✅ PRE-PAID PARCEL — CUSTOMER HAS ALREADY PAID ONLINE
                    </div>
                    <div style="font-size: 11px; color: #2e7d32; margin-top: 3px;">
                        Payment verified via ${ord.paymentMethod} ${ord.trxId ? `(TID: ${ord.trxId})` : ''}
                    </div>
                    <div style="font-size: 19px; font-weight: 900; color: #1b5e20; margin-top: 5px; letter-spacing: 0.5px;">
                        CASH TO COLLECT: RS. 0 (DO NOT COLLECT ANY CASH FROM CUSTOMER!)
                    </div>
                </div>
            ` : `
                <div style="background: #fff7ed; border: 2px solid #ea580c; color: #9a3412; border-radius: 8px; padding: 12px; margin-bottom: 15px; text-align: center;">
                    <div style="font-size: 12px; font-weight: bold; text-transform: uppercase;">
                        💵 CASH ON DELIVERY (COD) PARCEL
                    </div>
                    <div style="font-size: 11px; color: #c2410c; margin-top: 3px;">
                        Courier / Rider: Please collect exact cash from customer upon delivery
                    </div>
                    <div style="font-size: 21px; font-weight: 900; color: #dc2626; margin-top: 5px; letter-spacing: 0.5px;">
                        CASH TO COLLECT: ${config.currency} ${ord.grandTotal.toLocaleString()}
                    </div>
                </div>
            `}

            <div class="box">
                <strong style="text-transform: uppercase; font-size: 11px; color: #555;">Customer Delivery Address:</strong><br>
                <strong>Name:</strong> ${ord.customer.name} | <strong>Phone:</strong> ${ord.customer.phone}<br>
                <strong>City:</strong> ${ord.customer.city}<br>
                <strong>Address:</strong> ${ord.customer.address}<br>
                <strong>Payment Mode:</strong> ${ord.paymentMethod}<br>
                ${ord.trxId ? `<strong>Transaction ID (TID):</strong> ${ord.trxId}<br>` : ''}
                ${ord.customer.notes ? `<strong>Notes:</strong> ${ord.customer.notes}` : ''}
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 40px; text-align: center;">#</th>
                        <th>Toy Product</th>
                        <th style="text-align: center; width: 60px;">Qty</th>
                        <th style="text-align: right; width: 100px;">Price</th>
                        <th style="text-align: right; width: 100px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${ord.items.map((i, idx) => `
                        <tr>
                            <td style="text-align: center;">${idx + 1}</td>
                            <td><strong>${i.name}</strong></td>
                            <td style="text-align: center;">${i.quantity}</td>
                            <td style="text-align: right;">${config.currency} ${i.price.toLocaleString()}</td>
                            <td style="text-align: right;"><strong>${config.currency} ${(i.price * i.quantity).toLocaleString()}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div style="display: flex; justify-content: flex-end;">
                <div style="width: 270px; background: #fafafa; border: 1px solid #ddd; border-radius: 6px; padding: 10px; font-size: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                        <span>Subtotal:</span>
                        <span>${config.currency} ${ord.subtotal.toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                        <span>Shipping Charges:</span>
                        <span>${ord.shipping === 0 ? 'FREE' : config.currency + ' ' + ord.shipping}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 3px; border-top: 1px solid #eee; padding-top: 3px;">
                        <span>Total Order Value:</span>
                        <span>${config.currency} ${ord.grandTotal.toLocaleString()}</span>
                    </div>
                    ${isPaid ? `
                        <div style="display: flex; justify-content: space-between; color: #2e7d32; font-weight: bold; margin-bottom: 3px;">
                            <span>Payment Received:</span>
                            <span>${config.currency} ${ord.grandTotal.toLocaleString()}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 14px; color: #1b5e20; border-top: 2px solid #a3e635; padding: 6px; margin-top: 4px; background: #e8f5e9; border-radius: 4px;">
                            <span>Cash to Collect:</span>
                            <span>RS. 0 (PAID)</span>
                        </div>
                    ` : `
                        <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 14px; color: #d90429; border-top: 2px solid #ffc9c9; padding: 6px; margin-top: 4px; background: #fff5f5; border-radius: 4px;">
                            <span>Cash to Collect (COD):</span>
                            <span>${config.currency} ${ord.grandTotal.toLocaleString()}</span>
                        </div>
                    `}
                </div>
            </div>

            <div class="footer">
                Thank you for choosing ${config.storeName}! For inquiries, call ${config.displayPhone}.
            </div>
            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function closeAdminModal() {
    document.getElementById('admin-modal').classList.add('hidden');
}

// ----------------------------------------------------------------
// 7. CATEGORIES MANAGEMENT
// ----------------------------------------------------------------
function renderCategoriesTab() {
    const products = getProducts();
    const container = document.getElementById('categories-table-body');
    if (!container) return;

    container.innerHTML = CATEGORIES.map(cat => {
        const count = cat.id === 'all' ? products.length : products.filter(p => p.category === cat.id).length;
        return `
            <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs">
                <td class="px-4 py-3.5 font-bold flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center"><i class="fas ${cat.icon}"></i></div>
                    <span>${cat.name}</span>
                </td>
                <td class="px-4 py-3.5 text-slate-500 font-mono">${cat.id}</td>
                <td class="px-4 py-3.5 font-extrabold">${count} toys</td>
                <td class="px-4 py-3.5"><span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Active</span></td>
            </tr>
        `;
    }).join('');
}

// ----------------------------------------------------------------
// 8. CUSTOMERS DIRECTORY & LOGIN/SIGNUP MANAGEMENT HUB
// ----------------------------------------------------------------

let customerFilterType = 'all';
let customerSearchQuery = '';
let customerCityFilter = 'all';

function checkAndSeedCustomers() {
    let custs = JSON.parse(localStorage.getItem('mehar_toys_customers')) || [];
    const richSeedCustomers = [
        {
            id: 'CUST-1001',
            name: 'Kashif Ali',
            phone: '0301-4455667',
            password: 'kashif123',
            city: 'Lahore',
            address: 'House #14, Street 3, Model Town',
            createdAt: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
            lastLogin: new Date(Date.now() - 3600000 * 2).toISOString(),  // 2 hours ago (Today)
            loginCount: 8,
            status: 'active'
        },
        {
            id: 'CUST-1002',
            name: 'Dr. Sadia Fatima',
            phone: '0333-5566778',
            password: 'sadia2026',
            city: 'Islamabad',
            address: 'Sector F-8/2, Street 19',
            createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), // 15 days ago
            lastLogin: new Date(Date.now() - 3600000 * 5).toISOString(),  // 5 hours ago (Today)
            loginCount: 14,
            status: 'active'
        },
        {
            id: 'CUST-1003',
            name: 'Bilal Farooq',
            phone: '0345-9876543',
            password: 'bilal786',
            city: 'Rawalpindi',
            address: 'House 88, Street 4, Bahria Town Phase 7',
            createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
            lastLogin: new Date(Date.now() - 3600000 * 1).toISOString(),  // 1 hour ago (Today)
            loginCount: 4,
            status: 'active'
        },
        {
            id: 'CUST-1004',
            name: 'Tariq Naveed',
            phone: '0321-9988776',
            password: 'tariq321',
            city: 'Karachi',
            address: 'Flat 4B, Gulshan-e-Iqbal Block 5',
            createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
            lastLogin: new Date(Date.now() - 86400000 * 1).toISOString(),
            loginCount: 19,
            status: 'active'
        },
        {
            id: 'CUST-1005',
            name: 'Zainab Bibi',
            phone: '0312-3456789',
            password: 'zainab99',
            city: 'Faisalabad',
            address: 'Madina Town, Main Bazar',
            createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
            lastLogin: new Date(Date.now() - 86400000 * 3).toISOString(),
            loginCount: 6,
            status: 'active'
        },
        {
            id: 'CUST-1006',
            name: 'Imran Rafique',
            phone: '0300-4411223',
            password: 'imran555',
            city: 'Lahore',
            address: 'DHA Phase 5, Sector C',
            createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
            lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(),
            loginCount: 11,
            status: 'active'
        },
        {
            id: 'CUST-1007',
            name: 'Maryam Siddiqui',
            phone: '0315-7766554',
            password: 'maryam786',
            city: 'Karachi',
            address: 'Clifton Block 2',
            createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
            lastLogin: new Date(Date.now() - 86400000 * 4).toISOString(),
            loginCount: 15,
            status: 'active'
        },
        {
            id: 'CUST-1008',
            name: 'Usman Ghani',
            phone: '0302-8877665',
            password: 'usman123',
            city: 'Multan',
            address: 'Gulgasht Colony, House 12',
            createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
            lastLogin: new Date(Date.now() - 86400000 * 6).toISOString(),
            loginCount: 3,
            status: 'active'
        }
    ];

    if (custs.length < 5) {
        const existingPhones = new Set(custs.map(c => c.phone));
        richSeedCustomers.forEach(rc => {
            if (!existingPhones.has(rc.phone)) {
                custs.push(rc);
            }
        });
        localStorage.setItem('mehar_toys_customers', JSON.stringify(custs));
    }
}

function setCustomerFilter(type) {
    customerFilterType = type;
    document.querySelectorAll('.cust-filter-pill').forEach(btn => {
        const ft = btn.getAttribute('data-cust-filter');
        if (ft === type) {
            btn.className = 'cust-filter-pill px-3.5 py-1.5 rounded-xl text-xs font-bold transition bg-slate-900 text-white shadow-xs';
        } else {
            btn.className = 'cust-filter-pill px-3.5 py-1.5 rounded-xl text-xs font-bold transition bg-transparent hover:bg-slate-100 text-slate-600';
        }
    });
    renderCustomersList();
}

function handleCustomerSearch(query) {
    customerSearchQuery = (query || '').trim();
    renderCustomersList();
}

function handleCustomerCityFilter(city) {
    customerCityFilter = city;
    renderCustomersList();
}

function toggleCustomerPassword(safeId, encodedPass) {
    const el = document.getElementById(`pwd-val-${safeId}`);
    const icon = document.getElementById(`pwd-icon-${safeId}`);
    if (!el) return;
    const plain = decodeURIComponent(encodedPass);
    if (el.textContent === '••••••••') {
        el.textContent = plain;
        el.classList.add('text-indigo-600', 'bg-indigo-50', 'border-indigo-200');
        if (icon) icon.className = 'fas fa-eye-slash text-xs text-indigo-600';
    } else {
        el.textContent = '••••••••';
        el.classList.remove('text-indigo-600', 'bg-indigo-50', 'border-indigo-200');
        if (icon) icon.className = 'fas fa-eye text-xs text-slate-400';
    }
}

function renderCustomersList() {
    checkAndSeedCustomers();
    const registeredCustomers = JSON.parse(localStorage.getItem('mehar_toys_customers')) || [];
    const orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    const config = getStoreConfig();
    const tbody = document.getElementById('customers-table-body');
    const emptyEl = document.getElementById('empty-customers-view');
    if (!tbody) return;

    const customerMap = new Map();

    // 1. Add all registered customer accounts
    registeredCustomers.forEach(c => {
        customerMap.set(c.phone, {
            id: c.id || ('CUST-' + Math.abs(c.phone.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0) % 100000)),
            name: c.name || 'Customer',
            avatar: c.avatar || null,
            phone: c.phone,
            password: c.password || '••••••',
            city: c.city || 'Pakistan',
            address: c.address || 'Address on file',
            registered: true,
            createdAt: c.createdAt || new Date().toISOString(),
            lastLogin: c.lastLogin || c.createdAt || new Date().toISOString(),
            loginCount: c.loginCount || 1,
            status: c.status || 'active',
            orderCount: 0,
            totalSpent: 0,
            ordersList: []
        });
    });

    // 2. Add or enrich with order history
    orders.forEach(o => {
        if (!o.customer || !o.customer.phone) return;
        const p = o.customer.phone;
        if (!customerMap.has(p)) {
            customerMap.set(p, {
                id: 'GUEST-' + p.replace(/\D/g, '').slice(-4),
                name: o.customer.name || 'Guest Buyer',
                phone: p,
                password: null,
                city: o.customer.city || 'Pakistan',
                address: o.customer.address || '',
                registered: false,
                createdAt: o.date || 'Direct Order',
                lastLogin: null,
                loginCount: 0,
                status: 'guest',
                orderCount: 0,
                totalSpent: 0,
                ordersList: []
            });
        }
        const record = customerMap.get(p);
        record.orderCount += 1;
        record.totalSpent += (o.grandTotal || 0);
        record.ordersList.push(o);
        if ((!record.city || record.city === 'Pakistan') && o.customer.city) record.city = o.customer.city;
        if (!record.address && o.customer.address) record.address = o.customer.address;
    });

    const allProfiles = Array.from(customerMap.values());

    // Top 4 Metric Cards calculation
    const totalSignups = allProfiles.filter(c => c.registered).length;
    const recentLogins = allProfiles.filter(c => c.registered && (c.loginCount > 0 || c.lastLogin)).length;
    const directBuyers = allProfiles.filter(c => c.orderCount > 0).length;
    const totalRevenue = allProfiles.reduce((s, c) => s + (c.totalSpent || 0), 0);

    setElText('cust-stat-registered', totalSignups);
    setElText('cust-stat-active-logins', recentLogins);
    setElText('cust-stat-buyers', directBuyers);
    setElText('cust-stat-revenue', `${config.currency} ${totalRevenue.toLocaleString()}`);

    // Update filter counts
    setElText('count-pill-all', allProfiles.length);
    setElText('count-pill-registered', totalSignups);
    setElText('count-pill-recent', recentLogins);
    setElText('count-pill-guests', allProfiles.filter(c => !c.registered).length);

    // Apply Filter by type
    let filtered = allProfiles;
    if (customerFilterType === 'registered') {
        filtered = filtered.filter(c => c.registered);
    } else if (customerFilterType === 'recent') {
        filtered = filtered.filter(c => c.registered && c.loginCount > 0);
    } else if (customerFilterType === 'guests') {
        filtered = filtered.filter(c => !c.registered);
    }

    // Apply City filter
    if (customerCityFilter !== 'all') {
        filtered = filtered.filter(c => (c.city || '').toLowerCase().includes(customerCityFilter.toLowerCase()));
    }

    // Apply Search Query
    if (customerSearchQuery) {
        const q = customerSearchQuery.toLowerCase();
        filtered = filtered.filter(c => 
            (c.name || '').toLowerCase().includes(q) ||
            (c.phone || '').toLowerCase().includes(q) ||
            (c.city || '').toLowerCase().includes(q) ||
            (c.address || '').toLowerCase().includes(q) ||
            (c.id || '').toLowerCase().includes(q)
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        if (emptyEl) emptyEl.classList.remove('hidden');
        return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');

    tbody.innerHTML = filtered.map(c => {
        const cleanPhone = c.phone.replace(/\D/g, '');
        const waLink = `https://wa.me/92${cleanPhone.replace(/^0/, '')}?text=${encodeURIComponent(`Assalam-o-Alaikum ${c.name}, Mehar Toys helpline se rabta kiya gaya hai.`)}`;
        const initials = c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CU';

        // Format dates
        let signupDateFormatted = 'N/A';
        if (c.registered) {
            try {
                const sd = new Date(c.createdAt);
                if (!isNaN(sd)) {
                    signupDateFormatted = sd.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                } else {
                    signupDateFormatted = c.createdAt;
                }
            } catch(e) { signupDateFormatted = c.createdAt; }
        }

        let lastLoginFormatted = 'Never';
        let isOnlineRecent = false;
        if (c.registered && c.lastLogin) {
            try {
                const ld = new Date(c.lastLogin);
                if (!isNaN(ld)) {
                    const diffHours = (Date.now() - ld.getTime()) / 3600000;
                    if (diffHours < 24) {
                        isOnlineRecent = true;
                        lastLoginFormatted = diffHours < 1 ? 'Just now' : `${Math.round(diffHours)}h ago (Today)`;
                    } else if (diffHours < 48) {
                        lastLoginFormatted = 'Yesterday';
                    } else {
                        lastLoginFormatted = ld.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
                    }
                }
            } catch(e) { lastLoginFormatted = c.lastLogin; }
        }

        const safeId = (c.id || '').replace(/[^a-zA-Z0-9_-]/g, '_');
        const encodedPhone = encodeURIComponent(c.phone);

        return `
            <tr class="hover:bg-slate-50/80 transition-colors">
                <!-- 1. Customer Name & ID -->
                <td class="px-4 py-3.5">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs overflow-hidden ${c.avatar ? 'p-0 bg-slate-900 border border-slate-200' : ''}">
                            ${c.avatar ? `<img src="${c.avatar}" alt="${c.name}" class="w-full h-full object-cover">` : initials}
                        </div>
                        <div class="min-w-0">
                            <div class="font-black text-slate-900 truncate max-w-[150px] sm:max-w-xs text-xs">${c.name}</div>
                            <div class="flex items-center gap-1.5 mt-0.5">
                                <span class="font-mono text-[10px] text-slate-400 font-semibold">${c.id}</span>
                                ${c.registered ? 
                                    '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-700 border border-purple-200">🔐 Registered</span>' : 
                                    '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">🛍️ Guest</span>'}
                            </div>
                        </div>
                    </div>
                </td>

                <!-- 2. Mobile Phone -->
                <td class="px-4 py-3.5 whitespace-nowrap">
                    <div class="font-bold text-slate-900 text-xs">${c.phone}</div>
                    <div class="flex items-center gap-2 mt-1">
                        <a href="${waLink}" target="_blank" class="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                            <i class="fab fa-whatsapp"></i> Chat
                        </a>
                        <a href="tel:${cleanPhone}" class="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 shadow-2xs">
                            <i class="fas fa-phone text-[10px]"></i> Call
                        </a>
                    </div>
                </td>

                <!-- 3. Password (Credentials) -->
                <td class="px-4 py-3.5 whitespace-nowrap">
                    ${c.registered ? `
                        <div class="flex items-center gap-2">
                            <span id="pwd-val-${safeId}" class="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">••••••••</span>
                            <button type="button" onclick="toggleCustomerPassword('${safeId}', '${encodeURIComponent(c.password)}')" class="text-slate-400 hover:text-slate-700 p-1 transition" title="Show / Hide Password">
                                <i id="pwd-icon-${safeId}" class="fas fa-eye text-xs"></i>
                            </button>
                        </div>
                    ` : `
                        <span class="text-[11px] text-slate-400 italic">No password (Guest)</span>
                    `}
                </td>

                <!-- 4. Signup Registration Date -->
                <td class="px-4 py-3.5 whitespace-nowrap">
                    ${c.registered ? `
                        <div class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <i class="fas fa-calendar-check text-purple-500 text-[11px]"></i>
                            <span>${signupDateFormatted}</span>
                        </div>
                        <span class="text-[10px] text-slate-400 font-semibold mt-0.5 block">Account Created</span>
                    ` : `
                        <span class="text-xs text-slate-400">Direct order checkout</span>
                    `}
                </td>

                <!-- 5. Last Login Activity -->
                <td class="px-4 py-3.5 whitespace-nowrap">
                    ${c.registered ? `
                        <div class="flex items-center gap-1.5 text-xs font-black ${isOnlineRecent ? 'text-emerald-700' : 'text-slate-700'}">
                            <span class="w-2 h-2 rounded-full ${isOnlineRecent ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}"></span>
                            <span>${lastLoginFormatted}</span>
                        </div>
                        <span class="text-[10px] text-slate-400 font-bold mt-0.5 block">
                            ${c.loginCount || 1} Total Login${(c.loginCount || 1) === 1 ? '' : 's'}
                        </span>
                    ` : `
                        <span class="text-[11px] text-slate-400">N/A</span>
                    `}
                </td>

                <!-- 6. Location & Address -->
                <td class="px-4 py-3.5">
                    <span class="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
                        ${c.city || 'Pakistan'}
                    </span>
                    <div class="text-[11px] text-slate-500 truncate max-w-[180px] mt-1 font-medium" title="${c.address || ''}">
                        ${c.address || 'Address not added'}
                    </div>
                </td>

                <!-- 7. Orders & Spent -->
                <td class="px-4 py-3.5 text-center whitespace-nowrap">
                    <span class="inline-block px-2.5 py-1 rounded-xl ${c.orderCount > 0 ? 'bg-slate-900 text-white font-black' : 'bg-slate-100 text-slate-400 font-bold'} text-xs">
                        ${c.orderCount} Order${c.orderCount === 1 ? '' : 's'}
                    </span>
                    <div class="text-xs font-black ${c.totalSpent > 0 ? 'text-red-600' : 'text-slate-400'} mt-1">
                        ${c.totalSpent > 0 ? `${config.currency} ${c.totalSpent.toLocaleString()}` : 'Rs. 0'}
                    </div>
                </td>

                <!-- 8. Actions -->
                <td class="px-4 py-3.5 text-center whitespace-nowrap">
                    <div class="flex items-center justify-center gap-1.5">
                        <button 
                            type="button" 
                            onclick="openCustomerProfileModal('${encodedPhone}')" 
                            class="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-1"
                            title="View Full Profile & Order History">
                            <i class="fas fa-eye text-[10px]"></i> View Profile
                        </button>
                        ${c.registered ? `
                            <button 
                                type="button" 
                                onclick="deleteCustomerAccount('${encodedPhone}')" 
                                class="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200 transition"
                                title="Delete Customer Account">
                                <i class="fas fa-trash-can text-xs"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openCustomerProfileModal(encodedPhone) {
    const phone = decodeURIComponent(encodedPhone);
    const registeredCustomers = JSON.parse(localStorage.getItem('mehar_toys_customers')) || [];
    const orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    const config = getStoreConfig();

    const reg = registeredCustomers.find(c => c.phone === phone);
    const customerOrders = orders.filter(o => o.customer && o.customer.phone === phone);

    let customerName = reg ? reg.name : (customerOrders[0]?.customer?.name || 'Customer');
    let customerCity = reg ? reg.city : (customerOrders[0]?.customer?.city || 'Pakistan');
    let customerAddress = reg ? reg.address : (customerOrders[0]?.customer?.address || 'Not specified');
    let customerPassword = reg ? reg.password : 'No password (Guest)';
    let customerSignup = reg ? reg.createdAt : 'Direct Order Buyer';
    let customerLastLogin = reg ? (reg.lastLogin || reg.createdAt) : 'N/A';
    let customerLogins = reg ? (reg.loginCount || 1) : 0;
    let customerId = reg ? reg.id : ('GUEST-' + phone.replace(/\D/g, '').slice(-4));
    let custAvatar = reg ? (reg.avatar || null) : null;

    const totalSpent = customerOrders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + (o.grandTotal || 0), 0);
    const deliveredCount = customerOrders.filter(o => o.status === 'Delivered').length;

    const modal = document.getElementById('customer-profile-modal');
    const content = document.getElementById('customer-modal-content');
    if (!modal || !content) return;

    const initials = customerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CU';
    const cleanPhone = phone.replace(/\D/g, '');
    const waLink = `https://wa.me/92${cleanPhone.replace(/^0/, '')}?text=${encodeURIComponent(`Assalam-o-Alaikum ${customerName}, Mehar Toys helpline se rabta kiya gaya hai.`)}`;

    content.innerHTML = `
        <div class="space-y-5">
            <!-- Modal Header -->
            <div class="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-base flex items-center justify-center shadow-md overflow-hidden shrink-0 ${custAvatar ? 'bg-slate-900 border border-slate-200' : ''}">
                    ${custAvatar ? `<img src="${custAvatar}" alt="${customerName}" class="w-full h-full object-cover">` : initials}
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <h3 class="font-black text-slate-900 text-lg font-heading">${customerName}</h3>
                        ${reg ? '<span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-700 border border-purple-200">🔐 Registered User</span>' : '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">🛍️ Guest Buyer</span>'}
                    </div>
                    <div class="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span class="font-mono font-semibold">${customerId}</span>
                        <span>•</span>
                        <span>${customerCity}</span>
                    </div>
                </div>
            </div>

            <!-- Credentials & Auth Info Card -->
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
                <div class="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Account Credentials & Access</div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="bg-white p-3 rounded-xl border border-slate-200/60">
                        <div class="text-[11px] text-slate-400 font-semibold">Login Mobile Number</div>
                        <div class="font-black text-slate-900 text-sm mt-0.5 flex items-center justify-between">
                            <span>${phone}</span>
                            <button onclick="navigator.clipboard.writeText('${phone}'); alert('Phone copied!');" class="text-xs text-indigo-600 hover:text-indigo-800"><i class="fas fa-copy"></i></button>
                        </div>
                    </div>
                    <div class="bg-white p-3 rounded-xl border border-slate-200/60">
                        <div class="text-[11px] text-slate-400 font-semibold">Customer Password</div>
                        <div class="font-mono font-black text-slate-900 text-sm mt-0.5 flex items-center justify-between">
                            <span>${customerPassword}</span>
                            ${reg ? `<button onclick="navigator.clipboard.writeText('${customerPassword}'); alert('Password copied!');" class="text-xs text-indigo-600 hover:text-indigo-800"><i class="fas fa-copy"></i></button>` : ''}
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div class="bg-white p-2.5 rounded-xl border border-slate-200/60">
                        <div class="text-[10px] text-slate-400 font-bold uppercase">Signup Date</div>
                        <div class="font-bold text-slate-800 text-xs mt-0.5">${new Date(customerSignup).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div class="bg-white p-2.5 rounded-xl border border-slate-200/60">
                        <div class="text-[10px] text-slate-400 font-bold uppercase">Last Login</div>
                        <div class="font-bold text-slate-800 text-xs mt-0.5">${reg ? new Date(customerLastLogin).toLocaleDateString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never'}</div>
                    </div>
                    <div class="bg-white p-2.5 rounded-xl border border-slate-200/60">
                        <div class="text-[10px] text-slate-400 font-bold uppercase">Total Logins</div>
                        <div class="font-black text-indigo-600 text-xs mt-0.5">${customerLogins} Sessions</div>
                    </div>
                </div>

                <div class="bg-white p-3 rounded-xl border border-slate-200/60">
                    <div class="text-[11px] text-slate-400 font-semibold">Delivery Address</div>
                    <div class="font-bold text-slate-800 text-xs mt-0.5">${customerAddress}, ${customerCity}</div>
                </div>
            </div>

            <!-- Customer Lifetime Shopping Summary -->
            <div class="grid grid-cols-3 gap-3 text-center">
                <div class="bg-purple-50 p-3.5 rounded-2xl border border-purple-100">
                    <div class="text-xs text-purple-600 font-semibold">Total Orders</div>
                    <div class="text-xl font-black text-purple-900 mt-1">${customerOrders.length}</div>
                </div>
                <div class="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100">
                    <div class="text-xs text-emerald-600 font-semibold">Delivered Orders</div>
                    <div class="text-xl font-black text-emerald-900 mt-1">${deliveredCount}</div>
                </div>
                <div class="bg-blue-50 p-3.5 rounded-2xl border border-blue-100">
                    <div class="text-xs text-blue-600 font-semibold">Total Spent</div>
                    <div class="text-xl font-black text-blue-900 mt-1">${config.currency} ${totalSpent.toLocaleString()}</div>
                </div>
            </div>

            <!-- Customer Orders History Table -->
            <div class="space-y-2">
                <div class="text-xs font-black text-slate-900 flex items-center justify-between">
                    <span>Order History (${customerOrders.length} orders)</span>
                    <a href="${waLink}" target="_blank" class="text-emerald-600 font-bold hover:text-emerald-700 flex items-center gap-1">
                        <i class="fab fa-whatsapp"></i> Chat on WhatsApp
                    </a>
                </div>
                
                ${customerOrders.length === 0 ? `
                    <div class="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                        Is customer ne abhi tak koi order place nahi kiya.
                    </div>
                ` : `
                    <div class="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase">
                                <tr>
                                    <th class="p-2.5">Order ID</th>
                                    <th class="p-2.5">Date</th>
                                    <th class="p-2.5">Items</th>
                                    <th class="p-2.5">Total Amount</th>
                                    <th class="p-2.5">Status</th>
                                    <th class="p-2.5 text-center">Slip / Label</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${customerOrders.map(o => `
                                    <tr class="hover:bg-slate-50">
                                        <td class="p-2.5 font-mono font-bold text-slate-900">${o.id}</td>
                                        <td class="p-2.5 text-slate-600">${o.date}</td>
                                        <td class="p-2.5 font-medium text-slate-700">${(o.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ')}</td>
                                        <td class="p-2.5 font-black text-slate-900">${config.currency} ${(o.grandTotal || 0).toLocaleString()}</td>
                                        <td class="p-2.5">
                                            <span class="px-2 py-0.5 rounded-full text-[10px] font-black ${
                                                o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                                                o.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                                                o.status === 'Dispatched' ? 'bg-purple-100 text-purple-800' :
                                                'bg-amber-100 text-amber-800'
                                            }">${o.status}</span>
                                        </td>
                                        <td class="p-2.5 text-center">
                                            <button onclick="printOrderLabel('${o.id}')" class="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold shadow-2xs">
                                                <i class="fas fa-print"></i> Slip
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>

            <!-- Modal Footer -->
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button type="button" onclick="closeCustomerModal()" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition">
                    Close Details
                </button>
                <a href="${waLink}" target="_blank" class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm">
                    <i class="fab fa-whatsapp"></i>
                    <span>Contact Customer</span>
                </a>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function closeCustomerModal() {
    const modal = document.getElementById('customer-profile-modal');
    if (modal) modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

function deleteCustomerAccount(encodedPhone) {
    const phone = decodeURIComponent(encodedPhone);
    if (!confirm(`Kia aap waqai is customer account (${phone}) ko delete karna chahte hain?`)) return;

    let custs = JSON.parse(localStorage.getItem('mehar_toys_customers')) || [];
    custs = custs.filter(c => c.phone !== phone);
    localStorage.setItem('mehar_toys_customers', JSON.stringify(custs));
    renderCustomersList();
    alert('Customer account successfully deleted! 🗑️');
}

function exportCustomersCSV() {
    const registeredCustomers = JSON.parse(localStorage.getItem('mehar_toys_customers')) || [];
    const orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];

    const customerMap = new Map();
    registeredCustomers.forEach(c => {
        customerMap.set(c.phone, {
            id: c.id,
            name: c.name,
            phone: c.phone,
            password: c.password,
            city: c.city || 'Pakistan',
            address: c.address || '',
            registered: 'Yes (Registered)',
            signupDate: c.createdAt || '',
            lastLogin: c.lastLogin || '',
            logins: c.loginCount || 1,
            orders: 0,
            spent: 0
        });
    });

    orders.forEach(o => {
        if (!o.customer || !o.customer.phone) return;
        const p = o.customer.phone;
        if (!customerMap.has(p)) {
            customerMap.set(p, {
                id: 'GUEST-' + p.replace(/\D/g, '').slice(-4),
                name: o.customer.name,
                phone: p,
                password: 'N/A',
                city: o.customer.city || '',
                address: o.customer.address || '',
                registered: 'No (Guest Buyer)',
                signupDate: o.date || '',
                lastLogin: 'N/A',
                logins: 0,
                orders: 0,
                spent: 0
            });
        }
        const record = customerMap.get(p);
        record.orders += 1;
        record.spent += (o.grandTotal || 0);
    });

    const headers = ['Customer ID', 'Name', 'Phone', 'Account Type', 'Password', 'City', 'Delivery Address', 'Signup Date', 'Last Login', 'Login Count', 'Total Orders', 'Total Spent (Rs)'];
    const rows = Array.from(customerMap.values()).map(c => [
        `"${c.id}"`,
        `"${(c.name || '').replace(/"/g, '""')}"`,
        `"${c.phone}"`,
        `"${c.registered}"`,
        `"${(c.password || '').replace(/"/g, '""')}"`,
        `"${(c.city || '').replace(/"/g, '""')}"`,
        `"${(c.address || '').replace(/"/g, '""')}"`,
        `"${c.signupDate}"`,
        `"${c.lastLogin}"`,
        c.logins,
        c.orders,
        c.spent
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mehar_toys_customers_accounts_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ----------------------------------------------------------------
// 9. REVIEWS MANAGEMENT
// ----------------------------------------------------------------
function renderReviewsTab() {
    const revs = JSON.parse(localStorage.getItem('mehar_toys_reviews')) || [];
    const container = document.getElementById('reviews-table-body');
    if (!container) return;

    container.innerHTML = revs.map(r => `
        <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs">
            <td class="px-4 py-3 font-bold text-slate-900">${r.customer}</td>
            <td class="px-4 py-3 font-medium text-slate-600">${r.toy}</td>
            <td class="px-4 py-3 text-amber-400">${'★'.repeat(r.rating)}</td>
            <td class="px-4 py-3 text-slate-700 italic max-w-sm truncate">"${r.comment}"</td>
            <td class="px-4 py-3 text-slate-400 text-[10px]">${r.date}</td>
            <td class="px-4 py-3 text-right">
                <span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">Live on Site</span>
            </td>
        </tr>
    `).join('');
}

// ----------------------------------------------------------------
// 10. MESSAGES & CUSTOMER INQUIRIES
// ----------------------------------------------------------------
function renderMessagesTab() {
    checkAndSeedMessages();
    const msgs = JSON.parse(localStorage.getItem('mehar_toys_messages')) || [];
    const container = document.getElementById('messages-list-container');
    if (!container) return;

    if (msgs.length === 0) {
        container.innerHTML = `
            <div class="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
                <div class="text-4xl mb-3">📬</div>
                <h4 class="font-extrabold text-slate-800 text-sm">Koi Naya Inquiry Message Nahi Hai</h4>
                <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Website par "Contact Us" form se bhejay gaye messages yahan live show hon ge aur aap direct WhatsApp reply de sakein ge.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = msgs.map(m => {
        const cleanPhone = (m.phone || '').replace(/[^0-9]/g, '');
        const waText = encodeURIComponent(`Assalam-o-Alaikum ${m.name || 'Customer'}, Mehar Toys helpline se Muhammad Jameel rabta kar raha hoon aapki website inquiry ke hawalay se: "${m.subject || 'Inquiry'}"`);
        const waLink = `https://wa.me/92${cleanPhone.replace(/^0/, '')}?text=${waText}`;

        return `
            <div class="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs hover:shadow-sm transition">
                <div class="flex items-center justify-between flex-wrap gap-2">
                    <div class="flex items-center gap-3">
                        <span class="w-9 h-9 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                            ${(m.name || 'C').charAt(0).toUpperCase()}
                        </span>
                        <div>
                            <div class="flex items-center gap-2">
                                <h4 class="font-black text-sm text-slate-900">${m.name || 'Customer'}</h4>
                                ${m.email ? `<span class="text-[11px] text-slate-400 font-medium">(${m.email})</span>` : ''}
                            </div>
                            <span class="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                <i class="fas fa-phone-alt text-[10px] text-slate-400"></i> ${m.phone || 'No phone'}
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">${m.date || 'Recent'}</span>
                        <button onclick="deleteAdminMessage('${m.id}')" title="Delete Inquiry" class="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition">
                            <i class="fas fa-trash-alt text-xs"></i>
                        </button>
                    </div>
                </div>

                <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                    <div class="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <i class="fas fa-tag text-red-500 text-[10px]"></i>
                        <span>${m.subject || 'Website Inquiry'}</span>
                    </div>
                    <p class="text-xs text-slate-600 leading-relaxed font-normal whitespace-pre-wrap">${m.message || ''}</p>
                </div>

                <div class="flex justify-end gap-2 pt-1 border-t border-slate-100">
                    <a href="${waLink}" target="_blank" class="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-emerald-200 shadow-2xs transition">
                        <i class="fab fa-whatsapp text-sm text-emerald-600"></i>
                        <span>Chat on WhatsApp</span>
                    </a>
                    <a href="tel:${m.phone}" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
                        <i class="fas fa-phone text-xs"></i>
                        <span>Call</span>
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

function deleteAdminMessage(msgId) {
    if (!confirm("Are you sure you want to delete this message?")) return;
    let msgs = JSON.parse(localStorage.getItem('mehar_toys_messages')) || [];
    msgs = msgs.filter(m => String(m.id) !== String(msgId));
    localStorage.setItem('mehar_toys_messages', JSON.stringify(msgs));
    renderMessagesTab();
}

// ----------------------------------------------------------------
// 11. COUPONS & PROMO CODES
// ----------------------------------------------------------------
function renderCouponsTab() {
    const coupons = JSON.parse(localStorage.getItem('mehar_toys_coupons')) || [];
    const container = document.getElementById('coupons-table-body');
    if (!container) return;

    container.innerHTML = coupons.map(c => `
        <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs">
            <td class="px-4 py-3 font-mono font-black text-red-600 tracking-wider">${c.code}</td>
            <td class="px-4 py-3 font-extrabold text-emerald-600">${c.discountPercent}% OFF</td>
            <td class="px-4 py-3">Rs. ${c.minSpend.toLocaleString()}</td>
            <td class="px-4 py-3 font-bold">${c.usageCount} times</td>
            <td class="px-4 py-3"><span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Active</span></td>
        </tr>
    `).join('');
}

function handleAddCoupon(e) {
    e.preventDefault();
    const code = document.getElementById('new-coupon-code').value.trim().toUpperCase();
    const discount = parseInt(document.getElementById('new-coupon-discount').value);
    const minSpend = parseInt(document.getElementById('new-coupon-min').value) || 1000;

    if (!code || isNaN(discount)) return;

    let coupons = JSON.parse(localStorage.getItem('mehar_toys_coupons')) || [];
    coupons.unshift({ code, discountPercent: discount, minSpend, active: true, usageCount: 0 });
    localStorage.setItem('mehar_toys_coupons', JSON.stringify(coupons));

    document.getElementById('new-coupon-code').value = '';
    document.getElementById('new-coupon-discount').value = '';
    renderCouponsTab();
    alert(`🎉 Coupon code "${code}" created successfully!`);
}

// ----------------------------------------------------------------
// 12. NOTIFICATIONS MODULE
// ----------------------------------------------------------------
function renderNotificationsTab() {
    const orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    const container = document.getElementById('notifications-feed');
    if (!container) return;

    container.innerHTML = orders.map(ord => `
        <div class="flex items-start gap-3 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div class="w-8 h-8 rounded-xl ${ord.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'} flex items-center justify-center text-sm font-bold">
                <i class="fas ${ord.status === 'Pending' ? 'fa-bell' : 'fa-check'}"></i>
            </div>
            <div class="flex-1 min-w-0 text-xs">
                <div class="flex items-center justify-between">
                    <strong class="text-slate-900">${ord.status === 'Pending' ? 'New Order Awaiting Dispatch' : 'Order Status: ' + ord.status}</strong>
                    <span class="text-[10px] text-slate-400">${ord.date}</span>
                </div>
                <p class="text-slate-600 mt-0.5">Order #${ord.id} placed by <strong>${ord.customer.name}</strong> (${ord.customer.city}) for <strong>Rs. ${ord.grandTotal.toLocaleString()}</strong>.</p>
                <div class="mt-2 flex gap-2">
                    <button onclick="viewOrderDetails('${ord.id}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px]">View Order</button>
                    <button onclick="printOrderSlip('${ord.id}')" class="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[11px]">Print Slip</button>
                </div>
            </div>
        </div>
    `).join('');
}

// ----------------------------------------------------------------
// 13. STORE SETTINGS MODULE
// ----------------------------------------------------------------
function loadSettingsForm() {
    const config = getStoreConfig();
    document.getElementById('cfg-store-name').value = config.storeName || "MEHAR TOYS";
    document.getElementById('cfg-tagline').value = config.tagline || "";
    document.getElementById('cfg-phone').value = config.displayPhone || "0322-8482860";
    document.getElementById('cfg-email').value = config.email || "";
    document.getElementById('cfg-address').value = config.address || "";
    document.getElementById('cfg-free-shipping').value = config.freeDeliveryThreshold || 5999;
    document.getElementById('cfg-shipping-charge').value = config.deliveryCharges || 250;
    document.getElementById('cfg-account-title').value = config.accountTitle || "Muhammad Jameel";
    document.getElementById('cfg-account-number').value = config.accountNumber || "03228482860";
}

function handleSaveSettings(e) {
    e.preventDefault();

    const config = {
        storeName: document.getElementById('cfg-store-name').value.trim() || "MEHAR TOYS",
        tagline: document.getElementById('cfg-tagline').value.trim(),
        displayPhone: document.getElementById('cfg-phone').value.trim(),
        email: document.getElementById('cfg-email').value.trim(),
        address: document.getElementById('cfg-address').value.trim(),
        currency: "Rs.",
        freeDeliveryThreshold: parseInt(document.getElementById('cfg-free-shipping').value) || 5999,
        deliveryCharges: parseInt(document.getElementById('cfg-shipping-charge').value) || 250,
        accountTitle: document.getElementById('cfg-account-title').value.trim() || "Muhammad Jameel",
        accountNumber: document.getElementById('cfg-account-number').value.trim() || "03228482860"
    };

    localStorage.setItem('mehar_toys_config', JSON.stringify(config));
    alert("✅ Store Settings kamyabi se save ho gayin!");
    updateOverviewMetrics();
}

// Global Event Listeners
function setupAdminEventListeners() {
    const searchInput = document.getElementById('order-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            orderSearchQuery = e.target.value;
            renderFullOrdersTable();
        });
    }

    const filterSelect = document.getElementById('order-status-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            orderFilterStatus = e.target.value;
            renderFullOrdersTable();
        });
    }

    // Initialize Supabase in Admin Panel
    initSupabaseAdminUI();
}

// ----------------------------------------------------------------
// SUPABASE ADMIN DASHBOARD INTEGRATION
// ----------------------------------------------------------------
function initSupabaseAdminUI() {
    if (typeof getSupabaseCredentials !== 'function') return;

    if (typeof initSupabaseClient === 'function') {
        initSupabaseClient();
    }

    const creds = getSupabaseCredentials();
    const urlInput = document.getElementById('supabase-cfg-url');
    const keyInput = document.getElementById('supabase-cfg-key');
    if (urlInput) urlInput.value = creds.url || '';
    if (keyInput) keyInput.value = creds.anonKey || '';

    const active = typeof isSupabaseActive === 'function' && isSupabaseActive();
    updateSupabaseAdminBadge(active);

    // Immediately pull latest orders from Supabase cloud on load
    if (active && typeof cloudFetchOrders === 'function') {
        cloudFetchOrders().then((orders) => {
            console.log("☁️ Orders synced from Supabase Cloud on init:", orders ? orders.length : 0);
            updateOverviewMetrics();
            renderRecentOrders();
            renderFullOrdersTable();
        }).catch(err => console.warn("Supabase fetch orders on init:", err));
    }

    // If active, subscribe to realtime events
    if (active && typeof subscribeToRealtimeOrders === 'function') {
        subscribeToRealtimeOrders((newOrder, isUpdate) => {
            handleRealtimeOrderReceived(newOrder, isUpdate);
        });
    }
}

function updateSupabaseAdminBadge(isConnected) {
    const badge = document.getElementById('supabase-status-badge');
    const headerBadge = document.getElementById('header-supabase-badge');

    if (isConnected) {
        if (badge) {
            badge.className = "px-3 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 flex items-center gap-2 border border-emerald-300";
            badge.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span><span>🟢 Live Connected (Supabase Cloud)</span>`;
        }
        if (headerBadge) {
            headerBadge.className = "hidden sm:flex items-center gap-2 text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-300 shadow-xs";
            headerBadge.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span><span>🟢 Supabase Cloud: Live</span>`;
        }
    } else {
        if (badge) {
            badge.className = "px-3 py-1.5 rounded-full text-xs font-black bg-slate-100 text-slate-600 flex items-center gap-2";
            badge.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span><span>Offline (LocalStorage)</span>`;
        }
        if (headerBadge) {
            headerBadge.className = "hidden sm:flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full";
            headerBadge.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span><span>Offline Mode</span>`;
        }
    }
}

async function handleSaveAndTestSupabase() {
    const urlInput = document.getElementById('supabase-cfg-url');
    const keyInput = document.getElementById('supabase-cfg-key');
    const msgBox = document.getElementById('supabase-connect-msg');

    const url = urlInput ? urlInput.value.trim() : '';
    const key = keyInput ? keyInput.value.trim() : '';

    if (!url || !key) {
        if (msgBox) {
            msgBox.textContent = "Barah-e-karam Supabase Project URL aur anon public key dono enter karein!";
            msgBox.className = "p-3 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-200 mt-2 block";
        }
        return;
    }

    if (msgBox) {
        msgBox.textContent = "Testing connection with Supabase Cloud...";
        msgBox.className = "p-3 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mt-2 block";
    }

    if (typeof testSupabaseConnection !== 'function') {
        alert("Supabase integration script load nahi hua. Page refresh karein.");
        return;
    }

    const testRes = await testSupabaseConnection(url, key);
    if (testRes.success) {
        saveSupabaseCredentials(url, key);
        const creds = getSupabaseCredentials();
        creds.connected = true;
        localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(creds));

        updateSupabaseAdminBadge(true);

        if (testRes.tableMissing) {
            msgBox.innerHTML = `⚠️ <strong>Connected!</strong> Lekin Supabase me tables nahi bani. Project folder me mojood <code>supabase-schema.sql</code> ka code Supabase ke SQL Editor me paste karke "RUN" karein.`;
            msgBox.className = "p-3 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 mt-2 block";
        } else {
            msgBox.innerHTML = `🟢 <strong>Mashallah!</strong> Supabase Cloud Database kamyabi se connect ho gaya hai! Live Realtime active hai.`;
            msgBox.className = "p-3 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 mt-2 block";
        }

        // Subscribe to real-time events
        subscribeToRealtimeOrders((newOrder, isUpdate) => {
            handleRealtimeOrderReceived(newOrder, isUpdate);
        });
    } else {
        updateSupabaseAdminBadge(false);
        if (msgBox) {
            msgBox.innerHTML = `❌ <strong>Connection Failed:</strong> ${testRes.message}`;
            msgBox.className = "p-3 rounded-xl text-xs font-bold bg-red-100 text-red-800 border border-red-300 mt-2 block";
        }
    }
}

async function handleSyncDataToSupabase() {
    const msgBox = document.getElementById('supabase-connect-msg');
    if (typeof isSupabaseActive === 'function' && !isSupabaseActive()) {
        alert("Pehle Supabase URL aur API Key save karke connect karein!");
        return;
    }

    if (msgBox) {
        msgBox.textContent = "Syncing all toys and orders to Supabase cloud...";
        msgBox.className = "p-3 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 mt-2 block";
    }

    const res = await syncAllDataToSupabase();
    if (res.success) {
        if (msgBox) {
            msgBox.innerHTML = `✅ <strong>Kamyabi!</strong> ${res.productsCount} khilone aur ${res.ordersCount} orders Supabase Cloud par upload ho gaye hain!`;
            msgBox.className = "p-3 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 mt-2 block";
        }
    } else {
        if (msgBox) {
            msgBox.innerHTML = `⚠️ Sync me masla aaya: ${res.error || 'Check internet connection'}`;
            msgBox.className = "p-3 rounded-xl text-xs font-bold bg-red-100 text-red-800 border border-red-300 mt-2 block";
        }
    }
}

function handleDisconnectSupabase() {
    localStorage.removeItem(SUPABASE_CONFIG_KEY);
    supabaseClient = null;
    const urlInput = document.getElementById('supabase-cfg-url');
    const keyInput = document.getElementById('supabase-cfg-key');
    if (urlInput) urlInput.value = '';
    if (keyInput) keyInput.value = '';
    updateSupabaseAdminBadge(false);

    const msgBox = document.getElementById('supabase-connect-msg');
    if (msgBox) {
        msgBox.textContent = "Supabase disconnected. System offline localStorage mode me chal raha hai.";
        msgBox.className = "p-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 mt-2 block";
    }
}

function handleRealtimeOrderReceived(newOrder, isUpdate = false) {
    if (!newOrder) return;

    let orders = JSON.parse(localStorage.getItem('mehar_toys_orders')) || [];
    const idx = orders.findIndex(o => o.id === newOrder.id);

    const custName = newOrder.customer_name || (newOrder.customer ? newOrder.customer.name : 'Customer');
    const custPhone = newOrder.customer_phone || (newOrder.customer ? newOrder.customer.phone : '');
    const custCity = newOrder.customer_city || (newOrder.customer ? newOrder.customer.city : '');
    const custAddress = newOrder.customer_address || (newOrder.customer ? newOrder.customer.address : '');
    const custNotes = newOrder.customer_notes || (newOrder.customer ? newOrder.customer.notes : '');

    const normalizedOrder = {
        id: newOrder.id,
        date: newOrder.date,
        timestamp: Number(newOrder.timestamp) || Date.now(),
        customerId: newOrder.customer_id || newOrder.customerId,
        customer: {
            name: custName,
            phone: custPhone,
            city: custCity,
            address: custAddress,
            notes: custNotes
        },
        items: newOrder.items || [],
        subtotal: Number(newOrder.subtotal) || 0,
        shipping: Number(newOrder.shipping) || 0,
        couponCode: newOrder.coupon_code || newOrder.couponCode,
        discountAmount: Number(newOrder.discount_amount || newOrder.discountAmount) || 0,
        grandTotal: Number(newOrder.grand_total || newOrder.grandTotal) || 0,
        paymentMethod: newOrder.payment_method || newOrder.paymentMethod || 'Cash on Delivery (COD)',
        paymentStatus: newOrder.payment_status || newOrder.paymentStatus || 'Unpaid (COD)',
        isPaid: Boolean(newOrder.is_paid !== undefined ? newOrder.is_paid : newOrder.isPaid),
        trxId: newOrder.trx_id || newOrder.trxId,
        paymentSlip: newOrder.payment_slip || newOrder.paymentSlip,
        status: newOrder.status || 'Pending'
    };

    if (idx !== -1) {
        orders[idx] = {
            ...orders[idx],
            ...normalizedOrder,
            status: newOrder.status || orders[idx].status
        };
    } else {
        orders.unshift(normalizedOrder);
    }

    localStorage.setItem('mehar_toys_orders', JSON.stringify(orders));
    renderFullOrdersTable();
    updateOverviewMetrics();
    renderRecentOrders();

    showOrderLiveToast(normalizedOrder, isUpdate);
}

function showOrderLiveToast(order, isUpdate) {
    let container = document.getElementById('live-order-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'live-order-toast-container';
        container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-3 pointer-events-none max-w-sm';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-amber-400/40 flex items-start gap-3 transform translate-y-4 opacity-0 transition-all duration-300';
    toast.innerHTML = `
        <div class="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-lg font-black flex-shrink-0">
            🔔
        </div>
        <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-black text-amber-400">${isUpdate ? 'Order Status Updated' : 'Naya Live Order Aaya!'}</span>
                <span class="text-[10px] text-slate-400 font-mono">#${order.id}</span>
            </div>
            <div class="text-xs font-extrabold text-white truncate mt-0.5">${order.customer.name} (${order.customer.city || 'Pakistan'})</div>
            <div class="text-xs text-emerald-400 font-black mt-1">Rs. ${Number(order.grandTotal).toLocaleString()}</div>
        </div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
    });

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4');
        setTimeout(() => toast.remove(), 400);
    }, 8000);
}

// ----------------------------------------------------------------
// COPY SUPABASE SQL HELPER
// ----------------------------------------------------------------
const SUPABASE_SCHEMA_SQL = `-- MEHAR TOYS DATABASE SCHEMA
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

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public update on orders" ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Allow public select on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert on products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Allow public all on reviews" ON public.reviews FOR ALL USING (true);
`;

function copySupabaseSQL() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL).then(() => {
            const btn = document.getElementById('copy-sql-btn');
            if (btn) {
                const orig = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> <span>SQL Code Copied! Ab Supabase me Paste karein</span>';
                btn.className = "px-3.5 py-2 bg-emerald-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 transition shadow-sm";
                setTimeout(() => {
                    btn.innerHTML = orig;
                    btn.className = "px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 transition active:scale-95 shadow-sm";
                }, 3500);
            }
        }).catch(err => {
            prompt("Neeche diya gaya SQL code copy karein:", SUPABASE_SCHEMA_SQL);
        });
    } else {
        prompt("Neeche diya gaya SQL code copy karein:", SUPABASE_SCHEMA_SQL);
    }
}



// ================================================================
// MODULE 14: HERO BANNER & TOY SHOWCASE MANAGER CONTROLLER
// ================================================================

const DEFAULT_HERO_CONFIG = {
    imageUrl: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80",
    tag: "⚡ LUXURY FLASH SALE • LIMITED STOCK",
    headline: "ROYAL TOYS GALA",
    subheadline: "UP TO 50% OFF",
    description: "Pakistan's finest 4x4 RC stunt cars, Montessori educational blocks, robotics & premium soft plush toys. 100% Original with Cash on Delivery!",
    price: "Rs. 3,499",
    oldPrice: "Rs. 4,500",
    discount: "40% OFF"
};

function getHeroBannerConfig() {
    try {
        const stored = localStorage.getItem('mehar_toys_hero_config');
        if (stored) return JSON.parse(stored);
    } catch(e) {
        console.warn('Error reading hero banner config:', e);
    }
    return DEFAULT_HERO_CONFIG;
}

function renderHeroBannerTab() {
    const config = getHeroBannerConfig();

    const inputUrl = document.getElementById('hero-input-image-url');
    const inputTag = document.getElementById('hero-input-tag');
    const inputHeadline = document.getElementById('hero-input-headline');
    const inputSubheadline = document.getElementById('hero-input-subheadline');
    const inputDesc = document.getElementById('hero-input-description');
    const inputPrice = document.getElementById('hero-input-price');
    const inputOldPrice = document.getElementById('hero-input-oldprice');
    const inputDiscount = document.getElementById('hero-input-discount');

    if (inputUrl) inputUrl.value = config.imageUrl || '';
    if (inputTag) inputTag.value = config.tag || '';
    if (inputHeadline) inputHeadline.value = config.headline || '';
    if (inputSubheadline) inputSubheadline.value = config.subheadline || '';
    if (inputDesc) inputDesc.value = config.description || '';
    if (inputPrice) inputPrice.value = config.price || '';
    if (inputOldPrice) inputOldPrice.value = config.oldPrice || '';
    if (inputDiscount) inputDiscount.value = config.discount || '';

    updateHeroAdminPreview();
}

function updateHeroAdminPreview() {
    const inputUrl = document.getElementById('hero-input-image-url');
    const inputTag = document.getElementById('hero-input-tag');
    const inputHeadline = document.getElementById('hero-input-headline');
    const inputSubheadline = document.getElementById('hero-input-subheadline');
    const inputDesc = document.getElementById('hero-input-description');
    const inputPrice = document.getElementById('hero-input-price');
    const inputOldPrice = document.getElementById('hero-input-oldprice');
    const inputDiscount = document.getElementById('hero-input-discount');

    const previewImg = document.getElementById('preview-admin-img');
    const previewTag = document.getElementById('preview-admin-tag');
    const previewHeadline = document.getElementById('preview-admin-headline');
    const previewSubheadline = document.getElementById('preview-admin-subheadline');
    const previewDesc = document.getElementById('preview-admin-desc');
    const previewPrice = document.getElementById('preview-admin-price');
    const previewOldPrice = document.getElementById('preview-admin-oldprice');
    const previewDiscount = document.getElementById('preview-admin-discount');

    if (previewImg && inputUrl) previewImg.src = inputUrl.value || DEFAULT_HERO_CONFIG.imageUrl;
    if (previewTag && inputTag) previewTag.textContent = inputTag.value || DEFAULT_HERO_CONFIG.tag;
    if (previewHeadline && inputHeadline) previewHeadline.textContent = inputHeadline.value || DEFAULT_HERO_CONFIG.headline;
    if (previewSubheadline && inputSubheadline) previewSubheadline.textContent = inputSubheadline.value || DEFAULT_HERO_CONFIG.subheadline;
    if (previewDesc && inputDesc) previewDesc.textContent = inputDesc.value || DEFAULT_HERO_CONFIG.description;
    if (previewPrice && inputPrice) previewPrice.textContent = inputPrice.value || DEFAULT_HERO_CONFIG.price;
    if (previewOldPrice && inputOldPrice) previewOldPrice.textContent = inputOldPrice.value || DEFAULT_HERO_CONFIG.oldPrice;
    if (previewDiscount && inputDiscount) previewDiscount.textContent = inputDiscount.value || DEFAULT_HERO_CONFIG.discount;
}

function handleHeroInputChange() {
    updateHeroAdminPreview();
}

function handleHeroFileUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Please choose a valid image file (JPG, PNG, WEBP, etc.)');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const dataUrl = e.target.result;
        const inputUrl = document.getElementById('hero-input-image-url');
        if (inputUrl) {
            inputUrl.value = dataUrl;
            updateHeroAdminPreview();
        }
    };
    reader.readAsDataURL(file);
}

function selectHeroPreset(url, name, price, oldPrice, discount) {
    const inputUrl = document.getElementById('hero-input-image-url');
    const inputPrice = document.getElementById('hero-input-price');
    const inputOldPrice = document.getElementById('hero-input-oldprice');
    const inputDiscount = document.getElementById('hero-input-discount');

    if (inputUrl) inputUrl.value = url;
    if (price && inputPrice) inputPrice.value = price;
    if (oldPrice && inputOldPrice) inputOldPrice.value = oldPrice;
    if (discount && inputDiscount) inputDiscount.value = discount;

    updateHeroAdminPreview();
}

function saveHeroBannerSettings() {
    const inputUrl = document.getElementById('hero-input-image-url');
    const inputTag = document.getElementById('hero-input-tag');
    const inputHeadline = document.getElementById('hero-input-headline');
    const inputSubheadline = document.getElementById('hero-input-subheadline');
    const inputDesc = document.getElementById('hero-input-description');
    const inputPrice = document.getElementById('hero-input-price');
    const inputOldPrice = document.getElementById('hero-input-oldprice');
    const inputDiscount = document.getElementById('hero-input-discount');

    const config = {
        imageUrl: (inputUrl && inputUrl.value) ? inputUrl.value : DEFAULT_HERO_CONFIG.imageUrl,
        tag: (inputTag && inputTag.value) ? inputTag.value : DEFAULT_HERO_CONFIG.tag,
        headline: (inputHeadline && inputHeadline.value) ? inputHeadline.value : DEFAULT_HERO_CONFIG.headline,
        subheadline: (inputSubheadline && inputSubheadline.value) ? inputSubheadline.value : DEFAULT_HERO_CONFIG.subheadline,
        description: (inputDesc && inputDesc.value) ? inputDesc.value : DEFAULT_HERO_CONFIG.description,
        price: (inputPrice && inputPrice.value) ? inputPrice.value : DEFAULT_HERO_CONFIG.price,
        oldPrice: (inputOldPrice && inputOldPrice.value) ? inputOldPrice.value : DEFAULT_HERO_CONFIG.oldPrice,
        discount: (inputDiscount && inputDiscount.value) ? inputDiscount.value : DEFAULT_HERO_CONFIG.discount,
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem('mehar_toys_hero_config', JSON.stringify(config));

    // Also trigger custom storage event so active store tabs update
    try {
        window.dispatchEvent(new Event('storage'));
    } catch(e) {}

    // Show friendly success toast/alert
    alert("✅ Zabardast! Hero Banner ki car image aur details kamyabi se save ho gayi hain. Website par live change ho chuki hai!");
}

function resetHeroBannerDefaults() {
    if (confirm("Kya aap Hero Banner ko default setting par reset karna chahte hain?")) {
        localStorage.setItem('mehar_toys_hero_config', JSON.stringify(DEFAULT_HERO_CONFIG));
        renderHeroBannerTab();
        alert("Hero Banner default settings par restore ho gaya!");
    }
}

// Expose functions globally for inline HTML event handlers
window.getHeroBannerConfig = getHeroBannerConfig;
window.renderHeroBannerTab = renderHeroBannerTab;
window.updateHeroAdminPreview = updateHeroAdminPreview;
window.handleHeroInputChange = handleHeroInputChange;
window.handleHeroFileUpload = handleHeroFileUpload;
window.selectHeroPreset = selectHeroPreset;
window.saveHeroBannerSettings = saveHeroBannerSettings;
window.resetHeroBannerDefaults = resetHeroBannerDefaults;


// ================================================================
// MODULE 15: VOUCHERS BANNER & PROMO STRIP CONTROLLER
// ================================================================

const DEFAULT_VOUCHERS_STRIP_CONFIG = {
    title: "Claim Vouchers to Save More!",
    tag: "LIMITED",
    subtitle: "Click to collect discount vouchers for immediate checkout",
    v1: {
        title: "Rs. 300 OFF",
        sub: "On orders Rs. 3,500+",
        code: "SAVE300"
    },
    v2: {
        title: "FREE SHIPPING",
        sub: "Nationwide Pakistan",
        code: "FREESHIP"
    },
    v3: {
        title: "10% OFF",
        sub: "Code: WELCOME10",
        code: "WELCOME10"
    }
};

const VOUCHER_PRESETS = {
    default: DEFAULT_VOUCHERS_STRIP_CONFIG,
    eid: {
        title: "🌙 Eid Mubarak Special Vouchers!",
        tag: "EID GALA",
        subtitle: "Collect Eid gift vouchers & celebrate with biggest toy savings",
        v1: { title: "Rs. 500 OFF", sub: "On orders Rs. 4,000+", code: "EID500" },
        v2: { title: "FREE SHIPPING", sub: "All Pakistan Delivery", code: "FREESHIP" },
        v3: { title: "15% OFF", sub: "Code: EIDMUBARAK", code: "EIDMUBARAK" }
    },
    weekend: {
        title: "⚡ Super Weekend Flash Deals!",
        tag: "WEEKEND ONLY",
        subtitle: "Special limited-time vouchers for weekend toy shoppers",
        v1: { title: "Rs. 400 OFF", sub: "On orders Rs. 3,000+", code: "WEEKEND400" },
        v2: { title: "FREE SHIPPING", sub: "Express 24-48h Dispatch", code: "FREESHIP" },
        v3: { title: "20% OFF", sub: "Code: FLASH20", code: "FLASH20" }
    },
    mega: {
        title: "🎉 Grand Toy Festival Vouchers!",
        tag: "MEGA SALE",
        subtitle: "Collect all vouchers for instant savings at checkout",
        v1: { title: "Rs. 600 OFF", sub: "On orders Rs. 5,000+", code: "MEGA600" },
        v2: { title: "FREE SHIPPING", sub: "Doorstep Delivery Free", code: "FREESHIP" },
        v3: { title: "25% OFF", sub: "Code: TOYFEST25", code: "TOYFEST25" }
    }
};

function getVouchersStripConfig() {
    try {
        const stored = localStorage.getItem('mehar_toys_voucher_strip_config');
        if (stored) return JSON.parse(stored);
    } catch(e) {
        console.warn('Error reading voucher strip config:', e);
    }
    return DEFAULT_VOUCHERS_STRIP_CONFIG;
}

function renderVouchersStripTab() {
    const config = getVouchersStripConfig();

    const titleInput = document.getElementById('vstrip-input-title');
    const tagInput = document.getElementById('vstrip-input-tag');
    const subtitleInput = document.getElementById('vstrip-input-subtitle');

    const v1Title = document.getElementById('vstrip-input-v1-title');
    const v1Sub = document.getElementById('vstrip-input-v1-sub');
    const v1Code = document.getElementById('vstrip-input-v1-code');

    const v2Title = document.getElementById('vstrip-input-v2-title');
    const v2Sub = document.getElementById('vstrip-input-v2-sub');
    const v2Code = document.getElementById('vstrip-input-v2-code');

    const v3Title = document.getElementById('vstrip-input-v3-title');
    const v3Sub = document.getElementById('vstrip-input-v3-sub');
    const v3Code = document.getElementById('vstrip-input-v3-code');

    if (titleInput) titleInput.value = config.title || '';
    if (tagInput) tagInput.value = config.tag || '';
    if (subtitleInput) subtitleInput.value = config.subtitle || '';

    if (v1Title) v1Title.value = (config.v1 && config.v1.title) || '';
    if (v1Sub) v1Sub.value = (config.v1 && config.v1.sub) || '';
    if (v1Code) v1Code.value = (config.v1 && config.v1.code) || '';

    if (v2Title) v2Title.value = (config.v2 && config.v2.title) || '';
    if (v2Sub) v2Sub.value = (config.v2 && config.v2.sub) || '';
    if (v2Code) v2Code.value = (config.v2 && config.v2.code) || '';

    if (v3Title) v3Title.value = (config.v3 && config.v3.title) || '';
    if (v3Sub) v3Sub.value = (config.v3 && config.v3.sub) || '';
    if (v3Code) v3Code.value = (config.v3 && config.v3.code) || '';

    updateVouchersStripAdminPreview();
}

function updateVouchersStripAdminPreview() {
    const titleInput = document.getElementById('vstrip-input-title');
    const tagInput = document.getElementById('vstrip-input-tag');
    const subtitleInput = document.getElementById('vstrip-input-subtitle');

    const v1Title = document.getElementById('vstrip-input-v1-title');
    const v1Sub = document.getElementById('vstrip-input-v1-sub');

    const v2Title = document.getElementById('vstrip-input-v2-title');
    const v2Sub = document.getElementById('vstrip-input-v2-sub');

    const v3Title = document.getElementById('vstrip-input-v3-title');
    const v3Sub = document.getElementById('vstrip-input-v3-sub');

    const previewTitle = document.getElementById('preview-vstrip-title');
    const previewTag = document.getElementById('preview-vstrip-tag');
    const previewSubtitle = document.getElementById('preview-vstrip-subtitle');

    const pChip1Title = document.getElementById('preview-chip-1-title');
    const pChip1Sub = document.getElementById('preview-chip-1-sub');

    const pChip2Title = document.getElementById('preview-chip-2-title');
    const pChip2Sub = document.getElementById('preview-chip-2-sub');

    const pChip3Title = document.getElementById('preview-chip-3-title');
    const pChip3Sub = document.getElementById('preview-chip-3-sub');

    if (previewTitle && titleInput) previewTitle.textContent = titleInput.value || DEFAULT_VOUCHERS_STRIP_CONFIG.title;
    if (previewTag && tagInput) previewTag.textContent = tagInput.value || DEFAULT_VOUCHERS_STRIP_CONFIG.tag;
    if (previewSubtitle && subtitleInput) previewSubtitle.textContent = subtitleInput.value || DEFAULT_VOUCHERS_STRIP_CONFIG.subtitle;

    if (pChip1Title && v1Title) pChip1Title.textContent = v1Title.value || DEFAULT_VOUCHERS_STRIP_CONFIG.v1.title;
    if (pChip1Sub && v1Sub) pChip1Sub.textContent = v1Sub.value || DEFAULT_VOUCHERS_STRIP_CONFIG.v1.sub;

    if (pChip2Title && v2Title) pChip2Title.textContent = v2Title.value || DEFAULT_VOUCHERS_STRIP_CONFIG.v2.title;
    if (pChip2Sub && v2Sub) pChip2Sub.textContent = v2Sub.value || DEFAULT_VOUCHERS_STRIP_CONFIG.v2.sub;

    if (pChip3Title && v3Title) pChip3Title.textContent = v3Title.value || DEFAULT_VOUCHERS_STRIP_CONFIG.v3.title;
    if (pChip3Sub && v3Sub) pChip3Sub.textContent = v3Sub.value || DEFAULT_VOUCHERS_STRIP_CONFIG.v3.sub;
}

function handleVouchersStripInputChange() {
    updateVouchersStripAdminPreview();
}

function selectVouchersPreset(presetKey) {
    const preset = VOUCHER_PRESETS[presetKey] || DEFAULT_VOUCHERS_STRIP_CONFIG;

    const titleInput = document.getElementById('vstrip-input-title');
    const tagInput = document.getElementById('vstrip-input-tag');
    const subtitleInput = document.getElementById('vstrip-input-subtitle');

    const v1Title = document.getElementById('vstrip-input-v1-title');
    const v1Sub = document.getElementById('vstrip-input-v1-sub');
    const v1Code = document.getElementById('vstrip-input-v1-code');

    const v2Title = document.getElementById('vstrip-input-v2-title');
    const v2Sub = document.getElementById('vstrip-input-v2-sub');
    const v2Code = document.getElementById('vstrip-input-v2-code');

    const v3Title = document.getElementById('vstrip-input-v3-title');
    const v3Sub = document.getElementById('vstrip-input-v3-sub');
    const v3Code = document.getElementById('vstrip-input-v3-code');

    if (titleInput) titleInput.value = preset.title;
    if (tagInput) tagInput.value = preset.tag;
    if (subtitleInput) subtitleInput.value = preset.subtitle;

    if (v1Title) v1Title.value = preset.v1.title;
    if (v1Sub) v1Sub.value = preset.v1.sub;
    if (v1Code) v1Code.value = preset.v1.code;

    if (v2Title) v2Title.value = preset.v2.title;
    if (v2Sub) v2Sub.value = preset.v2.sub;
    if (v2Code) v2Code.value = preset.v2.code;

    if (v3Title) v3Title.value = preset.v3.title;
    if (v3Sub) v3Sub.value = preset.v3.sub;
    if (v3Code) v3Code.value = preset.v3.code;

    updateVouchersStripAdminPreview();
}

function saveVouchersStripSettings() {
    const titleInput = document.getElementById('vstrip-input-title');
    const tagInput = document.getElementById('vstrip-input-tag');
    const subtitleInput = document.getElementById('vstrip-input-subtitle');

    const v1Title = document.getElementById('vstrip-input-v1-title');
    const v1Sub = document.getElementById('vstrip-input-v1-sub');
    const v1Code = document.getElementById('vstrip-input-v1-code');

    const v2Title = document.getElementById('vstrip-input-v2-title');
    const v2Sub = document.getElementById('vstrip-input-v2-sub');
    const v2Code = document.getElementById('vstrip-input-v2-code');

    const v3Title = document.getElementById('vstrip-input-v3-title');
    const v3Sub = document.getElementById('vstrip-input-v3-sub');
    const v3Code = document.getElementById('vstrip-input-v3-code');

    const config = {
        title: (titleInput && titleInput.value) ? titleInput.value : DEFAULT_VOUCHERS_STRIP_CONFIG.title,
        tag: (tagInput && tagInput.value) ? tagInput.value : DEFAULT_VOUCHERS_STRIP_CONFIG.tag,
        subtitle: (subtitleInput && subtitleInput.value) ? subtitleInput.value : DEFAULT_VOUCHERS_STRIP_CONFIG.subtitle,
        v1: {
            title: (v1Title && v1Title.value) ? v1Title.value : DEFAULT_VOUCHERS_STRIP_CONFIG.v1.title,
            sub: (v1Sub && v1Sub.value) ? v1Sub.value : DEFAULT_VOUCHERS_STRIP_CONFIG.v1.sub,
            code: (v1Code && v1Code.value) ? v1Code.value.toUpperCase() : DEFAULT_VOUCHERS_STRIP_CONFIG.v1.code
        },
        v2: {
            title: (v2Title && v2Title.value) ? v2Title.value : DEFAULT_VOUCHERS_STRIP_CONFIG.v2.title,
            sub: (v2Sub && v2Sub.value) ? v2Sub.value : DEFAULT_VOUCHERS_STRIP_CONFIG.v2.sub,
            code: (v2Code && v2Code.value) ? v2Code.value.toUpperCase() : DEFAULT_VOUCHERS_STRIP_CONFIG.v2.code
        },
        v3: {
            title: (v3Title && v3Title.value) ? v3Title.value : DEFAULT_VOUCHERS_STRIP_CONFIG.v3.title,
            sub: (v3Sub && v3Sub.value) ? v3Sub.value : DEFAULT_VOUCHERS_STRIP_CONFIG.v3.sub,
            code: (v3Code && v3Code.value) ? v3Code.value.toUpperCase() : DEFAULT_VOUCHERS_STRIP_CONFIG.v3.code
        },
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem('mehar_toys_voucher_strip_config', JSON.stringify(config));

    try {
        window.dispatchEvent(new Event('storage'));
    } catch(e) {}

    alert("✅ Zabardast! Homepage Vouchers Banner kamyabi se save ho gaya hai. Website par live change ho chuki hai!");
}

function resetVouchersStripDefaults() {
    if (confirm("Kya aap Vouchers Banner ko default setting par reset karna chahte hain?")) {
        localStorage.setItem('mehar_toys_voucher_strip_config', JSON.stringify(DEFAULT_VOUCHERS_STRIP_CONFIG));
        renderVouchersStripTab();
        alert("Vouchers Banner default settings par restore ho gaya!");
    }
}

// Global exports
window.getVouchersStripConfig = getVouchersStripConfig;
window.renderVouchersStripTab = renderVouchersStripTab;
window.updateVouchersStripAdminPreview = updateVouchersStripAdminPreview;
window.handleVouchersStripInputChange = handleVouchersStripInputChange;
window.selectVouchersPreset = selectVouchersPreset;
window.saveVouchersStripSettings = saveVouchersStripSettings;
window.resetVouchersStripDefaults = resetVouchersStripDefaults;
