import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { ProductCompleteResponse, SinglePricing, BundlePricing } from '../../types/types';
import { ProductsApiService } from '../../services/productsApi';

interface ProductFormProps {
  product?: ProductCompleteResponse | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    overview: '',
    who_for: '',
    cta: '',
    product_type: 'single' as 'single' | 'bundle',
    active: true,
    metadata: {
      titleTag: '',
      metaDescription: ''
    }
  });

  const [features, setFeatures] = useState<string[]>(['']);
  const [benefits, setBenefits] = useState<string[]>(['']);
  const [pricing, setPricing] = useState<SinglePricing | BundlePricing>({
    price: '',
    discount_price: '',
    note: ''
  } as SinglePricing);

  // Initialize form data
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        overview: product.overview,
        who_for: product.who_for,
        cta: product.cta,
        product_type: product.product_type,
        active: product.active,
        metadata: {
          titleTag: product.metadata?.titleTag || '',
          metaDescription: product.metadata?.metaDescription || ''
        }
      });

      // Set features
      if (product.features.length > 0) {
        setFeatures(product.features.map(f => f.feature_text));
      } else {
        setFeatures(['']);
      }

      // Set benefits
      if (product.benefits.length > 0) {
        setBenefits(product.benefits.map(b => b.benefit_text));
      } else {
        setBenefits(['']);
      }

      // Set pricing
      if (product.product_type === 'bundle' && product.bundle_options.length > 0) {
        const bundlePricing: BundlePricing = {};
        product.bundle_options.forEach(option => {
          bundlePricing[option.option_name] = {
            price: option.price,
            discount_price: option.discount_price,
            note: option.note || ''
          };
        });
        setPricing(bundlePricing);
      } else if (product.single_pricing) {
        setPricing({
          price: product.single_pricing.price,
          discount_price: product.single_pricing.discount_price,
          note: product.single_pricing.note || ''
        });
      } else {
        setPricing({ price: '', discount_price: '', note: '' });
      }
    }
  }, [product]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const addFeature = () => {
    setFeatures([...features, '']);
  };

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
  };

  const addBenefit = () => {
    setBenefits([...benefits, '']);
  };

  const removeBenefit = (index: number) => {
    if (benefits.length > 1) {
      setBenefits(benefits.filter((_, i) => i !== index));
    }
  };

  const handlePricingChange = (field: string, value: string) => {
    if (formData.product_type === 'bundle') {
      // For bundles, we'll handle this differently
      return;
    } else {
      setPricing(prev => ({
        ...(prev as SinglePricing),
        [field]: value
      }));
    }
  };

  const handleBundleOptionChange = (optionName: string, field: string, value: string) => {
    setPricing(prev => ({
      ...(prev as BundlePricing),
      [optionName]: {
        ...(prev as BundlePricing)[optionName],
        [field]: value
      }
    }));
  };

  const addBundleOption = () => {
    const optionName = `Option ${Object.keys(pricing as BundlePricing).length + 1}`;
    setPricing(prev => ({
      ...(prev as BundlePricing),
      [optionName]: {
        price: '',
        discount_price: '',
        note: ''
      }
    }));
  };

  const removeBundleOption = (optionName: string) => {
    const newPricing = { ...(pricing as BundlePricing) };
    delete newPricing[optionName];
    setPricing(newPricing);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Filter out empty features and benefits
      const filteredFeatures = features.filter(f => f.trim() !== '');
      const filteredBenefits = benefits.filter(b => b.trim() !== '');

      if (product) {
        // Update existing product
        await ProductsApiService.updateProduct(
          product.id,
          formData,
          filteredFeatures,
          filteredBenefits,
          pricing
        );
      } else {
        // Create new product
        await ProductsApiService.createProduct(
          formData,
          filteredFeatures,
          filteredBenefits,
          pricing
        );
      }

      onSubmit();
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onCancel}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {product ? 'Edit Product' : 'Add New Product'}
                </h1>
                <p className="mt-2 text-gray-600">
                  {product ? 'Update product information' : 'Create a new SHSAT prep product'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1d99c6] focus:border-transparent"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overview *
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1d99c6] focus:border-transparent"
                  value={formData.overview}
                  onChange={(e) => handleInputChange('overview', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Who For *
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1d99c6] focus:border-transparent"
                  value={formData.who_for}
                  onChange={(e) => handleInputChange('who_for', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call to Action *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1d99c6] focus:border-transparent"
                  value={formData.cta}
                  onChange={(e) => handleInputChange('cta', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Type *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1d99c6] focus:border-transparent"
                  value={formData.product_type}
                  onChange={(e) => handleInputChange('product_type', e.target.value)}
                >
                  <option value="single">Single Product</option>
                  <option value="bundle">Bundle Product</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => handleInputChange('active', e.target.checked)}
                    className="rounded border-gray-300 text-[#1d99c6] focus:ring-[#1d99c6]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active (visible to customers)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Features</h2>
              <button
                type="button"
                onClick={addFeature}
                className="inline-flex items-center px-3 py-2 text-sm bg-[#1d99c6] text-white rounded-md hover:bg-[#176781]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Feature
              </button>
            </div>
            
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1d99c6] focus:border-transparent"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder="Enter feature..."
                  />
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Benefits</h2>
              <button
                type="button"
                onClick={addBenefit}
                className="inline-flex items-center px-3 py-2 text-sm bg-[#1d99c6] text-white rounded-md hover:bg-[#176781]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Benefit
              </button>
            </div>
            
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1d99c6] focus:border-transparent"
                    value={benefit}
                    onChange={(e) => handleBenefitChange(index, e.target.value)}
                    placeholder="Enter benefit..."
                  />
                  {benefits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBenefit(index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Pricing</h2>
            
            {formData.product_type === 'single' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1d99c6] focus:border-transparent"
                    value={(pricing as SinglePricing).price}
                    onChange={(e) => handlePricingChange('price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Price *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1d99c6] focus:border-transparent"
                    value={(pricing as SinglePricing).discount_price}
                    onChange={(e) => handlePricingChange('discount_price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1d99c6] focus:border-transparent"
                    value={(pricing as SinglePricing).note}
                    onChange={(e) => handlePricingChange('note', e.target.value)}
                    placeholder="Optional note..."
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-medium text-gray-700">Bundle Options</h3>
                  <button
                    type="button"
                    onClick={addBundleOption}
                    className="inline-flex items-center px-3 py-2 text-sm bg-[#1d99c6] text-white rounded-md hover:bg-[#176781]"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </button>
                </div>
                
                {Object.entries(pricing as BundlePricing).map(([optionName, optionPricing]) => (
                  <div key={optionName} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1d99c6] focus:border-transparent"
                        value={optionName}
                        onChange={(e) => {
                          const newPricing = { ...pricing as BundlePricing };
                          delete newPricing[optionName];
                          newPricing[e.target.value] = optionPricing;
                          setPricing(newPricing);
                        }}
                        placeholder="Option name..."
                      />
                      <button
                        type="button"
                        onClick={() => removeBundleOption(optionName)}
                        className="ml-2 p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1d99c6] focus:border-transparent"
                          value={optionPricing.price}
                          onChange={(e) => handleBundleOptionChange(optionName, 'price', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount Price *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1d99c6] focus:border-transparent"
                          value={optionPricing.discount_price}
                          onChange={(e) => handleBundleOptionChange(optionName, 'discount_price', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Note
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1d99c6] focus:border-transparent"
                          value={optionPricing.note}
                          onChange={(e) => handleBundleOptionChange(optionName, 'note', e.target.value)}
                          placeholder="Optional note..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEO Metadata */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">SEO Metadata</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title Tag
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1d99c6] focus:border-transparent"
                  value={formData.metadata.titleTag}
                  onChange={(e) => handleInputChange('metadata.titleTag', e.target.value)}
                  placeholder="SEO title for search engines..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1d99c6] focus:border-transparent"
                  value={formData.metadata.metaDescription}
                  onChange={(e) => handleInputChange('metadata.metaDescription', e.target.value)}
                  placeholder="SEO description for search engines..."
                />
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-[#1d99c6] text-white rounded-md hover:bg-[#176781] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {product ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
