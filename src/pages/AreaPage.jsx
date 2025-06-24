import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PageBackground from '../components/PageBackground';
import ProfileButton from '../components/ProfileButton';
import { useSidebar } from '../contexts/SidebarContext';
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
  const { isMinimized } = useSidebar();
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
        await api.delete(`/areas/${areaToDelete._id}`);
        setShowDeleteConfirm(false);
        setAreaToDelete(null);
        fetchData();
      } catch (error) {
        setError('Failed to delete area.');
        console.error('Error deleting area:', error);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setAreaToDelete(null);
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
      <div className={`relative z-20 ${isMinimized ? 'ml-20' : 'ml-72'} flex flex-col min-h-screen transition-all duration-500 ease-in-out`}>
        {/* Profile Button - Top Right */}
        <div className="absolute top-6 right-6 z-30">
          <ProfileButton />
        </div>
        
        <div className="flex-1 flex flex-col p-8 pt-20">
          <main className="flex-1 min-w-0 mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-extrabold text-[#5041BC]">Area Management</h2>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 text-sm font-medium text-white bg-gradient-to-r from-[#5041BC] to-[#6C63FF] hover:from-[#6C63FF] hover:to-[#5041BC] rounded-lg px-4 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <FiPlus className="w-4 h-4" />
                <span>Create Area</span>
              </button>
            </div>
            


            {/* Areas List */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
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
                <div className="space-y-4">
                  {areas.map(area => (
                    <div key={area._id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300">
                      <div>
                        <div className="font-bold text-lg text-[#5041BC]">{area.title}</div>
                        <div className="text-sm text-gray-500">
                          District: <span className="font-semibold">{area.district?.title || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(area)} 
                          className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                          title="Edit Area"
                        >
                          <FiEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteArea(area)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete Area"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
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
              <div className="bg-gradient-to-r from-[#5041BC] to-[#6C63FF] px-4 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <FiMapPin className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Create Area</h3>
                      <p className="text-white/80 text-sm">Add a new area</p>
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
              <form onSubmit={handleCreateArea} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* District */}
                  <div className="space-y-1">
                    <label htmlFor="modal-district" className="block text-sm font-medium text-gray-700">
                      District *
                    </label>
                    <select
                      id="modal-district"
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5041BC] focus:border-[#5041BC] bg-white"
                    >
                      <option value="">Select a District</option>
                      {districts.map(district => (
                        <option key={district._id} value={district._id}>{district.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area Name */}
                  <div className="space-y-1">
                    <label htmlFor="modal-area-name" className="block text-sm font-medium text-gray-700">
                      Area Name *
                    </label>
                    <input
                      type="text"
                      id="modal-area-name"
                      value={newAreaName}
                      onChange={(e) => setNewAreaName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5041BC] focus:border-[#5041BC]"
                      placeholder="Enter area name"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 justify-end border-t border-gray-200 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#5041BC] text-white rounded-md hover:bg-[#6C63FF] font-medium"
                  >
                    Create Area
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
              <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <FiEdit className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Edit Area</h3>
                      <p className="text-white/80 text-sm">Update area information</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      cancelEdit();
                    }}
                    className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleUpdateArea} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* District */}
                  <div className="space-y-1">
                    <label htmlFor="edit-district" className="block text-sm font-medium text-gray-700">
                      District *
                    </label>
                    <select
                      id="edit-district"
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-600 focus:border-violet-600 bg-white"
                    >
                      <option value="">Select a District</option>
                      {districts.map(district => (
                        <option key={district._id} value={district._id}>{district.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area Name */}
                  <div className="space-y-1">
                    <label htmlFor="edit-area-name" className="block text-sm font-medium text-gray-700">
                      Area Name *
                    </label>
                    <input
                      type="text"
                      id="edit-area-name"
                      value={newAreaName}
                      onChange={(e) => setNewAreaName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-600 focus:border-violet-600"
                      placeholder="Enter area name"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 justify-end border-t border-gray-200 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      cancelEdit();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-indigo-600 font-medium"
                  >
                    Update Area
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
            className="fixed inset-0 bg-black/50"
            onClick={cancelDelete}
          ></div>
          
          {/* Modal container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md">
              {/* Modal Header - Light Red Gradient */}
              <div className="bg-gradient-to-r from-red-400 to-red-500 px-4 py-3 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <FiAlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Confirm Delete</h3>
                    <p className="text-white/80 text-xs">This action cannot be undone</p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4">
                <div className="mb-4">
                  <p className="text-gray-600 text-sm mb-3">
                    Are you sure you want to delete this area?
                  </p>
                  {areaToDelete && (
                    <div className="bg-red-50 rounded-lg p-3 border-l-4 border-red-300">
                      <div className="font-semibold text-gray-900">{areaToDelete.title}</div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 font-medium"
                  >
                    Delete
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