'use client';

import { useState, useEffect } from 'react';
import { customerAPI } from '@/lib/api';
import { toast } from 'react-toastify';
import { 
  Search, 
  Filter, 
  UserCheck,
  Phone,
  MapPin,
  Calendar,
  Wifi,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getAll();
      setCustomers(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch customers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      customer.customer_contact?.includes(search) ||
      customer.customer_address?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = !statusFilter || 
      (statusFilter === 'active' && 
       (!customer.latest_end_date || new Date(customer.latest_end_date) > new Date())) ||
      (statusFilter === 'expired' && 
       customer.latest_end_date && new Date(customer.latest_end_date) < new Date());
    
    return matchesSearch && matchesFilter;
  });

  const getServiceStatus = (endDate) => {
    if (!endDate) return { label: 'Active', color: 'badge-success' };
    
    const end = new Date(endDate);
    const today = new Date();
    
    if (end > today) {
      const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) {
        return { label: `Expires in ${diffDays} days`, color: 'badge-warning' };
      }
      return { label: 'Active', color: 'badge-success' };
    }
    
    return { label: 'Expired', color: 'badge-danger' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Customers</h1>
          <p className="text-gray-600">Manage your subscribed customers</p>
        </div>
        <div className="text-sm text-gray-600">
          Total: {customers.length} customers
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers by name, contact, or address..."
                className="pl-10 input-field"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active Services</option>
              <option value="expired">Expired Services</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => {
              const serviceStatus = getServiceStatus(customer.latest_end_date);
              
              return (
                <div key={customer.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <UserCheck className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-900">{customer.customer_name}</h3>
                        <span className={`badge ${serviceStatus.color} mt-1`}>
                          {serviceStatus.label}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/customers/${customer.id}`}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span>{customer.customer_contact}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="truncate">{customer.customer_address}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span>Subscribed: {format(new Date(customer.subscription_date), 'dd MMM yyyy')}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Wifi className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span>{customer.total_services || 0} active services</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sales Person:</span>
                      <span className="text-sm font-medium">{customer.sales_name}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="lg:col-span-2 text-center py-12">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No customers found</h3>
              <p className="mt-2 text-gray-500">
                {search || statusFilter ? 'Try adjusting your search terms' : 'Convert leads to projects to create customers'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500 bg-opacity-20">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500 bg-opacity-20">
              <Wifi className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Services</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.reduce((acc, curr) => acc + (curr.total_services || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500 bg-opacity-20">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">New This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter(c => {
                  const subDate = new Date(c.subscription_date);
                  const now = new Date();
                  return subDate.getMonth() === now.getMonth() && 
                         subDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}