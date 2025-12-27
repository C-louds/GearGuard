"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MaintenanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [userRole, setUserRole] = useState('manager');

  useEffect(() => {
    fetchMaintenanceRequests();
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
    }
  };

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/maintenance');
      
      if (!response.ok) {
        throw new Error('Failed to fetch maintenance requests');
      }
      
      const data = await response.json();
      setMaintenanceRequests(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching maintenance:', err);
    } finally {
      setLoading(false);
    }
  };

  const canViewRequest = (request) => {
    if (userRole === 'manager' || userRole === 'admin') {
      return true;
    }
    
    if (userRole === 'technician') {
      return true;
    }
    
    return false;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getRequestsForDate = (date) => {
    return maintenanceRequests.filter(request => {
      if (!canViewRequest(request)) return false;
      if (filterType !== 'all' && request.requestType !== filterType) return false;
      
      const scheduledDate = request.scheduledDate ? new Date(request.scheduledDate) : null;
      if (!scheduledDate) return false;
      
      return (
        scheduledDate.getDate() === date.getDate() &&
        scheduledDate.getMonth() === date.getMonth() &&
        scheduledDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'CORRECTIVE': return 'bg-red-500';
      case 'PREVENTIVE': return 'bg-blue-500';
      case 'PREDICTIVE': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStageColor = (stage) => {
    switch(stage) {
      case 'PENDING': return 'border-yellow-400';
      case 'ASSIGNED': return 'border-blue-400';
      case 'IN_PROGRESS': return 'border-orange-400';
      case 'COMPLETED': return 'border-green-400';
      default: return 'border-gray-400';
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const handleRequestClick = (requestId) => {
    window.location.href = `/maintenance/${requestId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">Maintenance Calendar</h1>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth(-1)}
                className="border-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <h2 className="text-xl font-semibold text-gray-800 min-w-[200px] text-center">
                {monthName}
              </h2>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth(1)}
                className="border-gray-300"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="border-gray-300"
              >
                Today
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Filter:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-gray-700"
              >
                <option value="all">All Types</option>
                <option value="CORRECTIVE">Corrective</option>
                <option value="PREVENTIVE">Preventive</option>
                <option value="PREDICTIVE">Predictive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600">Corrective</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Preventive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-gray-600">Predictive</span>
            </div>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200 text-red-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading calendar...</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 border-b border-gray-200">
              {weekDays.map(day => (
                <div
                  key={day}
                  className="px-4 py-3 text-center text-sm font-semibold text-gray-600 bg-gray-50 border-r border-gray-200 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const date = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
                const requests = date ? getRequestsForDate(date) : [];
                const isToday = date && 
                  date.getDate() === new Date().getDate() &&
                  date.getMonth() === new Date().getMonth() &&
                  date.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border-r border-b border-gray-200 ${
                      !day ? 'bg-gray-50' : ''
                    } ${isToday ? 'bg-blue-50' : ''}`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-2 ${
                          isToday ? 'text-blue-600 font-bold' : 'text-gray-700'
                        }`}>
                          {day}
                          {isToday && (
                            <span className="ml-1 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {requests.map(request => (
                            <button
                              key={request.id}
                              onClick={() => handleRequestClick(request.id)}
                              className={`w-full text-left px-2 py-1 rounded text-xs border-l-2 ${getStageColor(request.stage)} bg-white hover:bg-gray-50 transition-colors`}
                            >
                              <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${getTypeColor(request.requestType)}`}></div>
                                <span className="font-medium text-gray-800 truncate">
                                  {request.subject}
                                </span>
                              </div>
                              <div className="text-gray-500 text-[10px] mt-0.5">
                                {new Date(request.scheduledDate).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && maintenanceRequests.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No scheduled maintenance requests found
          </div>
        )}
      </div>
    </div>
  );
}