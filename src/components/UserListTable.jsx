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

const UserListTable = forwardRef(({ onEditUser, onDeleteUser, onViewUser, showViewButton = true }, ref) => {
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
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5041BC] mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <FiUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">No users found</h3>
        <p className="text-sm text-gray-400">Users will appear here once they are created</p>
      </div>
    );
  }

  return (
    <div>
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50/50">
          <tr>
            <th scope="col" className="px-6 py-4 font-semibold">
              User
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              User Type
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              Role
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              App
            </th>
            <th scope="col" className="px-6 py-4 font-semibold text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user._id} className="transform transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:bg-white rounded-2xl">
              <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
                <div className="w-11 h-11 rounded-full bg-[#5041BC] flex items-center justify-center text-white font-semibold text-lg">
                  {user.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="pl-3">
                  <div className="text-base font-semibold">{user.username}</div>
                  <div className="font-normal text-gray-500">{user.mobile}</div>
                </div>
              </th>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1.5 rounded-full text-xs font-semibold ${getUserTypeColor(user.userType)}`}>
                  {user.userType?.charAt(0).toUpperCase() + user.userType?.slice(1) || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1.5 rounded-full text-xs font-semibold ${getRoleColor(user.userRole)}`}>
                  {user.userRole?.charAt(0).toUpperCase() + user.userRole?.slice(1) || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">
                  {user.app?.title || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className={`flex items-center justify-center ${showViewButton ? 'space-x-2' : 'space-x-3'}`}>
                  {/* View Button - Only show when showViewButton is true */}
                  {showViewButton && (
                    <button 
                      className="p-2 text-gray-400 rounded-lg hover:bg-gray-100/50 hover:text-blue-500 transition-colors"
                      title="View user details"
                      onClick={() => handleViewUser(user)}
                    >
                      <FiEye className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    className="p-2 text-gray-400 rounded-lg hover:bg-gray-100/50 hover:text-green-500 transition-colors"
                    title="Edit user"
                    onClick={() => onEditUser && onEditUser(user)}
                  >
                    <FiEdit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user)}
                    className="p-2 text-gray-400 rounded-lg hover:bg-gray-100/50 hover:text-red-500 transition-colors"
                    title="Delete user"
                  >
                    <FiTrash2 className="w-5 h-5" />
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