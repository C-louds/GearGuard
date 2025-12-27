"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function EquipmentManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newEquipment, setNewEquipment] = useState({
    name: '',
    serialNumber: '',
    categoryId: '',
    departmentId: '',
    assignedEmployeeId: '',
    maintenanceTeamId: '',
    defaultTechnicianId: '',
    location: '',
    purchaseDate: '',
    warrantyExpiryDate: ''
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/equipment');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch equipment: ${response.status}`);
      }
      
      const data = await response.json();
      setEquipment(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipment.filter(item =>
    Object.values(item).some(value =>
      value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleAddEquipment = async () => {
    try {
      setError(null);
      
      const equipmentData = {
        name: newEquipment.name,
        serialNumber: newEquipment.serialNumber,
        categoryId: newEquipment.categoryId ? parseInt(newEquipment.categoryId) : null,
        departmentId: newEquipment.departmentId ? parseInt(newEquipment.departmentId) : null,
        assignedEmployeeId: newEquipment.assignedEmployeeId ? parseInt(newEquipment.assignedEmployeeId) : null,
        maintenanceTeamId: newEquipment.maintenanceTeamId ? parseInt(newEquipment.maintenanceTeamId) : null,
        defaultTechnicianId: newEquipment.defaultTechnicianId ? parseInt(newEquipment.defaultTechnicianId) : null,
        location: newEquipment.location || null,
        purchaseDate: newEquipment.purchaseDate || null,
        warrantyExpiryDate: newEquipment.warrantyExpiryDate || null
      };

      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add equipment');
      }

      await fetchEquipment();
      
      setNewEquipment({
        name: '',
        serialNumber: '',
        categoryId: '',
        departmentId: '',
        assignedEmployeeId: '',
        maintenanceTeamId: '',
        defaultTechnicianId: '',
        location: '',
        purchaseDate: '',
        warrantyExpiryDate: ''
      });
      
      setIsDialogOpen(false);
    } catch (err) {
      setError(err.message);
      console.error('Error adding equipment:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">Equipment</h1>
          
          <div className="flex items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-200 text-gray-700 placeholder:text-gray-400 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            {/* New Button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm border-0">
                  <Plus className="w-4 h-4 mr-2" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-gray-200 text-gray-800 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-gray-800">Add New Equipment</DialogTitle>
                  <DialogDescription className="text-gray-500">
                    Enter the details of the new equipment item.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">Equipment Name</Label>
                    <Input
                      id="name"
                      value={newEquipment.name}
                      onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                      className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber" className="text-gray-700">Serial Number</Label>
                    <Input
                      id="serialNumber"
                      value={newEquipment.serialNumber}
                      onChange={(e) => setNewEquipment({...newEquipment, serialNumber: e.target.value})}
                      className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryId" className="text-gray-700">Category ID</Label>
                    <Input
                      id="categoryId"
                      type="number"
                      value={newEquipment.categoryId}
                      onChange={(e) => setNewEquipment({...newEquipment, categoryId: e.target.value})}
                      className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departmentId" className="text-gray-700">Department ID</Label>
                    <Input
                      id="departmentId"
                      type="number"
                      value={newEquipment.departmentId}
                      onChange={(e) => setNewEquipment({...newEquipment, departmentId: e.target.value})}
                      className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignedEmployeeId" className="text-gray-700">Employee ID</Label>
                    <Input
                      id="assignedEmployeeId"
                      type="number"
                      value={newEquipment.assignedEmployeeId}
                      onChange={(e) => setNewEquipment({...newEquipment, assignedEmployeeId: e.target.value})}
                      className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenanceTeamId" className="text-gray-700">Maintenance Team ID</Label>
                    <Input
                      id="maintenanceTeamId"
                      type="number"
                      value={newEquipment.maintenanceTeamId}
                      onChange={(e) => setNewEquipment({...newEquipment, maintenanceTeamId: e.target.value})}
                      className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultTechnicianId" className="text-gray-700">Technician ID</Label>
                    <Input
                      id="defaultTechnicianId"
                      type="number"
                      value={newEquipment.defaultTechnicianId}
                      onChange={(e) => setNewEquipment({...newEquipment, defaultTechnicianId: e.target.value})}
                      className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-gray-700">Location</Label>
                    <Input
                      id="location"
                      value={newEquipment.location}
                      onChange={(e) => setNewEquipment({...newEquipment, location: e.target.value})}
                      className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchaseDate" className="text-gray-700">Purchase Date</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={newEquipment.purchaseDate}
                      onChange={(e) => setNewEquipment({...newEquipment, purchaseDate: e.target.value})}
                      className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warrantyExpiryDate" className="text-gray-700">Warranty Expiry Date</Label>
                    <Input
                      id="warrantyExpiryDate"
                      type="date"
                      value={newEquipment.warrantyExpiryDate}
                      onChange={(e) => setNewEquipment({...newEquipment, warrantyExpiryDate: e.target.value})}
                      className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    Cancel
                  </Button>
                  <Button onClick={handleAddEquipment} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Add Equipment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200 text-red-800">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading equipment...</span>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left text-gray-600 font-medium px-6 py-4 text-sm">Equipment Name</th>
                      <th className="text-left text-gray-600 font-medium px-6 py-4 text-sm">Serial Number</th>
                      <th className="text-left text-gray-600 font-medium px-6 py-4 text-sm">Location</th>
                      <th className="text-left text-gray-600 font-medium px-6 py-4 text-sm">Category ID</th>
                      <th className="text-left text-gray-600 font-medium px-6 py-4 text-sm">Department ID</th>
                      <th className="text-left text-gray-600 font-medium px-6 py-4 text-sm">Employee ID</th>
                      <th className="text-left text-gray-600 font-medium px-6 py-4 text-sm">Purchase Date</th>
                      <th className="text-left text-gray-600 font-medium px-6 py-4 text-sm">Warranty Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEquipment.map((item, index) => (
                      <tr 
                        key={item.id} 
                        className={`border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors ${
                          index === filteredEquipment.length - 1 ? 'border-b-0' : ''
                        }`}
                      >
                        <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                        <td className="px-6 py-4 font-mono text-sm text-gray-600">{item.serialNumber}</td>
                        <td className="px-6 py-4 text-gray-700">{item.location || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-700">{item.categoryId || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-700">{item.departmentId || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-700">{item.assignedEmployeeId || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-700">{formatDate(item.purchaseDate)}</td>
                        <td className="px-6 py-4 text-gray-700">{formatDate(item.warrantyExpiryDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredEquipment.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                No equipment found matching your search.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}