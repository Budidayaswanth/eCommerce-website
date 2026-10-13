import api from './api';

// Rich Mock Catalog for resilient fallback
export const MOCK_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Royale Velvet Touch Luxury Interior Emulsion',
    slug: 'royale-velvet-touch-luxury-interior-emulsion',
    category: 'interior',
    categoryName: 'Interior Paints',
    paintType: 'Luxury Emulsion',
    finish: 'Eggshell',
    mrp: 680,
    price: 499,
    discount: 27,
    rating: 4.8,
    reviewCount: 142,
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1562184552-997c461abbe6?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80'
    ],
    sizes: ['1 Litre', '4 Litres', '10 Litres', '20 Litres'],
    color: 'Misty Dawn Pearl',
    colorHex: '#ECEFF1',
    coverage: '140 - 160 sq.ft/Litre (2 coats)',
    stock: 45,
    description: 'Experience unparalleled luxury with Royale Velvet Touch. Infused with Teflon surface protector for effortless stain resistance and a smooth, radiant sheen that elevates living rooms and bedrooms.',
    features: ['Teflon surface protector', 'Ultra-low VOC and non-toxic', 'Anti-fungal shield', 'Silky smooth touch'],
    featured: true,
  },
  {
    id: 'prod-2',
    name: 'Ultima WeatherShield Max Exterior Acrylic',
    slug: 'ultima-weathershield-max-exterior-acrylic',
    category: 'exterior',
    categoryName: 'Exterior Paints',
    paintType: 'Premium Acrylic',
    finish: 'Semi-Gloss',
    mrp: 850,
    price: 649,
    discount: 24,
    rating: 4.9,
    reviewCount: 98,
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80'
    ],
    sizes: ['4 Litres', '10 Litres', '20 Litres'],
    color: 'Royal Velvet Navy',
    colorHex: '#1A237E',
    coverage: '55 - 65 sq.ft/Litre (2 coats)',
    stock: 28,
    description: 'Engineered with nano-silicone technology to shield your building facades against extreme monsoons, tropical heat, UV discoloration, and algae formation.',
    features: ['10-Year Weather Warranty', 'Dirt pick-up resistance', 'Thermal heat reflection', 'Crack-bridging stretch'],
    featured: true,
  },
  {
    id: 'prod-3',
    name: 'DampLock Pro Hydrophobic Waterproofing Barrier',
    slug: 'damplock-pro-hydrophobic-waterproofing-barrier',
    category: 'waterproofing',
    categoryName: 'Waterproofing',
    paintType: 'Damp Proof Polymer',
    finish: 'Matte',
    mrp: 1200,
    price: 899,
    discount: 25,
    rating: 4.7,
    reviewCount: 64,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80'
    ],
    sizes: ['4 Litres', '10 Litres', '20 Litres'],
    color: 'Pure Base White',
    colorHex: '#FFFFFF',
    coverage: '35 - 45 sq.ft/Litre (3 coats)',
    stock: 35,
    description: 'Heavy duty elastomeric waterproofing membrane that forms a seamless, impenetrable rubber-like layer on roofs, parapets, basements, and wet walls.',
    features: ['Resists up to 7 bars of positive water pressure', 'High elongation elastic membrane', 'Direct solar reflective barrier'],
    featured: true,
  },
  {
    id: 'prod-4',
    name: 'WoodCraft Polyurethane Clear Gloss Varnish',
    slug: 'woodcraft-polyurethane-clear-gloss-varnish',
    category: 'wood',
    categoryName: 'Wood Finishes',
    paintType: 'Polyurethane (PU)',
    finish: 'High-Gloss',
    mrp: 520,
    price: 399,
    discount: 23,
    rating: 4.6,
    reviewCount: 51,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80'
    ],
    sizes: ['1 Litre', '4 Litres'],
    color: 'Clear Amber Sheen',
    colorHex: '#D7CCC8',
    coverage: '90 - 110 sq.ft/Litre (2 coats)',
    stock: 19,
    description: 'Showcase rich wood grains on doors, furniture, and cabinetry with this scratch-resistant, water-repellent German polyurethane formulation.',
    features: ['Superior abrasion resistance', 'Crystal clear finish', 'Resists hot cups and household chemicals'],
    featured: false,
  },
  {
    id: 'prod-5',
    name: 'PrimeCoat Alkali-Resistant Masonry Primer',
    slug: 'primecoat-alkali-resistant-masonry-primer',
    category: 'primers',
    categoryName: 'Primers & Undercoats',
    paintType: 'Premium Acrylic',
    finish: 'Matte',
    mrp: 410,
    price: 299,
    discount: 27,
    rating: 4.5,
    reviewCount: 39,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80'
    ],
    sizes: ['1 Litre', '4 Litres', '10 Litres', '20 Litres'],
    color: 'Chalk White',
    colorHex: '#F5F5F5',
    coverage: '120 - 140 sq.ft/Litre (1 coat)',
    stock: 50,
    description: 'Forms a tenacious bond between raw plaster, drywall or concrete and top coats. Seals alkalinity and eliminates patchy color absorption.',
    features: ['High alkali and efflorescence resistance', 'Enhances topcoat durability', 'Quick 30-min drying'],
    featured: false,
  },
  {
    id: 'prod-6',
    name: 'Metallo Stucco Designer Metallic Texture',
    slug: 'metallo-stucco-designer-metallic-texture',
    category: 'textures',
    categoryName: 'Textures & Designer',
    paintType: 'Metallic',
    finish: 'Textured Stucco',
    mrp: 1450,
    price: 1149,
    discount: 21,
    rating: 4.9,
    reviewCount: 88,
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80'
    ],
    sizes: ['1 Litre', '4 Litres'],
    color: 'Imperial Gold',
    colorHex: '#FFD700',
    coverage: '40 - 50 sq.ft/Litre (specialist roller)',
    stock: 15,
    description: 'Create bespoke accent walls with authentic metallic flakes, venetian trowel effects, and radiant light reflections.',
    features: ['Real bronze and gold micro-pigments', 'Washable textured finish', 'Seamless artisan styling'],
    featured: true,
  },
  {
    id: 'prod-7',
    name: 'Breeze Antibacterial Interior Silk Emulsion',
    slug: 'breeze-antibacterial-interior-silk-emulsion',
    category: 'interior',
    categoryName: 'Interior Paints',
    paintType: 'Luxury Emulsion',
    finish: 'Satin / Soft Sheen',
    mrp: 580,
    price: 435,
    discount: 25,
    rating: 4.7,
    reviewCount: 76,
    image: 'https://images.unsplash.com/photo-1562184552-997c461abbe6?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1562184552-997c461abbe6?w=600&auto=format&fit=crop&q=80'
    ],
    sizes: ['1 Litre', '4 Litres', '10 Litres'],
    color: 'Sage Meadow',
    colorHex: '#81C784',
    coverage: '130 - 150 sq.ft/Litre',
    stock: 40,
    description: 'Infused with silver-ion technology that neutralizes 99.9% of bacteria and viruses on interior wall surfaces.',
    features: ['Active Silver Ion antimicrobial barrier', 'Low odor formulation', 'High scrub resistance'],
    featured: true,
  },
  {
    id: 'prod-8',
    name: 'Apex DuraShield All-Weather Exterior Emulsion',
    slug: 'apex-durashield-all-weather-exterior-emulsion',
    category: 'exterior',
    categoryName: 'Exterior Paints',
    paintType: 'Premium Acrylic',
    finish: 'Matte',
    mrp: 690,
    price: 520,
    discount: 25,
    rating: 4.6,
    reviewCount: 54,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80'
    ],
    sizes: ['4 Litres', '10 Litres', '20 Litres'],
    color: 'Terracotta Clay',
    colorHex: '#D84315',
    coverage: '60 - 70 sq.ft/Litre',
    stock: 22,
    description: 'Designed specifically for harsh Indian tropical weather, resisting blistering monsoons and high temperatures.',
    features: ['Anti-algae & anti-fungal formula', 'Color fastness UV guarantee', '7-year performance warranty'],
    featured: false,
  }
];

