import React from 'react';
import { MapPin, Plus, Edit2, Trash2, Home } from 'lucide-react';
import AddressForm from "../product-modal/AddressForm"

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

interface AddressManagementProps {
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
  onBack: () => void;
  onProceedToPayment: () => void;
  isProcessing: boolean;
  resetAddressForm: () => void;
  startEditingAddress: (address: Address) => void;
  isFreeProduct: boolean;
  getCurrentPrice: () => string;
}

const AddressManagement: React.FC<AddressManagementProps> = ({
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
  onBack,
  onProceedToPayment,
  isProcessing,
  resetAddressForm,
  startEditingAddress,
  isFreeProduct,
  getCurrentPrice
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Delivery Address
        </h3>
        <button
          onClick={() => {
            resetAddressForm();
            setEditingAddress(null);
            setShowAddressForm(true);
          }}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add New Address
        </button>
      </div>

      {addressError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {addressError}
        </div>
      )}

      {addressLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading addresses...</p>
        </div>
      )}

      {!addressLoading && addresses.length === 0 && !showAddressForm && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No addresses found</p>
          <button
            onClick={() => {
              resetAddressForm();
              setShowAddressForm(true);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Your First Address
          </button>
        </div>
      )}

      {!addressLoading && addresses.length > 0 && !showAddressForm && (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.address_id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedAddressId === address.address_id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedAddressId(address.address_id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {address.name && (
                      <span className="font-medium text-gray-900">{address.name}</span>
                    )}
                    {address.is_default && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Home className="w-3 h-3" />
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">
                    {address.address_line1}
                    {address.address_line2 && `, ${address.address_line2}`}
                  </p>
                  <p className="text-gray-700">
                    {address.city}
                    {address.state && `, ${address.state}`} {address.postal_code}
                  </p>
                  <p className="text-gray-700">{address.country}</p>
                  <p className="text-gray-600 text-sm">{address.phone_number}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {selectedAddressId === address.address_id && (
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingAddress(address);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAddress(address.address_id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {selectedAddressId === address.address_id && !address.is_default && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetDefaultAddress(address.address_id);
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Set as default
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddressForm && (
        <AddressForm
          addressFormData={addressFormData}
          setAddressFormData={setAddressFormData}
          editingAddress={editingAddress}
          addressLoading={addressLoading}
          onSubmit={onAddressFormSubmit}
          onCancel={() => {
            setShowAddressForm(false);
            setEditingAddress(null);
            resetAddressForm();
          }}
        />
      )}

      {!showAddressForm && (
        <div className="flex gap-3 pt-4">
          <button
            onClick={onBack}
            disabled={isProcessing}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={onProceedToPayment}
            disabled={isProcessing || (addresses.length > 0 && !selectedAddressId)}
            className="flex-1 bg-gradient-to-r from-[#1d99c6] to-[#176781] text-white px-8 py-3 rounded-lg hover:from-[#1d99c6] hover:to-[#176781] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              `Complete Purchase - $${getCurrentPrice()}`
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressManagement;