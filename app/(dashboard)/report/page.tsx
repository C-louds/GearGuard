"use client";

import React, { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, Package, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function MaintenanceReports() {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [teams, setTeams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportView, setReportView] = useState('team');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [requestsRes, teamsRes, categoriesRes] = await Promise.all([
        fetch('/api/maintenance'),
        fetch('/api/teams'),
        fetch('/api/equipment-categories')
      ]);

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setMaintenanceRequests(data);
      }

      if (teamsRes.ok) {
        const data = await teamsRes.json();
        setTeams(data);
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRequestsByTeam = () => {
    const teamCounts = {};
    
    maintenanceRequests.forEach(request => {
      const teamId = request.maintenanceTeamId;
      if (!teamCounts[teamId]) {
        const team = teams.find(t => t.id === teamId);
        teamCounts[teamId] = {
          name: team?.name || `Team #${teamId}`,
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          corrective: 0,
          preventive: 0,
          predictive: 0
        };
      }
      
      teamCounts[teamId].total++;
      
      if (request.stage === 'PENDING') teamCounts[teamId].pending++;
      if (request.stage === 'IN_PROGRESS') teamCounts[teamId].inProgress++;
      if (request.stage === 'COMPLETED') teamCounts[teamId].completed++;
      
      if (request.requestType === 'CORRECTIVE') teamCounts[teamId].corrective++;
      if (request.requestType === 'PREVENTIVE') teamCounts[teamId].preventive++;
      if (request.requestType === 'PREDICTIVE') teamCounts[teamId].predictive++;
    });

    return Object.values(teamCounts).sort((a, b) => b.total - a.total);
  };

  const getRequestsByCategory = () => {
    const categoryCounts = {};
    
    maintenanceRequests.forEach(request => {
      const categoryId = request.equipmentCategoryId;
      if (!categoryCounts[categoryId]) {
        const category = categories.find(c => c.id === categoryId);
        categoryCounts[categoryId] = {
          name: category?.name || `Category #${categoryId}`,
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          corrective: 0,
          preventive: 0,
          predictive: 0
        };
      }
      
      categoryCounts[categoryId].total++;
      
      if (request.stage === 'PENDING') categoryCounts[categoryId].pending++;
      if (request.stage === 'IN_PROGRESS') categoryCounts[categoryId].inProgress++;
      if (request.stage === 'COMPLETED') categoryCounts[categoryId].completed++;
      
      if (request.requestType === 'CORRECTIVE') categoryCounts[categoryId].corrective++;
      if (request.requestType === 'PREVENTIVE') categoryCounts[categoryId].preventive++;
      if (request.requestType === 'PREDICTIVE') categoryCounts[categoryId].predictive++;
    });

    return Object.values(categoryCounts).sort((a, b) => b.total - a.total);
  };

  const getRequestTypeDistribution = () => {
    const distribution = {
      CORRECTIVE: 0,
      PREVENTIVE: 0,
      PREDICTIVE: 0
    };

    maintenanceRequests.forEach(request => {
      if (distribution.hasOwnProperty(request.requestType)) {
        distribution[request.requestType]++;
      }
    });

    return [
      { name: 'Corrective', value: distribution.CORRECTIVE, color: '#ef4444' },
      { name: 'Preventive', value: distribution.PREVENTIVE, color: '#3b82f6' },
      { name: 'Predictive', value: distribution.PREDICTIVE, color: '#a855f7' }
    ];
  };

  const getStageDistribution = () => {
    const distribution = {
      PENDING: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0
    };

    maintenanceRequests.forEach(request => {
      if (distribution.hasOwnProperty(request.stage)) {
        distribution[request.stage]++;
      }
    });

    return [
      { name: 'Pending', value: distribution.PENDING },
      { name: 'Assigned', value: distribution.ASSIGNED },
      { name: 'In Progress', value: distribution.IN_PROGRESS },
      { name: 'Completed', value: distribution.COMPLETED }
    ];
  };

  const exportToCSV = () => {
    const data = reportView === 'team' ? getRequestsByTeam() : getRequestsByCategory();
    const headers = ['Name', 'Total', 'Pending', 'In Progress', 'Completed', 'Corrective', 'Preventive', 'Predictive'];
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        item.name,
        item.total,
        item.pending,
        item.inProgress,
        item.completed,
        item.corrective,
        item.preventive,
        item.predictive
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintenance-report-${reportView}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const teamData = getRequestsByTeam();
  const categoryData = getRequestsByCategory();
  const typeDistribution = getRequestTypeDistribution();
  const stageDistribution = getStageDistribution();
  const currentData = reportView === 'team' ? teamData : categoryData;

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">Maintenance Reports & Analytics</h1>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant={reportView === 'team' ? 'default' : 'outline'}
                onClick={() => setReportView('team')}
                className={reportView === 'team' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'}
              >
                <Users className="w-4 h-4 mr-2" />
                By Team
              </Button>
              <Button
                variant={reportView === 'category' ? 'default' : 'outline'}
                onClick={() => setReportView('category')}
                className={reportView === 'category' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'}
              >
                <Package className="w-4 h-4 mr-2" />
                By Category
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={exportToCSV}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-800">{maintenanceRequests.length}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {maintenanceRequests.filter(r => r.stage === 'PENDING').length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {maintenanceRequests.filter(r => r.stage === 'IN_PROGRESS').length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {maintenanceRequests.filter(r => r.stage === 'COMPLETED').length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200 text-red-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading reports...</div>
        ) : (
          <>
            {/* Bar Chart - Requests by Team/Category */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Number of Requests {reportView === 'team' ? 'per Team' : 'per Equipment Category'}
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#3b82f6" name="Total Requests" />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Request Type Distribution */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Request Type Distribution</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={typeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Stage Distribution */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Request Stage Distribution</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stageDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Pivot Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  Detailed Breakdown - {reportView === 'team' ? 'Teams' : 'Equipment Categories'}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left text-gray-600 font-medium px-6 py-3 text-sm">
                        {reportView === 'team' ? 'Team Name' : 'Category Name'}
                      </th>
                      <th className="text-center text-gray-600 font-medium px-6 py-3 text-sm">Total</th>
                      <th className="text-center text-gray-600 font-medium px-6 py-3 text-sm">Pending</th>
                      <th className="text-center text-gray-600 font-medium px-6 py-3 text-sm">In Progress</th>
                      <th className="text-center text-gray-600 font-medium px-6 py-3 text-sm">Completed</th>
                      <th className="text-center text-gray-600 font-medium px-6 py-3 text-sm">Corrective</th>
                      <th className="text-center text-gray-600 font-medium px-6 py-3 text-sm">Preventive</th>
                      <th className="text-center text-gray-600 font-medium px-6 py-3 text-sm">Predictive</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((item, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${
                          index === currentData.length - 1 ? 'border-b-0' : ''
                        }`}
                      >
                        <td className="px-6 py-3 font-medium text-gray-800">{item.name}</td>
                        <td className="px-6 py-3 text-center font-semibold text-gray-800">{item.total}</td>
                        <td className="px-6 py-3 text-center text-gray-700">{item.pending}</td>
                        <td className="px-6 py-3 text-center text-gray-700">{item.inProgress}</td>
                        <td className="px-6 py-3 text-center text-gray-700">{item.completed}</td>
                        <td className="px-6 py-3 text-center text-gray-700">{item.corrective}</td>
                        <td className="px-6 py-3 text-center text-gray-700">{item.preventive}</td>
                        <td className="px-6 py-3 text-center text-gray-700">{item.predictive}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}