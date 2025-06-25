import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import { FiEdit, FiTrash2, FiEye, FiUser } from 'react-icons/fi';

const API_BASE_URL = 'http://localhost:3000/api';

const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'user': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
};

const getUserTypeColor = (userType) => {
    switch (userType) {
      case 'state': return 'bg-blue-100 text-blue-700';
      case 'district': return 'bg-green-100 text-green-700';
      case 'area': return 'bg-yellow-100 text-yellow-700';
      case 'halqa': return 'bg-orange-100 text-orange-700';
      case 'member': return 'bg-pink-100 text-pink-700';
      case 'membersGroup': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-700';
    }
};

const UserListTable = forwardRef(({ onEditUser, onDeleteUser, onViewUser, showViewButton = true, searchTerm = '', filters = {} }, ref) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/users`);
      setUsers(response.data.data || []);
    } catch (error) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Expose fetchUsers function to parent component
  useImperativeHandle(ref, () => ({
    refreshUsers: fetchUsers
  }));

  // Filter and search users
  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = !searchTerm || 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile?.includes(searchTerm);

    // Type filter
    const matchesType = !filters.userType || user.userType === filters.userType;

    // Role filter
    const matchesRole = !filters.userRole || user.userRole === filters.userRole;

    // App filter
    const matchesApp = !filters.app || user.app?._id === filters.app;

    return matchesSearch && matchesType && matchesRole && matchesApp;
  });

  const handleDeleteUser = (user) => {
    if (onDeleteUser) {
      onDeleteUser(user);
    }
  };

  const handleViewUser = (user) => {
    if (onViewUser) {
      onViewUser(user);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5041BC] mx-auto"></div>
        <p className="mt-2 text-gray-500 text-sm">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <FiUser className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">No users found</h3>
        <p className="text-sm text-gray-400">Users will appear here once they are created</p>
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="text-center py-8">
        <FiUser className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">No users match your criteria</h3>
        <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div>
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50/50">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              User
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              User Type
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Role
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              App
            </th>
            <th scope="col" className="px-4 py-3 font-semibold text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredUsers.map((user) => (
            <tr key={user._id} className="transform transition-transform duration-300 ease-in-out hover:scale-[1.01] hover:shadow-md hover:bg-white rounded-xl">
              <th scope="row" className="flex items-center px-4 py-3 text-gray-900 whitespace-nowrap">
                <div className="w-9 h-9 rounded-full bg-[#5041BC] flex items-center justify-center text-white font-semibold text-sm">
                  {user.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="pl-3">
                  <div className="text-sm font-semibold">{user.username}</div>
                </div>
              </th>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getUserTypeColor(user.userType)}`}>
                  {user.userType?.charAt(0).toUpperCase() + user.userType?.slice(1) || 'N/A'}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.userRole)}`}>
                  {user.userRole?.charAt(0).toUpperCase() + user.userRole?.slice(1) || 'N/A'}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-gray-600">
                  {user.app?.title || 'N/A'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className={`flex items-center justify-center ${showViewButton ? 'space-x-1' : 'space-x-2'}`}>
                  {/* View Button - Only show when showViewButton is true */}
                  {showViewButton && (
                    <button 
                      className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100/50 hover:text-blue-500 transition-colors"
                      title="View user details"
                      onClick={() => handleViewUser(user)}
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100/50 hover:text-green-500 transition-colors"
                    title="Edit user"
                    onClick={() => onEditUser && onEditUser(user)}
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user)}
                    className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100/50 hover:text-red-500 transition-colors"
                    title="Delete user"
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
  );
});

export default UserListTable; 