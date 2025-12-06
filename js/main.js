// js/main.js

// --- Static FAQ Data ---
const faqsData = [
    { q: "Do you offer cash on delivery (COD) in Pakistan?", a: "Due to the high value of gaming gear, we only offer COD for orders under PKR 50,000. All high-end PC parts and consoles require full advance payment." },
    { q: "What is your warranty policy for GPUs?", a: "All graphics cards come with a minimum 1-year manufacturer warranty, handled through our local service center partners. Physical damage voids the warranty." },
    { q: "How long does shipping take?", a: "Standard delivery time is 3-5 business days across major cities. Custom-built PCs may require an additional 5-7 days for assembly and testing." },
    { q: "Can I cancel my order?", a: "Orders can only be canceled within 12 hours of placement. If the item has already been shipped, cancellation is not possible." },
    { q: "Do you sell used/refurbished items?", a: "No, GAMERGEAR strictly sells brand new, sealed, and imported gaming products." },
    { q: "What payment methods do you accept?", a: "We accept bank transfers (IBFT), credit/debit cards, and payment via SadaPay/NayaPay." },
    { q: "What are the hidden charges?", a: "The price listed includes all taxes (GST). The only added charge is the flat-rate delivery fee shown at checkout." },
    { q: "Do you have a physical store?", a: "Currently, we operate purely as an online e-commerce storefront to keep our prices competitive." },
];

// --- Global Helper Function (Product Card Generator) ---

/**
 * Helper function to generate the HTML for a single product card.
 * @param {Object} product - The product object from the data array.
 * @returns {string} The HTML string for the product card.
 */
