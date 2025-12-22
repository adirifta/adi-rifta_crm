'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { leadAPI } from '@/lib/api';
import { toast } from 'react-toastify';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function CreateLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    requirement: '',
    status: 'new',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await leadAPI.create(formData);
      toast.success('Lead created successfully!');
      router.push('/leads');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/leads" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Leads
        </Link>
      </div>

      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Lead</h1>
        
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
                placeholder="John Doe"
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
                placeholder="+62 812-3456-7890"
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
                placeholder="Jl. Example No. 123, Jakarta"
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
                placeholder="Describe the internet service requirements..."
                value={formData.requirement}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Initial Status
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
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Link
              href="/leads"
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
                  Create Lead
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Tips for creating effective leads:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Collect complete contact information</li>
          <li>• Specify clear service requirements</li>
          <li>• Update lead status regularly</li>
          <li>• Add notes after each interaction</li>
        </ul>
      </div>
    </div>
  );
}