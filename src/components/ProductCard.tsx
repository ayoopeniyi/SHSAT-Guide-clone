import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Product, getProductIcon, isSinglePricing } from '../types/types';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const IconComponent = getProductIcon(product.name);
  const navigate = useNavigate();
  
  const getPrice = () => {
    if (isSinglePricing(product.pricing)) {
      return product.pricing;
    }
    const firstKey = Object.keys(product.pricing)[0];
    return product.pricing[firstKey];
  };

  const pricing = getPrice();
  const isFree = parseFloat(pricing.price) === 0;
  const hasDiscount = parseFloat(pricing.price) > parseFloat(pricing.discount_price);
  const price = parseFloat(pricing.discount_price);


  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer overflow-hidden border border-gray-100"
      onClick={handleCardClick}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full bg-blue-100/30 group-hover:bg-blue-200/40 transition-colors duration-500"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 -ml-12 -mb-12 rounded-full bg-purple-100/30 group-hover:bg-purple-200/40 transition-colors duration-500"></div>
      
      <div className="relative p-8 z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="p-3 bg-gradient-to-r from-[#1d99c6] to-[#176781] rounded-xl text-white group-hover:scale-110 transition-transform duration-300 shadow-md">
            <IconComponent className="w-8 h-8" />
          </div>
          {isFree && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
              FREE
            </div>
          )}
          {hasDiscount && !isFree && (
            <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
              SAVE {((parseFloat(pricing.price) - parseFloat(pricing.discount_price)) / parseFloat(pricing.price) * 100).toFixed(0)}%
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
          {product.name}
        </h3>
        
        <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
          {product.overview.slice(0, 150)}...
        </p>

        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col">
            {!isFree && (
              <div className="flex items-center gap-2">
                {hasDiscount && (
                  <span className="text-gray-400 line-through text-sm">
                    ${pricing.price}
                  </span>
                )}
                <span className="text-2xl font-bold text-gray-900">
                  ${pricing.discount_price}
                </span>
              </div>
            )}
            {isFree && (
              <span className="text-2xl font-bold text-green-600">FREE</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/product/${product.id}`);
              }}
              className="flex items-center text-blue-600 group-hover:translate-x-1 transition-transform duration-300 font-medium hover:text-blue-700"
            >
              <span className="text-sm">Learn More</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;