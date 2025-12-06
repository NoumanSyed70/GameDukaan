// js/store.js

/**
|--------------------------------------------------------------------------
| LocalStorage Management Utilities
|--------------------------------------------------------------------------
| This file handles all persistent data operations for the GAMERGEAR storefront.
| It uses LocalStorage to simulate a backend database for products and a cart.
*/

// --- LocalStorage Keys ---
const PRODUCTS_KEY = 'allGamerGearProducts';
const CART_KEY = 'gamergearCart';


// --- Product Storage Functions ---

/**
 * Loads products from LocalStorage, falling back to initialProducts (from data.js) if not found.
 * Initializes LocalStorage if it's empty.
 * @returns {Array} The current array of product objects.
 */
function loadProducts() {
    const storedProducts = localStorage.getItem(PRODUCTS_KEY);
    if (storedProducts) {
        return JSON.parse(storedProducts);
    }
    // If nothing in storage, save the initial data and return it
    if (typeof initialProducts !== 'undefined') {
        saveProducts(initialProducts);
        return initialProducts;
    }
    return []; // Return empty array if data.js wasn't loaded
}

/**
 * Saves the current products array to LocalStorage.
 * This is used by the Admin Page logic.
 * @param {Array} products - The array of product objects to save.
 */
function saveProducts(products) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

/**
 * Finds a single product by its ID across all products.
 * @param {number|string} id - The ID of the product.
 * @returns {Object|undefined} The product object or undefined.
 */
function getProductById(id) {
    const products = loadProducts();
    // Use Number() conversion as id often comes as a string from data attributes or URL params
    return products.find(p => p.id === Number(id));
}


// --- Cart Storage Functions ---

/**
 * Loads the cart state from LocalStorage.
 * Cart items are stored as { productId: number, qty: number }.
 * @returns {Array} The current cart array.
 */
function loadCart() {
    const storedCart = localStorage.getItem(CART_KEY);
    return JSON.parse(storedCart || '[]'); 
}

/**
 * Saves the current cart state to LocalStorage.
 * Also triggers a visual update of the cart count in the Header.
 * @param {Array} cart - The array of cart item objects.
 */
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    
    // Update the cart count badge in the header instantly
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        // Calculate the total number of unique items (not quantity)
        cartCountElement.textContent = cart.length; 
    }
}

/**
 * Adds an item to the cart or updates its quantity.
 * @param {number|string} productId - The ID of the product.
 * @param {number} quantity - The amount to add (default 1).
 */
function addToCart(productId, quantity = 1) {
    let cart = loadCart();
    const existingItem = cart.find(item => item.productId === Number(productId));

    if (existingItem) {
        existingItem.qty += quantity;
    } else {
        // Ensure product exists before adding
        if (getProductById(productId)) {
             cart.push({ productId: Number(productId), qty: quantity });
        } else {
            console.error(`Product with ID ${productId} not found. Cannot add to cart.`);
            return;
        }
    }

    saveCart(cart);
    // Use a non-disruptive feedback mechanism
    console.log(`Product ID ${productId} added to cart. Current items: ${cart.length}`);
}

// NOTE: Since we are using basic <script> tags, these functions are global.
// We do not need explicit 'export' statements here.