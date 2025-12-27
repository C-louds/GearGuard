"use client";   
import React, { useState, useEffect } from 'react';
import { Search, Plus, AlertCircle, ChevronDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from "next/navigation";

export default function MaintenanceDashboard() {
    const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('maintenance');
  const [filterStage, setFilterStage] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newRequest, setNewRequest] = useState({
    subject: '',
    description: '',
    equipmentId: '',
    equipmentCategoryId: '',
    maintenanceTeamId: '',
    requestType: 'CORRECTIVE',
    requestedById: '',
    assignedToId: '',
    scheduledDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [maintenanceRes, employeesRes, equipmentRes] = await Promise.all([
        fetch('/api/maintenance'),
        fetch('/api/employees'),
        fetch('/api/equipment')
      ]);
      
      if (maintenanceRes.ok) {
        const data = await maintenanceRes.json();
        setMaintenanceRequests(data);
      }
      
      if (employeesRes.ok) {
        const empData = await employeesRes.json();
        setEmployees(empData);
      }
      
      if (equipmentRes.ok) {
        const eqData = await equipmentRes.json();
        setEquipment(eqData);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleRequestClick = (requestId) => {

    console.log('Navigate to maintenance request:', requestId);
    router.push(`/maintenance/${requestId}`);
    
  };

  const handleCreateRequest = async () => {
    try {
      setError(null);
      
      const requestData = {
        ...newRequest,
        equipmentId: newRequest.equipmentId ? parseInt(newRequest.equipmentId) : null,
        equipmentCategoryId: newRequest.equipmentCategoryId ? parseInt(newRequest.equipmentCategoryId) : null,
        maintenanceTeamId: newRequest.maintenanceTeamId ? parseInt(newRequest.maintenanceTeamId) : null,
        requestedById: newRequest.requestedById ? parseInt(newRequest.requestedById) : null,
        assignedToId: newRequest.assignedToId ? parseInt(newRequest.assignedToId) : null,
      };

      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create request');
      }

      await fetchData();
      setIsDialogOpen(false);
      setNewRequest({
        subject: '',
        description: '',
        equipmentId: '',
        equipmentCategoryId: '',
        maintenanceTeamId: '',
        requestType: 'CORRECTIVE',
        requestedById: '',
        assignedToId: '',
        scheduledDate: ''
      });
    } catch (err) {
      setError(err.message);
      console.error('Error creating request:', err);
    }
  };

  const filteredRequests = maintenanceRequests.filter(request => {
    const matchesSearch = Object.values(request).some(value =>
      value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesStage = filterStage === 'all' || request.stage === filterStage;
    const matchesType = filterType === 'all' || request.requestType === filterType;
    
    return matchesSearch && matchesStage && matchesType;
  });

  // Calculate statistics
  const criticalCount = maintenanceRequests.filter(r => 
    r.stage === 'PENDING' && r.requestType === 'CORRECTIVE'
  ).length;

  const assignedCount = maintenanceRequests.filter(r => 
    r.assignedToId && r.stage !== 'COMPLETED'
  ).length;

  const totalActiveCount = maintenanceRequests.filter(r => 
    r.stage !== 'COMPLETED'
  ).length;

  const pendingCount = maintenanceRequests.filter(r => r.stage === 'PENDING').length;
  const inProgressCount = maintenanceRequests.filter(r => r.stage === 'IN_PROGRESS').length;
  const overdueCount = maintenanceRequests.filter(r => 
    r.scheduledDate && new Date(r.scheduledDate) < new Date() && r.stage !== 'COMPLETED'
  ).length;

  const getStageColor = (stage) => {
    switch(stage) {
      case 'PENDING': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'ASSIGNED': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'IN_PROGRESS': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'COMPLETED': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'CORRECTIVE': return 'text-red-700 bg-red-50';
      case 'PREVENTIVE': return 'text-blue-700 bg-blue-50';
      case 'PREDICTIVE': return 'text-purple-700 bg-purple-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">Maintenance Requests</h1>
          
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-200 text-gray-700 placeholder:text-gray-400 shadow-sm"
              />
            </div>

            {/* Stage Filter */}
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stages</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="CORRECTIVE">Corrective</option>
              <option value="PREVENTIVE">Preventive</option>
              <option value="PREDICTIVE">Predictive</option>
            </select>

            {/* New Request Button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-gray-200 text-gray-800 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-gray-800">Create Maintenance Request</DialogTitle>
                  <DialogDescription className="text-gray-500">
                    Submit a new maintenance request for equipment
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="col-span-2">
                    <Label htmlFor="subject" className="text-gray-700">Subject</Label>
                    <Input
                      id="subject"
                      value={newRequest.subject}
                      onChange={(e) => setNewRequest({...newRequest, subject: e.target.value})}
                      className="bg-white border-gray-200"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description" className="text-gray-700">Description</Label>
                    <Textarea
                      id="description"
                      value={newRequest.description}
                      onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                      className="bg-white border-gray-200"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="equipmentId" className="text-gray-700">Equipment ID</Label>
                    <Input
                      id="equipmentId"
                      type="number"
                      value={newRequest.equipmentId}
                      onChange={(e) => setNewRequest({...newRequest, equipmentId: e.target.value})}
                      className="bg-white border-gray-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="requestType" className="text-gray-700">Request Type</Label>
                    <select
                      id="requestType"
                      value={newRequest.requestType}
                      onChange={(e) => setNewRequest({...newRequest, requestType: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm"
                    >
                      <option value="CORRECTIVE">Corrective</option>
                      <option value="PREVENTIVE">Preventive</option>
                      <option value="PREDICTIVE">Predictive</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="requestedById" className="text-gray-700">Requested By (Employee ID)</Label>
                    <Input
                      id="requestedById"
                      type="number"
                      value={newRequest.requestedById}
                      onChange={(e) => setNewRequest({...newRequest, requestedById: e.target.value})}
                      className="bg-white border-gray-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignedToId" className="text-gray-700">Assign To (Technician ID)</Label>
                    <Input
                      id="assignedToId"
                      type="number"
                      value={newRequest.assignedToId}
                      onChange={(e) => setNewRequest({...newRequest, assignedToId: e.target.value})}
                      className="bg-white border-gray-200"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="scheduledDate" className="text-gray-700">Scheduled Date</Label>
                    <Input
                      id="scheduledDate"
                      type="datetime-local"
                      value={newRequest.scheduledDate}
                      onChange={(e) => setNewRequest({...newRequest, scheduledDate: e.target.value})}
                      className="bg-white border-gray-200"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-300">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRequest} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Create Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">Critical Equipment</h3>
                <AlertCircle className="w-5 h-5 opacity-75" />
              </div>
              <div className="text-3xl font-bold mb-1">{criticalCount} Units</div>
              <div className="text-xs opacity-75">(Requires immediate attention)</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">Technician Load</h3>
              </div>
              <div className="text-3xl font-bold mb-1">{assignedCount > 0 ? '85%' : '0%'} Utilized</div>
              <div className="text-xs opacity-75">({assignedCount} active assignments)</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">Open Requests</h3>
              </div>
              <div className="text-3xl font-bold mb-1">{inProgressCount} In Progress</div>
              <div className="text-xs opacity-75">{pendingCount} Pending · {overdueCount} Overdue</div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200 text-red-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Requests Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading maintenance requests...</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-gray-600 font-medium px-6 py-4 text-sm">Subject</th>
                    <th className="text-left text-gray-600 font-medium px-6 py-4 text-sm">Equipment</th>
                    <th className="text-left text-gray-600 font-medium px-6 py-4 text-sm">Type</th>
                    <th className="text-left text-gray-600 font-medium px-6 py-4 text-sm">Requested By</th>
                    <th className="text-left text-gray-600 font-medium px-6 py-4 text-sm">Assigned To</th>
                    <th className="text-left text-gray-600 font-medium px-6 py-4 text-sm">Scheduled</th>
                    <th className="text-left text-gray-600 font-medium px-6 py-4 text-sm">Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-gray-500">
                        No maintenance requests found
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request, index) => {
                      const equipmentItem = equipment.find(e => e.id === request.equipmentId);
                      const requestedBy = employees.find(e => e.id === request.requestedById);
                      const assignedTo = employees.find(e => e.id === request.assignedToId);
                      
                      return (
                        <tr 
                          key={request.id}
                          onClick={() => handleRequestClick(request.id)}
                          className={`border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer transition-colors ${
                            index === filteredRequests.length - 1 ? 'border-b-0' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-800">{request.subject}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{request.description}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {equipmentItem?.name || `Equipment #${request.equipmentId}`}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getTypeColor(request.requestType)}`}>
                              {request.requestType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {requestedBy?.name || `Employee #${request.requestedById}`}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {assignedTo?.name || (request.assignedToId ? `Tech #${request.assignedToId}` : 'Unassigned')}
                          </td>
                          <td className="px-6 py-4 text-gray-700 text-sm">
                            {formatDate(request.scheduledDate)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStageColor(request.stage)}`}>
                              {request.stage.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}