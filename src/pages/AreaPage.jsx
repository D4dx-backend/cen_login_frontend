import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PageBackground from '../components/PageBackground';
import ProfileButton from '../components/ProfileButton';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

import { FiPlus, FiTrash2, FiEdit, FiMapPin, FiLoader, FiAlertTriangle, FiX, FiMap } from 'react-icons/fi';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function AreaPage() {
  const [areas, setAreas] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newAreaName, setNewAreaName] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [areasRes, districtsRes] = await Promise.all([
        api.get('/areas'),
        api.get('/districts')
      ]);
      setAreas(areasRes.data.data || []);
      setDistricts(districtsRes.data.data || []);
    } catch (error) {
      setError('Failed to fetch data. Please try again.');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArea = async (e) => {
    e.preventDefault();
    if (!newAreaName.trim() || !selectedDistrict) {
      alert('Please enter an area name and select a district.');
      return;
    }

    try {
      await api.post('/areas', { title: newAreaName, district: selectedDistrict });
      setNewAreaName('');
      setSelectedDistrict('');
      setShowCreateForm(false);
      fetchData();
    } catch (error) {
      alert('Failed to create area.');
      console.error('Error creating area:', error);
    }
  };

  const handleUpdateArea = async (e) => {
    e.preventDefault();
    if (!newAreaName.trim() || !selectedDistrict) {
      alert('Please enter an area name and select a district.');
      return;
    }

    try {
      await api.put(`/areas/${editingArea._id}`, { title: newAreaName, district: selectedDistrict });
      setNewAreaName('');
      setSelectedDistrict('');
      setIsEditing(false);
      setEditingArea(null);
      setShowEditForm(false);
      fetchData();
    } catch (error) {
      alert('Failed to update area.');
      console.error('Error updating area:', error);
    }
  };

  const handleEdit = (area) => {
    setIsEditing(true);
    setEditingArea(area);
    setNewAreaName(area.title);
    setSelectedDistrict(area.district._id);
    setShowEditForm(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingArea(null);
    setNewAreaName('');
    setSelectedDistrict('');
    setShowEditForm(false);
  };

  const handleDeleteArea = (area) => {
    setAreaToDelete(area);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (areaToDelete) {
      try {
        setDeleting(true);
        await api.delete(`/areas/${areaToDelete._id}`);
        setShowDeleteConfirm(false);
        setAreaToDelete(null);
        fetchData();
      } catch (error) {
        setError('Failed to delete area.');
        console.error('Error deleting area:', error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const cancelDelete = () => {
    if (!deleting) {
      setShowDeleteConfirm(false);
      setAreaToDelete(null);
    }
  };

  const resetForm = () => {
    setNewAreaName('');
    setSelectedDistrict('');
    setShowCreateForm(false);
    setShowEditForm(false);
  };

  return (
    <div className="min-h-screen relative bg-[#e3e6eb] overflow-hidden" style={{ fontFamily: 'Nunito, sans-serif' }}>
      <PageBackground />
      <div className="fixed left-0 top-0 h-screen z-10">
        <Sidebar />
      </div>
      <div className="relative z-20 flex flex-col min-h-screen transition-all duration-300 ease-in-out" style={{ marginLeft: 'var(--sidebar-width, 224px)' }}>
        {/* Profile Button - Top Right */}
        <div className="absolute top-4 right-4 z-30">
          <ProfileButton />
        </div>
        
        <div className="flex-1 flex flex-col p-4 pt-16">
          <main className="flex-1 min-w-0 mt-4">
            {/* Heading */}
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-[#5041BC] via-[#6C63FF] to-[#8B7EFF] bg-clip-text text-transparent mb-4">Area Management</h2>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div className="flex items-center w-full sm:w-auto gap-2">
                {/* Empty space for consistency with UserPage layout */}
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center space-x-2 text-sm font-medium text-white bg-gradient-to-r from-[#5041BC] to-[#6C63FF] hover:from-[#6C63FF] hover:to-[#5041BC] rounded-lg px-3 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Create Area</span>
                </button>
              </div>
            </div>

            {/* Area Table */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <FiLoader className="animate-spin text-4xl text-[#5041BC]" />
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-500 flex flex-col items-center gap-4">
                  <FiAlertTriangle className="text-4xl" />
                  <span>{error}</span>
                  <button onClick={fetchData} className="px-4 py-2 bg-[#5041BC] text-white rounded-lg">Retry</button>
                </div>
              ) : areas.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FiMapPin className="text-5xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold">No areas found</h3>
                  <p>Create a new area to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-bold text-gray-700 text-sm uppercase tracking-wide">AREA</th>
                        <th className="text-left py-3 px-2 font-bold text-gray-700 text-sm uppercase tracking-wide">DISTRICT</th>
                        <th className="text-left py-3 px-2 font-bold text-gray-700 text-sm uppercase tracking-wide">CREATED</th>
                        <th className="text-center py-3 px-2 font-bold text-gray-700 text-sm uppercase tracking-wide">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {areas.map((area, index) => (
                        <tr key={area._id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[#5041BC] flex items-center justify-center text-white font-semibold text-sm">
                                {area.title?.charAt(0)?.toUpperCase() || 'A'}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-sm">{area.title}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {area.district?.title || 'N/A'}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-sm text-gray-600">
                              {new Date(area.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleEdit(area)} 
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-all duration-200"
                                title="Edit Area"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteArea(area)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                                title="Delete Area"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Create Area Modal - Minimalistic */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => {
              setShowCreateForm(false);
              resetForm();
            }}
          ></div>
          
          {/* Modal container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg">
              {/* Modal Header - Gradient */}
              <div className="bg-gradient-to-r from-[#5041BC] to-[#6C63FF] px-4 py-3 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiMapPin className="w-4 h-4 text-white" />
                    <h3 className="text-lg font-semibold text-white">Create Area</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="text-white/80 hover:text-white p-1"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleCreateArea} className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* District */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">District *</label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      required
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#5041BC] bg-white"
                    >
                      <option value="">Select district</option>
                      {districts.map(district => (
                        <option key={district._id} value={district._id}>{district.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Area Name *</label>
                    <input
                      type="text"
                      value={newAreaName}
                      onChange={(e) => setNewAreaName(e.target.value)}
                      required
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#5041BC]"
                      placeholder="Enter area name"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-2 pt-3 justify-end border-t border-gray-200 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs bg-[#5041BC] text-white rounded hover:bg-[#6C63FF]"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Area Modal - Minimalistic */}
      {showEditForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => {
              setShowEditForm(false);
              cancelEdit();
            }}
          ></div>
          
          {/* Modal container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg">
              {/* Modal Header - Gradient */}
              <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-3 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiEdit className="w-4 h-4 text-white" />
                    <h3 className="text-lg font-semibold text-white">Edit Area</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      cancelEdit();
                    }}
                    className="text-white/80 hover:text-white p-1"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleUpdateArea} className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* District */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">District *</label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      required
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600 bg-white"
                    >
                      <option value="">Select district</option>
                      {districts.map(district => (
                        <option key={district._id} value={district._id}>{district.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Area Name *</label>
                    <input
                      type="text"
                      value={newAreaName}
                      onChange={(e) => setNewAreaName(e.target.value)}
                      required
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600"
                      placeholder="Enter area name"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-2 pt-3 justify-end border-t border-gray-200 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      cancelEdit();
                    }}
                    className="px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs bg-violet-600 text-white rounded hover:bg-indigo-600"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        itemName={areaToDelete?.title}
        itemType="Area"
        loading={deleting}
      />
    </div>
  );
} 