'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { customerAPI, productAPI } from '@/lib/api';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  UserCheck, 
  Phone, 
  MapPin, 
  Calendar,
  Wifi,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({
    product_id: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
  });

  useEffect(() => {
    fetchCustomerDetails();
    fetchProducts();
  }, [params.id]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getById(params.id);
      setCustomer(response.data);
      setServices(response.data.services || []);
    } catch (error) {
      toast.error('Failed to fetch customer details');
      console.error(error);
      router.push('/customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    
    if (!newService.product_id) {
      toast.error('Please select a product');
      return;
    }

    try {
      await customerAPI.addService(params.id, newService);
      toast.success('Service added successfully');
      fetchCustomerDetails();
      setShowAddService(false);
      setNewService({
        product_id: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add service');
    }
  };

  const getServiceStatus = (endDate) => {
    if (!endDate) return { label: 'Active', color: 'badge-success', icon: CheckCircle };
    
    const end = new Date(endDate);
    const today = new Date();
    
    if (end > today) {
      const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) {
        return { 
          label: `Expires in ${diffDays} days`, 
          color: 'badge-warning', 
          icon: Clock 
        };
      }
      return { label: 'Active', color: 'badge-success', icon: CheckCircle };
    }
    
    return { label: 'Expired', color: 'badge-danger', icon: XCircle };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Customer not found</h2>
        <p className="text-gray-600 mt-2">The customer you're looking for doesn't exist.</p>
        <Link href="/customers" className="btn-primary mt-4 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <Link href="/customers" className="mr-4 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.customer_name}</h1>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm text-gray-500">
                Customer ID: CUST-{customer.id.toString().padStart(4, '0')}
              </span>
              <span className="text-sm text-gray-500">
                Since: {format(new Date(customer.subscription_date), 'dd MMM yyyy')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddService(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </button>
        </div>
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <UserCheck className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{customer.customer_name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{customer.customer_contact}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Subscription Date</p>
                    <p className="font-medium">
                      {format(new Date(customer.subscription_date), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{customer.customer_address}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <UserCheck className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Sales Person</p>
                    <p className="font-medium">{customer.sales_name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services List */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Active Services</h2>
              <span className="badge badge-primary">
                {services.length} service{services.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {services.length > 0 ? (
              <div className="space-y-4">
                {services.map((service) => {
                  const status = getServiceStatus(service.end_date);
                  const Icon = status.icon;
                  
                  return (
                    <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-primary-100 mr-3">
                            <Wifi className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{service.product_name}</h3>
                            <p className="text-sm text-gray-500">
                              Rp {parseFloat(service.regular_price).toLocaleString('id-ID')}/month
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`badge ${status.color} flex items-center`}>
                            <Icon className="h-3 w-3 mr-1" />
                            {status.label}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="text-gray-500">Start Date</p>
                            <p className="font-medium">
                              {format(new Date(service.start_date), 'dd MMM yyyy')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="text-gray-500">End Date</p>
                            <p className="font-medium">
                              {service.end_date 
                                ? format(new Date(service.end_date), 'dd MMM yyyy')
                                : 'No expiry'
                              }
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="text-gray-500">Status</p>
                            <p className="font-medium capitalize">{service.status || 'active'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wifi className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No services yet</h3>
                <p className="mt-2 text-gray-500">Add internet services for this customer</p>
                <button
                  onClick={() => setShowAddService(true)}
                  className="btn-primary mt-4 inline-flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Service
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Services</span>
                <span className="font-medium">{services.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Services</span>
                <span className="font-medium">
                  {services.filter(s => s.status === 'active').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Monthly Revenue</span>
                <span className="font-medium text-green-600">
                  Rp {services
                    .filter(s => s.status === 'active')
                    .reduce((sum, service) => sum + parseFloat(service.regular_price || 0), 0)
                    .toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full btn-secondary flex items-center justify-center">
                <Phone className="h-4 w-4 mr-2" />
                Contact Customer
              </button>
              <button className="w-full btn-secondary flex items-center justify-center">
                <Edit className="h-4 w-4 mr-2" />
                Update Information
              </button>
              <button className="w-full btn-secondary flex items-center justify-center">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Visit
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="font-medium text-gray-900">Customer created</p>
                <p className="text-gray-500 text-xs">
                  {format(new Date(customer.created_at), 'dd MMM yyyy, HH:mm')}
                </p>
              </div>
              {services.slice(0, 2).map((service) => (
                <div key={service.id} className="text-sm">
                  <p className="font-medium text-gray-900">
                    {service.product_name} service added
                  </p>
                  <p className="text-gray-500 text-xs">
                    {format(new Date(service.created_at), 'dd MMM yyyy')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Service Modal */}
      {showAddService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Service</h3>
                <button
                  onClick={() => setShowAddService(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleAddService} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product *
                  </label>
                  <select
                    className="input-field"
                    value={newService.product_id}
                    onChange={(e) => setNewService({...newService, product_id: e.target.value})}
                    required
                  >
                    <option value="">Select product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - Rp {product.price.toLocaleString('id-ID')}/month
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={newService.start_date}
                    onChange={(e) => setNewService({...newService, start_date: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={newService.end_date}
                    onChange={(e) => setNewService({...newService, end_date: e.target.value})}
                    min={newService.start_date}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty for ongoing service
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddService(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Add Service
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}