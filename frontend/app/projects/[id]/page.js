'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { projectAPI } from '@/lib/api';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Users,
  FileText,
  Package,
  AlertCircle,
  Download,
  Printer,
  Phone, // TAMBAHKAN INI
  MapPin, // TAMBAHKAN INI
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { getUserRole } from '@/lib/auth';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    fetchProjectDetails();
    setUserRole(getUserRole());
  }, [params.id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getById(params.id);
      setProject(response.data);
    } catch (error) {
      toast.error('Failed to fetch project details');
      console.error(error);
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (action, reason = '') => {
    if (action === 'reject' && !reason) {
      reason = prompt('Enter rejection reason:');
      if (!reason) return;
    }

    try {
      await projectAPI.approve(params.id, { 
        action, 
        rejection_reason: reason 
      });
      toast.success(`Project ${action}d successfully`);
      fetchProjectDetails();
    } catch (error) {
      toast.error(`Failed to ${action} project`);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'waiting_approval':
        return {
          color: 'badge-warning',
          icon: Clock,
          label: 'Waiting Approval',
        };
      case 'approved':
        return {
          color: 'badge-success',
          icon: CheckCircle,
          label: 'Approved',
        };
      case 'rejected':
        return {
          color: 'badge-danger',
          icon: XCircle,
          label: 'Rejected',
        };
      default:
        return {
          color: 'badge-info',
          icon: Clock,
          label: status,
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
        <p className="text-gray-600 mt-2">The project you're looking for doesn't exist.</p>
        <Link href="/projects" className="btn-primary mt-4 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Link>
      </div>
    );
  }

  const statusConfig = getStatusConfig(project.status);
  const Icon = statusConfig.icon;

  const totalAmount = project.items?.reduce((sum, item) => {
    const price = parseFloat(item.negotiated_price) || 0;
    const quantity = parseInt(item.quantity) || 1;
    return sum + (price * quantity);
  }, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <Link href="/projects" className="mr-4 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Project #{project.id.toString().padStart(4, '0')}
            </h1>
            <div className="flex items-center space-x-4 mt-1">
              <span className={`badge ${statusConfig.color} flex items-center`}>
                <Icon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </span>
              <span className="text-sm text-gray-500">
                Created: {format(new Date(project.created_at), 'dd MMM yyyy')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <button className="btn-secondary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Project Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Lead Name</p>
                    <p className="font-medium">{project.lead_name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Sales Person</p>
                    <p className="font-medium">{project.sales_name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Project ID</p>
                    <p className="font-medium">PRJ-{project.id.toString().padStart(4, '0')}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Lead Contact</p>
                    <p className="font-medium">{project.lead_contact}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Lead Address</p>
                    <p className="font-medium">{project.lead_address}</p>
                  </div>
                </div>
                {project.approved_by_name && (
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Approved By</p>
                      <p className="font-medium">{project.approved_by_name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Service Items</h2>
              <span className="badge badge-primary">
                {project.items?.length || 0} item{project.items?.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {project.items && project.items.length > 0 ? (
              <div className="space-y-4">
                {project.items.map((item, index) => {
                  const regularPrice = parseFloat(item.regular_price) || 0;
                  const negotiatedPrice = parseFloat(item.negotiated_price) || 0;
                  const quantity = parseInt(item.quantity) || 1;
                  const subtotal = negotiatedPrice * quantity;
                  const isBelowPrice = negotiatedPrice < regularPrice;
                  
                  return (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-primary-100 mr-3">
                            <Package className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                            <p className="text-sm text-gray-500">Quantity: {quantity}</p>
                          </div>
                        </div>
                        {isBelowPrice && (
                          <span className="badge badge-warning flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Discounted
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                        <div className="text-sm">
                          <p className="text-gray-500">Regular Price</p>
                          <p className="font-medium">
                            Rp {regularPrice.toLocaleString('id-ID')}
                          </p>
                        </div>
                        
                        <div className="text-sm">
                          <p className="text-gray-500">Negotiated Price</p>
                          <p className={`font-medium ${isBelowPrice ? 'text-green-600' : ''}`}>
                            Rp {negotiatedPrice.toLocaleString('id-ID')}
                          </p>
                        </div>
                        
                        <div className="text-sm">
                          <p className="text-gray-500">Quantity</p>
                          <p className="font-medium">{quantity}</p>
                        </div>
                        
                        <div className="text-sm">
                          <p className="text-gray-500">Subtotal</p>
                          <p className="font-medium text-primary-600">
                            Rp {subtotal.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                      
                      {isBelowPrice && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                            <span className="text-sm text-yellow-800">
                              Price below regular price: {((regularPrice - negotiatedPrice) / regularPrice * 100).toFixed(1)}% discount
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No items added</h3>
              </div>
            )}
          </div>
          
          {/* Rejection Reason */}
          {project.status === 'rejected' && project.rejection_reason && (
            <div className="card bg-red-50 border border-red-200">
              <div className="flex items-center mb-3">
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="font-semibold text-red-900">Rejection Reason</h3>
              </div>
              <p className="text-red-800">{project.rejection_reason}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-medium">{project.items?.length || 0}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`badge ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
              
              <div className="h-px bg-gray-200 my-2"></div>
              
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total Amount:</span>
                <span className="text-xl font-bold text-primary-600">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
              
              {project.approval_date && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm">
                    <p className="text-gray-500">Approved on:</p>
                    <p className="font-medium">
                      {format(new Date(project.approval_date), 'dd MMM yyyy, HH:mm')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Approval Actions (for managers only) */}
          {userRole === 'manager' && project.status === 'waiting_approval' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => handleApprove('approve')}
                  className="w-full btn-success flex items-center justify-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Project
                </button>
                <button
                  onClick={() => handleApprove('reject')}
                  className="w-full btn-danger flex items-center justify-center"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Project
                </button>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Approving will convert lead to customer and create service subscriptions.
              </p>
            </div>
          )}

          {/* Related Customer */}
          {project.status === 'approved' && (
            <div className="card bg-green-50 border border-green-200">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-900">Customer Created</h3>
              </div>
              <p className="text-sm text-green-800 mb-3">
                This project has been converted to a customer account.
              </p>
              <Link
                href={`/customers?search=${project.lead_name}`}
                className="text-sm text-green-700 hover:text-green-900 font-medium"
              >
                View Customer →
              </Link>
            </div>
          )}

          {/* Timeline */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Project created</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(project.created_at), 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>
              </div>
              
              {project.status === 'approved' && project.approval_date && (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Project approved</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(project.approval_date), 'dd MMM yyyy, HH:mm')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}