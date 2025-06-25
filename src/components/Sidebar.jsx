import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiUsers, FiBarChart2, FiSettings, FiBell, FiCreditCard, FiHelpCircle, FiHome, FiUser, FiSmartphone, FiMap, FiMapPin, FiUsers as FiUsersGroup, FiLogOut, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { useSidebar } from '../contexts/SidebarContext';

const navLinks = [
  { name: 'USER', icon: <FiUser />, path: '/user' },
  { name: 'HALQA', icon: <FiHome />, path: '/halqa' },
  { name: 'APP', icon: <FiSmartphone />, path: '/app' },
  { name: 'DISTRICT', icon: <FiMap />, path: '/district' },
  { name: 'AREA', icon: <FiMapPin />, path: '/area' },
  { name: 'MEMBERS GROUP', icon: <FiUsersGroup />, path: '/member-group' },
];

export default function Sidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const { isMinimized, setIsMinimized } = useSidebar();
  const buttonRefs = useRef([]);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();



  // Find the navLink whose path matches the current location
  const activeIndex = navLinks.findIndex(link => 
    link.path === location.pathname
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsMinimized(false);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsMinimized(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    navigate('/');
  };

  // Determine the effective width state
  const isExpanded = isHovered || !isMinimized;

  return (
    <aside 
      ref={sidebarRef}
      className={`${isExpanded ? 'w-56' : 'w-16'} min-h-full bg-gradient-to-br from-[#5041BC] to-[#A26AEA] text-white flex flex-col py-6 ${isExpanded ? 'pl-6 pr-4' : 'px-2'} ${isExpanded ? '' : 'rounded-tr-[30px] rounded-br-[30px]'} border-r border-[#e3e6eb] shadow-2xl overflow-hidden transition-all duration-300 ease-in-out`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
    >
      {/* Header with Logo */}
      <div className="flex items-center justify-center mb-4">
        <div 
          className={`flex items-center group transition-all duration-300 ${isExpanded ? 'justify-start' : 'justify-center w-full'}`}
        >
          <svg width="32" height="32" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:rotate-180 flex-shrink-0">
            <circle cx="60" cy="30" r="20" fill="#fff" />
            <circle cx="30" cy="80" r="20" fill="#fff" />
            <circle cx="90" cy="80" r="20" fill="#fff" />
            <polygon points="60,50 40,80 80,80" fill="#A26AEA" />
          </svg>
          {isExpanded && (
            <span className="ml-3 text-lg font-extrabold tracking-tight transition-all duration-300 whitespace-nowrap">
              Hira Admin
            </span>
          )}
        </div>
      </div>
      
      <hr className="border-t border-[#A26AEA] mb-6 opacity-30" />
      
      <nav className="flex-1">
        <ul className="space-y-1">
          {navLinks.map((link, index) => (
            <li key={link.name}>
              <button
                ref={el => buttonRefs.current[index] = el}
                onClick={() => navigate(link.path)}
                className={`w-full flex items-center ${isExpanded ? 'justify-start gap-3 px-3 py-2' : 'justify-center px-2 py-2'} text-left rounded-lg font-medium text-sm group transition-all duration-300 ease-in-out transform shadow-none border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-[#A26AEA]/20 focus:border-[#A26AEA] ${
                  activeIndex === index
                    ? 'bg-[#A26AEA]/80 text-white border-2 border-[#5041BC] shadow-md scale-105 transition-all duration-300'
                    : 'hover:bg-[#A26AEA]/20 hover:border-[#A26AEA] hover:scale-105 transition-all duration-200'
                }
                `}
                tabIndex={0}
                title={!isExpanded ? link.name : ''}
              >
                <span className={`text-base transition-transform duration-300 ease-in-out flex-shrink-0 ${
                  activeIndex === index
                    ? 'text-white scale-110'
                    : 'text-white group-hover:scale-110'
                }`}>{link.icon}</span>
                {isExpanded && (
                  <span className="transition-all duration-300 ease-in-out text-xs font-semibold tracking-wide whitespace-nowrap overflow-hidden">
                    {link.name}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Logout Button */}
      <div className="mt-6">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${isExpanded ? 'justify-start gap-3 px-3 py-2' : 'justify-center px-2 py-2'} text-left rounded-lg font-medium text-sm group transition-all duration-300 ease-in-out transform shadow-none border-2 border-transparent hover:bg-red-500/20 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20`}
          title={!isExpanded ? 'LOGOUT' : ''}
        >
          <span className="text-base transition-transform duration-300 ease-in-out text-white group-hover:scale-110 flex-shrink-0">
            <FiLogOut />
          </span>
          {isExpanded && (
            <span className="transition-all duration-300 ease-in-out text-xs font-semibold tracking-wide text-white whitespace-nowrap">
              LOGOUT
            </span>
          )}
        </button>
      </div>
      
      {isExpanded && (
        <div className="mt-6 text-xs text-gray-200">© Hira Community</div>
      )}
    </aside>
  );
} 