import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PageBackground from '../components/PageBackground';
import ProfileButton from '../components/ProfileButton';
import { useSidebar } from '../contexts/SidebarContext';
import { FiPlus, FiTrash2, FiEdit, FiMap, FiLoader, FiAlertTriangle, FiX, FiSave } from 'react-icons/fi';

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

export default function DistrictPage() {
  const { isMinimized } = useSidebar();
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [districtToDelete, setDistrictToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
  });

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/districts');
      setDistricts(response.data.data || []);
      console.log('Districts fetched:', response.data.data);
    } catch (error) {
      setError('Failed to fetch districts. Please try again.');
      console.error('Error fetching districts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ title: '' });
    setIsEditing(false);
    setEditingId(null);
    setShowCreateForm(false);
    setShowEditForm(false);
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCreateDistrict = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a district name.');
      return;
    }

    try {
      await api.post('/districts', formData);
      resetForm();
      fetchDistricts();
      showSuccessMessage('District created successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create district.';
      alert(errorMessage);
      console.error('Error creating district:', error);
    }
  };

  const handleEditDistrict = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a district name.');
      return;
    }

    try {
      await api.put(`/districts/${editingId}`, formData);
      resetForm();
      fetchDistricts();
      showSuccessMessage('District updated successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update district.';
      alert(errorMessage);
      console.error('Error updating district:', error);
    }
  };

  const handleDeleteDistrict = (district) => {
    setDistrictToDelete(district);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (districtToDelete) {
      try {
        await api.delete(`/districts/${districtToDelete._id}`);
        setShowDeleteConfirm(false);
        setDistrictToDelete(null);
        fetchDistricts();
        showSuccessMessage('District deleted successfully!');
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to delete district.';
        setError(errorMessage);
        console.error('Error deleting district:', error);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDistrictToDelete(null);
  };

  const startEdit = (district) => {
    setFormData({
      title: district.title,
    });
    setIsEditing(true);
    setEditingId(district._id);
    setShowEditForm(true);
  };

  const cancelEdit = () => {
    resetForm();
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
              <h2 className="text-3xl font-extrabold text-[#5041BC]">District Management</h2>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 text-sm font-medium text-white bg-gradient-to-r from-[#5041BC] to-[#6C63FF] hover:from-[#6C63FF] hover:to-[#5041BC] rounded-lg px-4 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <FiPlus className="w-4 h-4" />
                <span>Create District</span>
              </button>
            </div>
            
            {successMessage && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {successMessage}
              </div>
            )}
            


            <div className="bg-white rounded-2xl shadow-lg p-8">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <FiLoader className="animate-spin text-4xl text-[#5041BC]" />
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-500 flex flex-col items-center gap-4">
                  <FiAlertTriangle className="text-4xl" />
                  <span>{error}</span>
                  <button onClick={fetchDistricts} className="px-4 py-2 bg-[#5041BC] text-white rounded-lg">Retry</button>
                </div>
              ) : districts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FiMap className="text-5xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold">No districts found</h3>
                  <p>Create a new district to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mb-4 text-sm text-gray-600">
                    Total Districts: {districts.length}
                  </div>
                  {districts.map(district => (
                    <div key={district._id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex-1">
                        <div className="font-bold text-lg text-[#5041BC]">{district.title}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Created: {new Date(district.createdAt).toLocaleDateString()}
                          {district.updatedAt !== district.createdAt && (
                            <span className="ml-2">
                              • Updated: {new Date(district.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => startEdit(district)} 
                          className="p-2 text-gray-400 hover:text-blue-500 transition-colors" 
                          title="Edit District"
                        >
                          <FiEdit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteDistrict(district)} 
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors" 
                          title="Delete District"
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

      {/* Create District Modal - Gradient Header */}
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
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md">
              {/* Modal Header - Gradient */}
              <div className="bg-gradient-to-r from-[#5041BC] to-[#6C63FF] px-4 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <FiMap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Create District</h3>
                      <p className="text-white/80 text-sm">Add a new district</p>
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
              <form onSubmit={handleCreateDistrict} className="p-4">
                <div className="space-y-4">
                  {/* District Name */}
                  <div className="space-y-1">
                    <label htmlFor="modal-title" className="block text-sm font-medium text-gray-700">
                      District Name *
                    </label>
                    <input
                      type="text"
                      id="modal-title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5041BC] focus:border-[#5041BC]"
                      placeholder="Enter district name"
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
                    Create District
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit District Modal - Gradient Header */}
      {showEditForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => {
              setShowEditForm(false);
              resetForm();
            }}
          ></div>
          
          {/* Modal container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md">
              {/* Modal Header - Gradient */}
              <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <FiEdit className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Edit District</h3>
                      <p className="text-white/80 text-sm">Update district information</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      resetForm();
                    }}
                    className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleEditDistrict} className="p-4">
                {successMessage && (
                  <div className="p-3 rounded text-sm mb-4 bg-green-50 text-green-700 border-l-2 border-green-400">
                    {successMessage}
                  </div>
                )}

                <div className="space-y-4">
                  {/* District Name */}
                  <div className="space-y-1">
                    <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
                      District Name *
                    </label>
                    <input
                      type="text"
                      id="edit-title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-600 focus:border-violet-600"
                      placeholder="Enter district name"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 justify-end border-t border-gray-200 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-indigo-600 font-medium"
                  >
                    Update District
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
                    Are you sure you want to delete this district?
                  </p>
                  {districtToDelete && (
                    <div className="bg-red-50 rounded-lg p-3 border-l-4 border-red-300">
                      <div className="font-semibold text-gray-900">{districtToDelete.title}</div>
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