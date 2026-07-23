import React, { useState, useEffect } from 'react';
import {
  X, Check, Users, Award, Shield, Package,
  CreditCard, Download, Sparkles, Bookmark, Target, User
} from 'lucide-react';
import { Product, isSinglePricing, getProductIcon } from '../types/types';
import { createCheckoutSession } from '../lib/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductsContext';
import { ProductsApiService } from '../services/productsApi';

const ProductModal: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [userData, setUserData] = useState<{
    name: string, email: string, phone_number: string
  }>({
    name: "",
    email: "",
    phone_number: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const { getProductById } = useProducts();

  useEffect(() => {
    if (id) {
      const apiProduct = getProductById(id);
      if (apiProduct) {
        const convertedProduct = ProductsApiService.convertToProduct(apiProduct);
        setProduct(convertedProduct);
        
        // Set default bundle if it's a bundle product
        if (!isSinglePricing(convertedProduct.pricing)) {
          setSelectedBundle(Object.keys(convertedProduct.pricing)[0]);
        }
        setLoading(false);
      } else {
        setError('Product not found');
        setLoading(false);
      }
    }
  }, [id, getProductById]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Product not found</p>
          <button 
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const IconComponent = getProductIcon(product.name);

  const handleFreeProductSuccess = (transactionId: string, userId: string) => {
    localStorage.setItem('freeTransaction', JSON.stringify({
      transactionId,
      userId,
      productName: product.name,
      timestamp: new Date().toISOString()
    }));

    navigate(`/checkout-success?transaction_id=${transactionId}&free=true`);
  };

  const handleBuyNow = () => {
    const isFree = isSinglePricing(product.pricing) ?
      parseFloat(product.pricing.discount_price) === 0 :
      false;

    if (isFree) {
      setShowCheckoutForm(true);
      setError('');
    } else {
      setShowCheckoutForm(true);
      setError('');
    }
  };

  const handleCheckout = async () => {
    if (!userData.name || !userData.email) {
      setError('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsProcessing(true);
    setError('');

    let unitAmount = 0;
    let productName = product.name;
    let productDescription = product.overview;

    if (isSinglePricing(product.pricing)) {
      unitAmount = Math.round(parseFloat(product.pricing.discount_price) * 100);
    } else if (selectedBundle && product.pricing[selectedBundle]) {
      unitAmount = Math.round(parseFloat(product.pricing[selectedBundle].discount_price) * 100);
      productName = `${product.name} - ${selectedBundle}`;
    }

    try {
      const checkoutData = {
        user_data: {
          name: userData.name,
          email: userData.email,
          phone_number: userData.phone_number || ''
        },
        product_id: product.id,
        product_name: productName,
        product_description: productDescription,
        unit_amount: unitAmount,
        currency: 'usd'
      };

      const response = await createCheckoutSession(checkoutData);

      if (response.status === 'success') {
        if (response.is_free_product) {
          handleFreeProductSuccess(response.transaction_id!, response.user_id!);
        } else if (response.checkout_url) {
          window.location.href = response.checkout_url;
        } else {
          throw new Error('Invalid response from server - no checkout URL or free product flag');
        }
      } else {
        throw new Error(response.message || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      let errorMessage = 'Failed to proceed to checkout. Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);

      if (typeof window !== 'undefined' && (window as any).posthog) {
        const posthog = (window as any).posthog;
        posthog.capture('checkout_error', {
          error_message: errorMessage,
          product_name: productName,
          unit_amount: unitAmount,
          user_email: userData.email,
          timestamp: new Date().toISOString()
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getCurrentPrice = (): string => {
    if (isSinglePricing(product.pricing)) {
      return product.pricing.discount_price;
    } else if (selectedBundle && product.pricing[selectedBundle]) {
      return product.pricing[selectedBundle].discount_price;
    }
    return '0';
  };

  const isFreeProduct = isSinglePricing(product.pricing) ?
    parseFloat(product.pricing.discount_price) === 0 :
    false;

  const renderPricing = () => {
    if (isSinglePricing(product.pricing)) {
      const isFree = parseFloat(product.pricing.discount_price) === 0;
      const hasDiscount = parseFloat(product.pricing.price) > parseFloat(product.pricing.discount_price);

      return (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
          {!showCheckoutForm ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {!isFree ? (
                  <div className="flex flex-wrap items-center gap-3">
                    {hasDiscount && (
                      <span className="text-gray-500 line-through text-lg">
                        ${product.pricing.price}
                      </span>
                    )}
                    <span className="text-3xl font-bold text-gray-900">
                      ${product.pricing.discount_price}
                    </span>
                    {hasDiscount && (
                      <span className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                        SAVE ${(parseFloat(product.pricing.price) - parseFloat(product.pricing.discount_price)).toFixed(2)}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-green-600">FREE</span>
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                  </div>
                )}
                {product.pricing.note && (
                  <p className="text-sm text-gray-600 mt-2 flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-blue-500" />
                    {product.pricing.note}
                  </p>
                )}
              </div>
              {/* <button
                onClick={handleBuyNow}
                className="bg-gradient-to-r from-[#1d99c6] to-[#176781] text-white px-8 py-3.5 rounded-xl hover:bg-[#1d99c6] transition-all duration-300 transform hover:scale-105 font-semibold shadow-md hover:shadow-lg whitespace-nowrap flex items-center gap-2"
              >
                {isFree ? <Download className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                {product.cta}
              </button> */}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Enter Your Details
              </h3>
              <p className="text-gray-600">
                {isFree
                  ? "We'll use this information to deliver your free product and keep you updated."
                  : "We'll use this information to process your payment and deliver your product."
                }
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={userData.phone_number}
                    onChange={(e) => setUserData({ ...userData, phone_number: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your mobile number"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCheckoutForm(false)}
                  disabled={isProcessing}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing || !userData.name || !userData.email}
                  className="flex-1 bg-gradient-to-r from-[#1d99c6] to-[#176781] text-white px-8 py-3 rounded-lg hover:from-[#1d99c6] hover:to-[#176781] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {isFree ? <Download className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                      {isFree ? 'Get Free Access' : `Proceed to Payment - $${getCurrentPrice()}`}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#1d99c6]" />
            Bundle Options:
          </h4>

          {!showCheckoutForm ? (
            <>
              <div className="space-y-3 mb-6">
                {Object.entries(product.pricing).map(([bundleName, pricing]) => {
                  const hasDiscount = parseFloat(pricing.price) > parseFloat(pricing.discount_price);
                  const isSelected = selectedBundle === bundleName;
                  const isFree = parseFloat(pricing.discount_price) === 0;

                  return (
                    <div
                      key={bundleName}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer ${isSelected
                        ? 'bg-blue-50 border-blue-300 shadow-md'
                        : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
                        }`}
                      onClick={() => setSelectedBundle(bundleName)}
                    >
                      <div>
                        <h5 className="font-medium text-gray-900">{bundleName}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          {hasDiscount && (
                            <span className="text-gray-400 line-through text-sm">
                              ${pricing.price}
                            </span>
                          )}
                          <span className={`text-xl font-bold ${isFree ? 'text-green-600' : 'text-gray-900'}`}>
                            {isFree ? 'FREE' : `$${pricing.discount_price}`}
                          </span>
                          {hasDiscount && !isFree && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                              SAVE ${(parseFloat(pricing.price) - parseFloat(pricing.discount_price)).toFixed(2)}
                            </span>
                          )}
                        </div>
                        {pricing.note && (
                          <p className="text-xs text-gray-500 mt-1">{pricing.note}</p>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                        }`}>
                        {isSelected ? 'Selected' : 'Select'}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* <button
                onClick={handleBuyNow}
                className="w-full bg-gradient-to-r from-[#1d99c6] to-[#176781] text-white px-8 py-3.5 rounded-xl hover:from-[#1d99c6] hover:to-[#176781] transition-all duration-300 transform hover:scale-[1.02] font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                {product.cta}
              </button> */}
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Enter Your Details
              </h3>
              <p className="text-gray-600">We'll use this information to deliver your product and keep you updated.</p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={userData.phone_number}
                    onChange={(e) => setUserData({ ...userData, phone_number: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your mobile number"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCheckoutForm(false)}
                  disabled={isProcessing}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing || !userData.name || !userData.email}
                  className="flex-1 bg-gradient-to-r from-[#1d99c6] to-[#176781] text-white px-8 py-3 rounded-lg hover:from-[#1d99c6] hover:to-[#176781] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Proceed to Payment - ${getCurrentPrice()}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 py-12">
      <div className="container mx-auto px-4">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <X className="w-5 h-5 mr-2" /> Back to Products
        </button>
        
        <div className="bg-white rounded-3xl w-full shadow-2xl overflow-hidden">
          <div className="bg-white border-b border-gray-100 p-6 flex items-center justify-between rounded-t-3xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-[#1d99c6] to-[#195266] rounded-xl text-white shadow-md">
                <IconComponent className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-800">
                <Target className="w-5 h-5" />
                Overview
              </h3>
              <p className="text-gray-700 leading-relaxed">{product.overview}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-amber-600">
                  <Award className="w-5 h-5" />
                  Key Features
                </h3>
                <ul className="space-y-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-600">
                  <Shield className="w-5 h-5" />
                  Benefits
                </h3>
                <ul className="space-y-3">
                  {product.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-800">
                <Users className="w-5 h-5" />
                Who Is This For?
              </h3>
              <p className="text-gray-700 leading-relaxed">{product.whoFor}</p>
            </div>

            {renderPricing()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;