const productService = {
  async getProducts(params = {}) {
    try {
      const response = await api.get('/products', { params });
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data?.content) {
        return response.data.content;
      }
    } catch (error) {
      console.warn('API /products fallback to mock dataset');
    }

    // Filter mock data locally
    let filtered = [...MOCK_PRODUCTS];

    if (params.category && params.category !== 'all') {
      const cat = params.category.toLowerCase();
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === cat || p.slug.includes(cat)
      );
    }

    if (params.paintType && params.paintType.length > 0) {
      const types = Array.isArray(params.paintType) ? params.paintType : [params.paintType];
      filtered = filtered.filter((p) => types.includes(p.paintType));
    }

    if (params.finish && params.finish.length > 0) {
      const finishes = Array.isArray(params.finish) ? params.finish : [params.finish];
      filtered = filtered.filter((p) => finishes.includes(p.finish));
    }

    if (params.minPrice) {
      filtered = filtered.filter((p) => p.price >= Number(params.minPrice));
    }

    if (params.maxPrice) {
      filtered = filtered.filter((p) => p.price <= Number(params.maxPrice));
    }

    if (params.minRating) {
      filtered = filtered.filter((p) => p.rating >= Number(params.minRating));
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.paintType.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q)
      );
    }

    if (params.sort) {
      if (params.sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
      if (params.sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
      if (params.sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  },

  async getProductBySlug(slug) {
    try {
      const response = await api.get(`/products/${slug}`);
      if (response.data) return response.data;
    } catch (error) {
      console.warn(`API /products/${slug} fallback to mock`);
    }

    const found = MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
    if (!found) {
      return MOCK_PRODUCTS[0];
    }
    return found;
  },

  async searchProducts(query) {
    if (!query || query.trim() === '') return [];
    try {
      const response = await api.get('/products/search', { params: { query } });
      if (response.data) return response.data;
    } catch (error) {
      console.warn('API /products/search fallback');
    }

    const q = query.toLowerCase();
    return MOCK_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.paintType.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
    );
  },
};

export default productService;
