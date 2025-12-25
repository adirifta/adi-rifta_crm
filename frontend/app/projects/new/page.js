'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { projectAPI, leadAPI, productAPI } from '@/lib/api';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Calculator,
  Users,
  Package,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function CreateProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    lead_id: searchParams.get('lead_id') || '',
    items: [
      { product_id: '', negotiated_price: '', quantity: 1 }
    ]
  });
  const [selectedLead, setSelectedLead] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [regularPrices, setRegularPrices] = useState({});

  useEffect(() => {
    fetchLeadsAndProducts();
  }, []);

  useEffect(() => {
    calculateTotal();
    checkApprovalNeeded();
  }, [formData.items]);

  const fetchLeadsAndProducts = async () => {
    try {
      const [leadsResponse, productsResponse] = await Promise.all([
        leadAPI.getAll(),
        productAPI.getAll(),
      ]);

      setLeads(leadsResponse.data || []);
      setProducts(productsResponse.data || []);

      // Set regular prices
      const prices = {};
      productsResponse.data.forEach(product => {
        prices[product.id] = product.price;
      });
      setRegularPrices(prices);

      // If lead_id is in URL, find and set the lead
      const leadId = searchParams.get('lead_id');
      if (leadId) {
        const lead = leadsResponse.data.find(l => l.id == leadId);
        if (lead) {
          setSelectedLead(lead);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
  };

  const calculateTotal = () => {
    const total = formData.items.reduce((sum, item) => {
      const price = parseFloat(item.negotiated_price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
    setTotalAmount(total);
  };

  const checkApprovalNeeded = () => {
    const needsApproval = formData.items.some(item => {
      const regularPrice = regularPrices[item.product_id];
      const negotiatedPrice = parseFloat(item.negotiated_price) || 0;
      return regularPrice && negotiatedPrice < regularPrice;
    });
    setNeedsApproval(needsApproval);
  };

  const handleLeadChange = (leadId) => {
    const lead = leads.find(l => l.id == leadId);
    setSelectedLead(lead);
    setFormData(prev => ({ ...prev, lead_id: leadId }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product_id: '', negotiated_price: '', quantity: 1 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const getProductPrice = (productId) => {
    const product = products.find(p => p.id == productId);
    return product ? product.price : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.lead_id) {
      toast.error('Please select a lead');
      return;
    }

    if (formData.items.some(item => !item.product_id || !item.negotiated_price)) {
      toast.error('Please fill in all product fields');
      return;
    }

    setLoading(true);

    try {
      const projectData = {
        lead_id: parseInt(formData.lead_id),
        items: formData.items.map(item => ({
          product_id: parseInt(item.product_id),
          negotiated_price: parseFloat(item.negotiated_price),
          quantity: parseInt(item.quantity) || 1
        }))
      };

      const response = await projectAPI.create(projectData);
      
      if (needsApproval) {
        toast.success('Project created! Waiting for manager approval.');
      } else {
        toast.success('Project created and approved! Customer account created.');
      }
      
      router.push('/projects');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/projects" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Link>
      </div>

      <div className="card">
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-lg bg-primary-100 mr-4">
            <Calculator className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
            <p className="text-gray-600">Convert a lead to customer with service packages</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Lead Selection */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Select Lead</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="lead_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Lead *
                </label>
                <select
                  id="lead_id"
                  className="input-field"
                  value={formData.lead_id}
                  onChange={(e) => handleLeadChange(e.target.value)}
                  required
                >
                  <option value="">Select a lead</option>
                  {leads
                    .filter(lead => lead.status !== 'converted')
                    .map(lead => (
                      <option key={lead.id} value={lead.id}>
                        {lead.name} - {lead.contact} ({lead.status})
                      </option>
                    ))}
                </select>
              </div>
              
              {selectedLead && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">Lead Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Name:</span> {selectedLead.name}</p>
                    <p><span className="text-gray-600">Contact:</span> {selectedLead.contact}</p>
                    <p><span className="text-gray-600">Address:</span> {selectedLead.address}</p>
                    <p><span className="text-gray-600">Requirements:</span> {selectedLead.requirement || 'None'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Service Packages</h2>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="btn-secondary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.items.map((item, index) => {
                const product = products.find(p => p.id == item.product_id);
                const regularPrice = product ? product.price : 0;
                const negotiatedPrice = parseFloat(item.negotiated_price) || 0;
                const isBelowPrice = negotiatedPrice > 0 && negotiatedPrice < regularPrice;
                
                return (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Product #{index + 1}</h3>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product *
                        </label>
                        <select
                          className="input-field"
                          value={item.product_id}
                          onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                          required
                        >
                          <option value="">Select product</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} - Rp {product.price.toLocaleString('id-ID')}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Negotiated Price *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            Rp
                          </span>
                          <input
                            type="number"
                            className="pl-10 input-field"
                            placeholder="e.g., 390000"
                            value={item.negotiated_price}
                            onChange={(e) => handleItemChange(index, 'negotiated_price', e.target.value)}
                            required
                            min="0"
                            step="1000"
                          />
                        </div>
                        {product && (
                          <p className="mt-1 text-xs text-gray-500">
                            Regular price: Rp {regularPrice.toLocaleString('id-ID')}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          className="input-field"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min="1"
                        />
                      </div>
                    </div>
                    
                    {isBelowPrice && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                          <span className="text-sm text-yellow-800">
                            Price below regular price requires manager approval
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {product && negotiatedPrice > 0 && (
                      <div className="mt-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium">
                            Rp {(negotiatedPrice * (parseInt(item.quantity) || 1)).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-medium">{formData.items.length}</span>
              </div>
              
              <div className="h-px bg-gray-200"></div>
              
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total Amount:</span>
                <span className="text-xl font-bold text-primary-600">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
              
              {needsApproval && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Approval Required</h4>
                      <p className="text-sm text-yellow-800 mt-1">
                        This project contains products priced below regular price. 
                        It will require manager approval before becoming active.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Link
              href="/projects"
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
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}