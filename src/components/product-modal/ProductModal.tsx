import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, isSinglePricing } from '../../types/types';
import { createCheckoutSession } from '../../lib/api'
import { ProductsApiService } from '../../services/productApi';
import ProductHeader from '../product-modal/ProductHeader';
import ProductContent from '../product-modal/ProductContent';
import CheckoutPanel from '../product-modal/CheckoutPanel';
import { X, AlertTriangle } from 'lucide-react';

// Address types
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

// Delete Confirmation Dialog Component
const DeleteConfirmationDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}> = ({ isOpen, onClose, onConfirm, isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Delete Address</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">
            Are you sure you want to delete this address? This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Address API functions
const API_URL = import.meta.env.VITE_API_URL || "https://eznnseebbi.execute-api.ap-southeast-2.amazonaws.com/dev";

const addressAPI = {
  async getUserAddresses(email: string): Promise<Address[]> {
    const response = await fetch(`${API_URL}/addresses/${email}`);
    if (!response.ok) throw new Error('Failed to fetch addresses');
    return response.json();
  },

  async createAddress(email: string, addressData: AddressFormData): Promise<Address> {
    const response = await fetch(`${API_URL}/addresses/${email}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addressData)
    });
    if (!response.ok) throw new Error('Failed to create address');
    return response.json();
  },

  async updateAddress(email: string, addressId: string, addressData: Partial<AddressFormData>): Promise<Address> {
    const response = await fetch(`${API_URL}/addresses/${email}/${addressId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addressData)
    });
    if (!response.ok) throw new Error('Failed to update address');
    return response.json();
  },

  async deleteAddress(email: string, addressId: string): Promise<void> {
    const response = await fetch(`${API_URL}/addresses/${email}/${addressId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete address');
  },

  async setDefaultAddress(email: string, addressId: string): Promise<Address> {
    const response = await fetch(`${API_URL}/addresses/${email}/${addressId}/set-default`, {
      method: 'PATCH'
    });
    if (!response.ok) throw new Error('Failed to set default address');
    return response.json();
  }
};

const ProductModal: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  /* console.log("id", id) */
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

  // Address state
  const [showAddressManagement, setShowAddressManagement] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressFormData, setAddressFormData] = useState<AddressFormData>({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone_number: '',
    name: '',
    is_default: false
  });
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string>('');

  /* console.log("product", id) */

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          setLoading(true);
          setError('');
          const apiProduct = await ProductsApiService.getProductById(id);
          const convertedProduct = ProductsApiService.convertToProduct(apiProduct);
          setProduct(convertedProduct);

          if (!isSinglePricing(convertedProduct.pricing)) {
            setSelectedBundle(Object.keys(convertedProduct.pricing)[0]);
          }
        } catch (err) {
          console.error('Error fetching product:', err);
          setError('Failed to load product details');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProduct();
  }, [id]);

  // Load addresses when user email is entered
  const loadUserAddresses = async (email: string) => {
    if (!email) return;

    try {
      setAddressLoading(true);
      setAddressError('');
      const userAddresses = await addressAPI.getUserAddresses(email);
      setAddresses(userAddresses);

      // Set default address as selected
      const defaultAddress = userAddresses.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.address_id);
      } else if (userAddresses.length > 0) {
        setSelectedAddressId(userAddresses[0].address_id);
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
      setAddressError('Failed to load addresses');
    } finally {
      setAddressLoading(false);
    }
  };

  // Handle user data changes
  const handleUserDataChange = (field: string, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  // Address form handlers
  const handleAddressFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData.email) return;

    try {
      setAddressLoading(true);
      setAddressError('');

      if (editingAddress) {
        // Update existing address
        const updatedAddress = await addressAPI.updateAddress(
          userData.email,
          editingAddress.address_id,
          addressFormData
        );
        setAddresses(prev => prev.map(addr =>
          addr.address_id === editingAddress.address_id ? updatedAddress : addr
        ));
      } else {
        // Create new address
        const newAddress = await addressAPI.createAddress(userData.email, addressFormData);
        setAddresses(prev => [...prev, newAddress]);
        if (newAddress.is_default || addresses.length === 0) {
          setSelectedAddressId(newAddress.address_id);
        }
      }

      setShowAddressForm(false);
      setEditingAddress(null);
      resetAddressForm();
    } catch (err) {
      console.error('Error saving address:', err);
      setAddressError('Failed to save address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteClick = (addressId: string) => {
    setAddressToDelete(addressId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteAddress = async () => {
    if (!userData.email || !addressToDelete) return;

    try {
      setAddressLoading(true);
      await addressAPI.deleteAddress(userData.email, addressToDelete);
      setAddresses(prev => prev.filter(addr => addr.address_id !== addressToDelete));

      if (selectedAddressId === addressToDelete) {
        const remainingAddresses = addresses.filter(addr => addr.address_id !== addressToDelete);
        setSelectedAddressId(remainingAddresses.length > 0 ? remainingAddresses[0].address_id : '');
      }

      setDeleteDialogOpen(false);
      setAddressToDelete('');
    } catch (err) {
      console.error('Error deleting address:', err);
      setAddressError('Failed to delete address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!userData.email) return;

    try {
      setAddressLoading(true);
      const updatedAddress = await addressAPI.setDefaultAddress(userData.email, addressId);

      // Update addresses list
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        is_default: addr.address_id === addressId
      })));

      setSelectedAddressId(addressId);
    } catch (err) {
      console.error('Error setting default address:', err);
      setAddressError('Failed to set default address');
    } finally {
      setAddressLoading(false);
    }
  };

  const resetAddressForm = () => {
    setAddressFormData({
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      phone_number: '',
      name: '',
      is_default: false
    });
  };

  const startEditingAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressFormData({
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state || '',
      postal_code: address.postal_code,
      country: address.country,
      phone_number: address.phone_number,
      name: address.name || '',
      is_default: address.is_default
    });
    setShowAddressForm(true);
  };

  const handleFreeProductSuccess = (transactionId: string, userId: string) => {
    localStorage.setItem('freeTransaction', JSON.stringify({
      transactionId,
      userId,
      productName: product!.name,
      timestamp: new Date().toISOString()
    }));

    navigate(`/checkout-success?transaction_id=${transactionId}&free=true`);
  };

  const handleBuyNow = () => {
    setShowCheckoutForm(true);
    setError('');
  };

  const proceedToAddressStep = async () => {
    if (!userData.name || !userData.email) {
      setError('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setShowAddressManagement(true);

    try {
      if (userData.email) {
        await loadUserAddresses(userData.email);
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
      setAddressError('Failed to load addresses');
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      // If they have addresses but didn't select one, or if they have no addresses
      if (addresses.length === 0) {
        setError('Please add a delivery address to continue.');
      } else {
        setError('Please select a delivery address');
      }
      return;
    }

    setIsProcessing(true);
    setError('');

    let unitAmount = 0;
    let productName = product!.name;
    let productDescription = product!.overview;

    if (isSinglePricing(product!.pricing)) {
      unitAmount = Math.round(parseFloat(product!.pricing.discount_price) * 100);
    } else if (selectedBundle && product!.pricing[selectedBundle]) {
      unitAmount = Math.round(parseFloat(product!.pricing[selectedBundle].discount_price) * 100);
      productName = `${product!.name} - ${selectedBundle}`;
    }

    try {
      const checkoutData = {
        user_data: {
          name: userData.name,
          email: userData.email,
          phone_number: userData.phone_number || ''
        },
        product_id: id!, // ✅ This was missing - add it here
        product_name: productName,
        product_description: productDescription,
        unit_amount: unitAmount,
        currency: 'usd',
        address_id: selectedAddressId || undefined
      };

      /* console.log("checkoutData", checkoutData); */

      const response = await createCheckoutSession(checkoutData);

      if (response.status === 'success') {
        if (response.is_free_product) {
          handleFreeProductSuccess(response.transaction_id!, response.user_id!);
          if (response.redirect_url) {
            window.location.href = response.redirect_url;
          }
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
    if (isSinglePricing(product!.pricing)) {
      return product!.pricing.discount_price;
    } else if (selectedBundle && product!.pricing[selectedBundle]) {
      return product!.pricing[selectedBundle].discount_price;
    }
    return '0';
  };

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

  if (error && !product) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <ProductHeader
            product={product}
            onBack={() => navigate(-1)}
          />

          <div className="grid lg:grid-cols-2 gap-8 p-8">
            {/* Left Column - Product Content */}
            <div>
              <ProductContent product={product} />
            </div>

            {/* Right Column - Checkout Panel */}
            <div>
              <CheckoutPanel
                product={product}
                selectedBundle={selectedBundle}
                setSelectedBundle={setSelectedBundle}
                showCheckoutForm={showCheckoutForm}
                setShowCheckoutForm={setShowCheckoutForm}
                userData={userData}
                handleUserDataChange={handleUserDataChange}
                isProcessing={isProcessing}
                error={error}
                showAddressManagement={showAddressManagement}
                setShowAddressManagement={setShowAddressManagement}
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
                onAddressFormSubmit={handleAddressFormSubmit}
                onDeleteAddress={handleDeleteClick}
                onSetDefaultAddress={handleSetDefaultAddress}
                onBuyNow={handleBuyNow}
                proceedToAddressStep={proceedToAddressStep}
                handleCheckout={handleCheckout}
                resetAddressForm={resetAddressForm}
                startEditingAddress={startEditingAddress}
                getCurrentPrice={getCurrentPrice}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteAddress}
        isLoading={addressLoading}
      />
    </div>
  );
};

export default ProductModal;