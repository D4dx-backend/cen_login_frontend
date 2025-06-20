import React from 'react';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

const users = [
    {
      id: 1,
      name: 'Jane Doe',
      email: 'jane@example.com',
      status: 'Active',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      role: 'Admin',
    },
    {
      id: 2,
      name: 'John Smith',
      email: 'john@example.com',
      status: 'Inactive',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      role: 'User',
    },
    {
      id: 3,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      status: 'Active',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      role: 'Moderator',
    },
    {
      id: 4,
      name: 'Bob Wilson',
      email: 'bob@example.com',
      status: 'Pending',
      avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
      role: 'User',
    },
    {
      id: 5,
      name: 'Sarah Davis',
      email: 'sarah@example.com',
      status: 'Active',
      avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
      role: 'User',
    }
  ];

const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Inactive': return 'bg-gray-100 text-gray-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
};

const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-700';
      case 'Moderator': return 'bg-blue-100 text-blue-700';
      case 'User': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
};

export default function UserListTable() {
  return (
    <div>
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50/50">
          <tr>
            <th scope="col" className="px-6 py-4 font-semibold">
              User
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              Role
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              Status
            </th>
            <th scope="col" className="px-6 py-4 font-semibold text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="transform transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:bg-white rounded-2xl">
              <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
                <img className="w-11 h-11 rounded-full" src={user.avatar} alt={`${user.name} image`} />
                <div className="pl-3">
                  <div className="text-base font-semibold">{user.name}</div>
                  <div className="font-normal text-gray-500">{user.email}</div>
                </div>
              </th>
              <td className="px-6 py-4">
                  <span className={`px-2.5 py-1.5 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                      {user.role}
                  </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className={`h-2.5 w-2.5 rounded-full mr-2 ${user.status === 'Active' ? 'bg-green-500' : user.status === 'Pending' ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                  {user.status}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center space-x-2">
                  <button className="p-2 text-gray-400 rounded-lg hover:bg-gray-100/50 hover:text-blue-500 transition-colors">
                      <FiEye className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 rounded-lg hover:bg-gray-100/50 hover:text-green-500 transition-colors">
                      <FiEdit className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 rounded-lg hover:bg-gray-100/50 hover:text-red-500 transition-colors">
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
} 