import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export default function ProfileButton() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          navigate('/');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/admin/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setAdminData(response.data.admin);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        // If token is invalid, redirect to login
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Clear admin token
    localStorage.removeItem('adminToken');
    // Navigate to login page
    navigate('/');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const getInitials = (username) => {
    if (!username) return 'A';
    return username.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="flex flex-col items-start">
          <div className="w-20 h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
          <div className="w-16 h-2 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={toggleDropdown}
        className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${
          isDropdownOpen 
            ? 'bg-white/90 backdrop-blur-sm shadow-lg scale-105' 
            : 'bg-white/80 backdrop-blur-sm hover:bg-white/90 hover:scale-105'
        }`}
      >
        {/* Profile Avatar */}
        <div className="w-10 h-10 rounded-full bg-[#5041BC] border-2 border-white/30 flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {getInitials(adminData?.username)}
          </span>
        </div>

        {/* Username */}
        <div className="flex flex-col items-start">
          <span className="text-gray-800 font-semibold text-sm">
            {adminData?.username || 'Admin'}
          </span>
          <span className="text-gray-600 text-xs">Administrator</span>
        </div>

        {/* Dropdown Arrow */}
        <FiChevronDown 
          className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 hover:scale-105 transition-all duration-200 text-sm"
          >
            <FiLogOut className="w-4 h-4 text-gray-500" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
} 