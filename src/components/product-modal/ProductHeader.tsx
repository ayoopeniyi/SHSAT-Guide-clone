import React from 'react';
import { X } from 'lucide-react';
import { Product, getProductIcon } from '../../types/types';

interface ProductHeaderProps {
  product: Product;
  onBack: () => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ product, onBack }) => {
  const IconComponent = getProductIcon(product.name);

  return (
    <div className="bg-white border-b border-gray-100 p-6">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
      >
        <X className="w-5 h-5 mr-2" /> Back to Products
      </button>
      
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-r from-[#1d99c6] to-[#195266] rounded-xl text-white shadow-md">
          <IconComponent className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
      </div>
    </div>
  );
};

export default ProductHeader;