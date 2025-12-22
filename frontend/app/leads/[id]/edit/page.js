'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { leadAPI } from '@/lib/api';
import { toast } from 'react-toastify';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import Link from 'next/link';

export default function EditLeadPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    requirement: '',
    status: 'new',
  });

  useEffect(() => {
    fetchLead();
  }, [params.id]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const response = await leadAPI.getById(params.id);
      const lead = response.data;
      
      setFormData({
        name: lead.name || '',
        contact: lead.contact || '',
        address: lead.address || '',
        requirement: lead.requirement || '',
        status: lead.status || 'new',
      });
    } catch (error) {
      toast.error('Failed to fetch lead data');
      console.error(error);
      router.push('/leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await leadAPI.update(params.id, formData);
      toast.success('Lead updated successfully!');
      router.push(`/leads/${params.id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update lead');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/leads/${params.id}`} className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Lead Details
        </Link>
      </div>

      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Lead</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="input-field"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number *
              </label>
              <input
                type="tel"
                id="contact"
                name="contact"
                required
                className="input-field"
                value={formData.contact}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Complete Address *
              </label>
              <textarea
                id="address"
                name="address"
                required
                rows={3}
                className="input-field"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="requirement" className="block text-sm font-medium text-gray-700 mb-1">
                Service Requirements
              </label>
              <textarea
                id="requirement"
                name="requirement"
                rows={4}
                className="input-field"
                value={formData.requirement}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="input-field"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="new">New Lead</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Link
              href={`/leads/${params.id}`}
              className="btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center"
            >
              {saving ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}