'use client';

import { useState, useEffect } from 'react';
import { reportAPI } from '@/lib/api';
import { toast } from 'react-toastify';
import { 
  Download, 
  Filter, 
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  FileSpreadsheet
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
import { format, subDays, subMonths } from 'date-fns';

export default function ReportsPage() {
  const [salesData, setSalesData] = useState([]);
  const [leadStats, setLeadStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });
  const [reportType, setReportType] = useState('sales');

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = {
        start_date: dateRange.start,
        end_date: dateRange.end,
      };

      let salesResponse, leadsResponse;
      
      if (reportType === 'sales') {
        salesResponse = await reportAPI.getSalesReport(params);
        setSalesData(salesResponse.data || []);
      } else {
        leadsResponse = await reportAPI.getLeadsByStatus(params);
        setLeadStats(leadsResponse.data || []);
      }
    } catch (error) {
      toast.error('Failed to fetch report data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await reportAPI.exportSalesReport({
        start_date: dateRange.start,
        end_date: dateRange.end,
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales_report_${dateRange.start}_to_${dateRange.end}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const salesChartData = salesData.map(item => ({
    name: item.sales_name,
    leads: item.total_leads,
    projects: item.approved_projects,
    customers: item.total_customers,
    revenue: item.total_sales_value / 1000000, // Convert to millions
  }));

  const leadStatusData = leadStats.reduce((acc, curr) => {
    if (!acc[curr.month]) acc[curr.month] = {};
    acc[curr.month][curr.status] = curr.count;
    return acc;
  }, {});

  const leadStatusChartData = Object.keys(leadStatusData).map(month => ({
    month,
    ...leadStatusData[month],
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Track performance and generate insights</p>
        </div>
        <button
          onClick={handleExport}
          className="btn-success flex items-center space-x-2"
          disabled={loading}
        >
          <Download className="h-5 w-5" />
          <span>Export to Excel</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              className="input-field"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="sales">Sales Performance</option>
              <option value="leads">Lead Analytics</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                className="pl-10 input-field"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                className="pl-10 input-field"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-3">
          <button
            onClick={() => setDateRange({
              start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
              end: format(new Date(), 'yyyy-MM-dd'),
            })}
            className="btn-secondary"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDateRange({
              start: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
              end: format(new Date(), 'yyyy-MM-dd'),
            })}
            className="btn-secondary"
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDateRange({
              start: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
              end: format(new Date(), 'yyyy-MM-dd'),
            })}
            className="btn-secondary"
          >
            Last 90 Days
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {reportType === 'sales' ? (
            <>
              {/* Sales Performance Chart */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Sales Performance</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm text-gray-600">Leads</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm text-gray-600">Projects</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-purple-500 mr-2"></div>
                      <span className="text-sm text-gray-600">Revenue (in millions)</span>
                    </div>
                  </div>
                </div>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'revenue') return [`Rp ${(value * 1000000).toLocaleString('id-ID')}`, 'Revenue'];
                          return [value, name];
                        }}
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="leads" fill="#3b82f6" name="Total Leads" />
                      <Bar dataKey="projects" fill="#10b981" name="Approved Projects" />
                      <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue (millions)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sales Data Table */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Sales Report Details</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="table-header">Sales Person</th>
                        <th className="table-header">Total Leads</th>
                        <th className="table-header">Approved Projects</th>
                        <th className="table-header">Total Customers</th>
                        <th className="table-header">Conversion Rate</th>
                        <th className="table-header">Total Revenue</th>
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
                            <td className="table-cell font-medium">
                              Rp {(sales.total_sales_value || 0).toLocaleString('id-ID')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {salesData.length === 0 && (
                  <div className="text-center py-8">
                    <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No sales data available</h3>
                    <p className="mt-2 text-gray-500">Try adjusting the date range</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Lead Analytics */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Lead Conversion Trend</h2>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={leadStatusChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="new" stroke="#3b82f6" strokeWidth={2} name="New Leads" />
                      <Line type="monotone" dataKey="contacted" stroke="#f59e0b" strokeWidth={2} name="Contacted" />
                      <Line type="monotone" dataKey="qualified" stroke="#8b5cf6" strokeWidth={2} name="Qualified" />
                      <Line type="monotone" dataKey="converted" stroke="#10b981" strokeWidth={2} name="Converted" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Lead Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { 
                    title: 'Total Leads', 
                    value: leadStats.reduce((acc, curr) => acc + curr.count, 0),
                    icon: Users,
                    color: 'bg-blue-500',
                  },
                  { 
                    title: 'New Leads', 
                    value: leadStats.filter(l => l.status === 'new').reduce((acc, curr) => acc + curr.count, 0),
                    icon: TrendingUp,
                    color: 'bg-green-500',
                  },
                  { 
                    title: 'Qualified Leads', 
                    value: leadStats.filter(l => l.status === 'qualified').reduce((acc, curr) => acc + curr.count, 0),
                    icon: Filter,
                    color: 'bg-yellow-500',
                  },
                  { 
                    title: 'Converted Leads', 
                    value: leadStats.filter(l => l.status === 'converted').reduce((acc, curr) => acc + curr.count, 0),
                    icon: BarChart3,
                    color: 'bg-purple-500',
                  },
                ].map((stat, index) => (
                  <div key={index} className="card">
                    <div className="flex items-center">
                      <div className={`${stat.color} p-3 rounded-lg`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Export Options */}
          <div className="card bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">Export Options</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Download comprehensive reports for further analysis
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleExport}
                  className="btn-success flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel Export
                </button>
                <button className="btn-secondary flex items-center">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  PDF Report
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}