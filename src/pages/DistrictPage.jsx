import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PageBackground from '../components/PageBackground';
import ProfileButton from '../components/ProfileButton';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
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
  const [deleting, setDeleting] = useState(false);
  
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
      console.log('Updating district with data:', formData);
      console.log('Editing ID:', editingId);
      const response = await api.put(`/districts/${editingId}`, formData);
      console.log('Update response:', response.data);
      resetForm();
      fetchDistricts();
      showSuccessMessage('District updated successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update district.';
      console.error('Error updating district:', error);
      console.error('Error response:', error.response?.data);
      alert(errorMessage);
    }
  };

  const handleDeleteDistrict = (district) => {
    setDistrictToDelete(district);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (districtToDelete) {
      try {
        setDeleting(true);
        await api.delete(`/districts/${districtToDelete._id}`);
        setShowDeleteConfirm(false);
        setDistrictToDelete(null);
        fetchDistricts();
        showSuccessMessage('District deleted successfully!');
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to delete district.';
        setError(errorMessage);
        console.error('Error deleting district:', error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const cancelDelete = () => {
    if (!deleting) {
      setShowDeleteConfirm(false);
      setDistrictToDelete(null);
    }
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
      <div className={`relative z-20 ${isMinimized ? 'ml-16' : 'ml-56'} flex flex-col min-h-screen transition-all duration-300 ease-in-out`}>
        {/* Profile Button - Top Right */}
        <div className="absolute top-4 right-4 z-30">
          <ProfileButton />
        </div>
        
        <div className="flex-1 flex flex-col p-4 pt-16">
          <main className="flex-1 min-w-0 mt-4">
            {/* Heading */}
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-[#5041BC] via-[#6C63FF] to-[#8B7EFF] bg-clip-text text-transparent mb-4">District Management</h2>
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
                  <span>Create District</span>
                </button>
              </div>
            </div>
            
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                {successMessage}
              </div>
            )}

            {/* District Table */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              {loading ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5041BC] mx-auto"></div>
                  <p className="mt-2 text-gray-600 text-sm">Loading districts...</p>
                </div>
              ) : error ? (
                <div className="text-center py-6">
                  <p className="text-red-500 mb-3 text-sm">{error}</p>
                  <button onClick={fetchDistricts} className="px-3 py-1.5 bg-[#5041BC] text-white rounded-lg hover:bg-[#6C63FF] transition-colors text-sm">
                    Retry
                  </button>
                </div>
              ) : districts.length === 0 ? (
                <div className="text-center py-8">
                  <FiMap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-medium text-gray-500 mb-1">No districts found</h3>
                  <p className="text-xs text-gray-400">Create your first district to get started</p>
                </div>
              ) : (
                <div>
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50/50">
                      <tr>
                        <th scope="col" className="px-4 py-3 font-semibold">
                          District
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                          Created
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                          Updated
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {districts.map((district) => (
                        <tr key={district._id} className="transform transition-transform duration-300 ease-in-out hover:scale-[1.01] hover:shadow-md hover:bg-white rounded-xl">
                          <th scope="row" className="flex items-center px-4 py-3 text-gray-900 whitespace-nowrap">
                            <div className="w-9 h-9 rounded-full bg-[#5041BC] flex items-center justify-center text-white font-semibold text-sm">
                              {district.title?.charAt(0)?.toUpperCase() || 'D'}
                            </div>
                            <div className="pl-3">
                              <div className="text-sm font-semibold">{district.title}</div>
                              <div className="font-normal text-gray-500 text-xs">District</div>
                            </div>
                          </th>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-600">
                              {new Date(district.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-600">
                              {new Date(district.updatedAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center space-x-2">
                              <button 
                                className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100/50 hover:text-green-500 transition-colors"
                                title="Edit district"
                                onClick={() => startEdit(district)}
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteDistrict(district)}
                                className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100/50 hover:text-red-500 transition-colors"
                                title="Delete district"
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
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg">
              {/* Modal Header - Gradient */}
              <div className="bg-gradient-to-r from-[#5041BC] to-[#6C63FF] px-4 py-3 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiMap className="w-4 h-4 text-white" />
                    <h3 className="text-lg font-semibold text-white">Create District</h3>
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
              <form onSubmit={handleCreateDistrict} className="p-4">
                <div className="grid grid-cols-1 gap-3">
                  {/* District Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">District Name *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#5041BC]"
                      placeholder="Enter district name"
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
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg">
              {/* Modal Header - Gradient */}
              <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-3 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiEdit className="w-4 h-4 text-white" />
                    <h3 className="text-lg font-semibold text-white">Edit District</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      resetForm();
                    }}
                    className="text-white/80 hover:text-white p-1"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleEditDistrict} className="p-4">
                {successMessage && (
                  <div className="p-2 rounded text-xs mb-3 bg-green-50 text-green-700 border-l-2 border-green-400">
                    {successMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  {/* District Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">District Name *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600"
                      placeholder="Enter district name"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-2 pt-3 justify-end border-t border-gray-200 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      resetForm();
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
        itemName={districtToDelete?.title}
        itemType="District"
        loading={deleting}
      />
    </div>
  );
} 