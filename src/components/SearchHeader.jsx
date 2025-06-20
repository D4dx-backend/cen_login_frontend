import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { FaChevronDown } from 'react-icons/fa';

export default function SearchHeader() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotificationSelected, setIsNotificationSelected] = useState(false);
  const [isUserMenuSelected, setIsUserMenuSelected] = useState(false);

  const handleSearchFocus = () => {
    console.log('Search focused');
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    console.log('Search blurred');
    setIsSearchFocused(false);
  };

  const handleNotificationClick = () => {
    console.log('Notification clicked, current state:', isNotificationSelected);
    setIsNotificationSelected(!isNotificationSelected);
  };

  const handleUserMenuClick = () => {
    console.log('User menu clicked, current state:', isUserMenuSelected);
    setIsUserMenuSelected(!isUserMenuSelected);
  };

  console.log('SearchHeader render - states:', { isSearchFocused, isNotificationSelected, isUserMenuSelected });

  return (
    <div className="flex items-center justify-between mb-8">
      {/* Interactive Search Bar */}
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-xl group">
          <input
            type="text"
            placeholder="Search"
            className={`w-full pl-4 pr-10 py-2 rounded-full border-2 transition-all duration-300 font-normal text-sm group/input
              ${isSearchFocused 
                ? 'bg-white border-[#A26AEA] text-[#5041BC] shadow-lg focus:border-[#A26AEA] focus:ring-2 focus:ring-[#A26AEA]/30' 
                : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-white hover:border-[#A26AEA]'}
            `}
            style={{ fontFamily: 'Nunito, sans-serif' }}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
          <FiSearch className={`absolute right-3 top-1/2 -translate-y-1/2 text-lg transition-all duration-300 pointer-events-none
            ${isSearchFocused ? 'text-[#A26AEA] scale-100' : 'group-hover/input:text-[#A26AEA] group-hover/input:scale-90 text-gray-400 scale-100'}
          `} />
          <style>{`
            input::placeholder {
              color: #A26AEA;
              opacity: 1;
              transition: color 0.3s, font-size 0.3s, transform 0.3s;
            }
            input:not(:focus):not(:hover)::placeholder {
              color: #a0aec0;
              font-size: 1rem;
              transform: scale(1);
            }
            input:hover::placeholder {
              color: #A26AEA;
              font-size: 0.9rem;
              transform: scale(0.9);
            }
          `}</style>
        </div>
      </div>
      
      {/* Interactive Notification and User Elements */}
      <div className="flex items-center gap-6 ml-8">
        {/* Interactive Notification Bell Button */}
        <button 
          className={`relative p-3 rounded-full transition-all duration-300 ${
            isNotificationSelected 
              ? 'text-[#A26AEA] scale-110' 
              : 'text-gray-600 hover:text-[#A26AEA] hover:scale-105'
          }`}
          onClick={handleNotificationClick}
        >
          <IoMdNotificationsOutline className="text-2xl" />
          <span className={`absolute top-1 right-1 block w-3 h-3 rounded-full transition-all duration-300 ${
            isNotificationSelected 
              ? 'bg-[#A26AEA]' 
              : 'bg-red-500'
          }`}></span>
        </button>
        
        {/* Interactive User Info */}
        <button 
          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
            isUserMenuSelected 
              ? 'text-[#A26AEA] scale-105' 
              : 'text-gray-600 hover:text-[#A26AEA] hover:scale-105'
          }`}
          onClick={handleUserMenuClick}
        >
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="User Avatar"
            className="w-8 h-8 rounded-full object-cover transition-all duration-300"
          />
          <span className="font-semibold">Danielle Campbell</span>
          <FaChevronDown className={`text-xs transition-transform duration-300 ${
            isUserMenuSelected ? 'rotate-180' : ''
          }`} />
        </button>
      </div>
    </div>
  );
} 