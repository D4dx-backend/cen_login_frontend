import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PageBackground from '../components/PageBackground';
import ProfileButton from '../components/ProfileButton';
import { FiPlus, FiTrash2, FiEdit, FiUsers, FiLoader, FiAlertTriangle, FiX, FiSave, FiMapPin, FiMap } from 'react-icons/fi';
import { useSidebar } from '../contexts/SidebarContext';

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

export default function MemberGroupPage() {
  const { isMinimized } = useSidebar();
  const [membersGroups, setMembersGroups] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    district: '',
    area: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [membersGroupsRes, districtsRes, areasRes] = await Promise.all([
        api.get('/members'),
        api.get('/districts'),
        api.get('/areas'),
      ]);
      setMembersGroups(membersGroupsRes.data.data || []);
      setDistricts(districtsRes.data.data || []);
      setAreas(areasRes.data.data || []);
      
      // Debug logging
      console.log('Areas fetched:', areasRes.data.data);
      console.log('Districts fetched:', districtsRes.data.data);
    } catch (error) {
      setError('Failed to fetch data. Please try again.');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // If district changes, reset area selection
      if (name === 'district') {
        newData.area = '';
      }
      return newData;
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      district: '',
      area: '',
    });
    setIsEditing(false);
    setEditingId(null);
    setShowCreateForm(false);
    setShowEditForm(false);
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCreateMembersGroup = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.district || !formData.area) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      await api.post('/members', formData);
      resetForm();
      fetchData();
      showSuccessMessage('Members group created successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create members group.';
      alert(errorMessage);
      console.error('Error creating members group:', error);
    }
  };

  const handleEditMembersGroup = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.district || !formData.area) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      await api.put(`/members/${editingId}`, formData);
      resetForm();
      fetchData();
      showSuccessMessage('Members group updated successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update members group.';
      alert(errorMessage);
      console.error('Error updating members group:', error);
    }
  };

  const handleDeleteMembersGroup = (group) => {
    setGroupToDelete(group);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (groupToDelete) {
      try {
        await api.delete(`/members/${groupToDelete._id}`);
        setShowDeleteConfirm(false);
        setGroupToDelete(null);
        fetchData();
        showSuccessMessage('Members group deleted successfully!');
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to delete members group.';
        setError(errorMessage);
        console.error('Error deleting members group:', error);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setGroupToDelete(null);
  };

  const startEdit = (group) => {
    setFormData({
      title: group.title,
      district: group.district._id,
      area: group.area._id,
    });
    setIsEditing(true);
    setEditingId(group._id);
    setShowEditForm(true);
  };

  const cancelEdit = () => {
    resetForm();
  };

  // Filter areas based on selected district
  const filteredAreas = areas.filter(area => {
    if (!formData.district) return true;
    // Handle both cases: area.district as object (populated) or string (just ID)
    if (typeof area.district === 'object' && area.district !== null) {
      return area.district._id === formData.district;
    }
    return area.district === formData.district;
  });

  // Debug logging
  console.log('All areas:', areas);
  console.log('Form data:', formData);
  console.log('Filtered areas:', filteredAreas);

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
              <h2 className="text-3xl font-extrabold text-[#5041BC]">Members Group Management</h2>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 text-sm font-medium text-white bg-gradient-to-r from-[#5041BC] to-[#6C63FF] hover:from-[#6C63FF] hover:to-[#5041BC] rounded-lg px-4 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <FiPlus className="w-4 h-4" />
                <span>Create Members Group</span>
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
                  <button onClick={fetchData} className="px-4 py-2 bg-[#5041BC] text-white rounded-lg">Retry</button>
                </div>
              ) : membersGroups.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FiUsers className="text-5xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold">No members groups found</h3>
                  <p>Create a new members group to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {membersGroups.map(group => (
                    <div key={group._id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex-1">
                        <div className="font-bold text-lg text-[#5041BC]">{group.title}</div>
                        <div className="text-sm text-gray-500">
                          District: <span className="font-semibold">{group.district?.title || 'N/A'}</span>, 
                          Area: <span className="font-semibold">{group.area?.title || 'N/A'}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Created: {new Date(group.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => startEdit(group)} 
                          className="p-2 text-gray-400 hover:text-blue-500 transition-colors" 
                          title="Edit Group"
                        >
                          <FiEdit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMembersGroup(group)} 
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors" 
                          title="Delete Group"
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

      {/* Create Members Group Modal - Minimalistic */}
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
                      <FiUsers className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Create Members Group</h3>
                      <p className="text-white/80 text-sm">Add a new members group</p>
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
              <form onSubmit={handleCreateMembersGroup} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* District */}
                  <div className="space-y-1">
                    <label htmlFor="modal-district" className="block text-sm font-medium text-gray-700">
                      District *
                    </label>
                    <select
                      id="modal-district"
                      name="district"
                      required
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5041BC] focus:border-[#5041BC] bg-white"
                    >
                      <option value="">Select District</option>
                      {districts.map(d => (
                        <option key={d._id} value={d._id}>{d.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area */}
                  <div className="space-y-1">
                    <label htmlFor="modal-area" className="block text-sm font-medium text-gray-700">
                      Area *
                    </label>
                    <select
                      id="modal-area"
                      name="area"
                      required
                      value={formData.area}
                      onChange={handleInputChange}
                      disabled={filteredAreas.length === 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5041BC] focus:border-[#5041BC] bg-white disabled:bg-gray-50"
                    >
                      <option value="">{formData.district ? 'Select Area' : 'Select District First'}</option>
                      {filteredAreas.map(a => (
                        <option key={a._id} value={a._id}>{a.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Group Name */}
                  <div className="space-y-1 md:col-span-2">
                    <label htmlFor="modal-title" className="block text-sm font-medium text-gray-700">
                      Group Name *
                    </label>
                    <input
                      type="text"
                      id="modal-title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5041BC] focus:border-[#5041BC]"
                      placeholder="Enter group name"
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
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Members Group Modal - Minimalistic */}
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
                      <h3 className="text-lg font-semibold text-white">Edit Members Group</h3>
                      <p className="text-white/80 text-sm">Update group information</p>
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
              <form onSubmit={handleEditMembersGroup} className="p-4">
                {successMessage && (
                  <div className="p-3 rounded text-sm mb-4 bg-green-50 text-green-700 border-l-2 border-green-400">
                    {successMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* District */}
                  <div className="space-y-1">
                    <label htmlFor="edit-district" className="block text-sm font-medium text-gray-700">
                      District *
                    </label>
                    <select
                      id="edit-district"
                      name="district"
                      required
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-600 focus:border-violet-600 bg-white"
                    >
                      <option value="">Select District</option>
                      {districts.map(d => (
                        <option key={d._id} value={d._id}>{d.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area */}
                  <div className="space-y-1">
                    <label htmlFor="edit-area" className="block text-sm font-medium text-gray-700">
                      Area *
                    </label>
                    <select
                      id="edit-area"
                      name="area"
                      required
                      value={formData.area}
                      onChange={handleInputChange}
                      disabled={filteredAreas.length === 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-600 focus:border-violet-600 bg-white disabled:bg-gray-50"
                    >
                      <option value="">{formData.district ? 'Select Area' : 'Select District First'}</option>
                      {filteredAreas.map(a => (
                        <option key={a._id} value={a._id}>{a.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Group Name */}
                  <div className="space-y-1 md:col-span-2">
                    <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
                      Group Name *
                    </label>
                    <input
                      type="text"
                      id="edit-title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-600 focus:border-violet-600"
                      placeholder="Enter group name"
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
                    Update Group
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
                    Are you sure you want to delete this members group?
                  </p>
                  {groupToDelete && (
                    <div className="bg-red-50 rounded-lg p-3 border-l-4 border-red-300">
                      <div className="font-semibold text-gray-900">{groupToDelete.title}</div>
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