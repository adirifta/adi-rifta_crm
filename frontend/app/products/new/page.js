'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { productAPI } from '@/lib/api';
import { toast } from 'react-toastify';
import { ArrowLeft, Save, Package, Calculator } from 'lucide-react';
import Link from 'next/link';

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hpp: '',
    margin: '',
  });
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  const calculatePrice = (hpp, margin) => {
    const hppValue = parseFloat(hpp) || 0;
    const marginValue = parseFloat(margin) || 0;
    const price = hppValue * (1 + marginValue / 100);
    setCalculatedPrice(price);
    return price;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await productAPI.create(formData);
      toast.success('Product created successfully!');
      router.push('/products');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(newFormData);
    
    if (name === 'hpp' || name === 'margin') {
      calculatePrice(
        name === 'hpp' ? value : newFormData.hpp,
        name === 'margin' ? value : newFormData.margin
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/products" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>
      </div>

      <div className="card">
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-lg bg-primary-100 mr-4">
            <Package className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Product</h1>
            <p className="text-gray-600">Add a new internet service package</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="input-field"
                placeholder="e.g., Paket Internet 50Mbps"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="input-field"
                placeholder="Describe the internet service package..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="hpp" className="block text-sm font-medium text-gray-700 mb-1">
                HPP (Harga Pokok Penjualan) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  Rp
                </span>
                <input
                  type="number"
                  id="hpp"
                  name="hpp"
                  required
                  min="0"
                  step="1000"
                  className="pl-12 input-field"
                  placeholder="300000"
                  value={formData.hpp}
                  onChange={handleChange}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">Cost of providing the service</p>
            </div>

            <div>
              <label htmlFor="margin" className="block text-sm font-medium text-gray-700 mb-1">
                Margin Percentage *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="margin"
                  name="margin"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  className="pr-10 input-field"
                  placeholder="30"
                  value={formData.margin}
                  onChange={handleChange}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  %
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">Profit percentage</p>
            </div>

            {/* Price Calculation */}
            <div className="md:col-span-2">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <Calculator className="h-5 w-5 text-gray-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">Price Calculation</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">HPP:</span>
                    <span className="font-medium">
                      Rp {parseFloat(formData.hpp || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Margin:</span>
                    <span className="font-medium">{formData.margin || 0}%</span>
                  </div>
                  
                  <div className="h-px bg-gray-200 my-2"></div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Selling Price:</span>
                    <span className="text-xl font-bold text-primary-600">
                      Rp {calculatedPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Formula: HPP + (HPP × Margin%) = Selling Price
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Link
              href="/products"
              className="btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Help Information */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Tips for creating products:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• HPP (Harga Pokok Penjualan) is the cost of providing the service</li>
          <li>• Margin is the profit percentage added to HPP</li>
          <li>• Selling price is calculated automatically: HPP + (HPP × Margin%)</li>
          <li>• Sales can negotiate prices below selling price (requires approval)</li>
          <li>• Use descriptive names for easy identification</li>
        </ul>
      </div>
    </div>
  );
}