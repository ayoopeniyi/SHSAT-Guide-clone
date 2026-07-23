import React from 'react';
import { CreditCard, Download, Sparkles, Bookmark, Package, User, MapPin } from 'lucide-react';
import { Product, isSinglePricing } from '../../types/types';
import AddressManagement from './AddressManagement';

interface Address {
  address_id: string;
  user_id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone_number: string;
  is_default: boolean;
  name?: string;
  created_at: string;
  updated_at: string;
}

interface AddressFormData {
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone_number: string;
  name?: string;
  is_default: boolean;
}

interface CheckoutPanelProps {
  product: Product;
  selectedBundle: string | null;
  setSelectedBundle: (bundle: string | null) => void;
  showCheckoutForm: boolean;
  setShowCheckoutForm: (show: boolean) => void;
  userData: {
    name: string;
    email: string;
    phone_number: string;
  };
  handleUserDataChange: (field: string, value: string) => void;
  isProcessing: boolean;
  error: string;
  showAddressManagement: boolean;
  setShowAddressManagement: (show: boolean) => void;
  addresses: Address[];
  selectedAddressId: string;
  setSelectedAddressId: (id: string) => void;
  showAddressForm: boolean;
  setShowAddressForm: (show: boolean) => void;
  editingAddress: Address | null;
  setEditingAddress: (address: Address | null) => void;
  addressFormData: AddressFormData;
  setAddressFormData: React.Dispatch<React.SetStateAction<AddressFormData>>;
  addressLoading: boolean;
  addressError: string;
  onAddressFormSubmit: (e: React.FormEvent) => void;
  onDeleteAddress: (addressId: string) => void;
  onSetDefaultAddress: (addressId: string) => void;
  onBuyNow: () => void;
  proceedToAddressStep: () => void;
  handleCheckout: () => void;
  resetAddressForm: () => void;
  startEditingAddress: (address: Address) => void;
  getCurrentPrice: () => string;
}

const CheckoutPanel: React.FC<CheckoutPanelProps> = ({
  product,
  selectedBundle,
  setSelectedBundle,
  showCheckoutForm,
  setShowCheckoutForm,
  userData,
  handleUserDataChange,
  isProcessing,
  error,
  showAddressManagement,
  setShowAddressManagement,
  addresses,
  selectedAddressId,
  setSelectedAddressId,
  showAddressForm,
  setShowAddressForm,
  editingAddress,
  setEditingAddress,
  addressFormData,
  setAddressFormData,
  addressLoading,
  addressError,
  onAddressFormSubmit,
  onDeleteAddress,
  onSetDefaultAddress,
  onBuyNow,
  proceedToAddressStep,
  handleCheckout,
  resetAddressForm,
  startEditingAddress,
  getCurrentPrice
}) => {
  const isFreeProduct = isSinglePricing(product.pricing) ?
    parseFloat(product.pricing.discount_price) === 0 :
    false;

  const renderPricing = () => {
    if (isSinglePricing(product.pricing)) {
      const isFree = parseFloat(product.pricing.discount_price) === 0;
      const hasDiscount = parseFloat(product.pricing.price) > parseFloat(product.pricing.discount_price);

      return (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {product.name}
          </h3>
          
          <div className="space-y-2 mb-4">
            {!isFree ? (
              <div className="flex items-center gap-3">
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
              <p className="text-sm text-gray-600 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-blue-500" />
                {product.pricing.note}
              </p>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-4">Digital delivery</p>
          <p className="text-sm text-gray-600 mb-6">$0.00</p>
          
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total</span>
              <span>${product.pricing.discount_price}</span>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#1d99c6]" />
            Bundle Options:
          </h4>

          <div className="space-y-3 mb-6">
            {Object.entries(product.pricing).map(([bundleName, pricing]) => {
              const bundlePricing = pricing as { price: string; discount_price: string; note?: string };
              const hasDiscount = parseFloat(bundlePricing.price) > parseFloat(bundlePricing.discount_price);
              const isSelected = selectedBundle === bundleName;
              const isFree = parseFloat(bundlePricing.discount_price) === 0;

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
                          ${bundlePricing.price}
                        </span>
                      )}
                      <span className={`text-xl font-bold ${isFree ? 'text-green-600' : 'text-gray-900'}`}>
                        {isFree ? 'FREE' : `$${bundlePricing.discount_price}`}
                      </span>
                      {hasDiscount && !isFree && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                          SAVE ${(parseFloat(bundlePricing.price) - parseFloat(bundlePricing.discount_price)).toFixed(2)}
                        </span>
                      )}
                    </div>
                    {bundlePricing.note && (
                      <p className="text-xs text-gray-500 mt-1">{bundlePricing.note}</p>
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
          
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total</span>
              <span>${getCurrentPrice()}</span>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Purchase</h2>
      
      {!showCheckoutForm ? (
        <>
          {renderPricing()}
          <button
            onClick={onBuyNow}
            className="w-full bg-gradient-to-r from-[#1d99c6] to-[#176781] text-white px-8 py-3.5 rounded-xl hover:from-[#1d99c6] hover:to-[#176781] transition-all duration-300 transform hover:scale-[1.02] font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isFreeProduct ? <Download className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
            {product.cta}
          </button>
        </>
      ) : showAddressManagement ? (
        <AddressManagement
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          setSelectedAddressId={setSelectedAddressId}
          showAddressForm={showAddressForm}
          setShowAddressForm={setShowAddressForm}
          editingAddress={editingAddress}
          setEditingAddress={setEditingAddress}
          addressFormData={addressFormData}
          setAddressFormData={setAddressFormData}
          addressLoading={addressLoading}
          addressError={addressError}
          onAddressFormSubmit={onAddressFormSubmit}
          onDeleteAddress={onDeleteAddress}
          onSetDefaultAddress={onSetDefaultAddress}
          onBack={() => setShowAddressManagement(false)}
          onProceedToPayment={handleCheckout}
          isProcessing={isProcessing}
          resetAddressForm={resetAddressForm}
          startEditingAddress={startEditingAddress}
          isFreeProduct={isFreeProduct}
          getCurrentPrice={getCurrentPrice}
        />
      ) : (
        <div className="space-y-4">
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
                onChange={(e) => handleUserDataChange('name', e.target.value)}
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
                onChange={(e) => handleUserDataChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your Email"
                disabled={isProcessing}
              />
              <p className="text-xs text-gray-500 mt-1">Your workbook will be delivered to this email address</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={userData.phone_number}
                onChange={(e) => handleUserDataChange('phone_number', e.target.value)}
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
              onClick={proceedToAddressStep}
              disabled={isProcessing || !userData.name || !userData.email}
              className="flex-1 bg-gradient-to-r from-[#1d99c6] to-[#176781] text-white px-8 py-3 rounded-lg hover:from-[#1d99c6] hover:to-[#176781] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <span>Continue</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPanel;