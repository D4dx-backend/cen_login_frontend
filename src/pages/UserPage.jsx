import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PageBackground from '../components/PageBackground';
import DataTable from '../components/DataTable';
import ProfileButton from '../components/ProfileButton';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import CreateModal from '../components/CreateModal';


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
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [viewUserDetails, setViewUserDetails] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [apps, setApps] = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    userType: '',
    userRole: '',
    app: ''
  });
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

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError('');
      const response = await api.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        setUsersError('Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsersError('Failed to load users. Please try again.');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
    fetchUsers();
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      userType: '',
      userRole: '',
      app: ''
    });
    setSearchTerm('');
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
        fetchUsers();
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
        fetchUsers();
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
        setDeleting(true);
        await api.delete(`/admin/users/${userToDelete._id}`);
        setShowDeleteConfirm(false);
        setUserToDelete(null);
        fetchUsers();
        setMessage('User deleted successfully!');
      } catch (error) {
        setMessage('Failed to delete user');
        console.error('Error deleting user:', error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const cancelDelete = () => {
    if (!deleting) {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
    }
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
    switch (userType?.toLowerCase()) {
      case 'state': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'district': return 'bg-green-100 text-green-700 border-green-200';
      case 'area': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'halqa': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'member': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'membersgroup': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'user': return 'bg-teal-100 text-teal-700 border-teal-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatUserType = (type) => {
    if (!type) return 'N/A';
    switch (type.toLowerCase()) {
      case 'state': return 'State';
      case 'district': return 'District';
      case 'area': return 'Area';
      case 'halqa': return 'Halqa';
      case 'member': return 'Member';
      case 'membersgroup': return 'Members Group';
      default: return type;
    }
  };

  const formatUserRole = (role) => {
    if (!role) return 'N/A';
    switch (role.toLowerCase()) {
      case 'admin': return 'Admin';
      case 'user': return 'User';
      default: return role;
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
      <div className="relative z-20 flex flex-col min-h-screen transition-all duration-300 ease-in-out" style={{ marginLeft: 'var(--sidebar-width, 64px)' }}>
        {/* Profile Button - Top Right */}
        <div className="absolute top-4 right-4 z-30">
          <ProfileButton />
          </div>
        
        <div className="flex-1 flex flex-col p-4 pt-16">
          <main className="flex-1 min-w-0 mt-4">
            {/* Heading */}
            <h2 className="text-2xl font-extrabold text-[#5041BC] mb-4">User Management</h2>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div className="flex items-center w-full sm:w-auto gap-2">
                <div className="relative w-full sm:w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiSearch className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-3 py-2 w-full rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#5041BC]/30 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button 
                  onClick={() => setShowFilterModal(true)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-600 bg-gray-100/60 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
                >
                  <FiFilter className="w-4 h-4" />
                  <span>Filter</span>
                  {(filters.userType || filters.userRole || filters.app) && (
                    <span className="bg-[#5041BC] text-white text-xs rounded-full px-1.5 py-0.5 ml-1">
                      {[filters.userType, filters.userRole, filters.app].filter(Boolean).length}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center space-x-2 text-sm font-medium text-white bg-gradient-to-r from-[#5041BC] to-[#6C63FF] hover:from-[#6C63FF] hover:to-[#5041BC] rounded-lg px-3 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Create User</span>
                </button>
              </div>
            </div>

            {/* User Table */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <DataTable
                ref={userTableRef} 
                data={[...users].sort((a, b) => a.username.localeCompare(b.username))}
                loading={usersLoading}
                error={usersError}
                onRetry={fetchUsers}
                onRefresh={fetchUsers}
                searchTerm={searchTerm}
                filters={filters}
                emptyState={{
                  icon: <FiUser />,
                  title: "No users found",
                  description: "Users will appear here once they are created"
                }}
                columns={[
                  {
                    key: 'username',
                    label: 'User',
                    type: 'avatar',
                    fallback: 'U',
                    searchable: true
                  },
                  {
                    key: 'userType',
                    label: 'User Type',
                    type: 'badge',
                    getBadgeClass: (userType) => getUserTypeColor(userType),
                    formatValue: (userType) => formatUserType(userType)
                  },
                  {
                    key: 'userRole',
                    label: 'Role',
                    type: 'badge',
                    getBadgeClass: (userRole) => getRoleColor(userRole),
                    formatValue: (userRole) => formatUserRole(userRole)
                  },
                  {
                    key: 'app.title',
                    label: 'App',
                    type: 'badge',
                    getBadgeClass: (appTitle) => {
                      if (!appTitle) return 'bg-slate-50 text-slate-700 border border-slate-200';
                      
                      // Generate consistent colors based on app name
                      const appColors = {
                        'app 1': 'bg-cyan-50 text-cyan-800 border border-cyan-200',
                        'test app': 'bg-purple-50 text-purple-800 border border-purple-200',
                        'demo': 'bg-teal-50 text-teal-800 border border-teal-200',
                        'app 2': 'bg-sky-50 text-sky-800 border border-sky-200',
                        'production': 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                        'staging': 'bg-yellow-50 text-yellow-800 border border-yellow-200',
                        'development': 'bg-orange-50 text-orange-800 border border-orange-200',
                        'beta': 'bg-pink-50 text-pink-800 border border-pink-200',
                        'admin panel': 'bg-indigo-50 text-indigo-800 border border-indigo-200',
                        'mobile app': 'bg-violet-50 text-violet-800 border border-violet-200'
                      };
                      
                      const normalizedTitle = appTitle.toLowerCase().trim();
                      
                      // Return specific color if found, otherwise generate based on hash
                      if (appColors[normalizedTitle]) {
                        return appColors[normalizedTitle];
                      }
                      
                      // Generate color based on string hash for consistent colors
                      const colors = [
                        'bg-rose-50 text-rose-800 border border-rose-200',
                        'bg-amber-50 text-amber-800 border border-amber-200',
                        'bg-lime-50 text-lime-800 border border-lime-200',
                        'bg-emerald-50 text-emerald-800 border border-emerald-200',
                        'bg-teal-50 text-teal-800 border border-teal-200',
                        'bg-cyan-50 text-cyan-800 border border-cyan-200',
                        'bg-sky-50 text-sky-800 border border-sky-200',
                        'bg-blue-50 text-blue-800 border border-blue-200',
                        'bg-indigo-50 text-indigo-800 border border-indigo-200',
                        'bg-violet-50 text-violet-800 border border-violet-200',
                        'bg-purple-50 text-purple-800 border border-purple-200',
                        'bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200'
                      ];
                      
                      let hash = 0;
                      for (let i = 0; i < normalizedTitle.length; i++) {
                        hash = ((hash << 5) - hash + normalizedTitle.charCodeAt(i)) & 0xffffffff;
                      }
                      
                      return colors[Math.abs(hash) % colors.length];
                    }
                  }
                ]}
                actions={[
                  {
                    icon: FiEye,
                    title: "View user details",
                    onClick: handleViewUser,
                    className: "hover:text-blue-500 hover:bg-blue-50",
                    mobileClassName: "hover:bg-blue-50 hover:text-blue-500"
                  },
                  {
                    icon: FiEdit,
                    title: "Edit user",
                    onClick: handleEditUser,
                    className: "hover:text-green-500 hover:bg-green-50",
                    mobileClassName: "hover:bg-green-50 hover:text-green-500"
                  },
                  {
                    icon: FiTrash2,
                    title: "Delete user",
                    onClick: handleDeleteUser,
                    className: "hover:text-red-500 hover:bg-red-50",
                    mobileClassName: "hover:bg-red-50 hover:text-red-500"
                  }
                ]}
              />
            </div>
          </main>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/40"
            onClick={() => setShowFilterModal(false)}
          ></div>
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-4 py-3 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Filter Users</h3>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="text-white/80 hover:text-white p-1"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* User Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                  <select
                    name="userType"
                    value={filters.userType}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5041BC]"
                  >
                    <option value="">All Types</option>
                    {userTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                    </div>

                {/* User Role Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
                  <select
                    name="userRole"
                    value={filters.userRole}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5041BC]"
                  >
                    <option value="">All Roles</option>
                    {userRoles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                      </div>

                {/* App Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">App</label>
                  <select
                    name="app"
                    value={filters.app}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5041BC]"
                  >
                    <option value="">All Apps</option>
                    {apps.map(app => (
                      <option key={app._id} value={app._id}>
                        {app.title}
                      </option>
                    ))}
                  </select>
                      </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={clearFilters}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Clear All
                  </button>
                    <button
                    onClick={() => setShowFilterModal(false)}
                    className="flex-1 px-3 py-2 bg-[#5041BC] text-white rounded-md hover:bg-[#6C63FF]"
                  >
                    Apply
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal - Simplified */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={closeViewModal}
          ></div>
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiEye className="w-5 h-5 text-white" />
                    <h3 className="text-lg font-bold text-white">User Details</h3>
                  </div>
                  <button
                    onClick={closeViewModal}
                    className="text-white/80 hover:text-white p-1"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                {viewLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                    <span className="text-gray-600">Loading...</span>
                  </div>
                ) : viewUserDetails ? (
                  <div className="space-y-4">
                    {/* User Profile */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {viewUserDetails.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{viewUserDetails.username}</h4>
                        <p className="text-gray-600 text-sm">{viewUserDetails.mobile}</p>
                  </div>
                  </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="text-gray-500 text-xs">Type</label>
                        <div className={`mt-1 px-2 py-1 rounded text-xs font-medium ${getUserTypeColor(viewUserDetails.userType)}`}>
                          {formatUserType(viewUserDetails.userType)}
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-500 text-xs">Role</label>
                        <div className={`mt-1 px-2 py-1 rounded text-xs font-medium ${getRoleColor(viewUserDetails.userRole)}`}>
                          {formatUserRole(viewUserDetails.userRole)}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="text-gray-500 text-xs">App</label>
                        <div className="mt-1 text-gray-900">{viewUserDetails.app?.title || 'No app assigned'}</div>
                      </div>
                      <div className="col-span-2">
                        <label className="text-gray-500 text-xs">Created</label>
                        <div className="mt-1 text-gray-900">
                          {new Date(viewUserDetails.createdAt).toLocaleDateString()}
                  </div>
                </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">Failed to load user details</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 justify-end border-t border-gray-200">
                  <button
                    onClick={closeViewModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {viewingUser && (
                  <button
                      onClick={() => {
                        closeViewModal();
                        handleEditUser(viewingUser);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Edit
                  </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <CreateModal
        key={showCreateForm ? 'open' : 'closed'}
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Create User"
        icon={FiUser}
        apiEndpoint="/admin/users"
        fields={[
          {
            name: 'username',
            label: 'Username',
            type: 'text',
            required: true,
            placeholder: 'Enter username'
          },
          {
            name: 'mobile',
            label: 'Mobile',
            type: 'tel',
            required: true,
            placeholder: 'Mobile number'
          },
          {
            name: 'userType',
            label: 'Type',
            type: 'select',
            required: true,
            options: userTypes,
            valueKey: 'value',
            labelKey: 'label'
          },
          {
            name: 'userRole',
            label: 'Role',
            type: 'select',
            required: true,
            options: userRoles,
            valueKey: 'value',
            labelKey: 'label'
          },
          {
            name: 'app',
            label: 'App',
            type: 'select',
            required: true,
            dependsOn: 'apps',
            fullWidth: true
          }
        ]}
        dependencies={{
          apps: '/apps'
        }}
        validationRules={{
          mobile: (value) => ({
            isValid: /^\d{10,15}$/.test(value),
            message: 'Mobile number must be 10-15 digits'
          })
        }}
        onSuccess={fetchUsers}
        successMessage="User created successfully!"
      />

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
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete User"
        itemName={userToDelete?.username}
        itemType="user"
        loading={deleting}
      />
    </div>
  );
} 