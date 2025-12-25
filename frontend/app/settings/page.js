'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { 
  Settings as SettingsIcon,
  Bell,
  Eye,
  Moon,
  Globe,
  Save,
  Database,
  Shield,
  Palette,
  BellOff,
  Smartphone
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    leadNotifications: true,
    projectNotifications: true,
    dailySummary: true,
    
    // Display Settings
    theme: 'light',
    language: 'id',
    timezone: 'Asia/Jakarta',
    dateFormat: 'DD/MM/YYYY',
    itemsPerPage: 20,
    
    // Privacy Settings
    showOnlineStatus: true,
    allowDataCollection: false,
    autoBackup: true,
    
    // System Settings
    autoSave: true,
    twoFactorAuth: false,
  });

  const handleSave = () => {
    // In a real app, you would save to API
    localStorage.setItem('crm_settings', JSON.stringify(settings));
    toast.success('Settings saved successfully');
  };

  const handleReset = () => {
    const defaultSettings = {
      emailNotifications: true,
      pushNotifications: true,
      leadNotifications: true,
      projectNotifications: true,
      dailySummary: true,
      theme: 'light',
      language: 'id',
      timezone: 'Asia/Jakarta',
      dateFormat: 'DD/MM/YYYY',
      itemsPerPage: 20,
      showOnlineStatus: true,
      allowDataCollection: false,
      autoBackup: true,
      autoSave: true,
      twoFactorAuth: false,
    };
    setSettings(defaultSettings);
    toast.info('Settings reset to default');
  };

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center">
          <SettingsIcon className="h-6 w-6 text-gray-600 mr-2" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Customize your CRM experience</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Notification Settings */}
        <div className="card">
          <div className="flex items-center mb-6">
            <Bell className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive updates via email</p>
              </div>
              <button
                onClick={() => handleToggle('emailNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.emailNotifications ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-600">Desktop and mobile notifications</p>
              </div>
              <button
                onClick={() => handleToggle('pushNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.pushNotifications ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">New Lead Alerts</p>
                <p className="text-sm text-gray-600">Notify when new leads are assigned</p>
              </div>
              <button
                onClick={() => handleToggle('leadNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.leadNotifications ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.leadNotifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Project Updates</p>
                <p className="text-sm text-gray-600">Notify on project status changes</p>
              </div>
              <button
                onClick={() => handleToggle('projectNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.projectNotifications ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.projectNotifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Daily Summary</p>
                <p className="text-sm text-gray-600">Receive daily performance summary</p>
              </div>
              <button
                onClick={() => handleToggle('dailySummary')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.dailySummary ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.dailySummary ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="card">
          <div className="flex items-center mb-6">
            <Eye className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Display Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Theme
              </label>
              <select
                className="input-field"
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                className="input-field"
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                className="input-field"
                value={settings.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
              >
                <option value="Asia/Jakarta">WIB (Jakarta)</option>
                <option value="Asia/Makassar">WITA (Makassar)</option>
                <option value="Asia/Jayapura">WIT (Jayapura)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Format
              </label>
              <select
                className="input-field"
                value={settings.dateFormat}
                onChange={(e) => handleChange('dateFormat', e.target.value)}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Items per Page
              </label>
              <select
                className="input-field"
                value={settings.itemsPerPage}
                onChange={(e) => handleChange('itemsPerPage', parseInt(e.target.value))}
              >
                <option value="10">10 items</option>
                <option value="20">20 items</option>
                <option value="50">50 items</option>
                <option value="100">100 items</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="card">
          <div className="flex items-center mb-6">
            <Shield className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Privacy Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Show Online Status</p>
                <p className="text-sm text-gray-600">Allow others to see when you're online</p>
              </div>
              <button
                onClick={() => handleToggle('showOnlineStatus')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.showOnlineStatus ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Data Collection</p>
                <p className="text-sm text-gray-600">Allow anonymous usage data collection</p>
              </div>
              <button
                onClick={() => handleToggle('allowDataCollection')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.allowDataCollection ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.allowDataCollection ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Automatic Backup</p>
                <p className="text-sm text-gray-600">Automatically backup your data</p>
              </div>
              <button
                onClick={() => handleToggle('autoBackup')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.autoBackup ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="card">
          <div className="flex items-center mb-6">
            <Database className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">System Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auto-save Forms</p>
                <p className="text-sm text-gray-600">Automatically save form data</p>
              </div>
              <button
                onClick={() => handleToggle('autoSave')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.autoSave ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Two-factor Authentication</p>
                <p className="text-sm text-gray-600">Add extra security to your account</p>
              </div>
              <button
                onClick={() => handleToggle('twoFactorAuth')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.twoFactorAuth ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Clear Cache</p>
                  <p className="text-sm text-gray-600">Remove temporary data</p>
                </div>
                <button
                  onClick={() => toast.info('Cache cleared successfully')}
                  className="btn-secondary"
                >
                  Clear Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-medium text-gray-900">Reset to Default</p>
              <p className="text-sm text-gray-600">Reset all settings to default values</p>
            </div>
            <button
              onClick={handleReset}
              className="btn-secondary"
            >
              Reset Settings
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="btn-primary flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            Save All Settings
          </button>
        </div>

        {/* System Info */}
        <div className="card bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-3">System Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">App Version</p>
              <p className="font-medium">CRM v1.0.0</p>
            </div>
            <div>
              <p className="text-gray-600">Last Updated</p>
              <p className="font-medium">Dec 19, 2023</p>
            </div>
            <div>
              <p className="text-gray-600">Browser</p>
              <p className="font-medium">Chrome 120</p>
            </div>
            <div>
              <p className="text-gray-600">Screen</p>
              <p className="font-medium">1920×1080</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}