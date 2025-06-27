import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PageBackground from '../components/PageBackground';
import ProfileButton from '../components/ProfileButton';
import DataTable from '../components/DataTable';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import CreateModal from '../components/CreateModal';
import { FiPlus, FiTrash2, FiEdit, FiHome, FiLoader, FiAlertTriangle, FiX, FiMap, FiMapPin, FiUsers } from 'react-icons/fi';


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

export default function HalqaPage() {
  const [halqas, setHalqas] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [areas, setAreas] = useState([]);
  const [membersGroups, setMembersGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingHalqa, setEditingHalqa] = useState(null);
  const [halqaToDelete, setHalqaToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const tableRef = useRef();
  
  const [formData, setFormData] = useState({
    title: '',
    district: '',
    area: '',
    membersGroup: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [halqasRes, districtsRes, areasRes, membersGroupsRes] = await Promise.all([
        api.get('/halqas'),
        api.get('/districts'),
        api.get('/areas'),
        api.get('/members'),
      ]);
      setHalqas(halqasRes.data.data || []);
      setDistricts(districtsRes.data.data || []);
      setAreas(areasRes.data.data || []);
      setMembersGroups(membersGroupsRes.data.data || []);
    } catch (error) {
      setError('Failed to fetch data. Please try again.');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ title: '', district: '', area: '', membersGroup: '' });
    setShowCreateForm(false);
    setShowEditForm(false);
    setIsEditing(false);
    setEditingHalqa(null);
  };

  const handleCreateHalqa = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.district || !formData.area || !formData.membersGroup) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      await api.post('/halqas', formData);
      resetForm();
      fetchData();
    } catch (error) {
      alert('Failed to create halqa.');
      console.error('Error creating halqa:', error);
    }
  };

  const handleEditHalqa = (halqa) => {
    setFormData({
      title: halqa.title,
      district: halqa.district._id,
      area: halqa.area._id,
      membersGroup: halqa.membersGroup._id,
    });
    setIsEditing(true);
    setEditingHalqa(halqa);
    setShowEditForm(true);
  };

  const handleUpdateHalqa = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.district || !formData.area || !formData.membersGroup) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      await api.put(`/halqas/${editingHalqa._id}`, formData);
      resetForm();
      fetchData();
    } catch (error) {
      alert('Failed to update halqa.');
      console.error('Error updating halqa:', error);
    }
  };

  const handleDeleteHalqa = (halqa) => {
    setHalqaToDelete(halqa);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (halqaToDelete) {
      try {
        setDeleting(true);
        await api.delete(`/halqas/${halqaToDelete._id}`);
        setShowDeleteConfirm(false);
        setHalqaToDelete(null);
        fetchData();
      } catch (error) {
        setError('Failed to delete halqa.');
        console.error('Error deleting halqa:', error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const cancelDelete = () => {
    if (!deleting) {
    setShowDeleteConfirm(false);
    setHalqaToDelete(null);
    }
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
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#5041BC] via-[#6C63FF] to-[#8B7EFF] bg-clip-text text-transparent mb-4">Halqa Management</h1>
            
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
                <span>Create Halqa</span>
              </button>
            </div>
                </div>

            {/* Halqa Table */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <DataTable
                ref={tableRef}
                data={halqas}
                loading={loading}
                error={error}
                onRetry={fetchData}
                onRefresh={fetchData}
                emptyState={{
                  icon: <FiHome />,
                  title: "No halqas found",
                  description: "Create a new halqa to get started"
                }}
                columns={[
                  {
                    key: 'title',
                    label: 'Halqa',
                    type: 'avatar',
                    fallback: 'H',
                    searchable: true
                  },
                  {
                    key: 'district.title',
                    label: 'District',
                    type: 'badge',
                    getBadgeClass: () => 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  },
                  {
                    key: 'area.title',
                    label: 'Area',
                    type: 'badge',
                    getBadgeClass: () => 'bg-amber-50 text-amber-800 border border-amber-200'
                  },
                  {
                    key: 'membersGroup.title',
                    label: 'Members Group',
                    type: 'badge',
                    getBadgeClass: () => 'bg-violet-50 text-violet-800 border border-violet-200'
                  }
                ]}
                actions={[
                  {
                    icon: FiEdit,
                    title: "Edit Halqa",
                    onClick: handleEditHalqa,
                    className: "hover:text-green-600 hover:bg-green-50",
                    mobileClassName: "hover:bg-green-50 hover:text-green-500"
                  },
                  {
                    icon: FiTrash2,
                    title: "Delete Halqa",
                    onClick: handleDeleteHalqa,
                    className: "hover:text-red-600 hover:bg-red-50",
                    mobileClassName: "hover:bg-red-50 hover:text-red-500"
                  }
                ]}
              />
            </div>
          </main>
        </div>
      </div>

      {/* Create Halqa Modal */}
      <CreateModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Create Halqa"
        icon={FiHome}
        apiEndpoint="/halqas"
        fields={[
          {
            name: 'district',
            label: 'District',
            type: 'select',
            required: true,
            dependsOn: 'districts',
            valueKey: '_id',
            labelKey: 'title'
          },
          {
            name: 'area',
            label: 'Area',
            type: 'select',
            required: true,
            dependsOn: 'areas',
            filterBy: 'district',
            valueKey: '_id',
            labelKey: 'title'
          },
          {
            name: 'membersGroup',
            label: 'Members Group',
            type: 'select',
            required: true,
            dependsOn: 'membersGroups',
            filterBy: 'area',
            valueKey: '_id',
            labelKey: 'title'
          },
          {
            name: 'title',
            label: 'Halqa Name',
            type: 'text',
            required: true,
            placeholder: 'Enter halqa name',
            fullWidth: true
          }
        ]}
        dependencies={{
          districts: '/districts',
          areas: '/areas',
          membersGroups: '/members'
        }}
        customLogic={{
          onFieldChange: (name, value, formData) => {
            console.log('HalqaPage: Field changed:', { name, value, formData });
            let newData = { ...formData, [name]: value };
            
            // Reset dependent fields when parent changes
            if (name === 'district') {
              newData.area = '';
              newData.membersGroup = '';
            } else if (name === 'area') {
              newData.membersGroup = '';
            }
            
            console.log('HalqaPage: Updated form data:', newData);
            return newData;
          }
        }}
        onSuccess={() => {
          console.log('HalqaPage: Create success');
          fetchData();
        }}
        successMessage="Halqa created successfully!"
      />

      {/* Edit Halqa Modal - Minimalistic */}
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
                      <h3 className="text-lg font-semibold text-white">Edit Halqa</h3>
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
              <form onSubmit={handleUpdateHalqa} className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* District */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">District *</label>
                    <select
                      name="district"
                      required
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600 bg-white"
                    >
                      <option value="">Select district</option>
                      {districts.map(d => (
                        <option key={d._id} value={d._id}>{d.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Area *</label>
                    <select
                      name="area"
                      required
                      value={formData.area}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600 bg-white"
                    >
                      <option value="">Select area</option>
                      {areas.map(a => (
                        <option key={a._id} value={a._id}>{a.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Members Group */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Members Group *</label>
                    <select
                      name="membersGroup"
                      required
                      value={formData.membersGroup}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600 bg-white"
                    >
                      <option value="">Select group</option>
                      {membersGroups.map(m => (
                        <option key={m._id} value={m._id}>{m.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Halqa Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Halqa Name *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600"
                      placeholder="Enter halqa name"
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
        title="Delete Halqa"
        itemName={halqaToDelete?.title}
        itemType="halqa"
        loading={deleting}
      />
    </div>
  );
} 