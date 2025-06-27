import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PageBackground from '../components/PageBackground';
import ProfileButton from '../components/ProfileButton';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import DataTable from '../components/DataTable';
import CreateModal from '../components/CreateModal';

import { FiPlus, FiTrash2, FiEdit, FiMapPin, FiLoader, FiAlertTriangle, FiX, FiMap } from 'react-icons/fi';

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

  useEffect(() => {
    fetchData();
  }, []);

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

  return (
    <div className="min-h-screen relative bg-[#e3e6eb] overflow-hidden" style={{ fontFamily: 'Nunito, sans-serif' }}>
      <PageBackground />
      <div className="fixed left-0 top-0 h-screen z-10">
        <Sidebar />
      </div>
      <div className="relative z-20 flex flex-col min-h-screen transition-all duration-300 ease-in-out" style={{ marginLeft: 'var(--sidebar-width, 224px)' }}>
        {/* Profile Button - Top Right */}
        <div className="absolute top-4 right-4 z-30">
          <ProfileButton />
        </div>
        
        <div className="flex-1 flex flex-col p-4 pt-16">
          <main className="flex-1 min-w-0 mt-4">
            {/* Heading */}
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-[#5041BC] via-[#6C63FF] to-[#8B7EFF] bg-clip-text text-transparent mb-4">Area Management</h2>
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
                <span>Create Area</span>
              </button>
              </div>
            </div>
            
            {/* Area Table */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <DataTable
                ref={tableRef}
                data={areas}
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