import React, { useState, useEffect } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  console.log('API Request:', {
    url: config.url,
    method: config.method,
    hasToken: !!token
  });
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('API Request Error:', error);
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  console.log('API Response:', {
    url: response.config.url,
    status: response.status,
    data: response.data
  });
  return response;
}, (error) => {
  console.error('API Response Error:', {
    url: error.config?.url,
    status: error.response?.status,
    data: error.response?.data
  });
  return Promise.reject(error);
});

const CreateModal = ({
  isOpen,
  onClose,
  title,
  icon: Icon,
  apiEndpoint,
  fields = [],
  onSuccess,
  successMessage = "Created successfully!",
  dependencies = {},
  validationRules = {},
  customLogic = null
}) => {
  console.log('CreateModal: Component rendered with props:', {
    isOpen,
    title,
    apiEndpoint,
    fields,
    dependencies
  });

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [dependencyData, setDependencyData] = useState({});
  const [dependencyLoading, setDependencyLoading] = useState({});

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialData = {};
      fields.forEach(field => {
        initialData[field.name] = '';
      });
      setFormData(initialData);
      setMessage('');
      setDependencyData({});
      fetchDependencies();
    }
  }, [isOpen]);

  // Fetch dropdown options for select fields
  const fetchDependencies = async () => {
    for (const [key, endpoint] of Object.entries(dependencies)) {
      setDependencyLoading(prev => ({ ...prev, [key]: true }));
      try {
        const response = await api.get(endpoint);
        console.log(`CreateModal: ${key} API Response:`, response.data);
        
        // Ensure we're getting an array of objects with _id and title
        let processedData = [];
        if (response.data && response.data.data) {
          processedData = response.data.data;
        } else if (Array.isArray(response.data)) {
          processedData = response.data;
        }
        
        console.log(`CreateModal: Processed ${key} data:`, processedData);
        
        setDependencyData(prev => ({
          ...prev,
          [key]: processedData
        }));
      } catch (error) {
        console.error(`CreateModal: Failed to fetch ${key}:`, error);
        setDependencyData(prev => ({ ...prev, [key]: [] }));
      } finally {
        setDependencyLoading(prev => ({ ...prev, [key]: false }));
      }
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    console.log('CreateModal: handleInputChange called with:', { name, value });

    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // If changing district, reset area
      if (name === 'district') {
        newData.area = '';
      }
      
      console.log('CreateModal: New form data:', newData);
      return newData;
    });
  };

  const validateForm = () => {
    console.log('CreateModal: validateForm started', formData);
    for (const field of fields) {
      if (field.required && !formData[field.name]?.toString().trim()) {
        const message = `${field.label} is required.`;
        console.log('CreateModal: Validation failed -', message);
        setMessage(message);
        return false;
      }
      
      // Custom validation rules
      if (validationRules[field.name]) {
        const validation = validationRules[field.name](formData[field.name]);
        if (!validation.isValid) {
          console.log('CreateModal: Custom validation failed -', validation.message);
          setMessage(validation.message);
          return false;
        }
      }
    }
    console.log('CreateModal: Form validation passed');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('CreateModal: handleSubmit started', formData);
    
    if (!validateForm()) return;

    setLoading(true);
    setMessage('');

    try {
      console.log('CreateModal: Sending create request to:', apiEndpoint);
      const response = await api.post(apiEndpoint, formData);
      console.log('CreateModal: Create response:', response.data);
      setMessage(successMessage);
      
      // Auto close after success
      setTimeout(() => {
        console.log('CreateModal: Auto-closing after success');
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
      
    } catch (error) {
      console.error('CreateModal: Create error:', error);
      const errorMessage = error.response?.data?.message || `Failed to create ${title.toLowerCase()}.`;
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    console.log('CreateModal: resetAndClose called');
    setFormData({});
    setMessage('');
    onClose();
  };

  const renderField = (field) => {
    const {
      name,
      label,
      type,
      placeholder,
      required,
      options,
      dependsOn,
      valueKey = '_id',
      labelKey = 'title',
      disabled = false,
      className = '',
      filterBy
    } = field;

    const baseInputClass = `w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#5041BC] ${className}`;
    const selectClass = `${baseInputClass} bg-white`;

    switch (type) {
      case 'select':
        let selectOptions = [];
        if (options && Array.isArray(options) && options.length > 0) {
          selectOptions = options;
        } else if (dependsOn && dependencyData[dependsOn]) {
          selectOptions = dependencyData[dependsOn];

          // Filter options based on parent selection
          if (filterBy && formData[filterBy]) {
            selectOptions = selectOptions.filter(option => {
              let optionParentId;
              if (name === 'area') {
                optionParentId = option.district?._id || option.district;
              } else if (name === 'membersGroup') {
                optionParentId = option.area?._id || option.area;
              }
              return optionParentId === formData[filterBy];
            });
          }
        }

        const isLoading = dependsOn ? dependencyLoading[dependsOn] : false;
        const isDisabled = disabled || isLoading || (filterBy && !formData[filterBy]);

        return (
          <select
            name={name}
            value={formData[name] || ''}
            onChange={handleInputChange}
            className={selectClass}
            disabled={isDisabled}
            required={required}
          >
            <option value="">
              {isLoading ? 'Loading...' :
                isDisabled ? `Select ${filterBy} first` :
                `Select ${label.toLowerCase()}`}
            </option>
            {selectOptions.map((option) => {
              const optionValue = option[valueKey] ?? option.value;
              const optionLabel = option[labelKey] ?? option.label;
              if (!optionValue || !optionLabel) return null;
              return (
                <option key={optionValue} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
        );

      case 'text':
      case 'tel':
        return (
          <input
            type={type}
            name={name}
            value={formData[name] || ''}
            onChange={handleInputChange}
            className={baseInputClass}
            placeholder={placeholder}
            required={required}
            disabled={disabled || loading}
          />
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={!loading ? resetAndClose : undefined}
      />
      
      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg">
          {/* Modal Header - Gradient */}
          <div className="bg-gradient-to-r from-[#5041BC] to-[#6C63FF] px-4 py-3 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4 text-white" />}
                <h3 className="text-lg font-semibold text-white">{title}</h3>
              </div>
              <button
                onClick={!loading ? resetAndClose : undefined}
                disabled={loading}
                className="text-white/80 hover:text-white p-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="p-4">
            {message && (
              <div className={`p-2 rounded text-xs mb-3 ${
                message.includes('successfully') || message.includes('created')
                  ? 'bg-green-50 text-green-700 border-l-2 border-green-400' 
                  : 'bg-red-50 text-red-700 border-l-2 border-red-400'
              }`}>
                {message}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {fields.map((field) => (
                <div 
                  key={field.name} 
                  className={field.fullWidth ? 'col-span-2' : ''}
                >
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {field.label} {field.required && '*'}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </div>

            {/* Form Actions */}
            <div className="flex gap-2 pt-3 justify-end border-t border-gray-200 mt-3">
              <button
                type="button"
                onClick={resetAndClose}
                disabled={loading}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-1.5 text-xs bg-[#5041BC] text-white rounded hover:bg-[#6C63FF] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {loading ? (
                  <>
                    <FiLoader className="w-3 h-3 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateModal; 