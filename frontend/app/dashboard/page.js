'use client';

import { useEffect, useState } from 'react';
import { leadAPI, reportAPI } from '@/lib/api';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  CheckCircle,
  UserPlus,
  Package,
  Briefcase,
  UserCheck,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_leads: 0,
    new_leads: 0,
    contacted_leads: 0,
    qualified_leads: 0,
    converted_leads: 0,
  });
  const [salesData, setSalesData] = useState([]);
  const [leadStatusData, setLeadStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(today.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(today.getMonth() - 3);
          break;
        default:
          startDate.setMonth(today.getMonth() - 1);
      }

      const params = {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(today, 'yyyy-MM-dd'),
      };

      const [leadsStats, salesReport, leadsByStatus] = await Promise.all([
        leadAPI.getStats(),
        reportAPI.getSalesReport(params),
        reportAPI.getLeadsByStatus(params),
      ]);
      
      setStats(leadsStats.data || {});
      setSalesData(salesReport.data || []);
      setLeadStatusData(leadsByStatus.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const statCards = [
    {
      title: 'Total Leads',
      value: stats?.total_leads || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      trend: 'up',
    },
    {
      title: 'New Leads',
      value: stats?.new_leads || 0,
      icon: UserPlus,
      color: 'bg-green-500',
      change: '+8%',
      trend: 'up',
    },
    {
      title: 'Active Projects',
      value: salesData.length || 0,
      icon: Briefcase,
      color: 'bg-yellow-500',
      change: '+15%',
      trend: 'up',
    },
    {
      title: 'Active Customers',
      value: salesData.reduce((acc, curr) => acc + (curr.total_customers || 0), 0) || 0,
      icon: UserCheck,
      color: 'bg-purple-500',
      change: '+20%',
      trend: 'up',
    },
  ];

  const sampleChartData = [
    { month: 'Jan', leads: 40, conversions: 24, revenue: 42000 },
    { month: 'Feb', leads: 30, conversions: 13, revenue: 38000 },
    { month: 'Mar', leads: 20, conversions: 38, revenue: 45000 },
    { month: 'Apr', leads: 27, conversions: 39, revenue: 52000 },
    { month: 'May', leads: 18, conversions: 48, revenue: 61000 },
    { month: 'Jun', leads: 23, conversions: 38, revenue: 58000 },
  ];

  const leadStatusPieData = [
    { name: 'New', value: stats.new_leads || 0 },
    { name: 'Contacted', value: stats.contacted_leads || 0 },
    { name: 'Qualified', value: stats.qualified_leads || 0 },
    { name: 'Converted', value: stats.converted_leads || 0 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your CRM.</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            className="input-field w-full sm:w-auto"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 90 days</option>
            <option value="year">Last year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {stat.trend === 'up' ? (
                    <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last period
                  </span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-xl`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads & Conversions Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Leads & Conversions Trend</h2>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm text-gray-600">Leads</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-gray-600">Conversions</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sampleChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  name="Leads"
                />
                <Line 
                  type="monotone" 
                  dataKey="conversions" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Conversions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Status Distribution */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Lead Status Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadStatusPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {leadStatusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [value, 'Leads']}
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {leadStatusPieData.map((item, index) => (
              <div key={item.name} className="flex items-center">
                <div 
                  className="h-3 w-3 rounded-full mr-2" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm text-gray-600">{item.name}</span>
                <span className="ml-auto text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Performance */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Sales Performance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="table-header">Sales Person</th>
                <th className="table-header">Total Leads</th>
                <th className="table-header">Approved Projects</th>
                <th className="table-header">Total Customers</th>
                <th className="table-header">Sales Value</th>
                <th className="table-header">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salesData.map((sales, index) => {
                const conversionRate = sales.total_leads > 0 
                  ? ((sales.approved_projects / sales.total_leads) * 100).toFixed(1)
                  : 0;
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{sales.sales_name}</td>
                    <td className="table-cell">{sales.total_leads || 0}</td>
                    <td className="table-cell">{sales.approved_projects || 0}</td>
                    <td className="table-cell">{sales.total_customers || 0}</td>
                    <td className="table-cell font-medium">
                      Rp {(sales.total_sales_value || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${Math.min(conversionRate, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{conversionRate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {salesData.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No sales data available for the selected period.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500 bg-opacity-20">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Add New Lead</h3>
              <p className="text-sm text-gray-600 mt-1">Start tracking a new potential customer</p>
            </div>
          </div>
          <a
            href="/leads/new"
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            Create Lead
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500 bg-opacity-20">
              <Briefcase className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Create Project</h3>
              <p className="text-sm text-gray-600 mt-1">Convert leads into customer projects</p>
            </div>
          </div>
          <a
            href="/projects/new"
            className="mt-4 inline-flex items-center text-green-600 hover:text-green-700 font-medium"
          >
            Start Project
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500 bg-opacity-20">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">View Reports</h3>
              <p className="text-sm text-gray-600 mt-1">Generate and download sales reports</p>
            </div>
          </div>
          <a
            href="/reports"
            className="mt-4 inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
          >
            View Reports
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}