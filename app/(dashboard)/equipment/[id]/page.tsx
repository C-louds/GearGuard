"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Wrench, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function EquipmentDetail() {
 const router = useRouter();
  const params = useParams<{ equipmentId: string }>();
  const equipmentId = params.id;
  console.log("params:", params)
console.log("equipmentId:", equipmentId)

  const [equipment, setEquipment] = useState(null);
  const [category, setCategory] = useState(null);
  const [department, setDepartment] = useState(null);
  const [assignedEmployee, setAssignedEmployee] = useState(null);
  const [technician, setTechnician] = useState(null);
  const [maintenanceTeam, setMaintenanceTeam] = useState(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);

  useEffect(() => {
    fetchEquipmentDetails();
  }, [equipmentId]);

  const fetchEquipmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch equipment details
      const equipmentRes = await fetch(`/api/equipment/${equipmentId}`);
      if (!equipmentRes.ok) {
        throw new Error('Failed to fetch equipment details');
      }
      const equipmentData = await equipmentRes.json();
      setEquipment(equipmentData);

      // Fetch related data in parallel
      const [categoryRes, deptRes, empRes, techRes, teamRes, maintenanceRes] = await Promise.all([
        equipmentData.categoryId ? fetch(`/api/categories/${equipmentData.categoryId}`) : null,
        equipmentData.departmentId ? fetch(`/api/departments/${equipmentData.departmentId}`) : null,
        equipmentData.assignedEmployeeId ? fetch(`/api/employees/${equipmentData.assignedEmployeeId}`) : null,
        equipmentData.defaultTechnicianId ? fetch(`/api/employees/${equipmentData.defaultTechnicianId}`) : null,
        equipmentData.maintenanceTeamId ? fetch(`/api/teams/${equipmentData.maintenanceTeamId}`) : null,
        fetch(`/api/maintenance?equipmentId=${equipmentId}`)
      ]);

      if (categoryRes?.ok) setCategory(await categoryRes.json());
      if (deptRes?.ok) setDepartment(await deptRes.json());
      if (empRes?.ok) setAssignedEmployee(await empRes.json());
      if (techRes?.ok) setTechnician(await techRes.json());
      if (teamRes?.ok) setMaintenanceTeam(await teamRes.json());
      if (maintenanceRes?.ok) setMaintenanceRequests(await maintenanceRes.json());

    } catch (err) {
      setError(err.message);
      console.error('Error fetching equipment details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEquipment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch(`/api/equipment/${equipmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipment)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update equipment');
      }

      alert('Equipment updated successfully!');
      await fetchEquipmentDetails();
    } catch (err) {
      setError(err.message);
      console.error('Error saving equipment:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading equipment details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !equipment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-8">
        <div className="max-w-7xl mx-auto">
          <Alert className="bg-red-50 border-red-200 text-red-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-semibold text-gray-800">Equipment</h1>
              <p className="text-sm text-gray-500 mt-1">ID: {equipment?.id} | Serial: {equipment?.serialNumber}</p>
            </div>
          </div>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200 text-red-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Form */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 mb-6">
          {/* Maintenance Requests Button */}
          <div className="mb-8 flex justify-end">
            <Dialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="border-orange-400 text-orange-600 hover:bg-orange-50"
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  Maintenance ({maintenanceRequests.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-gray-200 text-gray-800 max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Maintenance Requests</DialogTitle>
                  <DialogDescription>
                    Maintenance requests for {equipment?.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  {maintenanceRequests.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No maintenance requests found</p>
                  ) : (
                    maintenanceRequests.map((request) => (
                      <div 
                        key={request.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => window.location.href = `/maintenance/${request.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-800">{request.subject}</h3>
                            <p className="text-sm text-gray-500 mt-1">{request.description}</p>
                            <div className="flex gap-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                request.stage === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                request.stage === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-700' :
                                request.stage === 'ASSIGNED' ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {request.stage}
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                                {request.requestType}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(request.scheduledDate)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-2 gap-x-16 gap-y-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-gray-700 mb-2 block">Name</Label>
                <Input
                  id="name"
                  value={equipment?.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-white border-b-2 border-t-0 border-x-0 border-gray-300 rounded-none px-0 focus:ring-0 focus:border-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="serialNumber" className="text-gray-700 mb-2 block">Serial Number</Label>
                <Input
                  id="serialNumber"
                  value={equipment?.serialNumber || ''}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  className="bg-white border-b-2 border-t-0 border-x-0 border-gray-300 rounded-none px-0 focus:ring-0 focus:border-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-gray-700 mb-2 block">Equipment Category</Label>
                <Input
                  id="category"
                  value={category?.name || equipment?.categoryId || ''}
                  disabled
                  className="bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 rounded-none px-0 focus:ring-0"
                />
              </div>

              <div>
                <Label htmlFor="department" className="text-gray-700 mb-2 block">Department</Label>
                <Input
                  id="department"
                  value={department?.name || equipment?.departmentId || ''}
                  disabled
                  className="bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 rounded-none px-0 focus:ring-0"
                />
              </div>

              <div>
                <Label htmlFor="maintenanceTeam" className="text-gray-700 mb-2 block">Maintenance Team</Label>
                <Input
                  id="maintenanceTeam"
                  value={maintenanceTeam?.name || equipment?.maintenanceTeamId || ''}
                  disabled
                  className="bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 rounded-none px-0 focus:ring-0"
                />
              </div>

              <div>
                <Label htmlFor="location" className="text-gray-700 mb-2 block">Location</Label>
                <Input
                  id="location"
                  value={equipment?.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="bg-white border-b-2 border-t-0 border-x-0 border-gray-300 rounded-none px-0 focus:ring-0 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="technician" className="text-gray-700 mb-2 block">Default Technician</Label>
                <Input
                  id="technician"
                  value={technician?.name || equipment?.defaultTechnicianId || 'Not assigned'}
                  disabled
                  className="bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 rounded-none px-0 focus:ring-0"
                />
              </div>

              <div>
                <Label htmlFor="employee" className="text-gray-700 mb-2 block">Assigned Employee</Label>
                <Input
                  id="employee"
                  value={assignedEmployee?.name || equipment?.assignedEmployeeId || 'Not assigned'}
                  disabled
                  className="bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 rounded-none px-0 focus:ring-0"
                />
              </div>

              <div>
                <Label htmlFor="purchaseDate" className="text-gray-700 mb-2 block">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={equipment?.purchaseDate ? equipment.purchaseDate.split('T')[0] : ''}
                  onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                  className="bg-white border-b-2 border-t-0 border-x-0 border-gray-300 rounded-none px-0 focus:ring-0 focus:border-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="warrantyExpiryDate" className="text-gray-700 mb-2 block">Warranty Expiry</Label>
                <Input
                  id="warrantyExpiryDate"
                  type="date"
                  value={equipment?.warrantyExpiryDate ? equipment.warrantyExpiryDate.split('T')[0] : ''}
                  onChange={(e) => handleInputChange('warrantyExpiryDate', e.target.value)}
                  className="bg-white border-b-2 border-t-0 border-x-0 border-gray-300 rounded-none px-0 focus:ring-0 focus:border-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="status" className="text-gray-700 mb-2 block">Status</Label>
                <select
                  id="status"
                  value={equipment?.status || 'ACTIVE'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full bg-white border-b-2 border-t-0 border-x-0 border-gray-300 rounded-none px-0 py-2 focus:ring-0 focus:border-blue-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="MAINTENANCE">Under Maintenance</option>
                  <option value="RETIRED">Retired</option>
                </select>
              </div>
            </div>

            {/* Description - Full Width */}
            <div className="col-span-2 mt-4">
              <Label htmlFor="description" className="text-gray-700 mb-2 block">Notes / Description</Label>
              <Textarea
                id="description"
                value={equipment?.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                placeholder="Add any additional notes about this equipment..."
                className="bg-white border-b-2 border-t-0 border-x-0 border-gray-300 rounded-none px-0 focus:ring-0 focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Timestamps</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-800">{formatDate(equipment?.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="text-gray-800">{formatDate(equipment?.updatedAt)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Maintenance Requests:</span>
                <span className="text-gray-800 font-medium">{maintenanceRequests.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Open Requests:</span>
                <span className="text-orange-600 font-medium">
                  {maintenanceRequests.filter(r => r.stage !== 'COMPLETED').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed Requests:</span>
                <span className="text-green-600 font-medium">
                  {maintenanceRequests.filter(r => r.stage === 'COMPLETED').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}