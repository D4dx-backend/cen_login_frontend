import React, { useState } from 'react';
import { FiUser, FiMail, FiClock, FiMoreVertical, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

export default function RecentUsersTable() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const users = [
    {
      id: 1,
      name: 'Jane Doe',
      email: 'jane@example.com',
      status: 'Active',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      lastActive: '2 hours ago',
      role: 'Admin',
      joinDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'John Smith',
      email: 'john@example.com',
      status: 'Inactive',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      lastActive: '1 day ago',
      role: 'User',
      joinDate: '2024-02-20'
    },
    {
      id: 3,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      status: 'Active',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      lastActive: '30 minutes ago',
      role: 'Moderator',
      joinDate: '2024-03-10'
    },
    {
      id: 4,
      name: 'Bob Wilson',
      email: 'bob@example.com',
      status: 'Pending',
      avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
      lastActive: 'Never',
      role: 'User',
      joinDate: '2024-04-05'
    },
    {
      id: 5,
      name: 'Sarah Davis',
      email: 'sarah@example.com',
      status: 'Active',
      avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
      lastActive: '5 minutes ago',
      role: 'User',
      joinDate: '2024-01-30'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 border-green-200';
      case 'Inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Moderator': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'User': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#5041BC]">Recent Users</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Total: {users.length}</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className={`relative bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 transition-all duration-300 ease-in-out cursor-pointer group
              ${hoveredCard === user.id 
                ? 'border-[#5041BC] shadow-lg scale-105 transform' 
                : 'border-gray-100 hover:border-[#5041BC] hover:shadow-md'
              }
              ${selectedUser === user.id ? 'ring-2 ring-[#5041BC] ring-opacity-50' : ''}
            `}
            onMouseEnter={() => setHoveredCard(user.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
          >
            {/* User Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    user.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-[#5041BC] transition-colors duration-200">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <FiMail className="w-3 h-3" />
                    {user.email}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button className="p-1 hover:bg-gray-100 rounded-full">
                    <FiMoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Role</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Last Active</span>
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  <FiClock className="w-3 h-3" />
                  {user.lastActive}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Joined</span>
                <span className="text-xs text-gray-600">
                  {new Date(user.joinDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`absolute top-2 right-2 flex gap-1 transition-all duration-300 ${
              hoveredCard === user.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            }`}>
              <button className="p-1.5 bg-white hover:bg-blue-50 text-blue-600 rounded-lg shadow-sm transition-all duration-200 hover:scale-110">
                <FiEye className="w-3 h-3" />
              </button>
              <button className="p-1.5 bg-white hover:bg-green-50 text-green-600 rounded-lg shadow-sm transition-all duration-200 hover:scale-110">
                <FiEdit className="w-3 h-3" />
              </button>
              <button className="p-1.5 bg-white hover:bg-red-50 text-red-600 rounded-lg shadow-sm transition-all duration-200 hover:scale-110">
                <FiTrash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Selection Indicator */}
            {selectedUser === user.id && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#5041BC] to-[#6C63FF] rounded-t-xl"></div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className="text-center py-12">
          <FiUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">No users found</h3>
          <p className="text-sm text-gray-400">Users will appear here once they register</p>
        </div>
      )}
    </div>
  );
} 