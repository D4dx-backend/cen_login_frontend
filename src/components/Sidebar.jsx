import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiUsers, FiBarChart2, FiSettings, FiBell, FiCreditCard, FiHelpCircle, FiHome, FiUser, FiSmartphone, FiMap, FiMapPin, FiUsers as FiUsersGroup, FiLogOut, FiChevronsLeft, FiChevronsRight, FiMenu, FiX } from 'react-icons/fi';
import dxLogoWhite from '../assets/dxLogoWhite.png';

// Create context within this file
const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

// SidebarProvider component
export const SidebarProvider = ({ children }) => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <SidebarContext.Provider value={{ 
      isMinimized, 
      setIsMinimized,
      isHovered,
      setIsHovered
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

const navLinks = [
  { name: 'HALQA', icon: <FiHome />, path: '/halqa' },
  { name: 'DISTRICT', icon: <FiMap />, path: '/district' },
  { name: 'AREA', icon: <FiMapPin />, path: '/area' },
];

export default function Sidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const buttonRefs = useRef([]);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Find the navLink whose path matches the current location
  const activeIndex = navLinks.findIndex(link => 
    link.path === location.pathname
  );

  // Check if screen is mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      const isMobileSize = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(isMobileSize);
      if (!isMobileSize) {
        setIsMobileExpanded(false); // Close mobile expanded state on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile sidebar when clicking outside (only when expanded)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isMobileExpanded && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMobileExpanded(false);
      }
    };

    if (isMobile && isMobileExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile, isMobileExpanded]);

  // Add CSS custom property to communicate sidebar width to other components
  useEffect(() => {
    if (isMobile) {
      // On mobile, always reserve space for the minimized sidebar
      document.documentElement.style.setProperty('--sidebar-width', '60px');
    } else {
      const isExpanded = isHovered || !isMinimized;
      document.documentElement.style.setProperty('--sidebar-width', isExpanded ? '224px' : '64px');
    }
  }, [isHovered, isMinimized, isMobile]);

  const handleMouseEnter = () => {
    if (!isMobile) {
    setIsHovered(true);
      setIsMinimized(false);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
    setIsHovered(false);
      setIsMinimized(true);
    }
  };

  const toggleMobileSidebar = () => {
    if (isMobile) {
      setIsMobileExpanded(!isMobileExpanded);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile && isMobileExpanded) {
      setIsMobileExpanded(false);
    }
  };

  // Determine the effective width state
  const isExpanded = isMobile ? isMobileExpanded : (isHovered || !isMinimized);

  return (
    <>
      {/* Mobile Backdrop - Only when expanded */}
      {isMobile && isMobileExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileExpanded(false)}
        />
      )}

      {/* Sidebar - Always visible, responsive width */}
    <aside 
      ref={sidebarRef}
        className={`
          ${isMobile 
            ? `fixed top-0 left-0 z-40 h-full transition-all duration-300 ease-in-out ${
                isMobileExpanded ? 'w-64' : 'w-15'
              }`
            : `${isExpanded ? 'w-56' : 'w-16'} min-h-screen transition-all duration-300 ease-in-out`
          }
          bg-gradient-to-br from-[#5041BC] to-[#A26AEA] text-white flex flex-col 
          ${isMobile 
            ? isMobileExpanded ? 'py-4 px-4' : 'py-4 px-1'
            : isExpanded ? 'py-6 pl-6 pr-4' : 'py-6 px-2'
          } 
          ${!isMobile ? 'rounded-tr-[30px] rounded-br-[30px]' : ''} 
          ${isMobile && !isMobileExpanded ? 'rounded-tr-[20px] rounded-br-[20px]' : ''}
          shadow-2xl overflow-hidden
        `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
    >
        {/* Header with Logo/Menu Toggle */}
        <div className="flex items-center justify-center mb-4">
          {isMobile ? (
            <button
              onClick={toggleMobileSidebar}
              className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle Sidebar"
            >
              {isMobileExpanded ? (
                <FiX className="w-5 h-5 text-white" />
              ) : (
                <FiMenu className="w-5 h-5 text-white" />
              )}
            </button>
          ) : (
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
          )}
        </div>

        {/* Mobile Logo - Only when expanded */}
        {isMobile && isMobileExpanded && (
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center">
              <svg width="32" height="32" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 flex-shrink-0">
                <circle cx="60" cy="30" r="20" fill="#fff" />
                <circle cx="30" cy="80" r="20" fill="#fff" />
                <circle cx="90" cy="80" r="20" fill="#fff" />
                <polygon points="60,50 40,80 80,80" fill="#A26AEA" />
              </svg>
              <span className="ml-3 text-lg font-extrabold tracking-tight whitespace-nowrap">
                Hira Admin
              </span>
        </div>
      </div>
        )}
        
        <hr className="border-t border-[#A26AEA] mb-4 opacity-30" />
        
      <nav className="flex-1">
          <ul className={`${isMobile && !isMobileExpanded ? 'space-y-4' : 'space-y-3'}`}>
          {navLinks.map((link, index) => (
            <li key={link.name}>
              <button
                ref={el => buttonRefs.current[index] = el}
                  onClick={() => handleNavigation(link.path)}
                  className={`w-full flex items-center ${
                    isExpanded 
                      ? 'justify-start gap-3 px-3 py-2' 
                      : isMobile 
                        ? 'justify-center px-1 py-2' 
                        : 'justify-center px-2 py-2'
                  } text-left rounded-lg font-medium text-sm group transition-all duration-300 ease-in-out transform shadow-none border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-[#A26AEA]/20 focus:border-[#A26AEA] ${
                  activeIndex === index
                      ? 'bg-[#A26AEA]/80 text-white border-2 border-[#5041BC] shadow-md scale-105 transition-all duration-300'
                    : 'hover:bg-[#A26AEA]/20 hover:border-[#A26AEA] hover:scale-105 transition-all duration-200'
                }
                `}
                tabIndex={0}
                  title={!isExpanded ? link.name : ''}
              >
                  <span className={`${isMobile && !isMobileExpanded ? 'text-sm' : 'text-base'} transition-transform duration-300 ease-in-out flex-shrink-0 ${
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
        <div className="mt-4">
        <button
          onClick={handleLogout}
            className={`w-full flex items-center ${
              isExpanded 
                ? 'justify-start gap-3 px-3 py-2' 
                : isMobile 
                  ? 'justify-center px-1 py-2' 
                  : 'justify-center px-2 py-2'
            } text-left rounded-lg font-medium text-sm group transition-all duration-300 ease-in-out transform shadow-none border-2 border-transparent hover:bg-red-500/20 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20`}
            title={!isExpanded ? 'LOGOUT' : ''}
        >
            <span className={`${isMobile && !isMobileExpanded ? 'text-sm' : 'text-base'} transition-transform duration-300 ease-in-out text-white group-hover:scale-110 flex-shrink-0`}>
            <FiLogOut />
          </span>
            {isExpanded && (
              <span className="transition-all duration-300 ease-in-out text-xs font-semibold tracking-wide text-white whitespace-nowrap">
              LOGOUT
            </span>
          )}
        </button>
      </div>
      
        <div className="mt-4 flex flex-col items-center space-y-2">
          <img 
            src={dxLogoWhite} 
            alt="D4DX Logo" 
            className="w-8 h-8 object-contain"
          />
          {isExpanded && (
            <div className="text-xs text-gray-200 font-medium">POWERED BY D4DX</div>
          )}
        </div>
    </aside>
    </>
  );
} 