function createProductCardHTML(product) {
    // Generate star icons based on rating (e.g., rating=4 -> ****)
    const stars = '⭐'.repeat(product.rating) + '☆'.repeat(5 - product.rating);

    // Format price with commas for readability (professional standard)
    const formattedPrice = product.price.toLocaleString('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 });

    // FIX: Added h-full to outer card and flex-grow to inner div for vertical alignment
    return `
        <div class="product-card bg-white p-4 rounded-xl shadow-soft hover:shadow-premium transition-all duration-300 transform hover:-translate-y-1 js-loaded-item h-full flex flex-col">
            <a href="product-details.html?id=${product.id}" class="block h-40 bg-gray-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <img src="${product.imageUrl}" alt="${product.name}" class="w-full h-full object-contain rounded-lg" />
            </a>
            
            <div class="flex flex-col flex-grow">
                <h3 class="text-lg font-semibold text-gg-dark mb-1 h-14 overflow-hidden">
                    <a href="product-details.html?id=${product.id}" class="hover:text-gg-primary transition-colors">${product.name}</a>
                </h3>

                <div class="product-rating flex items-center mb-2">
                    <span class="star text-yellow-400">${stars}</span>
                    <span class="text-sm font-medium text-gray-500 ml-2">(${product.rating}.0)</span>
                </div>

                <p class="text-2xl font-bold text-gg-primary mt-auto mb-3">
                    ${formattedPrice}
                </p>

                <button data-product-id="${product.id}" class="add-to-cart-btn w-full bg-gg-dark text-white py-2 rounded-lg font-medium hover:bg-gg-primary transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-gg-primary/50">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
}

/**
 * Renders the products into a specified container.
 * @param {Array} productList - List of products to render.
 * @param {string} containerId - ID of the HTML element container.
 */
function renderProducts(productList, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear previous content
    container.innerHTML = ''; 

    if (productList.length === 0) {
         container.innerHTML = '<p class="col-span-full text-center text-lg text-gray-500 py-10">No products match your current filters.</p>';
         return;
    }

    // Generate and insert HTML for each product
    const productHTML = productList.map(createProductCardHTML).join('');
    container.innerHTML = productHTML;

    // Add event listeners to the new "Add to Cart" buttons
    container.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            addToCart(productId); // Function from js/store.js
        });
    });
}

// --- Cart Rendering Logic ---
const DELIVERY_FEE = 1500;
const TAX_RATE = 0.05; // 5%

function formatPrice(price) {
    // Ensures price is formatted as an integer with commas
    return price.toLocaleString('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 });
}

/**
 * Calculates and updates the cart totals in the Summary Panel.
 * @param {Array} cart - The current cart array.
 */
function updateCartSummary(cart) {
    const subtotal = cart.reduce((sum, item) => {
        const product = getProductById(item.productId);
        return sum + (product ? product.price * item.qty : 0);
    }, 0);
    
    // FIX: Conditionally calculate fee and tax only if there's a subtotal > 0
    const calculatedDeliveryFee = subtotal > 0 ? DELIVERY_FEE : 0;
    const tax = subtotal > 0 ? subtotal * TAX_RATE : 0;
    const total = subtotal + calculatedDeliveryFee + tax;

    document.getElementById('summary-subtotal').textContent = formatPrice(subtotal);
    document.getElementById('summary-tax').textContent = formatPrice(tax);
    // FIX: Display conditional delivery fee
    document.getElementById('summary-delivery-estimate').textContent = formatPrice(calculatedDeliveryFee); 
    document.getElementById('summary-total').textContent = formatPrice(total);

    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        if (cart.length > 0) {
            checkoutButton.disabled = false;
        } else {
            checkoutButton.disabled = true;
        }
    }
}

/**
 * Generates HTML for a single item in the Cart Page list.
 */
function createCartItemHTML(item, product) {
    const lineTotal = product.price * item.qty;
    
    return `
        <div class="cart-item flex items-center bg-white p-4 rounded-xl shadow-soft transition-shadow">
            <img src="${product.imageUrl}" alt="${product.name}" class="w-20 h-20 object-cover rounded-lg mr-4">
            
            <div class="flex-grow">
                <h3 class="text-lg font-semibold text-gg-dark hover:text-gg-primary transition-colors">
                    <a href="product-details.html?id=${product.id}">${product.name}</a>
                </h3>
                <p class="text-sm text-gray-600">${product.category}</p>
            </div>
            
            <div class="flex items-center space-x-3 mx-4">
                <button data-product-id="${item.productId}" data-action="decrease" class="qty-btn bg-gray-200 text-gg-dark p-2 rounded-lg font-bold hover:bg-gg-primary hover:text-white transition-colors">
                    -
                </button>
                <input type="number" value="${item.qty}" min="1" readonly class="w-12 text-center border border-gray-300 rounded-lg py-1 font-medium">
                <button data-product-id="${item.productId}" data-action="increase" class="qty-btn bg-gray-200 text-gg-dark p-2 rounded-lg font-bold hover:bg-gg-primary hover:text-white transition-colors">
                    +
                </button>
            </div>
            
            <div class="w-32 text-right">
                <p class="text-xl font-bold text-gg-primary">${formatPrice(lineTotal)}</p>
                <p class="text-sm text-gray-500">${formatPrice(product.price)} each</p>
            </div>
            
            <button data-product-id="${item.productId}" data-action="remove" class="remove-btn text-gray-400 hover:text-red-600 ml-4 p-2 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
        </div>
    `;
}

/**
 * Main function to render the Cart Page.
 */
function renderCartPage() {
    const cart = loadCart();
    const container = document.getElementById('cart-items-container');
    const emptyMessage = document.getElementById('empty-cart-message');
    
    container.innerHTML = '';

    if (cart.length === 0) {
        emptyMessage.style.display = 'block';
        // FIX: Ensure summary is updated when empty
        updateCartSummary(cart); 
        return;
    }
    
    emptyMessage.style.display = 'none';

    let cartHTML = '';
    cart.forEach(item => {
        const product = getProductById(item.productId);
        if (product) cartHTML += createCartItemHTML(item, product);
    });

    container.innerHTML = cartHTML;
    
    // FIX: Ensure summary is updated every time items are rendered
    updateCartSummary(cart); 

    container.querySelectorAll('.qty-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            // FIX: Ensure the product ID is treated as a Number or use == for comparison consistency
            const productId = Number(e.currentTarget.dataset.productId); 
            const action = e.currentTarget.dataset.action;
            let currentCart = loadCart();
            
            // FIX: Use Number(productId) for correct comparison
            let item = currentCart.find(i => i.productId === productId); 
            
            if (!item) return;

            if (action === 'increase') {
                item.qty += 1;
            } else if (action === 'decrease' && item.qty > 1) {
                item.qty -= 1;
            }

            saveCart(currentCart);
            // FIX: Calling renderCartPage() ensures the items and summary update in real-time
            renderCartPage(); 
        });
    });

    container.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            // FIX: Ensure the product ID is treated as a Number
            const productId = Number(e.currentTarget.dataset.productId); 
            
            let currentCart = loadCart();
            // FIX: Use strict comparison (===) after ensuring both IDs are Numbers
            const newCart = currentCart.filter(item => item.productId !== productId); 
            
            saveCart(newCart);
            // FIX: Calling renderCartPage() ensures the items and summary update in real-time
            renderCartPage(); 
        });
    });

    const checkoutButton = document.getElementById('checkout-button');
    const checkoutMessage = document.getElementById('checkout-message');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            alert('Checkout Initiated (Frontend Simulation). Thank you for your order!');
            saveCart([]); 
            if (checkoutMessage) checkoutMessage.style.display = 'block';
            renderCartPage(); 
        });
    }
}


// --- Products Listing Logic (Filters and Sorting) ---

let currentProducts = loadProducts(); // Load all available products
let appliedFilters = {
    price: 1000000,
    type: [],
    brand: '',
    sort: 'latest',
    search: ''
};

/**
 * Initializes the filter sidebar elements based on product data.
 */
function initializeFilters() {
    const allProducts = loadProducts();

    // 1. Determine unique types and brands
    const types = [...new Set(allProducts.map(p => p.type))].filter(t => t); 
    const brands = [...new Set(allProducts.map(p => p.brand))].filter(b => b);

    // 2. Populate Type Filter Checkboxes
    const typeContainer = document.getElementById('type-filter-container');
    if (typeContainer) {
        typeContainer.innerHTML = types.map(type => {
            // Mapping friendly names for display
            let displayName = type;
            if (type === 'GPU') displayName = 'Graphics Cards';
            if (type === 'PC') displayName = 'Gaming PCs / Laptops';
            if (type === 'Monitor') displayName = 'Monitors';
            if (type === 'Console') displayName = 'Consoles';
            if (type === 'Accessories') displayName = 'Gaming Accessories';
            
            return `
                <label class="flex items-center space-x-2">
                    <input type="checkbox" name="type" value="${type}" class="form-checkbox text-gg-primary rounded focus:ring-gg-primary">
                    <span>${displayName}</span>
                </label>
            `;
        }).join('');
    }

    // 3. Populate Brand Dropdown
    const brandDropdown = document.getElementById('brand-dropdown');
    if (brandDropdown) {
        brandDropdown.innerHTML = '<option value="">All Brands</option>' + brands.map(brand => `
            <option value="${brand}">${brand}</option>
        `).join('');
    }
    
    // 4. Set Max Price for Slider (Find max price in initial products)
    const maxPrice = Math.max(1000000, ...allProducts.map(p => p.price));
    const priceSlider = document.getElementById('price-range-slider');
    const maxPriceDisplay = document.getElementById('max-price-display');
    
    if (priceSlider) {
        priceSlider.max = maxPrice;
        priceSlider.value = maxPrice;
        appliedFilters.price = maxPrice;
        maxPriceDisplay.textContent = formatPrice(maxPrice);
    }
}

/**
 * Applies all filters and sorting to the product list and re-renders the grid.
 */
function applyFiltersAndRender() {
    let filtered = loadProducts();

    // 1. Apply Search Filter
    if (appliedFilters.search) {
        const searchTerm = appliedFilters.search.toLowerCase();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm) ||
            p.brand.toLowerCase().includes(searchTerm) ||
            p.category.toLowerCase().includes(searchTerm) ||
            p.type.toLowerCase().includes(searchTerm)
        );
    }

    // 2. Apply Price Filter
    filtered = filtered.filter(p => p.price <= appliedFilters.price);

    // 3. Apply Type Filter
    if (appliedFilters.type.length > 0) {
        filtered = filtered.filter(p => appliedFilters.type.includes(p.type));
    }

    // 4. Apply Brand Filter
    if (appliedFilters.brand) {
        filtered = filtered.filter(p => p.brand === appliedFilters.brand);
    }
    
    // 4. Apply Sorting
    switch (appliedFilters.sort) {
        case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'rating-desc':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        case 'latest':
        default:
            // Sorting by ID descending is 'latest' for dynamically added items (Date.now())
            filtered.sort((a, b) => b.id - a.id); 
            break;
    }

    // Update Product Count Display
    document.getElementById('product-count').textContent = filtered.length;

    // Render the final filtered and sorted list
    renderProducts(filtered, 'product-grid-container');
}

/**
 * Attaches all necessary event listeners for the Products Listing Page.
 */
function setupFilterListeners() {
    const filtersForm = document.getElementById('product-filters');
    const priceSlider = document.getElementById('price-range-slider');
    const sortBySelect = document.getElementById('sort-by');
    const maxPriceDisplay = document.getElementById('max-price-display');
    const typeContainer = document.getElementById('type-filter-container');
    const brandDropdown = document.getElementById('brand-dropdown');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    if (!filtersForm) return; // Exit if not on the Products page

    // Event 1: Price Slider Input
    priceSlider.addEventListener('input', (e) => {
        appliedFilters.price = Number(e.target.value);
        maxPriceDisplay.textContent = formatPrice(appliedFilters.price);
        applyFiltersAndRender();
    });
    
    // Event 2: Type Checkboxes & Brand Dropdown (Change event on form)
    filtersForm.addEventListener('change', () => {
        // Collect current checked types
        const checkedTypes = Array.from(typeContainer.querySelectorAll('input[name="type"]:checked'))
                                  .map(checkbox => checkbox.value);
        
        appliedFilters.type = checkedTypes;
        appliedFilters.brand = brandDropdown.value;

        applyFiltersAndRender();
    });

    // Event 3: Sorting Dropdown
    sortBySelect.addEventListener('change', (e) => {
        appliedFilters.sort = e.target.value;
        applyFiltersAndRender();
    });
    
    // Event 4: Clear Filters Button
    clearFiltersBtn.addEventListener('click', () => {
        filtersForm.reset();
        
        // Reset appliedFilters state
        const maxPrice = Math.max(1000000, ...loadProducts().map(p => p.price));
        appliedFilters = { price: maxPrice, type: [], brand: '', sort: 'latest', search: '' };
        
        // Reset UI elements
        priceSlider.value = maxPrice;
        maxPriceDisplay.textContent = formatPrice(maxPrice);
        sortBySelect.value = 'latest';
        
        applyFiltersAndRender();
    });
}


// --- Product Details Logic ---

function renderProductDetailsPage() {
    // Get product ID from URL query parameters (e.g., ?id=1)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        const container = document.getElementById('product-detail-container');
        if (container) container.innerHTML = '<h2 class="text-4xl text-red-600 text-center py-20">Product Not Found. Invalid ID.</h2>';
        return;
    }

    const product = getProductById(productId);

    if (!product) {
        const container = document.getElementById('product-detail-container');
        if (container) container.innerHTML = '<h2 class="text-4xl text-red-600 text-center py-20">Product Not Found.</h2>';
        return;
    }

    const formattedPrice = formatPrice(product.price);
    const stars = '⭐'.repeat(product.rating) + '☆'.repeat(5 - product.rating);

    // Populate the details directly into the HTML elements (assumes product-details.html structure)
    document.getElementById('product-title').textContent = product.name;
    document.getElementById('product-price').textContent = formattedPrice;
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('product-main-image').src = product.imageUrl;
    document.getElementById('product-main-image').alt = product.name;
    document.getElementById('product-rating').innerHTML = `<span class="star">${stars}</span> (${product.rating}.0)`;
    
    // Features List
    const featuresList = document.getElementById('product-features-list');
    if (featuresList && product.features) {
        featuresList.innerHTML = product.features.map(feature => 
            `<li class="flex items-center space-x-2 text-lg text-gray-700">
                <span class="text-gg-primary font-bold text-2xl">•</span>
                <span>${feature}</span>
            </li>`
        ).join('');
    }
    
    // Add to Cart Button Logic
    const addToCartBtn = document.getElementById('add-to-cart-details-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const quantityInput = document.getElementById('quantity-input');
            const quantity = quantityInput ? Number(quantityInput.value) : 1;
            addToCart(productId, quantity);
        });
    }

    // Recommended Products (Simple rendering of other featured products)
    const recommendedContainer = document.getElementById('recommended-products-carousel');
    const recommended = loadProducts().filter(p => p.id != productId && p.isFeatured).slice(0, 4);
    if (recommendedContainer) {
        // Change the grid layout temporarily for the carousel look
        recommendedContainer.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'; 
        renderProducts(recommended, 'recommended-products-carousel');
    }
}


// --- Newsletter Logic ---

function setupNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    const statusBox = document.getElementById('newsletter-status');
    if (!form || !statusBox) return;

    // Helper function to show/hide status message
    const showStatus = (message, isError = false) => {
        statusBox.textContent = message;
        statusBox.classList.remove('hidden');
        
        // Tailwind classes for styling the message box
        if (isError) {
            // Error Message (Red Background)
            statusBox.className = 'mt-3 text-center text-sm font-medium p-2 rounded text-red-100 bg-red-600';
        } else {
            // Success Message (Green Background)
            statusBox.className = 'mt-3 text-center text-sm font-medium p-2 rounded text-green-100 bg-green-600';
        }
        
        // 5 seconds (5000ms) ke baad message ko chhupane ka intizam
        setTimeout(() => {
            statusBox.classList.add('hidden');
        }, 5000); 
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop page refresh
        
        const emailInput = document.getElementById('newsletter-email');
        const email = emailInput.value;
        
        // Simple regex validation for email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email || !emailRegex.test(email)) {
            // Validation Fail: showStatus ko 'isError: true' ke saath call karein
            showStatus('Invalid Email Format! Please enter a correct email address.', true);
            emailInput.focus();
            return;
        }

        // --- SUCCESS SIMULATION ---
        showStatus(`Thank you for subscribing, ${email}! You will now receive exclusive deals.`);
        emailInput.value = ''; // Clear input after success
    });
}


// --- Footer Modals and Contact Logic ---

function setupModalsAndSupport() {
    const contactModal = document.getElementById('contact-modal');
    const faqsModal = document.getElementById('faqs-modal');
    const contactLink = document.getElementById('contact-us-link');
    const faqsLink = document.getElementById('faqs-link');

    if (!contactModal || !faqsModal || !contactLink || !faqsLink) return;

    // 1. Open/Close Logic
    // NOTE: Contact Form relies on HTML action for submission, JS only handles modal open/close
    contactLink.addEventListener('click', (e) => { e.preventDefault(); contactModal.classList.remove('hidden'); });
    document.getElementById('close-contact-modal').addEventListener('click', () => contactModal.classList.add('hidden'));
    
    // Clicking 'FAQs' opens the modal and renders the FAQ content
    faqsLink.addEventListener('click', (e) => { e.preventDefault(); faqsModal.classList.remove('hidden'); renderFaqs(); });
    document.getElementById('close-faqs-modal').addEventListener('click', () => faqsModal.classList.add('hidden'));
    
    // Close on backdrop click (optional but professional)
    contactModal.addEventListener('click', (e) => { if (e.target === contactModal) contactModal.classList.add('hidden'); });
    faqsModal.addEventListener('click', (e) => { if (e.target === faqsModal) faqsModal.classList.add('hidden'); });
    
    // 2. FAQs Rendering
    const faqsList = document.getElementById('faqs-list');
    const renderFaqs = () => {
        if (!faqsList) return;
        faqsList.innerHTML = faqsData.map((faq, index) => `
            <div class="faq-item border border-gray-200 rounded-lg overflow-hidden">
                <button class="w-full text-left p-4 font-semibold text-lg hover:bg-gg-light transition-colors flex justify-between items-center" 
                        data-index="${index}" onclick="this.nextElementSibling.classList.toggle('hidden');">
                    ${faq.q}
                    <span class="text-gg-primary text-xl">+</span>
                </button>
                <div class="faq-answer hidden p-4 bg-gray-50 text-gray-700 border-t border-gray-200">
                    <p>${faq.a}</p>
                </div>
            </div>
        `).join('');
    };

    // 3. Contact Form Submission Logic REMOVED (Relies on HTML Form Action)
}


// --- Search Functionality ---

function setupSearch() {
    const searchToggleBtn = document.getElementById('search-toggle-btn');
    const searchBarContainer = document.getElementById('search-bar-container');
    const searchInput = document.getElementById('search-input');
    
    if (!searchToggleBtn || !searchBarContainer || !searchInput) return;
    
    // Toggle search bar visibility
    searchToggleBtn.addEventListener('click', () => {
        searchBarContainer.classList.toggle('hidden');
        if (!searchBarContainer.classList.contains('hidden')) {
            // Focus on search input when opened
            setTimeout(() => searchInput.focus(), 100);
        }
    });
    
    // Handle search input
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        
        // Clear previous timeout
        clearTimeout(searchTimeout);
        
        // Debounce search to avoid too many renders
        searchTimeout = setTimeout(() => {
            const page = window.location.pathname.split('/').pop();
            
            if (page === 'products.html') {
                // If on products page, apply search filter
                appliedFilters.search = searchTerm;
                applyFiltersAndRender();
            } else {
                // If on other pages, redirect to products page with search query
                if (searchTerm) {
                    window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
                }
            }
        }, 300); // 300ms debounce
    });
    
    // Handle Enter key to search immediately
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            clearTimeout(searchTimeout);
            const searchTerm = searchInput.value.trim();
            const page = window.location.pathname.split('/').pop();
            
            if (page === 'products.html') {
                appliedFilters.search = searchTerm;
                applyFiltersAndRender();
            } else {
                if (searchTerm) {
                    window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
                }
            }
        }
    });
}


// --- Main Entry Point ---

document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split('/').pop();
    
    // Global setups
    setupNewsletterForm(); 
    setupModalsAndSupport();
    setupSearch();
    
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) cartCountElement.textContent = loadCart().length;

    if (page === 'index.html' || page === '') {
        const allProducts = loadProducts();
        renderProducts(allProducts.filter(p => p.isFeatured).slice(0, 4), 'featured-products-container');
        renderProducts(allProducts.filter(p => p.isTrending).slice(0, 3), 'trending-products-container');

    } else if (page === 'admin.html') {
        const form = document.getElementById('add-product-form');
        const statusMessage = document.getElementById('status-message');

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault(); 
                const formData = new FormData(form);
                const newProduct = {
                    id: Date.now(), 
                    name: formData.get('name'),
                    price: Number(formData.get('price')),
                    category: formData.get('category'),
                    type: formData.get('category').split(' ')[0], 
                    brand: 'New Gear', 
                    rating: Number(formData.get('rating')),
                    stock: Number(formData.get('stock')),
                    description: formData.get('description'),
                    imageUrl: formData.get('imageUrl'),
                    features: [], 
                    isFeatured: true, 
                    isTrending: true,
                };
                
                const allProducts = loadProducts();
                allProducts.push(newProduct);
                saveProducts(allProducts); 

                statusMessage.textContent = `Success! Product "${newProduct.name}" added and saved to LocalStorage.`;
                statusMessage.className = 'p-4 mb-6 text-sm text-green-700 bg-green-100 rounded-lg font-semibold';
                statusMessage.style.display = 'block';
                form.reset();
                setTimeout(() => { statusMessage.style.display = 'none'; }, 5000);
            });
        }
    } else if (page === 'products.html') {
        // --- PRODUCTS LISTING PAGE LOGIC (APPLYING PRE-FILTER FIX) ---
        
        // 1. Get Category and Search from URL
        const urlParams = new URLSearchParams(window.location.search);
        const categoryFilter = urlParams.get('category')?.toUpperCase();
        const searchQuery = urlParams.get('search');
        
        // 2. Initialize Filters (This clears the checkbox container)
        initializeFilters();
        
        // 3. Pre-Filter Logic (FIX for Monitors/Accessories)
        if (categoryFilter) {
            // Find the dynamically generated checkbox for the category
            const checkbox = document.querySelector(`input[name="type"][value="${categoryFilter}"]`);
            
            if (checkbox) {
                // Set checkbox as checked in the UI
                checkbox.checked = true;
                
                // Manually push the uppercase value to the appliedFilters array
                // This correctly sets the filter state before rendering
                appliedFilters.type.push(categoryFilter);
            }
        }
        
        // 4. Apply Search Query if present
        if (searchQuery) {
            appliedFilters.search = searchQuery;
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = searchQuery;
                // Show search bar if it's hidden
                const searchBarContainer = document.getElementById('search-bar-container');
                if (searchBarContainer) {
                    searchBarContainer.classList.remove('hidden');
                }
            }
        }
        
        // 5. Setup Listeners (Must be run AFTER initializeFilters)
        setupFilterListeners();
        
        // 6. Initial render (This applies the filters, including the pre-selected category and search)
        applyFiltersAndRender(); 

    } else if (page === 'cart.html') {
        renderCartPage();

    } else if (page.startsWith('product-details.html')) {
        renderProductDetailsPage();
    }
});