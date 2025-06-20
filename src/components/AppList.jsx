import React, { useState } from 'react';
import { FiEye, FiSettings, FiTrash2, FiUsers } from 'react-icons/fi';

export default function AppList() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const apps = [
    {
      id: 1,
      name: 'Project Phoenix',
      category: 'Productivity',
      status: 'Live',
      icon: '🚀',
      version: '2.5.0',
      users: 12500,
      lastUpdate: '2024-05-18'
    },
    {
      id: 2,
      name: 'QuantumLeap CRM',
      category: 'Business',
      status: 'In Development',
      icon: '💼',
      version: '0.8.0-beta',
      users: 50,
      lastUpdate: '2024-06-15'
    },
    {
      id: 3,
      name: 'DataWeaver',
      category: 'Analytics',
      status: 'Live',
      icon: '📊',
      version: '1.9.2',
      users: 8200,
      lastUpdate: '2024-04-22'
    },
    {
        id: 4,
        name: 'ConnectSphere',
        category: 'Social',
        status: 'Maintenance',
        icon: '💬',
        version: '3.1.5',
        users: 25000,
        lastUpdate: '2024-06-20'
      },
      {
        id: 5,
        name: 'SecureVault',
        category: 'Security',
        status: 'Live',
        icon: '🔒',
        version: '4.0.1',
        users: 50000,
        lastUpdate: '2024-03-30'
      },
      {
        id: 6,
        name: 'Legacy System',
        category: 'Internal',
        status: 'Deprecated',
        icon: '🏛️',
        version: '1.0.0',
        users: 200,
        lastUpdate: '2022-01-01'
      }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Live': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Development': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Deprecated': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {apps.map((app) => (
            <div
                key={app.id}
                className={`relative bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 transition-all duration-300 ease-in-out cursor-pointer group
                  ${hoveredCard === app.id ? 'shadow-2xl scale-[1.025] bg-[#f3f0fa]/70 border-[#5041BC]' : 'hover:shadow-xl hover:scale-[1.02] hover:bg-[#f3f0fa]/50 hover:border-[#5041BC]'}
                `}
                onMouseEnter={() => setHoveredCard(app.id)}
                onMouseLeave={() => setHoveredCard(null)}
            >
                {/* App Header */}
                <div className="p-3 md:p-4 border-b border-gray-100">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="text-2xl md:text-3xl bg-gray-100/60 p-2 md:p-3 rounded-lg">
                        {app.icon}
                    </div>
                    <div className="flex-1">
                    <h3 className="font-semibold text-base md:text-lg text-gray-800 group-hover:text-[#5041BC] transition-colors duration-200">
                        {app.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500">{app.category}</p>
                    </div>
                </div>
                </div>

                {/* App Details */}
                <div className="p-3 md:p-4 space-y-2 md:space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Status</span>
                    <span className={`px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-xs font-semibold border ${getStatusColor(app.status)}`}>
                    {app.status}
                    </span>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Version</span>
                    <span className="text-xs text-gray-700 font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {app.version}
                    </span>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Active Users</span>
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                    <FiUsers className="w-3 h-3" />
                    {app.users.toLocaleString()}
                    </span>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Last Update</span>
                    <span className="text-xs text-gray-600">
                    {new Date(app.lastUpdate).toLocaleDateString()}
                    </span>
                </div>
                </div>

                {/* Action Buttons */}
                <div className={`absolute top-2 right-2 flex gap-1.5 transition-all duration-300 ${
                hoveredCard === app.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
                }`}>
                    <button className="p-2 bg-white hover:bg-blue-100 text-blue-600 rounded-full shadow-md border border-gray-100 transition-all duration-200 hover:scale-110">
                        <FiEye className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-white hover:bg-green-100 text-green-600 rounded-full shadow-md border border-gray-100 transition-all duration-200 hover:scale-110">
                        <FiSettings className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-white hover:bg-red-100 text-red-600 rounded-full shadow-md border border-gray-100 transition-all duration-200 hover:scale-110">
                        <FiTrash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
            ))}
        </div>
    </div>
  );
} 