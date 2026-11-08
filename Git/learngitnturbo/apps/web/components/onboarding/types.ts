export type BrandTheme = 'obsidian' | 'emerald' | 'amber' | 'sapphire';

export type LotCapacity = 'boutique' | 'medium' | 'large';

export type InventorySize = 'under-20' | '20-50' | '50-100' | '100-plus';

export interface OnboardingData {
  // Step 1: Dealership Identity
  dealershipName: string;
  slug: string;
  customDomain: string;
  tagline: string;
  theme: BrandTheme;

  // Step 2: Showroom Location
  address: string;
  city: string;
  state: string;
  pincode: string;
  mapsUrl: string;
  lotCapacity: LotCapacity;

  // Step 3: Customer Contact & Inquiries
  whatsappNumber: string;
  deskPhone: string;
  salesEmail: string;
  gstin: string;

  // Step 4: Fleet Profile & Launch
  segments: string[];
  inventorySize: InventorySize;
  preloadSampleCars: boolean;
  agreeTerms: boolean;
}

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
  dealershipName: '',
  slug: '',
  customDomain: '',
  tagline: '',
  theme: 'obsidian',

  address: '',
  city: '',
  state: '',
  pincode: '',
  mapsUrl: '',
  lotCapacity: 'medium',

  whatsappNumber: '',
  deskPhone: '',
  salesEmail: '',
  gstin: '',

  segments: [],
  inventorySize: '20-50',
  preloadSampleCars: false,
  agreeTerms: false,
};

export const INDIAN_STATES = [
  'Karnataka',
  'Maharashtra',
  'Delhi NCR',
  'Tamil Nadu',
  'Kerala',
  'Telangana',
  'Gujarat',
  'Rajasthan',
  'Uttar Pradesh',
  'West Bengal',
  'Punjab',
  'Haryana',
  'Goa',
  'Andhra Pradesh',
  'Madhya Pradesh',
  'Odisha',
  'Chandigarh',
];

export const THEME_CONFIG: Record<
  BrandTheme,
  {
    name: string;
    subtitle: string;
    badgeBg: string;
    badgeText: string;
    headerGradient: string;
    accentColor: string;
    previewRing: string;
  }
> = {
  obsidian: {
    name: 'Obsidian Stealth',
    subtitle: 'High contrast monochrome & slate',
    badgeBg: 'bg-neutral-950',
    badgeText: 'text-white',
    headerGradient: 'from-neutral-950 via-neutral-900 to-neutral-800',
    accentColor: '#171717',
    previewRing: 'ring-neutral-900',
  },
  emerald: {
    name: 'Monaco Emerald',
    subtitle: 'British racing green & gold accents',
    badgeBg: 'bg-emerald-950',
    badgeText: 'text-emerald-100',
    headerGradient: 'from-emerald-950 via-emerald-900 to-neutral-900',
    accentColor: '#064e3b',
    previewRing: 'ring-emerald-600',
  },
  amber: {
    name: 'Apex Amber',
    subtitle: 'Champagne gold & warm sand luxury',
    badgeBg: 'bg-amber-950',
    badgeText: 'text-amber-100',
    headerGradient: 'from-amber-950 via-amber-900 to-neutral-900',
    accentColor: '#78350f',
    previewRing: 'ring-amber-600',
  },
  sapphire: {
    name: 'Sapphire Royal',
    subtitle: 'Deep cobalt blue & platinum silver',
    badgeBg: 'bg-blue-950',
    badgeText: 'text-blue-100',
    headerGradient: 'from-blue-950 via-blue-900 to-neutral-900',
    accentColor: '#1e3a8a',
    previewRing: 'ring-blue-600',
  },
};

