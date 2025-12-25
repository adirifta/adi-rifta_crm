'use client';

import { useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { toast } from 'react-toastify';
import { 
  User, 
  Mail, 
  Briefcase, 
  Calendar,
  Phone,
  MapPin,
  Lock,
  Save,
  Camera,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      const userData = response.data.user;
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
      });
    } catch (error) {
      toast.error('Failed to fetch profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    // In a real app, you would have an API endpoint for updating profile
    toast.success('Profile updated successfully');
    setEditing(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    // In a real app, you would call an API to change password
    toast.success('Password changed successfully');
    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">Manage your account information and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              <button
                onClick={() => setEditing(!editing)}
                className="text-sm text-primary-600 hover:text-primary-800 font-medium"
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="flex items-center">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-12 w-12 text-primary-600" />
                  </div>
                  {editing && (
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
                  <p className="text-gray-600 capitalize">{user?.role}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Member since {format(new Date(user?.created_at || new Date()), 'MMMM yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      className="pl-10 input-field"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      disabled={!editing}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      className="pl-10 input-field"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={!editing}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      className="pl-10 input-field"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      className="pl-10 input-field bg-gray-50"
                      value={user?.role || ''}
                      disabled
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      className="pl-10 input-field"
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                </div>
              </div>
              
              {editing && (
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="btn-primary flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Change Password */}
          <div className="card">
            <div className="flex items-center mb-6">
              <Shield className="h-5 w-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    className="pl-10 input-field"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      className="pl-10 input-field"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      className="pl-10 input-field"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="btn-primary flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Stats */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Leads</p>
                    <p className="text-lg font-bold text-gray-900">42</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Projects</p>
                    <p className="text-lg font-bold text-gray-900">18</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                    <UserCheck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Customers</p>
                    <p className="text-lg font-bold text-gray-900">27</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center mr-3">
                    <DollarSign className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-lg font-bold text-gray-900">
                      Rp 42,500,000
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">User ID</span>
                <span className="font-medium">UID-{user?.id?.toString().padStart(4, '0')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Role</span>
                <span className="font-medium capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Account Created</span>
                <span className="font-medium">
                  {format(new Date(user?.created_at || new Date()), 'dd MMM yyyy')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Login</span>
                <span className="font-medium">Today, 14:30</span>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="card bg-blue-50 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">Security Status</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-blue-800">Password strength: Strong</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-blue-800">Two-factor: Not enabled</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-sm text-blue-800">Last password change: 90 days ago</span>
              </div>
            </div>
            <button className="mt-4 text-sm text-blue-700 hover:text-blue-900 font-medium">
              View security settings →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}