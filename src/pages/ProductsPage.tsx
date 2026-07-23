import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, Clock, Check, Users, Monitor, Loader2, ArrowLeft } from 'lucide-react';
import { Product } from '../types/types';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../contexts/ProductsContext';
import { ProductsApiService } from '../services/productsApi';
import { useNavigate } from 'react-router-dom';
import LmsProducts from './LmsProducts';

const ProductsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const { products: apiProducts, loading, error } = useProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  // Convert API products to frontend format
  useEffect(() => {
    if (apiProducts.length > 0) {
      const convertedProducts = apiProducts.map(ProductsApiService.convertToProduct);
      setProducts(convertedProducts);
      setFilteredProducts(convertedProducts);
    }
  }, [apiProducts]);

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const results = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.overview.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.features.some(feature =>
        feature.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-[#3083a1] to-[#176781] text-white px-6 py-2 rounded-full text-sm font-medium mb-6 shadow-md">
            <Sparkles className="w-4 h-4 mr-2" />
            Trusted by Thousands of Students
          </div>
          <div>

          </div>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-[#1d99c6] bg-clip-text text-transparent">
            SHSAT Prep Products
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10">
            Discover our comprehensive collection of SHSAT preparation materials, designed to help students succeed on their specialized high school journey.
          </p>

          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products by name, features..."
              className="block w-full pl-10 pr-3 py-4 border border-gray-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-[#1d99c6] focus:border-[#1d99c6] shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <Clock className="w-3 h-3 mr-1" /> Self-Paced
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Check className="w-3 h-3 mr-1" /> Free Options
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <Users className="w-3 h-3 mr-1" /> Live Classes
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              <Monitor className="w-3 h-3 mr-1" /> Digital Practice
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-[#1d99c6] mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-medium text-gray-500">Loading products...</h3>
            <p className="text-gray-400 mt-2">Please wait while we fetch the latest products</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-red-500">Error loading products</h3>
            <p className="text-red-400 mt-2">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-[#1d99c6] text-white rounded-lg hover:bg-[#176781] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500">No products found</h3>
            <p className="text-gray-400 mt-2">Try different search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <ProductCard product={product} key={index} />
            ))}
          </div>
        )}
      </div>
      {/* <div className='container mx-auto px-4 py-12'>
             <LmsProducts />
      </div> */}
   

      <footer className="mt-20 py-8 text-center text-gray-500 text-sm">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Bell Curves SHSAT Prep. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ProductsPage;