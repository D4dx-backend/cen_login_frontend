import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PageBackground from '../components/PageBackground';
import ProfileButton from '../components/ProfileButton';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import DataTable from '../components/DataTable';
import CreateModal from '../components/CreateModal';

import { FiPlus, FiTrash2, FiEdit, FiMapPin, FiLoader, FiAlertTriangle, FiX, FiMap, FiSearch, FiFilter, FiChevronDown } from 'react-icons/fi';

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

export default function AreaPage() {
  const [areas, setAreas] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newAreaName, setNewAreaName] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const tableRef = useRef();
  const [filterDistrict, setFilterDistrict] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterDropdown && !event.target.closest('.filter-dropdown')) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [areasRes, districtsRes] = await Promise.all([
        api.get('/areas'),
        api.get('/districts')
      ]);
      setAreas(areasRes.data.data || []);
      setDistricts(districtsRes.data.data || []);
    } catch (error) {
      setError('Failed to fetch data. Please try again.');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArea = async (e) => {
    e.preventDefault();
    if (!newAreaName.trim() || !selectedDistrict) {
      alert('Please enter an area name and select a district.');
      return;
    }

    try {
      await api.post('/areas', { title: newAreaName, district: selectedDistrict });
      setNewAreaName('');
      setSelectedDistrict('');
      setShowCreateForm(false);
      fetchData();
    } catch (error) {
      alert('Failed to create area.');
      console.error('Error creating area:', error);
    }
  };

  const handleUpdateArea = async (e) => {
    e.preventDefault();
    if (!newAreaName.trim() || !selectedDistrict) {
      alert('Please enter an area name and select a district.');
      return;
    }

    try {
      await api.put(`/areas/${editingArea._id}`, { title: newAreaName, district: selectedDistrict });
      setNewAreaName('');
      setSelectedDistrict('');
      setIsEditing(false);
      setEditingArea(null);
      setShowEditForm(false);
      fetchData();
    } catch (error) {
      alert('Failed to update area.');
      console.error('Error updating area:', error);
    }
  };

  const handleEdit = (area) => {
    setIsEditing(true);
    setEditingArea(area);
    setNewAreaName(area.title);
    setSelectedDistrict(area.district._id);
    setShowEditForm(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingArea(null);
    setNewAreaName('');
    setSelectedDistrict('');
    setShowEditForm(false);
  };

  const handleDeleteArea = (area) => {
    setAreaToDelete(area);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (areaToDelete) {
      try {
        setDeleting(true);
        await api.delete(`/areas/${areaToDelete._id}`);
        setShowDeleteConfirm(false);
        setAreaToDelete(null);
        fetchData();
      } catch (error) {
        setError('Failed to delete area.');
        console.error('Error deleting area:', error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const cancelDelete = () => {
    if (!deleting) {
    setShowDeleteConfirm(false);
    setAreaToDelete(null);
    }
  };

  const resetForm = () => {
    setNewAreaName('');
    setSelectedDistrict('');
    setShowCreateForm(false);
    setShowEditForm(false);
  };

  // Filtered areas based on selected district and search term
  const filteredAreas = areas.filter(area => {
    const districtMatch = filterDistrict ? (area.district && area.district._id === filterDistrict) : true;
    const searchMatch = searchTerm ? (
      area.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.code?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : true;
    return districtMatch && searchMatch;
  });

  return (
    <div className="min-h-screen relative bg-[#e3e6eb] overflow-hidden" style={{ fontFamily: 'Nunito, sans-serif' }}>
      <PageBackground />
      <div className="fixed left-0 top-0 h-screen z-10">
        <Sidebar />
      </div>
      <div className="relative z-20 flex flex-col min-h-screen transition-all duration-300 ease-in-out" style={{ marginLeft: 'var(--sidebar-width, 224px)' }}>
        {/* Profile Button - Top Right */}
        <div className="absolute top-2 right-4 z-30">
          <ProfileButton />
        </div>
        
        <div className="flex-1 flex flex-col p-4 pt-2">
          <main className="flex-1 min-w-0 mt-2">
            {/* Heading */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-[#5041BC] via-[#6C63FF] to-[#8B7EFF] bg-clip-text text-transparent mb-2 tracking-tight leading-normal pb-1 pr-4 sm:pr-8 md:pr-0">Area Management</h2>
            {/* Toolbar: search left, filter/create right */}
            <div className="flex flex-row items-center justify-between mb-4 gap-2">
              <div className="relative w-full max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiSearch className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search areas or codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#5041BC]/30 text-sm"
                />
              </div>
              <div className="flex flex-row gap-2 items-center">
                <div className="relative filter-dropdown">
                  <button 
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-600 bg-gray-100/60 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
                  >
                    <FiFilter className="w-4 h-4" />
                    <span>Filter</span>
                    {filterDistrict && (
                      <span className="bg-[#5041BC] text-white text-xs rounded-full px-1.5 py-0.5 ml-1">
                        1
                      </span>
                    )}
                    <FiChevronDown className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {/* Dropdown Menu */}
                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                          <h3 className="text-sm font-semibold text-gray-700">Filter Options</h3>
                          <button
                            onClick={() => setShowFilterDropdown(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                        {/* District Filter */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">District</label>
                          <select
                            value={filterDistrict}
                            onChange={e => setFilterDistrict(e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#5041BC] focus:border-[#5041BC]"
                          >
                            <option value="">All Districts</option>
                            {districts.map(d => (
                              <option key={d._id} value={d._id}>{d.title}</option>
                            ))}
                          </select>
                        </div>
                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-gray-200">
                          <button
                            onClick={() => {
                              setFilterDistrict('');
                              setShowFilterDropdown(false);
                            }}
                            className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium"
                          >
                            Clear All
                          </button>
                          <button
                            onClick={() => setShowFilterDropdown(false)}
                            className="flex-1 px-3 py-1.5 text-xs bg-[#5041BC] text-white rounded hover:bg-[#6C63FF] font-medium"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center space-x-2 text-sm font-medium text-white bg-gradient-to-r from-[#5041BC] to-[#6C63FF] hover:from-[#6C63FF] hover:to-[#5041BC] rounded-lg px-3 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <FiPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Area</span>
                  <span className="sm:hidden">Create</span>
                </button>
              </div>
            </div>

            {/* Area Table */}
            <div className="bg-white rounded-xl shadow-lg p-4 max-h-[86vh] overflow-y-auto">
              <DataTable
                ref={tableRef}
                data={filteredAreas}
                loading={loading}
                error={error}
                onRetry={fetchData}
                onRefresh={fetchData}
                emptyState={{
                  icon: <FiMapPin />, 
                  title: "No areas found",
                  description: "Create a new area to get started"
                }}
                columns={[ 
                  {
                    key: 'title',
                    label: 'Area',
                    type: 'avatar',
                    fallback: 'A',
                    searchable: true
                  },
                  {
                    key: 'code',
                    label: 'Code',
                    type: 'badge',
                    getBadgeClass: () => 'bg-blue-50 text-blue-800 border border-blue-200 font-mono'
                  },
                  {
                    key: 'district.title',
                    label: 'District',
                    type: 'badge',
                    getBadgeClass: () => 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  },
                  {
                    key: 'createdAt',
                    label: 'Created',
                    type: 'date'
                  }
                ]}
                actions={[ 
                  {
                    icon: FiEdit,
                    title: "Edit Area",
                    onClick: handleEdit,
                    className: "hover:text-green-600 hover:bg-green-50",
                    mobileClassName: "hover:bg-green-50 hover:text-green-500"
                  },
                  {
                    icon: FiTrash2,
                    title: "Delete Area",
                    onClick: handleDeleteArea,
                    className: "hover:text-red-600 hover:bg-red-50",
                    mobileClassName: "hover:bg-red-50 hover:text-red-500"
                  }
                ]}
              />
            </div>
          </main>
        </div>
      </div>

      {/* Create Area Modal */}
      <CreateModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Create Area"
        icon={FiMapPin}
        apiEndpoint="/areas"
        fields={[
          {
            name: 'district',
            label: 'District',
            type: 'select',
            required: true,
            dependsOn: 'districts'
          },
          {
            name: 'title',
            label: 'Area Name',
            type: 'text',
            required: true,
            placeholder: 'Enter area name'
          }
        ]}
        dependencies={{
          districts: '/districts'
        }}
        onSuccess={fetchData}
        successMessage="Area created successfully!"
      />

      {/* Edit Area Modal - Minimalistic */}
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
                      <h3 className="text-lg font-semibold text-white">Edit Area</h3>
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
              <form onSubmit={handleUpdateArea} className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* District */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">District *</label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      required
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600 bg-white"
                    >
                      <option value="">Select district</option>
                      {districts.map(district => (
                        <option key={district._id} value={district._id}>{district.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Area Name *</label>
                    <input
                      type="text"
                      value={newAreaName}
                      onChange={(e) => setNewAreaName(e.target.value)}
                      required
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600"
                      placeholder="Enter area name"
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        itemName={areaToDelete?.title}
        itemType="Area"
        loading={deleting}
      />
    </div>
  );
} 