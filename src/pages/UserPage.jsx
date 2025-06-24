import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PageBackground from '../components/PageBackground';
import UserListTable from '../components/UserListTable';
import ProfileButton from '../components/ProfileButton';
import { useSidebar } from '../contexts/SidebarContext';
import { FiPlus, FiFilter, FiSearch, FiX, FiUser, FiPhone, FiShield, FiSmartphone, FiEdit, FiAlertTriangle, FiTrash2, FiEye, FiCalendar, FiClock } from 'react-icons/fi';

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
}, (error) => {
  return Promise.reject(error);
});

export default function UserPage() {
  const { isMinimized } = useSidebar();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [viewUserDetails, setViewUserDetails] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [apps, setApps] = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const userTableRef = useRef();
  const [formData, setFormData] = useState({
    username: '',
    mobile: '',
    userType: '',
    userRole: '',
    app: ''
  });

  const userTypes = [
    { value: 'state', label: 'State' },
    { value: 'district', label: 'District' },
    { value: 'area', label: 'Area' },
    { value: 'halqa', label: 'Halqa' },
    { value: 'member', label: 'Member' },
    { value: 'membersGroup', label: 'Members Group' }
  ];

  const userRoles = [
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'User' }
  ];

  useEffect(() => {
    fetchApps();
  }, []);

  const createDefaultApp = async () => {
    try {
      const response = await api.post('/apps', { title: 'Default App' });
      
      if (response.data.success) {
        console.log('Default app created:', response.data.data);
        fetchApps();
        setMessage('Default app created successfully!');
      }
    } catch (error) {
      console.error('Error creating default app:', error);
      setMessage('Failed to create default app');
    }
  };

  const fetchApps = async () => {
    try {
      setAppsLoading(true);
      console.log('Fetching apps from:', `${API_BASE_URL}/apps`);
      const response = await axios.get(`${API_BASE_URL}/apps`);
      console.log('Apps response:', response.data);
      
      if (response.data.success && response.data.data) {
        setApps(response.data.data);
        console.log('Apps loaded:', response.data.data.length, 'apps');
      } else {
        console.error('Invalid response format:', response.data);
        setMessage('Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setMessage(`Failed to fetch apps: ${error.response?.data?.message || error.message}`);
    } finally {
      setAppsLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      setViewLoading(true);
      const response = await api.get(`/admin/users/${userId}`);
      
      if (response.data.success) {
        setViewUserDetails(response.data.data);
      } else {
        setMessage('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setMessage('Failed to fetch user details');
    } finally {
      setViewLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/admin/users', formData);

      if (response.data.success) {
        setMessage('User created successfully!');
        setFormData({
          username: '',
          mobile: '',
          userType: '',
          userRole: '',
          app: ''
        });
        setShowCreateForm(false);
        userTableRef.current?.refreshUsers();
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      mobile: user.mobile,
      userType: user.userType,
      userRole: user.userRole,
      app: user.app?._id || ''
    });
    setShowEditForm(true);
  };

  const handleViewUser = (user) => {
    setViewingUser(user);
    setShowViewModal(true);
    fetchUserDetails(user._id);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.put(`/admin/users/${editingUser._id}`, formData);

      if (response.data.success) {
        setMessage('User updated successfully!');
        setFormData({
          username: '',
          mobile: '',
          userType: '',
          userRole: '',
          app: ''
        });
        setShowEditForm(false);
        setEditingUser(null);
        userTableRef.current?.refreshUsers();
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await api.delete(`/admin/users/${userToDelete._id}`);
        setShowDeleteConfirm(false);
        setUserToDelete(null);
        userTableRef.current?.refreshUsers();
        setMessage('User deleted successfully!');
      } catch (error) {
        setMessage('Failed to delete user');
        console.error('Error deleting user:', error);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingUser(null);
    setViewUserDetails(null);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      mobile: '',
      userType: '',
      userRole: '',
      app: ''
    });
    setMessage('');
    setEditingUser(null);
  };

  const getUserTypeColor = (userType) => {
    switch (userType) {
      case 'state': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'district': return 'bg-green-100 text-green-700 border-green-200';
      case 'area': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'halqa': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'member': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'membersGroup': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'user': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen relative bg-[#e3e6eb] overflow-hidden" style={{ fontFamily: 'Nunito, sans-serif' }}>
      <PageBackground />
      {/* Sidebar fixed - full window height */}
      <div className="fixed left-0 top-0 h-screen z-10">
        <Sidebar />
      </div>
      {/* Main content positioned to the right of sidebar */}
      <div className={`relative z-20 ${isMinimized ? 'ml-20' : 'ml-72'} flex flex-col min-h-screen transition-all duration-500 ease-in-out`}>
        {/* Profile Button - Top Right */}
        <div className="absolute top-6 right-6 z-30">
          <ProfileButton />
          </div>
        
        <div className="flex-1 flex flex-col p-8 pt-20">
          <main className="flex-1 min-w-0 mt-8">
            {/* Heading */}
            <h2 className="text-3xl font-extrabold text-[#5041BC] mb-2">User Management</h2>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
              <div className="flex items-center w-full sm:w-auto gap-2">
                <div className="relative w-full sm:w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiSearch className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-3 py-2 w-full rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#5041BC]/30 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button className="flex items-center space-x-2 text-sm font-medium text-gray-600 bg-gray-100/60 hover:bg-gray-100 rounded-lg px-4 py-2.5 transition-colors">
                  <FiFilter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center space-x-2 text-sm font-medium text-white bg-gradient-to-r from-[#5041BC] to-[#6C63FF] hover:from-[#6C63FF] hover:to-[#5041BC] rounded-lg px-4 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Create User</span>
                </button>
              </div>
            </div>


            {/* User Table */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <UserListTable 
                onEditUser={handleEditUser} 
                onDeleteUser={handleDeleteUser} 
                onViewUser={handleViewUser} 
                showViewButton={isMinimized} 
                ref={userTableRef} 
              />
            </div>
          </main>
        </div>
      </div>

      {/* View User Modal */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeViewModal}
          ></div>
          
          {/* Modal container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2.5 rounded-xl">
                      <FiEye className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">User Details</h3>
                      <p className="text-white/80 text-sm">Complete user information</p>
                    </div>
                  </div>
                  <button
                    onClick={closeViewModal}
                    className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {viewLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                    <span className="text-gray-600">Loading user details...</span>
                  </div>
                ) : viewUserDetails ? (
                  <div className="space-y-6">
                    {/* User Profile Section */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
                        {viewUserDetails.username?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-gray-900">{viewUserDetails.username}</h4>
                        <p className="text-gray-600 flex items-center gap-2">
                          <FiPhone className="w-4 h-4" />
                          {viewUserDetails.mobile}
                        </p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* User Type */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">User Type</label>
                        <div className={`inline-flex px-3 py-2 rounded-lg text-sm font-semibold border ${getUserTypeColor(viewUserDetails.userType)}`}>
                          {viewUserDetails.userType?.charAt(0).toUpperCase() + viewUserDetails.userType?.slice(1) || 'N/A'}
                        </div>
                      </div>

                      {/* User Role */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">User Role</label>
                        <div className={`inline-flex px-3 py-2 rounded-lg text-sm font-semibold border ${getRoleColor(viewUserDetails.userRole)}`}>
                          <FiShield className="w-4 h-4 mr-2" />
                          {viewUserDetails.userRole?.charAt(0).toUpperCase() + viewUserDetails.userRole?.slice(1) || 'N/A'}
                        </div>
                      </div>

                      {/* App */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Application</label>
                        <div className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg">
                          <FiSmartphone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{viewUserDetails.app?.title || 'No app assigned'}</span>
                        </div>
                      </div>

                      {/* User ID */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">User ID</label>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <span className="text-gray-900 font-mono text-sm">{viewUserDetails._id}</span>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Created Date</label>
                        <div className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg">
                          <FiCalendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">
                            {new Date(viewUserDetails.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Last Updated */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Last Updated</label>
                        <div className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg">
                          <FiClock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">
                            {new Date(viewUserDetails.updatedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Information */}
                    {viewUserDetails.status && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <h5 className="font-semibold text-blue-900 mb-2">Account Status</h5>
                        <p className="text-blue-700">{viewUserDetails.status}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Failed to load user details</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-6 justify-end border-t border-gray-200">
                  <button
                    onClick={closeViewModal}
                    className="px-6 py-2.5 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                  >
                    Close
                  </button>
                  {viewingUser && (
                    <button
                      onClick={() => {
                        closeViewModal();
                        handleEditUser(viewingUser);
                      }}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                    >
                      Edit User
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal - Minimalistic */}
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
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl">
              {/* Modal Header - Gradient */}
              <div className="bg-gradient-to-r from-[#5041BC] to-[#6C63FF] px-4 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <FiUser className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Create User</h3>
                      <p className="text-white/80 text-sm">Add a new user to the system</p>
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
              <form onSubmit={handleSubmit} className="p-4">
                {message && (
                  <div className={`p-3 rounded text-sm mb-4 ${
                    message.includes('successfully') 
                      ? 'bg-green-50 text-green-700 border-l-2 border-green-400' 
                      : 'bg-red-50 text-red-700 border-l-2 border-red-400'
                  }`}>
                    {message}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Username */}
                  <div className="space-y-1">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username *
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5041BC] focus:border-[#5041BC]"
                      placeholder="Enter username"
                    />
                  </div>

                  {/* Mobile */}
                  <div className="space-y-1">
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      required
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5041BC] focus:border-[#5041BC]"
                      placeholder="Enter mobile number"
                    />
                  </div>

                  {/* User Type */}
                  <div className="space-y-1">
                    <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                      User Type *
                    </label>
                    <select
                      id="userType"
                      name="userType"
                      required
                      value={formData.userType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5041BC] focus:border-[#5041BC] bg-white"
                    >
                      <option value="">Select user type</option>
                      {userTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* User Role */}
                  <div className="space-y-1">
                    <label htmlFor="userRole" className="block text-sm font-medium text-gray-700">
                      User Role *
                    </label>
                    <select
                      id="userRole"
                      name="userRole"
                      required
                      value={formData.userRole}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5041BC] focus:border-[#5041BC] bg-white"
                    >
                      <option value="">Select user role</option>
                      {userRoles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* App */}
                  <div className="space-y-1 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="app" className="block text-sm font-medium text-gray-700">
                        App *
                      </label>
                      {!appsLoading && (
                        <button
                          type="button"
                          onClick={fetchApps}
                          className="text-xs text-[#5041BC] hover:text-[#6C63FF] font-medium"
                        >
                          Refresh
                        </button>
                      )}
                    </div>
                    {appsLoading ? (
                      <div className="px-3 py-2 w-full border border-gray-300 rounded-md bg-gray-50 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#5041BC] mr-2"></div>
                        <span className="text-gray-500 text-sm">Loading apps...</span>
                      </div>
                    ) : apps.length === 0 ? (
                      <div className="space-y-2">
                        <div className="px-3 py-2 w-full border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-sm">
                          No apps available
                        </div>
                        <button
                          type="button"
                          onClick={createDefaultApp}
                          className="w-full py-2 px-3 bg-[#5041BC] text-white rounded-md hover:bg-[#6C63FF] font-medium"
                        >
                          Create Default App
                        </button>
                      </div>
                    ) : (
                      <select
                        id="app"
                        name="app"
                        required
                        value={formData.app}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5041BC] focus:border-[#5041BC] bg-white"
                      >
                        <option value="">Select app</option>
                        {apps.map(app => (
                          <option key={app._id} value={app._id}>
                            {app.title}
                          </option>
                        ))}
                      </select>
                    )}
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
                    disabled={loading}
                    className="px-4 py-2 bg-[#5041BC] text-white rounded-md hover:bg-[#6C63FF] disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </div>
                    ) : (
                      'Create User'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal - Compact */}
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
            <div className="relative bg-white rounded-lg shadow-md w-full max-w-lg">
              {/* Modal Header - Gradient */}
              <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-3 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <FiEdit className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">Edit User</h3>
                      <p className="text-white/80 text-xs">Update user information</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      resetForm();
                    }}
                    className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-all duration-200"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleUpdateUser} className="p-4">
                {message && (
                  <div className={`p-2 rounded text-xs mb-3 ${
                    message.includes('successfully') 
                      ? 'bg-green-50 text-green-700 border-l-2 border-green-400' 
                      : 'bg-red-50 text-red-700 border-l-2 border-red-400'
                  }`}>
                    {message}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {/* Username */}
                  <div className="space-y-1">
                    <label htmlFor="edit-username" className="block text-xs font-medium text-gray-700">
                      Username *
                    </label>
                    <input
                      type="text"
                      id="edit-username"
                      name="username"
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600 focus:border-violet-600"
                      placeholder="Enter username"
                    />
                  </div>

                  {/* Mobile */}
                  <div className="space-y-1">
                    <label htmlFor="edit-mobile" className="block text-xs font-medium text-gray-700">
                      Mobile *
                    </label>
                    <input
                      type="tel"
                      id="edit-mobile"
                      name="mobile"
                      required
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600 focus:border-violet-600"
                      placeholder="Enter mobile"
                    />
                  </div>

                  {/* User Type */}
                  <div className="space-y-1">
                    <label htmlFor="edit-userType" className="block text-xs font-medium text-gray-700">
                      Type *
                    </label>
                    <select
                      id="edit-userType"
                      name="userType"
                      required
                      value={formData.userType}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600 focus:border-violet-600 bg-white"
                    >
                      <option value="">Select type</option>
                      {userTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* User Role */}
                  <div className="space-y-1">
                    <label htmlFor="edit-userRole" className="block text-xs font-medium text-gray-700">
                      Role *
                    </label>
                    <select
                      id="edit-userRole"
                      name="userRole"
                      required
                      value={formData.userRole}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600 focus:border-violet-600 bg-white"
                    >
                      <option value="">Select role</option>
                      {userRoles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* App */}
                  <div className="space-y-1 col-span-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="edit-app" className="block text-xs font-medium text-gray-700">
                        App *
                      </label>
                      {!appsLoading && (
                        <button
                          type="button"
                          onClick={fetchApps}
                          className="text-xs text-violet-600 hover:text-indigo-600 font-medium"
                        >
                          Refresh
                        </button>
                      )}
                    </div>
                    {appsLoading ? (
                      <div className="px-2 py-1.5 w-full border border-gray-300 rounded bg-gray-50 flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-violet-600 mr-2"></div>
                        <span className="text-gray-500 text-xs">Loading...</span>
                      </div>
                    ) : apps.length === 0 ? (
                      <div className="space-y-2">
                        <div className="px-2 py-1.5 w-full border border-gray-300 rounded bg-gray-50 text-gray-500 text-xs">
                          No apps available
                        </div>
                        <button
                          type="button"
                          onClick={createDefaultApp}
                          className="w-full py-1.5 px-2 bg-violet-600 text-white rounded hover:bg-indigo-600 font-medium text-xs"
                        >
                          Create Default App
                        </button>
                      </div>
                    ) : (
                      <select
                        id="edit-app"
                        name="app"
                        required
                        value={formData.app}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600 focus:border-violet-600 bg-white"
                      >
                        <option value="">Select app</option>
                        {apps.map(app => (
                          <option key={app._id} value={app._id}>
                            {app.title}
                          </option>
                        ))}
                      </select>
                    )}
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
                    className="px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-3 py-1.5 text-xs bg-violet-600 text-white rounded hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? (
                      <div className="flex items-center gap-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Updating...
                      </div>
                    ) : (
                      'Update'
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
                    Are you sure you want to delete this user?
                  </p>
                  {userToDelete && (
                    <div className="bg-red-50 rounded-lg p-3 border-l-4 border-red-300">
                      <div className="font-semibold text-gray-900">{userToDelete.username}</div>
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