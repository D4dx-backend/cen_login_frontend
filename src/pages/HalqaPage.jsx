import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PageBackground from '../components/PageBackground';
import DataTable from '../components/DataTable';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import CreateModal from '../components/CreateModal';
import { FiPlus, FiTrash2, FiEdit, FiHome, FiLoader, FiAlertTriangle, FiX, FiMap, FiMapPin, FiUsers, FiSearch, FiFilter, FiChevronDown } from 'react-icons/fi';


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

  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

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
    if (!formData.title.trim() || !formData.district || !formData.area) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        membersGroup: formData.membersGroup || undefined
      };
      await api.post('/halqas', dataToSend);
      resetForm();
      fetchData();
    } catch (error) {
      alert('Failed to create halqa.');
      console.error('Error creating halqa:', error);
    }
  };

  const handleEditHalqa = (halqa) => {
    setFormData({
      title: halqa.title || '',
      district: halqa.district?._id || '',
      area: halqa.area?._id || '',
      membersGroup: halqa.membersGroup?._id || '',
    });
    setIsEditing(true);
    setEditingHalqa(halqa);
    setShowEditForm(true);
  };

  const handleUpdateHalqa = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.district || !formData.area) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        membersGroup: formData.membersGroup || undefined
      };
      await api.put(`/halqas/${editingHalqa._id}`, dataToSend);
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

  // Filtered halqas based on selected district, area, and search term
  const filteredHalqas = halqas.filter(halqa => {
    const districtMatch = filterDistrict ? (halqa.district && halqa.district._id === filterDistrict) : true;
    const areaMatch = filterArea ? (halqa.area && halqa.area._id === filterArea) : true;
    const searchMatch = searchTerm ? halqa.title?.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    return districtMatch && areaMatch && searchMatch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredHalqas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHalqas = filteredHalqas.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDistrict, filterArea, searchTerm]);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen relative bg-[#e3e6eb] overflow-hidden" style={{ fontFamily: 'Nunito, sans-serif' }}>
      <PageBackground />
      <div className="fixed left-0 top-0 h-screen z-10">
        <Sidebar />
      </div>
      <div className="relative z-20 flex flex-col min-h-screen transition-all duration-300 ease-in-out" style={{ marginLeft: 'var(--sidebar-width, 224px)' }}>
        
        <div className="flex-1 flex flex-col pl-12 pr-6 py-4">
          <main className="flex-1 min-w-0 mt-2">
            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-[#5041BC] via-[#6C63FF] to-[#8B7EFF] bg-clip-text text-transparent mb-2 tracking-tight leading-normal pb-1 pr-4 sm:pr-8 md:pr-0">Halqa Management</h1>
            {/* Toolbar: search left, filter/create right */}
            <div className="flex flex-row items-center justify-between mb-4 gap-2">
              <div className="relative w-full max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiSearch className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search halqas..."
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
                  <span className="hidden sm:inline">Create Halqa</span>
                  <span className="sm:hidden">Create</span>
                </button>
              </div>
            </div>

            {/* Halqa Table */}
            <div className="bg-white rounded-xl shadow-lg p-4 max-h-[86vh] overflow-y-auto">
              <DataTable
                ref={tableRef}
                data={paginatedHalqas}
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
              
              {/* Pagination Controls */}
              {filteredHalqas.length > itemsPerPage && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  {/* Results info */}
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredHalqas.length)} of {filteredHalqas.length} halqas
                  </div>
                  
                  {/* Pagination buttons */}
                  <div className="flex items-center space-x-2">
                    {/* Previous button */}
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    >
                      Previous
                    </button>
                    
                    {/* Page numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                              currentPage === pageNum
                                ? 'bg-[#5041BC] text-white border-[#5041BC]'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Next button */}
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
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
            required: false,
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">Members Group</label>
                    <select
                      name="membersGroup"
                      value={formData.membersGroup}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-600 bg-white"
                    >
                      <option value="">Select group (optional)</option>
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