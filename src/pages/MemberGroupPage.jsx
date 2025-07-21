import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PageBackground from '../components/PageBackground';
import ProfileButton from '../components/ProfileButton';
import DataTable from '../components/DataTable';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import CreateModal from '../components/CreateModal';
import { FiPlus, FiTrash2, FiEdit, FiUsers, FiLoader, FiAlertTriangle, FiX, FiSave, FiMapPin, FiMap, FiSearch, FiFilter, FiChevronDown } from 'react-icons/fi';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

export default function MemberGroupPage() {
  console.log('MemberGroupPage: Component initialized');

  const [membersGroups, setMembersGroups] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const tableRef = useRef();
  
  const [formData, setFormData] = useState({
    title: '',
    district: '',
    area: '',
  });

  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log('MemberGroupPage: Initial useEffect triggered');
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
    console.log('MemberGroupPage: fetchData started');
    setLoading(true);
    setError('');
    try {
      console.log('MemberGroupPage: Fetching data from APIs');
      const [membersGroupsRes, districtsRes, areasRes] = await Promise.all([
        api.get('/members'),
        api.get('/districts'),
        api.get('/areas'),
      ]);
      console.log('MemberGroupPage: API responses received', {
        membersGroups: membersGroupsRes.data,
        districts: districtsRes.data,
        areas: areasRes.data
      });
      
      setMembersGroups(membersGroupsRes.data.data || []);
      setDistricts(districtsRes.data.data || []);
      setAreas(areasRes.data.data || []);
      
      console.log('MemberGroupPage: State updated with fetched data', {
        membersGroupsCount: (membersGroupsRes.data.data || []).length,
        districtsCount: (districtsRes.data.data || []).length,
        areasCount: (areasRes.data.data || []).length
      });
    } catch (error) {
      console.error('MemberGroupPage: Error in fetchData:', error);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
      console.log('MemberGroupPage: fetchData completed');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('MemberGroupPage: handleInputChange', { name, value });
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'district') {
        newData.area = '';
        console.log('MemberGroupPage: District changed, area reset');
      }
      console.log('MemberGroupPage: New form data:', newData);
      return newData;
    });
  };

  const resetForm = () => {
    console.log('MemberGroupPage: resetForm called');
    setFormData({
      title: '',
      district: '',
      area: '',
    });
    setIsEditing(false);
    setEditingId(null);
    setShowCreateForm(false);
    setShowEditForm(false);
    console.log('MemberGroupPage: Form reset completed');
  };

  const showSuccessMessage = (message) => {
    console.log('MemberGroupPage: showSuccessMessage:', message);
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
      console.log('MemberGroupPage: Success message cleared');
    }, 3000);
  };

  const handleCreateMembersGroup = async (e) => {
    e.preventDefault();
    console.log('MemberGroupPage: handleCreateMembersGroup started', formData);

    if (!formData.title.trim() || !formData.district || !formData.area) {
      console.log('MemberGroupPage: Form validation failed');
      alert('Please fill in all fields.');
      return;
    }

    try {
      console.log('MemberGroupPage: Sending create request');
      const response = await api.post('/members', formData);
      console.log('MemberGroupPage: Create response:', response.data);
      resetForm();
      fetchData();
      showSuccessMessage('Members group created successfully!');
    } catch (error) {
      console.error('MemberGroupPage: Error in handleCreateMembersGroup:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create members group.';
      alert(errorMessage);
    }
  };

  const handleEditMembersGroup = async (e) => {
    e.preventDefault();
    console.log('MemberGroupPage: handleEditMembersGroup started', { formData, editingId });

    if (!formData.title.trim() || !formData.district || !formData.area) {
      console.log('MemberGroupPage: Edit form validation failed');
      alert('Please fill out all fields.');
      return;
    }

    try {
      console.log('MemberGroupPage: Sending update request');
      const response = await api.put(`/members/${editingId}`, formData);
      console.log('MemberGroupPage: Update response:', response.data);
      resetForm();
      fetchData();
      showSuccessMessage('Members group updated successfully!');
    } catch (error) {
      console.error('MemberGroupPage: Error in handleEditMembersGroup:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update members group.';
      alert(errorMessage);
    }
  };

  const handleDeleteMembersGroup = (group) => {
    console.log('MemberGroupPage: handleDeleteMembersGroup called', group);
    setGroupToDelete(group);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    console.log('MemberGroupPage: confirmDelete started', groupToDelete);
    if (groupToDelete) {
      try {
        setDeleting(true);
        console.log('MemberGroupPage: Sending delete request');
        await api.delete(`/members/${groupToDelete._id}`);
        setShowDeleteConfirm(false);
        setGroupToDelete(null);
        fetchData();
        showSuccessMessage('Members group deleted successfully!');
      } catch (error) {
        console.error('MemberGroupPage: Error in confirmDelete:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete members group.';
        setError(errorMessage);
      } finally {
        setDeleting(false);
      }
    }
  };

  const cancelDelete = () => {
    console.log('MemberGroupPage: cancelDelete called');
    if (!deleting) {
      setShowDeleteConfirm(false);
      setGroupToDelete(null);
    }
  };

  const startEdit = (group) => {
    console.log('MemberGroupPage: startEdit called', group);
    setFormData({
      title: group.title,
      district: group.district?._id || '',
      area: group.area?._id || '',
    });
    setIsEditing(true);
    setEditingId(group._id);
    setShowEditForm(true);
    console.log('MemberGroupPage: Edit mode initialized with data:', {
      title: group.title,
      district: group.district?._id,
      area: group.area?._id
    });
  };

  const cancelEdit = () => {
    console.log('MemberGroupPage: cancelEdit called');
    resetForm();
  };

  // Filter areas based on selected district
  const filteredAreas = areas.filter(area => {
    if (!formData.district) return true;
    // Handle both cases: area.district as object (populated) or string (just ID)
    if (typeof area.district === 'object' && area.district !== null) {
      return area.district._id === formData.district;
    }
    return area.district === formData.district;
  });

  // Filtered membersGroups based on selected district, area, and search term
  const filteredMembersGroups = membersGroups.filter(group => {
    const districtMatch = filterDistrict ? (group.district && group.district._id === filterDistrict) : true;
    const areaMatch = filterArea ? (group.area && group.area._id === filterArea) : true;
    const searchMatch = searchTerm ? group.title?.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    return districtMatch && areaMatch && searchMatch;
  });

  // Debug logging
  console.log('All areas:', areas);
  console.log('Form data:', formData);
  console.log('Filtered areas:', filteredAreas);

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
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-[#5041BC] via-[#6C63FF] to-[#8B7EFF] bg-clip-text text-transparent mb-2 tracking-tight leading-normal pb-1 pr-4 sm:pr-8 md:pr-0">Members Group Management</h2>
            
            {/* Toolbar: search left, filter/create right */}
            <div className="flex flex-row items-center justify-between mb-4 gap-2">
              <div className="relative w-full max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiSearch className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search groups..."
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
                    {(filterDistrict || filterArea) && (
                      <span className="bg-[#5041BC] text-white text-xs rounded-full px-1.5 py-0.5 ml-1">
                        {[filterDistrict, filterArea].filter(Boolean).length}
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
                            onChange={e => {
                              setFilterDistrict(e.target.value);
                              setFilterArea(''); // Reset area filter when district changes
                            }}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#5041BC] focus:border-[#5041BC]"
                          >
                            <option value="">All Districts</option>
                            {districts.map(d => (
                              <option key={d._id} value={d._id}>{d.title}</option>
                            ))}
                          </select>
                        </div>
                        {/* Area Filter */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Area</label>
                          <select
                            value={filterArea}
                            onChange={e => setFilterArea(e.target.value)}
                            disabled={!filterDistrict}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#5041BC] focus:border-[#5041BC]"
                          >
                            <option value="">{filterDistrict ? 'All Areas' : 'Select District First'}</option>
                            {areas.filter(a => !filterDistrict || (a.district && a.district._id === filterDistrict)).map(a => (
                              <option key={a._id} value={a._id}>{a.title}</option>
                            ))}
                          </select>
                        </div>
                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-gray-200">
                          <button
                            onClick={() => {
                              setFilterDistrict('');
                              setFilterArea('');
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
                  <span className="hidden sm:inline">Create Members Group</span>
                  <span className="sm:hidden">Create</span>
                </button>
              </div>
            </div>
            
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                {successMessage}
              </div>
            )}
            
            {/* Members Group Table */}
            <div className="bg-white rounded-xl shadow-lg p-4 max-h-[86vh] overflow-y-auto">
              <DataTable
                ref={tableRef}
                data={filteredMembersGroups}
                loading={loading}
                error={error}
                onRetry={fetchData}
                onRefresh={fetchData}
                emptyState={{
                  icon: <FiUsers />,
                  title: "No members groups found",
                  description: "Create a new members group to get started"
                }}
                columns={[
                  {
                    key: 'title',
                    label: 'Members Group',
                    type: 'avatar',
                    fallback: 'M',
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
                    key: 'createdAt',
                    label: 'Created',
                    type: 'date'
                  }
                ]}
                actions={[
                  {
                    icon: FiEdit,
                    title: "Edit Group",
                    onClick: startEdit,
                    className: "hover:text-green-600 hover:bg-green-50",
                    mobileClassName: "hover:bg-green-50 hover:text-green-500"
                  },
                  {
                    icon: FiTrash2,
                    title: "Delete Group",
                    onClick: handleDeleteMembersGroup,
                    className: "hover:text-red-600 hover:bg-red-50",
                    mobileClassName: "hover:bg-red-50 hover:text-red-500"
                  }
                ]}
              />
            </div>
          </main>
        </div>
      </div>

      {/* Create Members Group Modal */}
      <CreateModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Create Members Group"
        icon={FiUsers}
        apiEndpoint="/members"
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
            name: 'title',
            label: 'Group Name',
            type: 'text',
            required: true,
            placeholder: 'Enter group name',
            fullWidth: true
          }
        ]}
        dependencies={{
          districts: '/districts',
          areas: '/areas'
        }}
        customLogic={{
          onFieldChange: (name, value, formData) => {
            console.log('MemberGroupPage: Field changed:', { name, value, formData });
            if (name === 'district') {
              // When district changes, reset area
              return { ...formData, district: value, area: '' };
            }
            return { ...formData, [name]: value };
          }
        }}
        onSuccess={() => {
          console.log('MemberGroupPage: Create success');
          fetchData();
        }}
        successMessage="Members group created successfully!"
      />

      {/* Edit Members Group Modal - Minimalistic */}
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
                      <h3 className="text-lg font-semibold text-white">Edit Members Group</h3>
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
              <form onSubmit={handleEditMembersGroup} className="p-4">
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
                      disabled={filteredAreas.length === 0}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600 bg-white disabled:bg-gray-50"
                    >
                      <option value="">{formData.district ? 'Select area' : 'Select district first'}</option>
                      {filteredAreas.map(a => (
                        <option key={a._id} value={a._id}>{a.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Group Name */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Group Name *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600"
                      placeholder="Enter group name"
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
        title="Delete Members Group"
        itemName={groupToDelete?.title}
        itemType="members group"
        loading={deleting}
      />
    </div>
  );
} 