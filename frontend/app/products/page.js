'use client';

import { useState, useEffect } from 'react';
import { productAPI } from '@/lib/api';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  DollarSign,
  TrendingUp,
  Percent
} from 'lucide-react';
import Link from 'next/link';
import { getUserRole } from '@/lib/auth';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    fetchProducts();
    setUserRole(getUserRole());
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll();
      setProducts(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productAPI.delete(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Internet Packages</h1>
          <p className="text-gray-600">Manage your internet service products</p>
        </div>
        {userRole === 'manager' && (
          <Link
            href="/products/new"
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Product</span>
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or description..."
            className="pl-10 input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-lg bg-primary-100">
                      <Package className="h-6 w-6 text-primary-600" />
                    </div>
                    {userRole === 'manager' && (
                      <div className="flex space-x-2">
                        <Link
                          href={`/products/${product.id}/edit`}
                          className="p-1 text-yellow-600 hover:text-yellow-800"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{product.name}</h3>
                  <p className="mt-2 text-gray-600 text-sm">{product.description}</p>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>HPP</span>
                      </div>
                      <span className="font-medium">
                        Rp {parseFloat(product.hpp).toLocaleString('id-ID')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Percent className="h-4 w-4 mr-1" />
                        <span>Margin</span>
                      </div>
                      <span className="font-medium">{product.margin}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200">
                      <div className="flex items-center text-gray-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span className="font-medium">Selling Price</span>
                      </div>
                      <span className="text-lg font-bold text-primary-600">
                        Rp {parseFloat(product.price).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
              <p className="mt-2 text-gray-500">
                {search ? 'Try adjusting your search terms' : 'Get started by creating your first product'}
              </p>
              {userRole === 'manager' && (
                <Link
                  href="/products/new"
                  className="btn-primary mt-4 inline-flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Link>
              )}
            </div>
          )}
        </>
      )}

      {/* Pricing Explanation */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Pricing Formula</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Selling Price = HPP + (HPP × Margin %)</strong></p>
          <p>Example: HPP Rp 300,000 + 30% margin = Rp 390,000 selling price</p>
          <p className="mt-2 text-xs text-gray-500">
            Note: Sales can negotiate prices below selling price, but requires manager approval.
          </p>
        </div>
      </div>
    </div>
  );
}