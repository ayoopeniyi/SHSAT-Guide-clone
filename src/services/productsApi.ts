import { Product, ProductCompleteResponse } from '../types/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ProductCreateData {
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
}

export interface ProductUpdateData {
  name?: string;
  overview?: string;
  who_for?: string;
  cta?: string;
  product_type?: 'single' | 'bundle';
  active?: boolean;
  metadata?: {
    titleTag?: string;
    metaDescription?: string;
  };
}

export interface SinglePricing {
  price: string;
  discount_price: string;
  note?: string;
}

export interface BundlePricing {
  [optionName: string]: SinglePricing;
}

export class ProductsApiService {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Get all products
  static async getAllProducts(activeOnly: boolean = false): Promise<ProductCompleteResponse[]> {
    try {
      const url = activeOnly 
        ? `${API_BASE_URL}/api/products/get-products?active_only=true`
        : `${API_BASE_URL}/api/products/get-products`;
      const response = await fetch(url);
      return this.handleResponse<ProductCompleteResponse[]>(response);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Get single product by ID
  static async getProductById(id: string): Promise<ProductCompleteResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/get-product/${id}`);
      return this.handleResponse<ProductCompleteResponse>(response);
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  }

  // Get products by type
  static async getProductsByType(type: 'single' | 'bundle'): Promise<ProductCompleteResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/get-products-by-type/${type}`);
      return this.handleResponse<ProductCompleteResponse[]>(response);
    } catch (error) {
      console.error(`Error fetching ${type} products:`, error);
      throw error;
    }
  }

  // Get products by active status for admin interface
  static async getProductsByStatus(activeStatus?: boolean): Promise<ProductCompleteResponse[]> {
    try {
      let url = `${API_BASE_URL}/api/products/get-products-by-status`;
      if (activeStatus !== undefined) {
        url += `?active_status=${activeStatus}`;
      }
      const response = await fetch(url);
      return this.handleResponse<ProductCompleteResponse[]>(response);
    } catch (error) {
      console.error(`Error fetching products by status:`, error);
      throw error;
    }
  }

  // Create product
  static async createProduct(
    productData: ProductCreateData,
    features: string[] = [],
    benefits: string[] = [],
    pricing?: SinglePricing | BundlePricing
  ): Promise<ProductCompleteResponse> {
    try {
      const requestBody = {
        product_data: productData,
        features: features,
        benefits: benefits,
        pricing: pricing
      };

      const response = await fetch(`${API_BASE_URL}/api/products/create-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      return this.handleResponse<ProductCompleteResponse>(response);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Update product
  static async updateProduct(
    id: string,
    productData: ProductUpdateData,
    features?: string[],
    benefits?: string[],
    pricing?: SinglePricing | BundlePricing
  ): Promise<ProductCompleteResponse> {
    try {
      const requestBody = {
        product_data: productData,
        features: features,
        benefits: benefits,
        pricing: pricing
      };

      const response = await fetch(`${API_BASE_URL}/api/products/update-product/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      return this.handleResponse<ProductCompleteResponse>(response);
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  }

  // Delete product
  static async deleteProduct(id: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/delete-product/${id}`, {
        method: 'DELETE',
      });
      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  }

  // Bulk create products
  static async bulkCreateProducts(products: any[]): Promise<ProductCompleteResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/bulk-create-products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products }),
      });
      return this.handleResponse<ProductCompleteResponse[]>(response);
    } catch (error) {
      console.error('Error bulk creating products:', error);
      throw error;
    }
  }

  // Convert API response to frontend Product type
  static convertToProduct(apiProduct: ProductCompleteResponse): Product {
    const pricing = apiProduct.product_type === 'bundle' 
      ? ProductsApiService.convertBundlePricing(apiProduct.bundle_options)
      : ProductsApiService.convertSinglePricing(apiProduct.single_pricing);

    return {
      id: apiProduct.id,
      name: apiProduct.name,
      overview: apiProduct.overview,
      features: apiProduct.features.map(f => f.feature_text),
      benefits: apiProduct.benefits.map(b => b.benefit_text),
      whoFor: apiProduct.who_for,
      pricing,
      cta: apiProduct.cta,
      metadata: apiProduct.metadata,
    };
  }

  static convertSinglePricing(singlePricing: any): SinglePricing {
    if (!singlePricing) {
      return { price: '0.00', discount_price: '0.00' };
    }
    return {
      price: singlePricing.price,
      discount_price: singlePricing.discount_price,
      note: singlePricing.note,
    };
  }

  static convertBundlePricing(bundleOptions: any[]): BundlePricing {
    const pricing: BundlePricing = {};
    bundleOptions.forEach(option => {
      pricing[option.option_name] = {
        price: option.price,
        discount_price: option.discount_price,
        note: option.note,
      };
    });
    return pricing;
  }
}
