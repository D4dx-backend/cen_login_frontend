import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEye, FiSettings, FiTrash2, FiUsers, FiSmartphone, FiX, FiAlertTriangle } from 'react-icons/fi';
import DeleteConfirmModal from './DeleteConfirmModal';

const API_BASE_URL = 'http://localhost:3000/api';

export default function AppList({ refreshTrigger }) {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchApps();
  }, [refreshTrigger]);

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

  const handleDeleteApp = (app) => {
    setAppToDelete(app);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!appToDelete) return;
    
    try {
      setDeleting(true);
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
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    if (!deleting) {
      setShowDeleteConfirm(false);
      setAppToDelete(null);
    }
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
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5041BC] mx-auto"></div>
        <p className="mt-2 text-gray-600 text-sm">Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500 mb-3 text-sm">{error}</p>
          <button 
            onClick={fetchApps}
          className="px-3 py-1.5 bg-[#5041BC] text-white rounded-lg hover:bg-[#6C63FF] transition-colors text-sm"
          >
            Retry
          </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Apps Grid */}
      <div>
        {apps.length === 0 ? (
          <div className="text-center py-8">
            <FiSmartphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-500 mb-1">No applications found</h3>
            <p className="text-xs text-gray-400">Create your first application to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {apps.map((app) => (
              <div
                key={app._id}
                className={`relative bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 transition-all duration-300 cursor-pointer group hover:shadow-md hover:scale-[1.01] hover:border-[#5041BC]/30 ${
                  hoveredCard === app._id ? 'shadow-lg scale-[1.01] border-[#5041BC]/50' : ''
                }`}
                onMouseEnter={() => setHoveredCard(app._id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* App Header */}
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="text-lg bg-[#5041BC]/10 p-2 rounded-lg text-[#5041BC] flex-shrink-0">
                      <FiSmartphone />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-800 group-hover:text-[#5041BC] transition-colors truncate">
                        {app.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* App Details */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor('Live')}`}>
                      Live
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Created</span>
                    <span className="text-xs text-gray-600">
                      {new Date(app.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Updated</span>
                    <span className="text-xs text-gray-600">
                      {new Date(app.updatedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">ID</span>
                    <span className="text-xs text-gray-600 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                      {app._id.slice(-8)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={`absolute top-2 right-2 flex gap-1 transition-all duration-300 ${
                  hoveredCard === app._id ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}>
                  <button className="p-1.5 bg-white hover:bg-blue-50 text-blue-600 rounded-md shadow-sm border border-gray-200 transition-all duration-200 hover:scale-105">
                    <FiEye className="w-3 h-3" />
                  </button>
                  <button className="p-1.5 bg-white hover:bg-green-50 text-green-600 rounded-md shadow-sm border border-gray-200 transition-all duration-200 hover:scale-105">
                    <FiSettings className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteApp(app);
                    }}
                    className="p-1.5 bg-white hover:bg-red-50 text-red-600 rounded-md shadow-sm border border-gray-200 transition-all duration-200 hover:scale-105"
                  >
                    <FiTrash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Application"
        itemName={appToDelete?.title}
        itemType="application"
        loading={deleting}
      />
    </div>
  );
} 