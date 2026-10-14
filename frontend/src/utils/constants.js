export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'leo_paints_access_token',
  REFRESH_TOKEN: 'leo_paints_refresh_token',
  USER: 'leo_paints_user',
  CART: 'leo_paints_cart',
  WISHLIST: 'leo_paints_wishlist',
};

export const CATEGORIES = [
  { id: 'interior', name: 'Interior Paints', slug: 'interior-paints', icon: 'RiPaintBrushLine', description: 'Transform your indoor spaces with ultra-smooth luxury emulsions.' },
  { id: 'exterior', name: 'Exterior Paints', slug: 'exterior-paints', icon: 'RiBuildingLine', description: 'Weather-resistant and UV-protected all-climate durability.' },
  { id: 'primers', name: 'Primers & Undercoats', slug: 'primers', icon: 'RiMagicLine', description: 'Essential base for flawless finish, sealing & masonry bonding.' },
  { id: 'wood', name: 'Wood Finishes', slug: 'wood-finishes', icon: 'RiTreeLine', description: 'Enrich natural grains with PU coats and clear wood stains.' },
  { id: 'waterproofing', name: 'Waterproofing', slug: 'waterproofing', icon: 'RiDropLine', description: 'Superior damp-proof membranes and roof sealing protection.' },
  { id: 'textures', name: 'Textures & Designer', slug: 'textures', icon: 'RiArtboardLine', description: 'Artistic feature wall textures with metallic and stucco sheen.' },
];

export const PAINT_TYPES = [
  'Luxury Emulsion',
  'Interior Architectural',
  'Exterior WeatherShield',
  'Primer & Undercoat',
  'Masonry Sealer',
  'Wall Putty & Leveler',
  'Damp Proof Polymer',
  'Premium Acrylic',
  'Oil-Based Enamel',
  'Epoxy Floor Coating',
  'Polyurethane (PU)',
  'Designer Texture',
  'Metallic Specialty Coat',
  'Rust Preventive Primer',
  'Wood Varnish & Stain',
  'Distemper',
  'Chalk Decorative Paint',
];

export const FINISHES = [
  'Matte',
  'Eggshell',
  'Satin / Soft Sheen',
  'Silk Luxury Sheen',
  'Velvet Soft-Touch',
  'Semi-Gloss',
  'Gloss',
  'High-Gloss Mirror',
  'Pearl Iridescent',
  'Metallic Sparkle',
  'Textured Stucco',
  'Rustic Weathered',
];

export const SIZES = ['1 Litre', '4 Litres', '10 Litres', '20 Litres'];

export const ORDER_STATUSES = {
  PENDING: { label: 'Pending', color: '#ED6C02', bg: '#FFF3E0', variant: 'warning' },
  CONFIRMED: { label: 'Confirmed', color: '#0288D1', bg: '#E1F5FE', variant: 'info' },
  PROCESSING: { label: 'Processing', color: '#5E35B1', bg: '#EDE7F6', variant: 'info' },
  SHIPPED: { label: 'Shipped', color: '#1565C0', bg: '#E3F2FD', variant: 'info' },
  DELIVERED: { label: 'Delivered', color: '#2E7D32', bg: '#E8F5E9', variant: 'success' },
  CANCELLED: { label: 'Cancelled', color: '#C62828', bg: '#FFEBEE', variant: 'danger' },
  REFUNDED: { label: 'Refunded', color: '#616161', bg: '#EEEEEE', variant: 'info' },
};

export const TRENDING_COLORS = [
  { name: 'Royal Velvet Navy', hex: '#1A237E', category: 'Bold' },
  { name: 'Imperial Gold', hex: '#FFD700', category: 'Accent' },
  { name: 'Heritage Crimson', hex: '#C62828', category: 'Vibrant' },
  { name: 'Sage Meadow', hex: '#81C784', category: 'Earth' },
  { name: 'Misty Dawn Pearl', hex: '#ECEFF1', category: 'Neutral' },
  { name: 'Terracotta Clay', hex: '#D84315', category: 'Warm' },
  { name: 'Aegean Cobalt', hex: '#0277BD', category: 'Cool' },
  { name: 'Blush Sandstone', hex: '#F8BBD0', category: 'Pastel' },
  { name: 'Olive Grove', hex: '#558B2F', category: 'Earth' },
  { name: 'Charcoal Slate', hex: '#37474F', category: 'Modern' },
];

export const BRAND_PROMISES = [
  {
    icon: 'RiShieldCheckLine',
    title: '10-Year Warranty',
    description: 'Certified weather resistance & pigment lock guarantee',
  },
  {
    icon: 'RiTruckLine',
    title: 'Express Doorstep Delivery',
    description: 'Safely packed tamper-proof cans delivered across India',
  },
  {
    icon: 'RiPaletteLine',
    title: 'Precision Color Match',
    description: 'Computerized spectral shade accuracy to 99.8%',
  },
  {
    icon: 'RiCustomerService2Line',
    title: 'Expert Paint Consultants',
    description: 'Free technical advice & surface estimation anytime',
  },
];
