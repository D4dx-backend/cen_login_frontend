import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEye, FiSettings, FiTrash2, FiUsers, FiPlus, FiSmartphone, FiX, FiAlertTriangle } from 'react-icons/fi';

const API_BASE_URL = 'http://localhost:3000/api';

export default function AppList() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);
  const [newAppName, setNewAppName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/apps`);
      if (response.data.success) {
        setApps(response.data.data || []);
      } else {
        setError('Failed to fetch apps');
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
      setError('Failed to fetch apps from server');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApp = async (e) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    try {
      setCreating(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(`${API_BASE_URL}/apps`, 
        { title: newAppName },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        resetForm();
        fetchApps(); // Refresh the list
      }
    } catch (error) {
      console.error('Error creating app:', error);
      alert('Failed to create app');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setNewAppName('');
    setShowCreateForm(false);
  };

  const handleDeleteApp = (app) => {
    setAppToDelete(app);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!appToDelete) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_BASE_URL}/apps/${appToDelete._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchApps(); // Refresh the list
      setShowDeleteConfirm(false);
      setAppToDelete(null);
    } catch (error) {
      console.error('Error deleting app:', error);
      alert('Failed to delete app');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setAppToDelete(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Live': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Development': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Deprecated': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
        <div className="text-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5041BC] mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
        <div className="text-center py-8 sm:py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchApps}
            className="px-4 py-2 bg-[#5041BC] text-white rounded-lg hover:bg-[#6C63FF] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Applications ({apps.length})</h3>
          <p className="text-sm text-gray-500 mt-1">Manage and monitor your applications</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center justify-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-[#5041BC] to-[#6C63FF] hover:from-[#6C63FF] hover:to-[#5041BC] rounded-lg px-5 py-2.5 shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
        >
          <FiPlus className="w-4 h-4" />
          <span>Create App</span>
        </button>
      </div>

      {/* Apps Grid */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        {apps.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <FiSmartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No applications found</h3>
            <p className="text-sm text-gray-400 mb-6">Create your first application to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-[#5041BC] to-[#6C63FF] hover:from-[#6C63FF] hover:to-[#5041BC] rounded-lg px-5 py-2.5 shadow-md hover:shadow-lg transition-all duration-200 mx-auto"
            >
              <FiPlus className="w-4 h-4" />
              <span>Create First App</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {apps.map((app) => (
              <div
                key={app._id}
                className={`relative bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:scale-[1.02] hover:border-[#5041BC]/30 ${
                  hoveredCard === app._id ? 'shadow-xl scale-[1.02] border-[#5041BC]/50' : ''
                }`}
                onMouseEnter={() => setHoveredCard(app._id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* App Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl bg-[#5041BC]/10 p-2.5 rounded-lg text-[#5041BC] flex-shrink-0">
                      <FiSmartphone />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-gray-800 group-hover:text-[#5041BC] transition-colors truncate">
                        {app.title}
                      </h3>
                      <p className="text-sm text-gray-500">Application</p>
                    </div>
                  </div>
                </div>

                {/* App Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 font-medium">Status</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor('Live')}`}>
                      Live
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 font-medium">Created</span>
                    <span className="text-sm text-gray-600">
                      {new Date(app.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 font-medium">Updated</span>
                    <span className="text-sm text-gray-600">
                      {new Date(app.updatedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 font-medium">ID</span>
                    <span className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                      {app._id.slice(-8)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={`absolute top-3 right-3 flex gap-1.5 transition-all duration-300 ${
                  hoveredCard === app._id ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}>
                  <button className="p-2 bg-white hover:bg-blue-50 text-blue-600 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:scale-105">
                    <FiEye className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-white hover:bg-green-50 text-green-600 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:scale-105">
                    <FiSettings className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteApp(app);
                    }}
                    className="p-2 bg-white hover:bg-red-50 text-red-600 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:scale-105"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create App Modal - Balanced Design */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowCreateForm(false);
              resetForm();
            }}
          ></div>
          
          {/* Modal container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#5041BC] to-[#6C63FF] p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2.5 rounded-xl">
                      <FiSmartphone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Create Application</h3>
                      <p className="text-white/80 text-sm">Add a new application to the system</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleCreateApp} className="p-6">
                <div className="space-y-5">
                  {/* App Name */}
                  <div className="space-y-2">
                    <label htmlFor="modal-app-name" className="block text-sm font-semibold text-gray-700">
                      Application Name *
                    </label>
                    <div className="relative">
                      <FiSmartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        id="modal-app-name"
                        value={newAppName}
                        onChange={(e) => setNewAppName(e.target.value)}
                        required
                        className="pl-12 pr-4 py-3 w-full rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5041BC]/20 focus:border-[#5041BC] transition-all duration-200"
                        placeholder="Enter application name"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-6 justify-end border-t border-gray-200 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="px-6 py-2.5 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#5041BC] to-[#6C63FF] text-white rounded-xl hover:from-[#6C63FF] hover:to-[#5041BC] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
                  >
                    {creating ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FiPlus className="w-4 h-4" />
                        Create App
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={cancelDelete}
          ></div>
          
          {/* Modal container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
              {/* Modal Header */}
              <div className="flex items-center gap-3 p-5 border-b border-gray-200">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <FiAlertTriangle className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
              </div>

              {/* Modal Body */}
              <div className="p-5">
                <div className="mb-5">
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete this application? This action cannot be undone.
                  </p>
                  {appToDelete && (
                    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-red-400">
                      <div className="font-semibold text-gray-900">{appToDelete.title}</div>
                      <div className="text-sm text-gray-500 mt-1">ID: {appToDelete._id.slice(-8)}</div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={cancelDelete}
                    className="px-5 py-2.5 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    Delete App
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 