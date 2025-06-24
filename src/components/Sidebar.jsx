import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiGrid, FiUsers, FiBarChart2, FiSettings, FiBell, FiCreditCard, FiHelpCircle, FiHome, FiUser, FiSmartphone, FiMap, FiMapPin, FiUsers as FiUsersGroup, FiLogOut, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { useSidebar } from '../contexts/SidebarContext';

const navLinks = [
  { name: 'DASHBOARD', icon: <FiGrid />, path: '/admin/dashboard' },
  { name: 'USER', icon: <FiUser />, path: '/user' },
  { name: 'HALQA', icon: <FiHome />, path: '/halqa' },
  { name: 'APP', icon: <FiSmartphone />, path: '/app' },
  { name: 'DISTRICT', icon: <FiMap />, path: '/district' },
  { name: 'AREA', icon: <FiMapPin />, path: '/area' },
  { name: 'MEMBERS GROUP', icon: <FiUsersGroup />, path: '/member-group' },
];

export default function Sidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const { isMinimized, toggleSidebar } = useSidebar();
  const buttonRefs = useRef([]);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we're in admin or user section
  const isAdminSection = location.pathname.startsWith('/admin');

  // Find the navLink whose path matches the current location
  const activeIndex = navLinks.findIndex(link => 
    link.path === location.pathname ||
    (link.name === 'DASHBOARD' && location.pathname.startsWith('/admin'))
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    navigate('/');
  };

  return (
    <aside 
      ref={sidebarRef}
      className={`${isMinimized ? 'w-20' : 'w-72'} min-h-full bg-gradient-to-br from-[#5041BC] to-[#A26AEA] text-white flex flex-col py-8 ${isMinimized ? 'px-3' : 'pl-10 pr-8'} ${isMinimized ? '' : 'rounded-tr-[40px] rounded-br-[40px]'} border-r border-[#e3e6eb] shadow-2xl overflow-y-auto transition-all duration-500 ease-in-out`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
    >
      {/* Header with Logo and Toggle */}
      <div className="flex items-center justify-center mb-6">
        <div 
          className={`flex items-center group cursor-pointer transition-all duration-300 hover:scale-105 ${isMinimized ? 'justify-center w-full' : ''}`}
          onClick={toggleSidebar}
        >
          <svg width="40" height="40" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-500 group-hover:rotate-180">
            <circle cx="60" cy="30" r="20" fill="#fff" />
            <circle cx="30" cy="80" r="20" fill="#fff" />
            <circle cx="90" cy="80" r="20" fill="#fff" />
            <polygon points="60,50 40,80 80,80" fill="#A26AEA" />
          </svg>
          {!isMinimized && (
            <>
              <span className="ml-3 text-2xl font-extrabold tracking-tight transition-all duration-300 group-hover:scale-110">
                Hira Admin
              </span>
              <button
                className="ml-auto p-2 rounded-full hover:bg-[#A26AEA]/30 transition-all duration-500 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/30"
                title={isMinimized ? "Expand Sidebar" : "Minimize Sidebar"}
              >
                <FiChevronsLeft className={`text-xl text-white transition-transform duration-500 ${isMinimized ? 'rotate-180' : 'rotate-0'}`} />
              </button>
            </>
          )}
        </div>
      </div>
      <hr className="border-t border-[#A26AEA] mb-8 opacity-30" />
      <nav className="flex-1">
        <ul className="space-y-2">
          {navLinks.map((link, index) => (
            <li key={link.name}>
              <button
                ref={el => buttonRefs.current[index] = el}
                onClick={() => navigate(link.path)}
                className={`w-full flex items-center ${isMinimized ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-2'} text-left rounded-full font-medium text-base group transition-all duration-300 ease-in-out transform shadow-none border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-[#A26AEA]/20 focus:border-[#A26AEA] ${
                  activeIndex === index
                    ? 'bg-[#A26AEA]/80 text-white border-4 border-[#5041BC] shadow-lg scale-105 transition-all duration-300'
                    : 'hover:bg-[#A26AEA]/20 hover:border-[#A26AEA] hover:scale-105 transition-all duration-200'
                }
                `}
                tabIndex={0}
                title={isMinimized ? link.name : ''}
              >
                <span className={`text-lg sm:text-xl transition-transform duration-300 ease-in-out ${
                  activeIndex === index
                    ? 'text-white scale-110'
                    : 'text-white group-hover:scale-110'
                }`}>{link.icon}</span>
                {!isMinimized && (
                  <span className="transition-all duration-300 ease-in-out text-sm sm:text-base font-semibold tracking-wide">
                    {link.name}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Logout Button */}
      <div className="mt-8">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${isMinimized ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-2'} text-left rounded-full font-medium text-base group transition-all duration-300 ease-in-out transform shadow-none border-2 border-transparent hover:bg-red-500/20 hover:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20`}
          title={isMinimized ? 'LOGOUT' : ''}
        >
          <span className="text-lg sm:text-xl transition-transform duration-300 ease-in-out text-white group-hover:scale-110">
            <FiLogOut />
          </span>
          {!isMinimized && (
            <span className="transition-all duration-300 ease-in-out text-sm sm:text-base font-semibold tracking-wide text-white">
              LOGOUT
            </span>
          )}
        </button>
      </div>
      
      {!isMinimized && (
        <div className="mt-8 text-xs text-gray-200">© Hira Community</div>
      )}
    </aside>
  );
} 