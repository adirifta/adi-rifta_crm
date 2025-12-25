'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productAPI } from '@/lib/api';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  Package,
  DollarSign,
  Percent,
  TrendingUp,
  Calendar,
  Edit,
  BarChart3,
  Tag,
  Users,
  UserCheck,
  Plus,
  CheckCircle // TAMBAHKAN INI
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { getUserRole } from '@/lib/auth';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [usageStats, setUsageStats] = useState({
    totalProjects: 0,
    activeCustomers: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    fetchProductDetails();
    setUserRole(getUserRole());
  }, [params.id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getById(params.id);
      setProduct(response.data);
      
      // Simulate usage stats (in real app, this would come from API)
      setUsageStats({
        totalProjects: Math.floor(Math.random() * 50) + 10,
        activeCustomers: Math.floor(Math.random() * 30) + 5,
        monthlyRevenue: (response.data.price || 0) * (Math.floor(Math.random() * 20) + 5),
      });
    } catch (error) {
      toast.error('Failed to fetch product details');
      console.error(error);
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <p className="text-gray-600 mt-2">The product you're looking for doesn't exist.</p>
        <Link href="/products" className="btn-primary mt-4 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <Link href="/products" className="mr-4 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm text-gray-500">
                Product ID: PROD-{product.id.toString().padStart(4, '0')}
              </span>
              <span className="text-sm text-gray-500">
                Created: {format(new Date(product.created_at), 'dd MMM yyyy')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          {userRole === 'manager' && (
            <Link
              href={`/products/${params.id}/edit`}
              className="btn-primary flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Product Information */}
          <div className="card">
            <div className="flex items-start">
              <div className="p-4 rounded-xl bg-primary-100 mr-6">
                <Package className="h-8 w-8 text-primary-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Product Details</h2>
                <p className="text-gray-600 mb-4">{product.description || 'No description available'}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">HPP (Cost)</p>
                        <p className="font-medium">
                          Rp {parseFloat(product.hpp || 0).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Percent className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Margin</p>
                        <p className="font-medium">{product.margin}%</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Tag className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Product ID</p>
                        <p className="font-medium">PROD-{product.id.toString().padStart(4, '0')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Created Date</p>
                        <p className="font-medium">
                          {format(new Date(product.created_at), 'dd MMM yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Profit per Unit</p>
                        <p className="font-medium text-green-600">
                          Rp {(product.hpp * (product.margin / 100)).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing Breakdown</h2>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-gray-600">HPP (Cost)</span>
                  </div>
                  <span className="font-medium">
                    Rp {parseFloat(product.hpp || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-gray-600">Profit ({product.margin}%)</span>
                  </div>
                  <span className="font-medium text-green-600">
                    Rp {(product.hpp * (product.margin / 100)).toLocaleString('id-ID')}
                  </span>
                </div>
                
                <div className="h-px bg-gray-300 my-3"></div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-4 w-4 rounded-full bg-primary-600 mr-2"></div>
                    <span className="font-semibold text-gray-900">Selling Price</span>
                  </div>
                  <span className="text-xl font-bold text-primary-600">
                    Rp {parseFloat(product.price || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">Pricing Formula</h3>
                <p className="text-sm text-blue-800">
                  Selling Price = HPP + (HPP × Margin%)
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  {product.hpp} + ({product.hpp} × {product.margin}%) = {product.price}
                </p>
              </div>
            </div>
          </div>
          
          {/* Notes for Sales */}
          <div className="card bg-yellow-50 border border-yellow-200">
            <h3 className="font-semibold text-yellow-900 mb-2">Sales Information</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• This is the regular price for this product</li>
              <li>• Sales can negotiate prices below this amount</li>
              <li>• Discounted prices require manager approval</li>
              <li>• Minimum acceptable price: Rp {(product.hpp * 1.1).toLocaleString('id-ID')} (10% above cost)</li>
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Card */}
          <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white mb-4">
                <DollarSign className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-sm font-medium text-primary-900">Selling Price</h3>
              <p className="text-3xl font-bold text-primary-900 mt-2">
                Rp {parseFloat(product.price || 0).toLocaleString('id-ID')}
              </p>
              <p className="text-sm text-primary-700 mt-1">per month</p>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="card">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-5 w-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Usage Statistics</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{usageStats.totalProjects}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              
              <div className="h-px bg-gray-200"></div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{usageStats.activeCustomers}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
              
              <div className="h-px bg-gray-200"></div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    Rp {usageStats.monthlyRevenue.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href={`/projects/new?product_id=${product.id}`}
                className="w-full btn-primary flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Use in Project
              </Link>
              <button className="w-full btn-secondary flex items-center justify-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Reports
              </button>
              {userRole === 'manager' && (
                <Link
                  href={`/products/${params.id}/edit`}
                  className="w-full btn-secondary flex items-center justify-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </Link>
              )}
            </div>
          </div>

          {/* Product Specifications */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Profit Margin</span>
                <span className="font-medium">{product.margin}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Profit per Unit</span>
                <span className="font-medium text-green-600">
                  Rp {(product.hpp * (product.margin / 100)).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Break-even Price</span>
                <span className="font-medium">
                  Rp {parseFloat(product.hpp || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}