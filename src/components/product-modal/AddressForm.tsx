import React from 'react';

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

interface AddressFormProps {
  addressFormData: AddressFormData;
  setAddressFormData: React.Dispatch<React.SetStateAction<AddressFormData>>;
  editingAddress: Address | null;
  addressLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
  addressFormData,
  setAddressFormData,
  editingAddress,
  addressLoading,
  onSubmit,
  onCancel
}) => {
  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h4 className="text-lg font-semibold mb-4">
        {editingAddress ? 'Edit Address' : 'Add New Address'}
      </h4>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Name (Optional)
            </label>
            <input
              type="text"
              value={addressFormData.name}
              onChange={(e) => setAddressFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Home, Work, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={addressFormData.phone_number}
              onChange={(e) => setAddressFormData(prev => ({ ...prev, phone_number: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address Line 1 *
          </label>
          <input
            type="text"
            required
            value={addressFormData.address_line1}
            onChange={(e) => setAddressFormData(prev => ({ ...prev, address_line1: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Street address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            value={addressFormData.address_line2}
            onChange={(e) => setAddressFormData(prev => ({ ...prev, address_line2: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Apartment, suite, etc."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              required
              value={addressFormData.city}
              onChange={(e) => setAddressFormData(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State/Province
            </label>
            <input
              type="text"
              value={addressFormData.state}
              onChange={(e) => setAddressFormData(prev => ({ ...prev, state: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code *
            </label>
            <input
              type="text"
              required
              value={addressFormData.postal_code}
              onChange={(e) => setAddressFormData(prev => ({ ...prev, postal_code: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country *
          </label>
          <input
            type="text"
            required
            value={addressFormData.country}
            onChange={(e) => setAddressFormData(prev => ({ ...prev, country: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_default"
            checked={addressFormData.is_default}
            onChange={(e) => setAddressFormData(prev => ({ ...prev, is_default: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700">
            Set as default address
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={addressLoading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={addressLoading}
            className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {addressLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              editingAddress ? 'Update Address' : 'Save Address'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;