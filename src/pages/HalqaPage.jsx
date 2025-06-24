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
      <div className={`relative z-20 ${isMinimized ? 'ml-20' : 'ml-72'} flex flex-col min-h-screen transition-all duration-500 ease-in-out`}>
        {/* Profile Button - Top Right */}
        <div className="absolute top-6 right-6 z-30">
          <ProfileButton />
        </div>
        
        <div className="flex-1 flex flex-col p-8 pt-20">
          <main className="flex-1 min-w-0 mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-extrabold text-[#5041BC]">Halqa Management</h2>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 text-sm font-medium text-white bg-gradient-to-r from-[#5041BC] to-[#6C63FF] hover:from-[#6C63FF] hover:to-[#5041BC] rounded-lg px-4 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <FiPlus className="w-4 h-4" />
                <span>Create Halqa</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
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
                <div className="space-y-4">
                  {halqas.map(halqa => (
                    <div key={halqa._id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300">
                      <div>
                        <div className="font-bold text-lg text-[#5041BC]">{halqa.title}</div>
                        <div className="text-sm text-gray-500">
                          District: <span className="font-semibold">{halqa.district?.title || 'N/A'}</span>, 
                          Area: <span className="font-semibold">{halqa.area?.title || 'N/A'}</span>, 
                          Group: <span className="font-semibold">{halqa.membersGroup?.title || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleEditHalqa(halqa)} className="p-2 text-gray-400 hover:text-green-500 transition-colors" title="Edit Halqa"><FiEdit className="w-5 h-5" /></button>
                        <button onClick={() => handleDeleteHalqa(halqa)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Delete Halqa"><FiTrash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
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
                      <p className="text-white/80 text-sm">Add a new halqa</p>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5041BC] focus:border-[#5041BC] bg-white"
                    >
                      <option value="">Select Area</option>
                      {areas.map(a => (
                        <option key={a._id} value={a._id}>{a.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Members Group */}
                  <div className="space-y-1">
                    <label htmlFor="modal-membersGroup" className="block text-sm font-medium text-gray-700">
                      Members Group *
                    </label>
                    <select
                      id="modal-membersGroup"
                      name="membersGroup"
                      required
                      value={formData.membersGroup}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5041BC] focus:border-[#5041BC] bg-white"
                    >
                      <option value="">Select Group</option>
                      {membersGroups.map(m => (
                        <option key={m._id} value={m._id}>{m.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Halqa Name */}
                  <div className="space-y-1">
                    <label htmlFor="modal-title" className="block text-sm font-medium text-gray-700">
                      Halqa Name *
                    </label>
                    <input
                      type="text"
                      id="modal-title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5041BC] focus:border-[#5041BC]"
                      placeholder="Enter halqa name"
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
                    Create Halqa
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
              <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <FiEdit className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Edit Halqa</h3>
                      <p className="text-white/80 text-sm">Update halqa information</p>
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
              <form onSubmit={handleUpdateHalqa} className="p-4">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-600 focus:border-violet-600 bg-white"
                    >
                      <option value="">Select Area</option>
                      {areas.map(a => (
                        <option key={a._id} value={a._id}>{a.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Members Group */}
                  <div className="space-y-1">
                    <label htmlFor="edit-membersGroup" className="block text-sm font-medium text-gray-700">
                      Members Group *
                    </label>
                    <select
                      id="edit-membersGroup"
                      name="membersGroup"
                      required
                      value={formData.membersGroup}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-600 focus:border-violet-600 bg-white"
                    >
                      <option value="">Select Group</option>
                      {membersGroups.map(m => (
                        <option key={m._id} value={m._id}>{m.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Halqa Name */}
                  <div className="space-y-1">
                    <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
                      Halqa Name *
                    </label>
                    <input
                      type="text"
                      id="edit-title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-600 focus:border-violet-600"
                      placeholder="Enter halqa name"
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
                    Update Halqa
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
                    Are you sure you want to delete this halqa?
                  </p>
                  {halqaToDelete && (
                    <div className="bg-red-50 rounded-lg p-3 border-l-4 border-red-300">
                      <div className="font-semibold text-gray-900">{halqaToDelete.title}</div>
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