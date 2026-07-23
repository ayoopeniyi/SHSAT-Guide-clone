import React from 'react';
import { Check, Target, Award, Shield, Users } from 'lucide-react';
import { Product } from 'src/types/types';

interface ProductContentProps {
  product: Product;
}

const ProductContent: React.FC<ProductContentProps> = ({ product }) => {
  return (
    <div className="space-y-8">
      {/* Overview Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-800">
          <Target className="w-5 h-5" />
          Overview
        </h3>
        <p className="text-gray-700 leading-relaxed">{product.overview}</p>
      </div>

      {/* Features and Benefits Grid */}
      <div className="grid gap-8">
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

      {/* Who Is This For Section */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-800">
          <Users className="w-5 h-5" />
          Who Is This For?
        </h3>
        <p className="text-gray-700 leading-relaxed">{product.whoFor}</p>
      </div>
    </div>
  );
};

export default ProductContent;