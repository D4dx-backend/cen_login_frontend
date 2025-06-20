import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiGrid, FiUsers, FiBarChart2, FiSettings, FiBell, FiCreditCard, FiHelpCircle, FiHome, FiUser, FiSmartphone, FiMap, FiMapPin, FiUsers as FiUsersGroup } from 'react-icons/fi';

const navLinks = [
  { name: 'DASHBOARD', icon: <FiGrid />, path: '/admin/dashboard' },
  { name: 'HALQA', icon: <FiHome />, path: '/halqa' },
  { name: 'USER', icon: <FiUser />, path: '/user' },
  { name: 'APP', icon: <FiSmartphone />, path: '/app' },
  { name: 'DISTRICT', icon: <FiMap />, path: '/district' },
  { name: 'AREA', icon: <FiMapPin />, path: '/area' },
  { name: 'MEMBERS GROUP', icon: <FiUsersGroup />, path: '/member-group' },
];

export default function Sidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const buttonRefs = useRef([]);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Find the navLink whose path matches the current location
  const activeIndex = navLinks.findIndex(link =>
    link.path === location.pathname ||
    (link.name === 'DASHBOARD' && location.pathname === '/admin')
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <aside 
      ref={sidebarRef}
      className="w-72 min-h-full bg-gradient-to-br from-[#5041BC] to-[#A26AEA] text-white flex flex-col py-8 pl-10 pr-8 rounded-tr-[40px] rounded-br-[40px] border-r border-[#e3e6eb] shadow-2xl overflow-y-auto"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
    >
      <div className="flex items-center mb-10 group cursor-pointer">
        <svg width="40" height="40" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-500 group-hover:rotate-180">
          <circle cx="60" cy="30" r="20" fill="#fff" />
          <circle cx="30" cy="80" r="20" fill="#fff" />
          <circle cx="90" cy="80" r="20" fill="#fff" />
          <polygon points="60,50 40,80 80,80" fill="#A26AEA" />
        </svg>
        <span className="ml-3 text-2xl font-extrabold tracking-tight transition-transform duration-300 group-hover:scale-110">Hira Admin</span>
      </div>
      <hr className="border-t border-[#A26AEA] mb-8 opacity-30" />
      <nav className="flex-1">
        <ul className="space-y-2">
          {navLinks.map((link, index) => (
            <li key={link.name}>
              <button
                ref={el => buttonRefs.current[index] = el}
                onClick={() => navigate(link.path)}
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-full font-medium text-base group transition-all duration-300 ease-in-out transform shadow-none border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-[#A26AEA]/20 focus:border-[#A26AEA] ${
                  activeIndex === index
                    ? 'bg-[#A26AEA]/80 text-white border-4 border-[#5041BC] shadow-lg scale-105 transition-all duration-300'
                    : 'hover:bg-[#A26AEA]/20 hover:border-[#A26AEA] hover:scale-105 transition-all duration-200'
                }
                `}
                tabIndex={0}
              >
                <span className={`text-lg sm:text-xl transition-transform duration-300 ease-in-out ${
                  activeIndex === index
                    ? 'text-white scale-110'
                    : 'text-white group-hover:scale-110'
                }`}>{link.icon}</span>
                <span className="transition-all duration-300 ease-in-out text-sm sm:text-base font-semibold tracking-wide">
                  {link.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-12 text-xs text-gray-200">© Hira Community</div>
    </aside>
  );
} 