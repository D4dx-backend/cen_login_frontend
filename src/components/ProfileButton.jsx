import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function ProfileButton() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={toggleDropdown}
        className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${
          isDropdownOpen 
            ? 'bg-white/20 backdrop-blur-sm shadow-lg scale-105' 
            : 'bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:scale-105'
        }`}
      >
        {/* Profile Picture */}
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Username */}
        <div className="flex flex-col items-start">
          <span className="text-white font-semibold text-sm">Admin User</span>
          <span className="text-white/70 text-xs">Administrator</span>
        </div>

        {/* Dropdown Arrow */}
        <FiChevronDown 
          className={`w-4 h-4 text-white/80 transition-transform duration-300 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 transform transition-all duration-200 origin-top-right scale-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors duration-200">
              <FiLogOut className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <div className="font-semibold text-sm">Logout</div>
              <div className="text-xs text-gray-500 group-hover:text-red-500">Sign out of your account</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
} 