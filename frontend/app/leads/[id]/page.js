'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { leadAPI, projectAPI } from '@/lib/api';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchLeadDetails();
  }, [params.id]);

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      const [leadResponse, projectsResponse] = await Promise.all([
        leadAPI.getById(params.id),
        projectAPI.getAll({ lead_id: params.id }),
      ]);
      
      setLead(leadResponse.data);
      setProjects(projectsResponse.data || []);
    } catch (error) {
      toast.error('Failed to fetch lead details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: 'badge-info', icon: Clock },
      contacted: { color: 'badge-primary', icon: Phone },
      qualified: { color: 'badge-warning', icon: CheckCircle },
      converted: { color: 'badge-success', icon: CheckCircle },
    };
    
    const config = statusConfig[status] || { color: 'badge-info', icon: Clock };
    const Icon = config.icon;
    
    return (
      <span className={`badge ${config.color} flex items-center`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Lead not found</h2>
        <p className="text-gray-600 mt-2">The lead you're looking for doesn't exist.</p>
        <Link href="/leads" className="btn-primary mt-4 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <Link href="/leads" className="mr-4 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
            <div className="flex items-center space-x-4 mt-1">
              {getStatusBadge(lead.status)}
              <span className="text-sm text-gray-500">
                Created: {format(new Date(lead.created_at), 'dd MMM yyyy')}
              </span>
              <span className="text-sm text-gray-500">
                Sales: {lead.sales_name || 'Not assigned'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/leads/${params.id}/edit`}
            className="btn-secondary flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Lead
          </Link>
          {lead.status !== 'converted' && (
            <Link
              href={`/projects/new?lead_id=${params.id}`}
              className="btn-primary flex items-center"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Convert to Project
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['details', 'projects', 'activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{lead.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="font-medium">{lead.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium">
                        {format(new Date(lead.created_at), 'dd MMM yyyy, HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{lead.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Requirements</p>
                      <p className="font-medium">{lead.requirement || 'No specific requirements'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes & Follow-up</h2>
              <div className="space-y-4">
                <textarea
                  className="input-field h-32"
                  placeholder="Add notes about this lead..."
                  defaultValue={lead.notes || ''}
                />
                <button className="btn-primary">Save Notes</button>
              </div>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Status</h2>
              <div className="space-y-4">
                {['new', 'contacted', 'qualified', 'converted'].map((status) => (
                  <div
                    key={status}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      lead.status === status
                        ? 'bg-primary-50 border border-primary-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full mr-3 ${
                        lead.status === status ? 'bg-primary-600' : 'bg-gray-300'
                      }`}></div>
                      <span className={`font-medium ${
                        lead.status === status ? 'text-primary-700' : 'text-gray-700'
                      }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                    {lead.status === status && (
                      <CheckCircle className="h-5 w-5 text-primary-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full btn-secondary flex items-center justify-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Lead
                </button>
                <button className="w-full btn-secondary flex items-center justify-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </button>
                <button className="w-full btn-secondary flex items-center justify-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Associated Projects</h2>
          {projects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="table-header">Project ID</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Total Value</th>
                    <th className="table-header">Created</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td className="table-cell font-medium">PRJ-{project.id.toString().padStart(4, '0')}</td>
                      <td className="table-cell">
                        <span className={`badge ${
                          project.status === 'approved' ? 'badge-success' :
                          project.status === 'rejected' ? 'badge-danger' :
                          'badge-warning'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="table-cell font-medium">
                        Rp {(project.total_value || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="table-cell">
                        {format(new Date(project.created_at), 'dd MMM yyyy')}
                      </td>
                      <td className="table-cell">
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-primary-600 hover:text-primary-800 font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No projects yet</h3>
              <p className="mt-2 text-gray-500">
                This lead hasn't been converted to a project yet.
              </p>
              <Link
                href={`/projects/new?lead_id=${params.id}`}
                className="btn-primary mt-4 inline-flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Project
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Activity Log</h2>
          <div className="space-y-4">
            {[
              { action: 'Lead created', user: lead.sales_name, time: lead.created_at },
              { action: 'Status updated to contacted', user: 'System', time: new Date(Date.now() - 86400000) },
              { action: 'Notes added', user: lead.sales_name, time: new Date(Date.now() - 172800000) },
            ].map((activity, index) => (
              <div key={index} className="flex items-start border-l-4 border-primary-500 pl-4 py-2">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">
                    by {activity.user} • {format(new Date(activity.time), 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}