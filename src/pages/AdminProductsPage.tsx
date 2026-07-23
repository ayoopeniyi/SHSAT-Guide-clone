import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit, Trash2, Search, Loader2, AlertCircle,
  Package, DollarSign
} from 'lucide-react';
import { ProductCompleteResponse, getProductIcon } from '../types/types';
import { ProductsApiService } from '../services/productsApi';
import ProductForm from '../components/admin/ProductForm';
import { useProducts } from '../contexts/ProductsContext';
import { useAuthStore } from '../stores/authStore';

const AdminProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuthStore();
  const [filteredProducts, setFilteredProducts] = useState<ProductCompleteResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'single' | 'bundle'>('all');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductCompleteResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const { products, loading, error, refetch } = useProducts();

  // Fetch all products (including inactive) for admin on component mount
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/teacher-dashboard');
      return;
    }
    refetch(false); // false means fetch all products, not just active ones
  }, [isAdmin, authLoading, navigate]); // Empty dependency array - only run once on mount

  // Filter products based on search term, type, and active status
  useEffect(() => {
    let filtered = products;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(product => product.product_type === filterType);
    }

    // Filter by active status
    if (filterActive !== 'all') {
      filtered = filtered.filter(product => 
        filterActive === 'active' ? product.active : !product.active
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.overview.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.who_for.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, filterType, filterActive]);


  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: ProductCompleteResponse) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await ProductsApiService.deleteProduct(productId);
      await refetch(false); // Refresh the list with all products
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingProduct(null);
    await refetch(false); // Refresh the list with all products
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const getProductTypeIcon = (productType: string) => {
    switch (productType) {
      case 'single': return DollarSign;
      case 'bundle': return Package;
      default: return Package;
    }
  };

  const formatPrice = (product: ProductCompleteResponse) => {
    if (product.product_type === 'bundle') {
      const options = product.bundle_options;
      if (options.length === 0) return { price: 'No pricing', discount: null, isFree: false };
      const minPrice = Math.min(...options.map(opt => parseFloat(opt.price)));
      const maxPrice = Math.max(...options.map(opt => parseFloat(opt.price)));
      const price = options.length === 1 ? `$${options[0].price}` : `$${minPrice} - $${maxPrice}`;
      return { price, discount: null, isFree: false };
    } else {
      const pricing = product.single_pricing;
      if (!pricing) return { price: 'No pricing', discount: null, isFree: false };
      const isFree = parseFloat(pricing.price) === 0;
      return { 
        price: isFree ? 'Free' : `$${pricing.price}`, 
        discount: pricing.discount_price !== pricing.price ? `$${pricing.discount_price}` : null,
        isFree 
      };
    }
  };

  if (showForm) {
    return (
      <ProductForm
        product={editingProduct}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Products Management</h1>
                <p className="text-gray-600">Manage your SHSAT prep products and pricing</p>
              </div>
              <button
                onClick={handleCreateProduct}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'single' | 'bundle')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              >
                <option value="all">All Types</option>
                <option value="single">Single Products</option>
                <option value="bundle">Bundle Products</option>
              </select>
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-[#1d99c6] mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-medium text-gray-500">Loading products...</h3>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-red-500">Error loading products</h3>
            <p className="text-red-400 mt-2">{error}</p>
            <button 
              onClick={() => refetch(false)}
              className="mt-4 px-4 py-2 bg-[#1d99c6] text-white rounded-lg hover:bg-[#176781] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-medium text-gray-500 mb-2">No products found</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filters to find what you\'re looking for' 
                  : 'Get started by adding your first product to the system'
                }
              </p>
              {!searchTerm && filterType === 'all' && (
                <button
                  onClick={handleCreateProduct}
                  className="inline-flex items-center px-6 py-3 bg-[#1d99c6] text-white rounded-lg hover:bg-[#176781] transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Product
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const IconComponent = getProductIcon(product.name);
              const TypeIcon = getProductTypeIcon(product.product_type);
              const pricing = formatPrice(product);
              
              // Color schemes based on product type - more minimal and subtle
              const getColorScheme = (productType: string) => {
                switch (productType) {
                  case 'bundle':
                    return {
                      gradient: 'from-slate-600 to-slate-700',
                      bg: 'bg-slate-50',
                      text: 'text-slate-600',
                      border: 'border-slate-200',
                      accent: 'bg-slate-100'
                    };
                  case 'single':
                    return {
                      gradient: 'from-blue-600 to-blue-700',
                      bg: 'bg-blue-50',
                      text: 'text-blue-600',
                      border: 'border-blue-200',
                      accent: 'bg-blue-100'
                    };
                  default:
                    return {
                      gradient: 'from-gray-600 to-gray-700',
                      bg: 'bg-gray-50',
                      text: 'text-gray-600',
                      border: 'border-gray-200',
                      accent: 'bg-gray-100'
                    };
                }
              };

              const colors = getColorScheme(product.product_type);
              
              return (
                <div key={product.id} className={`bg-white rounded-xl shadow-md border ${colors.border} hover:shadow-lg transition-all duration-200 overflow-hidden`}>
                  {/* Card Header - Clean and minimal */}
                  <div className={`${colors.bg} p-6 border-b ${colors.border}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`h-12 w-12 rounded-lg ${colors.accent} flex items-center justify-center`}>
                          <IconComponent className={`h-6 w-6 ${colors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                            {product.name}
                          </h3>
                          <div className="flex items-center mt-1">
                            <TypeIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-500 capitalize">
                              {product.product_type}
                            </span>
                            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                              product.active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-6 overflow-hidden leading-relaxed" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {product.overview}
                    </p>
                    
                    {/* Pricing Section */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Pricing</span>
                        <div className="text-right">
                          {pricing.isFree ? (
                            <span className="text-xl font-bold text-green-600">FREE</span>
                          ) : (
                            <div>
                              <span className="text-xl font-bold text-gray-900">{pricing.price}</span>
                              {pricing.discount && (
                                <div className="text-sm text-gray-500 line-through">{pricing.discount}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                        <div className="text-2xl font-bold text-gray-700">
                          {product.features.length}
                        </div>
                        <div className="text-xs text-gray-500">Features</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                        <div className="text-2xl font-bold text-gray-700">
                          {product.benefits.length}
                        </div>
                        <div className="text-xs text-gray-500">Benefits</div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="text-center">
                      <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                        {product.cta}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-mono bg-white px-2 py-1 rounded border text-gray-600">
                        {product.id}
                      </span>
                      <span className="text-gray-400">
                        {product.created_at 
                          ? new Date(product.created_at).toLocaleDateString()
                          : 'Recently created'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Product</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this product? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(deleteConfirm)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductsPage;
