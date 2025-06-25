import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PageBackground from '../components/PageBackground';
import ProfileButton from '../components/ProfileButton';
import { FiPlus, FiTrash2, FiEdit, FiHome, FiLoader, FiAlertTriangle, FiX, FiMap, FiMapPin, FiUsers } from 'react-icons/fi';
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

export default function HalqaPage() {
  const { isMinimized } = useSidebar();
  const [halqas, setHalqas] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [areas, setAreas] = useState([]);
  const [membersGroups, setMembersGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingHalqa, setEditingHalqa] = useState(null);
  const [halqaToDelete, setHalqaToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    district: '',
    area: '',
    membersGroup: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [halqasRes, districtsRes, areasRes, membersGroupsRes] = await Promise.all([
        api.get('/halqas'),
        api.get('/districts'),
        api.get('/areas'),
        api.get('/members'),
      ]);
      setHalqas(halqasRes.data.data || []);
      setDistricts(districtsRes.data.data || []);
      setAreas(areasRes.data.data || []);
      setMembersGroups(membersGroupsRes.data.data || []);
    } catch (error) {
      setError('Failed to fetch data. Please try again.');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ title: '', district: '', area: '', membersGroup: '' });
    setShowCreateForm(false);
    setShowEditForm(false);
    setIsEditing(false);
    setEditingHalqa(null);
  };

  const handleCreateHalqa = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.district || !formData.area || !formData.membersGroup) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      await api.post('/halqas', formData);
      resetForm();
      fetchData();
    } catch (error) {
      alert('Failed to create halqa.');
      console.error('Error creating halqa:', error);
    }
  };

  const handleEditHalqa = (halqa) => {
    setFormData({
      title: halqa.title,
      district: halqa.district._id,
      area: halqa.area._id,
      membersGroup: halqa.membersGroup._id,
    });
    setIsEditing(true);
    setEditingHalqa(halqa);
    setShowEditForm(true);
  };

  const handleUpdateHalqa = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.district || !formData.area || !formData.membersGroup) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      await api.put(`/halqas/${editingHalqa._id}`, formData);
      resetForm();
      fetchData();
    } catch (error) {
      alert('Failed to update halqa.');
      console.error('Error updating halqa:', error);
    }
  };

  const handleDeleteHalqa = (halqa) => {
    setHalqaToDelete(halqa);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (halqaToDelete) {
      try {
        await api.delete(`/halqas/${halqaToDelete._id}`);
        setShowDeleteConfirm(false);
        setHalqaToDelete(null);
        fetchData();
      } catch (error) {
        setError('Failed to delete halqa.');
        console.error('Error deleting halqa:', error);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setHalqaToDelete(null);
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
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#5041BC] via-[#6C63FF] to-[#8B7EFF] bg-clip-text text-transparent mb-4">Halqa Management</h1>
            
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
                  <span>Create Halqa</span>
                </button>
              </div>
            </div>

            {/* Halqa Table */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              {loading ? (
                <div className="flex justify-center items-center py-12"><FiLoader className="animate-spin text-4xl text-[#5041BC]" /></div>
              ) : error ? (
                <div className="text-center py-12 text-red-500 flex flex-col items-center gap-4">
                  <FiAlertTriangle className="text-4xl" />
                  <span>{error}</span>
                  <button onClick={fetchData} className="px-4 py-2 bg-[#5041BC] text-white rounded-lg">Retry</button>
                </div>
              ) : halqas.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FiHome className="text-5xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold">No halqas found</h3>
                  <p>Create a new halqa to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-bold text-gray-700 text-sm uppercase tracking-wide">HALQA</th>
                        <th className="text-left py-3 px-2 font-bold text-gray-700 text-sm uppercase tracking-wide">DISTRICT</th>
                        <th className="text-left py-3 px-2 font-bold text-gray-700 text-sm uppercase tracking-wide">AREA</th>
                        <th className="text-left py-3 px-2 font-bold text-gray-700 text-sm uppercase tracking-wide">MEMBERS GROUP</th>
                        <th className="text-center py-3 px-2 font-bold text-gray-700 text-sm uppercase tracking-wide">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {halqas.map((halqa, index) => (
                        <tr key={halqa._id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[#5041BC] flex items-center justify-center text-white font-semibold text-sm">
                                {halqa.title?.charAt(0)?.toUpperCase() || 'H'}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-sm">{halqa.title}</div>
                                <div className="text-xs text-gray-500">ID: {halqa._id?.slice(-6) || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {halqa.district?.title || 'N/A'}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              {halqa.area?.title || 'N/A'}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                              {halqa.membersGroup?.title || 'N/A'}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-center gap-1">
                              <button 
                                onClick={() => handleEditHalqa(halqa)} 
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-all duration-200" 
                                title="Edit Halqa"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteHalqa(halqa)} 
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200" 
                                title="Delete Halqa"
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

      {/* Create Halqa Modal - Minimalistic */}
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
                      <FiHome className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Create Halqa</h3>
                     
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
              <form onSubmit={handleCreateHalqa} className="p-4">
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
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#5041BC] bg-white"
                    >
                      <option value="">Select area</option>
                      {areas.map(a => (
                        <option key={a._id} value={a._id}>{a.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Members Group */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Members Group *</label>
                    <select
                      name="membersGroup"
                      required
                      value={formData.membersGroup}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#5041BC] bg-white"
                    >
                      <option value="">Select group</option>
                      {membersGroups.map(m => (
                        <option key={m._id} value={m._id}>{m.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Halqa Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Halqa Name *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#5041BC]"
                      placeholder="Enter halqa name"
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

      {/* Edit Halqa Modal - Minimalistic */}
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
                    <h3 className="text-lg font-semibold text-white">Edit Halqa</h3>
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
              <form onSubmit={handleUpdateHalqa} className="p-4">
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
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600 bg-white"
                    >
                      <option value="">Select area</option>
                      {areas.map(a => (
                        <option key={a._id} value={a._id}>{a.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Members Group */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Members Group *</label>
                    <select
                      name="membersGroup"
                      required
                      value={formData.membersGroup}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600 bg-white"
                    >
                      <option value="">Select group</option>
                      {membersGroups.map(m => (
                        <option key={m._id} value={m._id}>{m.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Halqa Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Halqa Name *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600"
                      placeholder="Enter halqa name"
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
                      {halqaToDelete?.title?.charAt(0)?.toUpperCase() || 'H'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{halqaToDelete?.title}</p>
                    <p className="text-xs text-gray-500">Halqa will be permanently deleted</p>
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
                    Delete Halqa
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