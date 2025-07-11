import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PageBackground from '../components/PageBackground';
import ProfileButton from '../components/ProfileButton';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import DataTable from '../components/DataTable';
import CreateModal from '../components/CreateModal';

import { FiPlus, FiTrash2, FiEdit, FiMap, FiLoader, FiAlertTriangle, FiX, FiSave } from 'react-icons/fi';

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

export default function DistrictPage() {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [districtToDelete, setDistrictToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const tableRef = useRef();
  
  const [formData, setFormData] = useState({
    title: '',
  });

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/districts');
      setDistricts(response.data.data || []);
      console.log('Districts fetched:', response.data.data);
    } catch (error) {
      setError('Failed to fetch districts. Please try again.');
      console.error('Error fetching districts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ title: '' });
    setIsEditing(false);
    setEditingId(null);
    setShowCreateForm(false);
    setShowEditForm(false);
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCreateDistrict = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a district name.');
      return;
    }

    try {
      await api.post('/districts', formData);
      resetForm();
      fetchDistricts();
      showSuccessMessage('District created successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create district.';
      alert(errorMessage);
      console.error('Error creating district:', error);
    }
  };

  const handleEditDistrict = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a district name.');
      return;
    }

    try {
      console.log('Updating district with data:', formData);
      console.log('Editing ID:', editingId);
      const response = await api.put(`/districts/${editingId}`, formData);
      console.log('Update response:', response.data);
      resetForm();
      fetchDistricts();
      showSuccessMessage('District updated successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update district.';
      console.error('Error updating district:', error);
      console.error('Error response:', error.response?.data);
      alert(errorMessage);
    }
  };

  const handleDeleteDistrict = (district) => {
    setDistrictToDelete(district);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (districtToDelete) {
      try {
        setDeleting(true);
        await api.delete(`/districts/${districtToDelete._id}`);
        setShowDeleteConfirm(false);
        setDistrictToDelete(null);
        fetchDistricts();
        showSuccessMessage('District deleted successfully!');
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to delete district.';
        setError(errorMessage);
        console.error('Error deleting district:', error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const cancelDelete = () => {
    if (!deleting) {
    setShowDeleteConfirm(false);
    setDistrictToDelete(null);
    }
  };

  const startEdit = (district) => {
    setFormData({
      title: district.title,
    });
    setIsEditing(true);
    setEditingId(district._id);
    setShowEditForm(true);
  };

  const cancelEdit = () => {
    resetForm();
  };

  return (
    <div className="min-h-screen relative bg-[#e3e6eb] overflow-hidden" style={{ fontFamily: 'Nunito, sans-serif' }}>
      <PageBackground />
      <div className="fixed left-0 top-0 h-screen z-10">
        <Sidebar />
      </div>
      <div className="relative z-20 flex flex-col min-h-screen transition-all duration-300 ease-in-out" style={{ marginLeft: 'var(--sidebar-width, 224px)' }}>
        {/* Profile Button - Top Right */}
        <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2">
          <ProfileButton />
          <div className="flex flex-row gap-2 mt-2">
            <button 
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 text-sm font-medium text-white bg-gradient-to-r from-[#5041BC] to-[#6C63FF] hover:from-[#6C63FF] hover:to-[#5041BC] rounded-lg px-3 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <FiPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Create District</span>
              <span className="sm:hidden">Create</span>
            </button>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col p-4 pt-8">
          <main className="flex-1 min-w-0 mt-4 sm:mt-6 md:mt-4">
            {/* Heading */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-[#5041BC] via-[#6C63FF] to-[#8B7EFF] bg-clip-text text-transparent mb-2 tracking-tight leading-normal pb-1 pr-4 sm:pr-8 md:pr-0">District Management</h2>
            <div className="mb-4 sm:mb-6 md:mb-4"></div>
            
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                {successMessage}
              </div>
            )}
            
            {/* District Table */}
            <div className="bg-white rounded-xl shadow-lg p-4 max-h-[86vh] overflow-y-auto mt-16 sm:mt-8 md:mt-0">
              <DataTable
                ref={tableRef}
                data={districts}
                loading={loading}
                error={error}
                onRetry={fetchDistricts}
                onRefresh={fetchDistricts}
                emptyState={{
                  icon: <FiMap />,
                  title: "No districts found",
                  description: "Create your first district to get started"
                }}
                columns={[
                  {
                    key: 'title',
                    label: 'District',
                    type: 'avatar',
                    fallback: 'D',
                    searchable: true
                  },
                  {
                    key: 'createdAt',
                    label: 'Created',
                    type: 'date'
                  },
                  {
                    key: 'updatedAt',
                    label: 'Updated', 
                    type: 'date'
                  }
                ]}
                actions={[
                  {
                    icon: FiEdit,
                    title: "Edit district",
                    onClick: startEdit,
                    className: "hover:bg-gray-100/50 hover:text-green-500",
                    mobileClassName: "hover:bg-green-50 hover:text-green-500"
                  },
                  {
                    icon: FiTrash2,
                    title: "Delete district",
                    onClick: handleDeleteDistrict,
                    className: "hover:bg-gray-100/50 hover:text-red-500",
                    mobileClassName: "hover:bg-red-50 hover:text-red-500"
                  }
                ]}
              />
            </div>
          </main>
        </div>
      </div>

      {/* Create District Modal */}
      <CreateModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Create District"
        icon={FiMap}
        apiEndpoint="/districts"
        fields={[
          {
            name: 'title',
            label: 'District Name',
            type: 'text',
            required: true,
            placeholder: 'Enter district name',
            fullWidth: true
          }
        ]}
        onSuccess={fetchDistricts}
        successMessage="District created successfully!"
      />

      {/* Edit District Modal - Gradient Header */}
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
              <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-3 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <FiEdit className="w-4 h-4 text-white" />
                      <h3 className="text-lg font-semibold text-white">Edit District</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      resetForm();
                    }}
                    className="text-white/80 hover:text-white p-1"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleEditDistrict} className="p-4">
                {successMessage && (
                  <div className="p-2 rounded text-xs mb-3 bg-green-50 text-green-700 border-l-2 border-green-400">
                    {successMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  {/* District Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">District Name *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600"
                      placeholder="Enter district name"
                    />
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
        itemName={districtToDelete?.title}
        itemType="District"
        loading={deleting}
      />
    </div>
  );
} 