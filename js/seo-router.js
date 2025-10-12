// SEO-Friendly Router for Product URLs
// Add this to your frontend as js/seo-router.js

class SEORouter {
    constructor(app) {
        this.app = app;
        this.baseUrl = window.location.origin;
        this.init();
    }

    init() {
        // Handle initial load
        this.handleRouteChange();
        
        // Listen for popstate (back/forward buttons)
        window.addEventListener('popstate', () => {
            this.handleRouteChange();
        });
        
        // Intercept link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-route]');
            if (link) {
                e.preventDefault();
                this.navigate(link.getAttribute('href'));
            }
        });
    }

    // Navigate to a new route
    navigate(url, updateHistory = true) {
        if (updateHistory) {
            history.pushState({}, '', url);
        }
        this.handleRouteChange();
    }

    // Handle current route
    async handleRouteChange() {
        const path = window.location.pathname;
        const searchParams = new URLSearchParams(window.location.search);
        
        // Route patterns
        const routes = {
            // Product detail: /product/product-id or /produit/product-id-slug
            product: /^\/(product|produit)\/([a-zA-Z0-9-_]+)\/?$/,
            
            // Category: /category/category-name or /categorie/category-name
            category: /^\/(category|categorie)\/([a-zA-Z0-9-_]+)\/?$/,
            
            // Products list: /products or /produits
            products: /^\/(products|produits)\/?$/,
            
            // Home
            home: /^\/$/
        };

        // Match product detail route
        if (routes.product.test(path)) {
            const match = path.match(routes.product);
            const productId = match[2].split('-')[0]; // Extract ID from slug
            
            await this.loadProductPage(productId);
            return;
        }

        // Match category route
        if (routes.category.test(path)) {
            const match = path.match(routes.category);
            const categoryName = this.urlToCategory(match[2]);
            
            await this.app.showPage('products', { categorie: categoryName });
            return;
        }

        // Match products list route
        if (routes.products.test(path)) {
            const params = {};
            searchParams.forEach((value, key) => {
                params[key] = value;
            });
            
            await this.app.showPage('products', params);
            return;
        }

        // Default: home
        await this.app.showPage('home');
    }

    // Load product page and update meta tags
    async loadProductPage(productId) {
        try {
            // Find product
            let product = this.app.allProducts.find(p => p._id === productId);
            
            if (!product) {
                // Try API
                product = await apiCall(`/products/${productId}`);
            }

            if (product) {
                // Update meta tags BEFORE showing the page
                this.updateMetaTags(product);
                this.addStructuredData(product);
                
                // Show product page
                await this.app.loadProductPage(productId);
            } else {
                // Product not found
                this.app.showProductNotFound();
            }
        } catch (error) {
            console.error('Error loading product:', error);
            this.app.showProductNotFound();
        }
    }

    // Update meta tags for SEO
    updateMetaTags(product) {
        const title = `${product.nom} - ${product.marque || 'Shifa Parapharmacie'}`;
        const description = product.description || `Achetez ${product.nom} sur Shifa Parapharmacie. ${product.marque || ''} à ${product.prix} DA.`;
        const imageUrl = this.getProductImageUrl(product);
        const productUrl = this.getProductUrl(product);

        // Update document title
        document.title = title;

        // Update or create meta tags
        this.setMetaTag('description', description);
        
        // Open Graph tags (Facebook, LinkedIn)
        this.setMetaTag('og:title', title, 'property');
        this.setMetaTag('og:description', description, 'property');
        this.setMetaTag('og:image', imageUrl, 'property');
        this.setMetaTag('og:url', productUrl, 'property');
        this.setMetaTag('og:type', 'product', 'property');
        this.setMetaTag('og:site_name', 'Shifa - Parapharmacie', 'property');
        this.setMetaTag('og:locale', 'fr_DZ', 'property');

        // Twitter Card tags
        this.setMetaTag('twitter:card', 'summary_large_image');
        this.setMetaTag('twitter:title', title);
        this.setMetaTag('twitter:description', description);
        this.setMetaTag('twitter:image', imageUrl);

        // Product specific tags
        this.setMetaTag('product:price:amount', product.prix, 'property');
        this.setMetaTag('product:price:currency', 'DZD', 'property');
        this.setMetaTag('product:availability', product.stock > 0 ? 'in stock' : 'out of stock', 'property');
        this.setMetaTag('product:brand', product.marque || 'Shifa', 'property');
        this.setMetaTag('product:category', product.categorie, 'property');

        // Canonical URL
        this.setLink('canonical', productUrl);
    }

    // Set or update a meta tag
    setMetaTag(name, content, attribute = 'name') {
        let element = document.querySelector(`meta[${attribute}="${name}"]`);
        
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(attribute, name);
            document.head.appendChild(element);
        }
        
        element.setAttribute('content', content);
    }

    // Set or update a link tag
    setLink(rel, href) {
        let element = document.querySelector(`link[rel="${rel}"]`);
        
        if (!element) {
            element = document.createElement('link');
            element.setAttribute('rel', rel);
            document.head.appendChild(element);
        }
        
        element.setAttribute('href', href);
    }

    // Add JSON-LD structured data for products
    addStructuredData(product) {
        // Remove existing structured data
        const existingScript = document.getElementById('product-structured-data');
        if (existingScript) {
            existingScript.remove();
        }

        const structuredData = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.nom,
            "image": this.getProductImageUrl(product),
            "description": product.description || `${product.nom} - ${product.marque || 'Shifa Parapharmacie'}`,
            "brand": {
                "@type": "Brand",
                "name": product.marque || "Shifa"
            },
            "offers": {
                "@type": "Offer",
                "url": this.getProductUrl(product),
                "priceCurrency": "DZD",
                "price": product.prix,
                "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
        };

        // Add category
        if (product.categorie) {
            structuredData.category = product.categorie;
        }

        // Add aggregateRating if you have reviews (optional)
        // structuredData.aggregateRating = {
        //     "@type": "AggregateRating",
        //     "ratingValue": "4.5",
        //     "reviewCount": "24"
        // };

        const script = document.createElement('script');
        script.id = 'product-structured-data';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
    }

    // Generate product URL with slug
    getProductUrl(product) {
        const slug = this.createSlug(product.nom);
        return `${this.baseUrl}/produit/${product._id}-${slug}`;
    }

    // Create URL-friendly slug from product name
    createSlug(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    }

    // Get full product image URL
    getProductImageUrl(product) {
        if (product.image && product.image.startsWith('http')) {
            return product.image;
        } else if (product.image && product.image.startsWith('data:image')) {
            // For base64 images, return a placeholder or convert to hosted URL
            return `${this.baseUrl}/images/placeholder.jpg`;
        } else if (product.image) {
            return `${this.baseUrl}${product.image}`;
        }
        
        // Fallback to placeholder
        return `${this.baseUrl}/images/placeholder.jpg`;
    }

    // Convert URL-friendly category to actual category name
    urlToCategory(urlCategory) {
        const mapping = {
            'vitalite': 'Vitalité',
            'sport': 'Sport',
            'visage': 'Visage',
            'cheveux': 'Cheveux',
            'solaire': 'Solaire',
            'intime': 'Intime',
            'soins': 'Soins',
            'bebe': 'Bébé',
            'homme': 'Homme',
            'dentaire': 'Dentaire'
        };
        
        return mapping[urlCategory.toLowerCase()] || urlCategory;
    }

    // Convert category name to URL-friendly format
    categoryToUrl(category) {
        return this.createSlug(category);
    }
}

// Export for use
window.SEORouter = SEORouter;

console.log('✅ SEO Router loaded successfully');
