import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PageBackground from '../components/PageBackground';
import ProfileButton from '../components/ProfileButton';
import { FiPlus, FiTrash2, FiEdit, FiUsers, FiLoader, FiAlertTriangle, FiX, FiSave, FiMapPin, FiMap } from 'react-icons/fi';


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
      console.log('Updating members group with data:', formData);
      console.log('Editing ID:', editingId);
      const response = await api.put(`/members/${editingId}`, formData);
      console.log('Update response:', response.data);
      resetForm();
      fetchData();
      showSuccessMessage('Members group updated successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update members group.';
      console.error('Error updating members group:', error);
      console.error('Error response:', error.response?.data);
      alert(errorMessage);
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
      district: group.district?._id || '',
      area: group.area?._id || '',
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
      <div className="relative z-20 flex flex-col min-h-screen transition-all duration-300 ease-in-out" style={{ marginLeft: 'var(--sidebar-width, 224px)' }}>
        {/* Profile Button - Top Right */}
        <div className="absolute top-4 right-4 z-30">
          <ProfileButton />
        </div>
        
        <div className="flex-1 flex flex-col p-4 pt-16">
          <main className="flex-1 min-w-0 mt-4">
            {/* Heading */}
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-[#5041BC] via-[#6C63FF] to-[#8B7EFF] bg-clip-text text-transparent mb-4">Members Group Management</h2>
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
                  <span>Create Members Group</span>
                </button>
              </div>
            </div>
            
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                {successMessage}
              </div>
            )}

            {/* Members Group Table */}
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
              ) : membersGroups.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FiUsers className="text-5xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold">No members groups found</h3>
                  <p>Create a new members group to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-bold text-gray-700 text-sm uppercase tracking-wide">MEMBERS GROUP</th>
                        <th className="text-left py-3 px-2 font-bold text-gray-700 text-sm uppercase tracking-wide">DISTRICT</th>
                        <th className="text-left py-3 px-2 font-bold text-gray-700 text-sm uppercase tracking-wide">AREA</th>
                        <th className="text-left py-3 px-2 font-bold text-gray-700 text-sm uppercase tracking-wide">CREATED</th>
                        <th className="text-center py-3 px-2 font-bold text-gray-700 text-sm uppercase tracking-wide">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {membersGroups.map((group, index) => (
                        <tr key={group._id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[#5041BC] flex items-center justify-center text-white font-semibold text-sm">
                                {group.title?.charAt(0)?.toUpperCase() || 'M'}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-sm">{group.title}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {group.district?.title || 'N/A'}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              {group.area?.title || 'N/A'}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-sm text-gray-600">
                              {new Date(group.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-center gap-1">
                              <button 
                                onClick={() => startEdit(group)} 
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-all duration-200" 
                                title="Edit Group"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteMembersGroup(group)} 
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200" 
                                title="Delete Group"
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
              <div className="bg-gradient-to-r from-[#5041BC] to-[#6C63FF] px-4 py-3 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiUsers className="w-4 h-4 text-white" />
                    <h3 className="text-lg font-semibold text-white">Create Members Group</h3>
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
              <form onSubmit={handleCreateMembersGroup} className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* District */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">District *</label>
                    <select
                      name="district"
                      required
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#5041BC] bg-white"
                    >
                      <option value="">Select district</option>
                      {districts.map(d => (
                        <option key={d._id} value={d._id}>{d.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Area *</label>
                    <select
                      name="area"
                      required
                      value={formData.area}
                      onChange={handleInputChange}
                      disabled={filteredAreas.length === 0}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#5041BC] bg-white disabled:bg-gray-50"
                    >
                      <option value="">{formData.district ? 'Select area' : 'Select district first'}</option>
                      {filteredAreas.map(a => (
                        <option key={a._id} value={a._id}>{a.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Group Name */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Group Name *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#5041BC]"
                      placeholder="Enter group name"
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
              <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-3 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiEdit className="w-4 h-4 text-white" />
                    <h3 className="text-lg font-semibold text-white">Edit Members Group</h3>
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
              <form onSubmit={handleEditMembersGroup} className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* District */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">District *</label>
                    <select
                      name="district"
                      required
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600 bg-white"
                    >
                      <option value="">Select district</option>
                      {districts.map(d => (
                        <option key={d._id} value={d._id}>{d.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Area *</label>
                    <select
                      name="area"
                      required
                      value={formData.area}
                      onChange={handleInputChange}
                      disabled={filteredAreas.length === 0}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600 bg-white disabled:bg-gray-50"
                    >
                      <option value="">{formData.district ? 'Select area' : 'Select district first'}</option>
                      {filteredAreas.map(a => (
                        <option key={a._id} value={a._id}>{a.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Group Name */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Group Name *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600"
                      placeholder="Enter group name"
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

      {/* Delete Confirmation Modal - Professional & Styled */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={cancelDelete}
          ></div>
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-sm transform transition-all">
              <div className="bg-gradient-to-r from-red-50 to-rose-50 px-4 py-3 rounded-t-xl border-b border-red-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-sm">
                    <FiAlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-red-700">Confirm Deletion</h3>
                    <p className="text-xs text-red-600/80">This action cannot be undone</p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-600">
                      {groupToDelete?.title?.charAt(0)?.toUpperCase() || 'M'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{groupToDelete?.title}</p>
                    <p className="text-xs text-gray-500">Members group will be permanently deleted</p>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Delete Group
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