import { 
  FileText, Brain, Monitor, Users, Play, BookOpen, Package, Star 
} from 'lucide-react';

export type SinglePricing = {
  price: string;
  discount_price: string;
  note?: string;
};

export type BundlePricing = {
  [key: string]: SinglePricing;
};

export interface Product {
  id: string;
  name: string;
  overview: string;
  features: string[];
  benefits: string[];
  whoFor: string;
  pricing: SinglePricing | BundlePricing;
  cta: string;
  metadata?: {
    titleTag?: string;
    metaDescription?: string;
  };
}

export const isSinglePricing = (pricing: Product["pricing"]): pricing is SinglePricing => {
  return (pricing as SinglePricing).price !== undefined;
};

// API Response Types
export interface ProductCompleteResponse {
  id: string;
  name: string;
  overview: string;
  who_for: string;
  cta: string;
  product_type: 'single' | 'bundle';
  active: boolean;
  metadata?: {
    titleTag?: string;
    metaDescription?: string;
  };
  created_at?: string;
  updated_at?: string;
  features: ProductFeatureResponse[];
  benefits: ProductBenefitResponse[];
  bundle_options: ProductBundleOptionResponse[];
  single_pricing?: ProductSinglePricingResponse;
}

export interface ProductFeatureResponse {
  id: string;
  product_id: string;
  feature_text: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductBenefitResponse {
  id: string;
  product_id: string;
  benefit_text: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductBundleOptionResponse {
  id: string;
  product_id: string;
  option_name: string;
  price: string;
  discount_price: string;
  note?: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductSinglePricingResponse {
  id: string;
  product_id: string;
  price: string;
  discount_price: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export const getProductIcon = (name: string) => {
  if (name.includes('Parent Guide') || name.includes('AI Test Prep')) return FileText;
  if (name.includes('Quiz') || name.includes('Question Bank')) return Brain;
  if (name.includes('Test Pack')) return Monitor;
  if (name.includes('Virtual Course')) return name.includes('Live') ? Users : Play;
  if (name.includes('Workbook')) return BookOpen;
  if (name.includes('Bundle')) return Package;
  return Star;
};