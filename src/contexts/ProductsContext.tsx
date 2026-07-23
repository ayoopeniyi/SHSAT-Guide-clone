import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ProductsApiService } from '../services/productsApi';
import { ProductCompleteResponse } from '../types/types';

interface ProductsContextType {
  products: ProductCompleteResponse[];
  loading: boolean;
  error: string | null;
  refetch: (activeOnly?: boolean) => Promise<void>;
  getProductById: (id: string) => ProductCompleteResponse | null;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

interface ProductsProviderProps {
  children: ReactNode;
}

export const ProductsProvider: React.FC<ProductsProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<ProductCompleteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const fetchProducts = useCallback(async (activeOnly: boolean = true) => {
    try {
      setLoading(true);
      setError(null);
      const apiProducts = await ProductsApiService.getAllProducts(activeOnly);
      setProducts(apiProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async (activeOnly: boolean = true) => {
    await fetchProducts(activeOnly);
  }, [fetchProducts]);

  const getProductById = (id: string): ProductCompleteResponse | null => {
    return products.find(product => product.id === id) || null;
  };

  // Initialize products on first load
  useEffect(() => {
    if (!initialized) {
      fetchProducts();
      setInitialized(true);
    }
  }, [initialized]); // Remove fetchProducts from dependencies to prevent infinite loop

  const value: ProductsContextType = {
    products,
    loading,
    error,
    refetch,
    getProductById,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = (): ProductsContextType => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
