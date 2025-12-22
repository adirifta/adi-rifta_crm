'use client';

import { useState, useEffect } from 'react';
import { projectAPI } from '@/lib/api';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Users,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { getUserRole } from '@/lib/auth';
import { format } from 'date-fns';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
    setUserRole(getUserRole());
  }, [statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {
        search: search || undefined,
        status: statusFilter || undefined,
      };
      
      const response = await projectAPI.getAll(params);
      setProjects(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch projects');
      console.error(error);
    } finally {
      setLoading(false);
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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Pipeline</h1>
          <p className="text-gray-600">Manage deals and conversion projects</p>
        </div>
        <Link
          href="/projects/new"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>New Project</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by lead name or sales person..."
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
              <option value="waiting_approval">Waiting Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">
            <Filter className="h-5 w-5" />
            <span className="ml-2">Filter</span>
          </button>
        </form>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.length > 0 ? (
            projects.map((project) => {
              const statusConfig = getStatusConfig(project.status);
              const Icon = statusConfig.icon;
              
              return (
                <div key={project.id} className="card">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className={`badge ${statusConfig.color} flex items-center`}>
                          <Icon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </span>
                        <h3 className="font-semibold text-gray-900">Project #{project.id}</h3>
                      </div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          <span>Lead: {project.lead_name}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          <span>Sales: {project.sales_name}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span>Total: Rp {(project.total_value || 0).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/projects/${project.id}`}
                        className="btn-secondary flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                      <button
                        onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                        className="p-2 text-gray-600 hover:text-gray-900"
                      >
                        <ChevronDown className={`h-5 w-5 transition-transform ${
                          expandedProject === project.id ? 'rotate-180' : ''
                        }`} />
                      </button>
                    </div>
                  </div>
                  
                  {expandedProject === project.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Project Details</h4>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-gray-600">Created:</span> {format(new Date(project.created_at), 'dd MMM yyyy')}</p>
                            <p><span className="text-gray-600">Items:</span> {project.total_items || 0} products</p>
                            {project.approved_by_name && (
                              <p><span className="text-gray-600">Approved by:</span> {project.approved_by_name}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Lead Contact</h4>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-gray-600">Name:</span> {project.lead_name}</p>
                            <p><span className="text-gray-600">Contact:</span> {project.lead_contact}</p>
                          </div>
                        </div>
                      </div>
                      
                      {userRole === 'manager' && project.status === 'waiting_approval' && (
                        <div className="mt-4 flex space-x-3">
                          <button
                            onClick={async () => {
                              try {
                                await projectAPI.approve(project.id, { action: 'approve' });
                                toast.success('Project approved');
                                fetchProjects();
                              } catch (error) {
                                toast.error('Failed to approve project');
                              }
                            }}
                            className="btn-success flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </button>
                          <button
                            onClick={async () => {
                              const reason = prompt('Enter rejection reason:');
                              if (reason) {
                                try {
                                  await projectAPI.approve(project.id, { 
                                    action: 'reject', 
                                    rejection_reason: reason 
                                  });
                                  toast.success('Project rejected');
                                  fetchProjects();
                                } catch (error) {
                                  toast.error('Failed to reject project');
                                }
                              }
                            }}
                            className="btn-danger flex items-center"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No projects found</h3>
              <p className="mt-2 text-gray-500">
                {search || statusFilter ? 'Try adjusting your filters' : 'Start by converting a lead to a project'}
              </p>
              <Link
                href="/projects/new"
                className="btn-primary mt-4 inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Project
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}