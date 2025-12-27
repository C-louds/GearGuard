"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Clock, User, Wrench, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RequestData {
  id: number;
  subject: string;
  description: string | null;
  equipmentId: number;
  equipmentCategoryId: number;
  maintenanceTeamId: number;
  requestType: 'CORRECTIVE' | 'PREVENTIVE';
  stage: 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'REPAIRED' | 'SCRAPPED';
  requestedById: number;
  assignedToId: number | null;
  scheduledDate: string | null;
  completedDate: string | null;
  durationHours: number | null;
  createdAt: string;
  updatedAt: string;

  equipment: {
    id: number;
    name: string;
    serialNumber: string;
    location: string;
  };
  equipmentCategory: {
    id: number;
    name: string;
  };
  maintenanceTeam: {
    id: number;
    name: string;
  };
  requestedBy: {
    id: number;
    name: string;
    email: string;
  };
  assignedTo: {
    id: number;
    employee: {
      name: string;
      email: string;
    };
  } | null;
}

export default function MaintenanceRequestDetail() {
  const router = useRouter();
  const params = useParams<{ requestId: string }>();
  const requestId = params.id;
  console.log("params:", params)
console.log("requestId:", requestId)

  const [request, setRequest] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (requestId) {
      fetchRequestDetail();
    }
  }, [requestId]);

  const fetchRequestDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("============================"+requestId+"\n");
      const response = await fetch(`/api/maintenance/${requestId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch maintenance request');
      }
      
      const data = await response.json();
      setRequest(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching request:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!request) return;

    try {
      setIsSaving(true);
      setError(null);
      
      const response = await fetch(`/api/maintenance/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: request.subject,
          description: request.description,
          requestType: request.requestType,
          stage: request.stage,
          assignedToId: request.assignedToId,
          scheduledDate: request.scheduledDate,
          completedDate: request.completedDate,
          durationHours: request.durationHours,
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update request');
      }
      
      alert('Request updated successfully!');
      fetchRequestDetail(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof RequestData, value: any) => {
    setRequest(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const getStageColor = (stage: string) => {
    switch(stage) {
      case 'NEW': return 'bg-red-100 text-red-800 border-red-300';
      case 'ASSIGNED': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'REPAIRED': return 'bg-green-100 text-green-800 border-green-300';
      case 'SCRAPPED': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 16);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20 text-gray-500">Loading request details...</div>
        </div>
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-8">
        <div className="max-w-6xl mx-auto">
          <Alert className="bg-red-50 border-red-200 text-red-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={() => router.back()} 
            variant="outline" 
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!request) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-semibold text-gray-800">
                {request.subject}
              </h1>
              <p className="text-sm text-gray-500 mt-1">Request ID: #{request.id}</p>
            </div>
          </div>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200 text-red-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Status Badge */}
        <div className="mb-6">
          <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border ${getStageColor(request.stage)}`}>
            <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
            {request.stage.replace('_', ' ')}
          </span>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="col-span-2 space-y-6">
            {/* Request Information Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                Request Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject" className="text-gray-700">Subject</Label>
                  <Input
                    id="subject"
                    value={request.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="mt-1 bg-white border-gray-200"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-700">Description</Label>
                  <Textarea
                    id="description"
                    value={request.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="mt-1 bg-white border-gray-200"
                    placeholder="Detailed description of the maintenance request..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="requestType" className="text-gray-700">Request Type</Label>
                    <select
                      id="requestType"
                      value={request.requestType}
                      onChange={(e) => handleInputChange('requestType', e.target.value)}
                      className="mt-1 w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm"
                    >
                      <option value="CORRECTIVE">Corrective (Breakdown)</option>
                      <option value="PREVENTIVE">Preventive (Scheduled)</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="stage" className="text-gray-700">Stage</Label>
                    <select
                      id="stage"
                      value={request.stage}
                      onChange={(e) => handleInputChange('stage', e.target.value)}
                      className="mt-1 w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm"
                    >
                      <option value="NEW">New</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="REPAIRED">Repaired</option>
                      <option value="SCRAPPED">Scrapped</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Equipment & Assignment Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Wrench className="w-5 h-5 mr-2 text-gray-600" />
                Equipment & Assignment
              </h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Equipment</p>
                      <p className="text-sm font-medium text-gray-800">{request.equipment.name}</p>
                      <p className="text-xs text-gray-500">SN: {request.equipment.serialNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="text-sm font-medium text-gray-800">{request.equipment.location}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Category</p>
                      <p className="text-sm font-medium text-gray-800">{request.equipmentCategory.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Maintenance Team</p>
                      <p className="text-sm font-medium text-gray-800">{request.maintenanceTeam.name}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="assignedToId" className="text-gray-700">Assigned Technician</Label>
                  <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                    {request.assignedTo ? (
                      <div>
                        <p className="font-medium text-gray-800">{request.assignedTo.employee.name}</p>
                        <p className="text-xs text-gray-500">{request.assignedTo.employee.email}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Unassigned</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    To change assignment, use the stage transitions
                  </p>
                </div>
              </div>
            </div>

            {/* Scheduling Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                Scheduling & Duration
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledDate" className="text-gray-700">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    value={formatDateForInput(request.scheduledDate)}
                    onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    className="mt-1 bg-white border-gray-200"
                  />
                  {request.requestType === 'PREVENTIVE' && !request.scheduledDate && (
                    <p className="text-xs text-red-500 mt-1">Required for preventive maintenance</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="completedDate" className="text-gray-700">Completed Date</Label>
                  <Input
                    id="completedDate"
                    type="datetime-local"
                    value={formatDateForInput(request.completedDate)}
                    onChange={(e) => handleInputChange('completedDate', e.target.value)}
                    className="mt-1 bg-white border-gray-200"
                    disabled={request.stage !== 'REPAIRED'}
                  />
                </div>

                <div>
                  <Label htmlFor="durationHours" className="text-gray-700">Duration (Hours)</Label>
                  <Input
                    id="durationHours"
                    type="number"
                    step="0.5"
                    value={request.durationHours || ''}
                    onChange={(e) => handleInputChange('durationHours', parseFloat(e.target.value))}
                    className="mt-1 bg-white border-gray-200"
                    placeholder="e.g., 2.5"
                  />
                  {request.stage === 'REPAIRED' && !request.durationHours && (
                    <p className="text-xs text-red-500 mt-1">Duration required for completed requests</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Metadata */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Info</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <User className="w-4 h-4 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Requested By</p>
                    <p className="text-sm font-medium text-gray-800">{request.requestedBy.name}</p>
                    <p className="text-xs text-gray-500">{request.requestedBy.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Wrench className="w-4 h-4 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Assigned To</p>
                    <p className="text-sm font-medium text-gray-800">
                      {request.assignedTo ? request.assignedTo.employee.name : 'Unassigned'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-4 h-4 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm font-medium text-gray-800">{formatDate(request.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-4 h-4 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm font-medium text-gray-800">{formatDate(request.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Alert */}
            {request.requestType === 'CORRECTIVE' && request.stage === 'NEW' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-red-800">High Priority</h3>
                    <p className="text-xs text-red-700 mt-1">
                      This corrective maintenance request requires immediate attention.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions</h2>
              
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-gray-300"
                  onClick={() => router.push(`/equipment/${request.equipmentId}`)}
                >
                  View Equipment
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-gray-300"
                  onClick={() => router.push(`/equipment/${request.equipmentId}?tab=history`)}
                >
                  View History
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    if (confirm('Are you sure you want to mark this equipment as scrapped?')) {
                      handleInputChange('stage', 'SCRAPPED');
                      handleSave();
                    }
                  }}
                  disabled={request.stage === 'SCRAPPED'}
                >
                  Mark as Scrapped
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}