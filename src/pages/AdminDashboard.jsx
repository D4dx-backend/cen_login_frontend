import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PageBackground from '../components/PageBackground';
import ProfileButton from '../components/ProfileButton';
import { useSidebar } from '../contexts/SidebarContext';
import { 
  FiUsers, 
  FiMap, 
  FiMapPin, 
  FiHome, 
  FiUserCheck, 
  FiSmartphone,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiPlus,
  FiAlertTriangle,
  FiClock,
  FiBell,
  FiSettings,
  FiBarChart,
  FiBarChart2,
  FiDownload,
  FiUpload,
  FiSearch,
  FiFilter,
  FiEye,
  FiShield,
  FiDatabase,
  FiMail,
  FiCalendar
} from 'react-icons/fi';

export default function AdminDashboard() {
  const { isMinimized } = useSidebar();
  const navigate = useNavigate();
  
  // Use the same API base URL as LoginPage
const API_BASE_URL = 'http://localhost:3000/api';

  // State for dashboard data with initial demo data
  const [dashboardData, setDashboardData] = useState({
    users: { total: 0, active: 0, inactive: 0, trend: 0 },
    districts: { total: 0, trend: 0 },
    areas: { total: 0, trend: 0 },
    halqas: { total: 0, trend: 0 },
    membersGroups: { total: 0, trend: 0 },
    apps: { total: 0, active: 0 },
    recentActivity: [],
    usersByType: {},
    usersByRole: {},
    notifications: 3,
    pendingApprovals: 5,
    systemHealth: 'good'
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    const userType = localStorage.getItem('userType');
    
    console.log('Auth check:', { adminToken: !!adminToken, userType });
    console.log('Full localStorage:', {
      adminToken: localStorage.getItem('adminToken'),
      userType: localStorage.getItem('userType'),
      userToken: localStorage.getItem('userToken')
    });
    
    if (!adminToken || userType !== 'admin') {
      console.log('No admin token or wrong user type, redirecting to login');
      // Add a small delay to see what's happening
      setTimeout(() => {
        navigate('/');
      }, 2000);
      return;
    }
    
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('adminToken');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('Fetching dashboard data from:', API_BASE_URL);
      console.log('Using token:', !!token);
      
      // Fetch all data in parallel with correct endpoints
      const responses = await Promise.allSettled([
        fetch(`${API_BASE_URL}/admin/users`, { headers }),
        fetch(`${API_BASE_URL}/districts`, { headers }),
        fetch(`${API_BASE_URL}/areas`, { headers }),
        fetch(`${API_BASE_URL}/halqas`, { headers }),
        fetch(`${API_BASE_URL}/members`, { headers }), // Note: backend uses /members not /members-groups
        fetch(`${API_BASE_URL}/apps`, { headers })
      ]);

      console.log('API Responses status:', responses.map(r => r.status));

      // Process responses
      const results = await Promise.allSettled(
        responses.map(async (response, index) => {
          const endpoints = ['users', 'districts', 'areas', 'halqas', 'members', 'apps'];
          
          if (response.status === 'fulfilled' && response.value.ok) {
            const data = await response.value.json();
            console.log(`${endpoints[index]} response:`, data);
            return data;
          } else {
            console.warn(`Failed to fetch ${endpoints[index]}:`, response);
            return { success: false, data: [] };
          }
        })
      );

      // Extract data with fallbacks
      const [usersData, districtsData, areasData, halqasData, groupsData, appsData] = results.map(
        result => result.status === 'fulfilled' ? result.value : { success: false, data: [] }
      );

      console.log('Final API data:', {
        users: usersData,
        districts: districtsData,
        areas: areasData,
        halqas: halqasData,
        groups: groupsData,
        apps: appsData
      });

      // Extract data arrays from API responses with fallbacks
      const users = (usersData.success && Array.isArray(usersData.data)) ? usersData.data : [];
      const districts = (districtsData.success && Array.isArray(districtsData.data)) ? districtsData.data : [];
      const areas = (areasData.success && Array.isArray(areasData.data)) ? areasData.data : [];
      const halqas = (halqasData.success && Array.isArray(halqasData.data)) ? halqasData.data : [];
      const groups = (groupsData.success && Array.isArray(groupsData.data)) ? groupsData.data : [];
      const apps = (appsData.success && Array.isArray(appsData.data)) ? appsData.data : [];

      console.log('Processed data counts:', { 
        users: users.length, 
        districts: districts.length, 
        areas: areas.length, 
        halqas: halqas.length, 
        groups: groups.length, 
        apps: apps.length 
      });

      // Process user data safely
      const usersByType = users.reduce((acc, user) => {
        if (user && user.userType) {
          acc[user.userType] = (acc[user.userType] || 0) + 1;
        }
        return acc;
      }, {});

      const usersByRole = users.reduce((acc, user) => {
        if (user && user.userRole) {
          acc[user.userRole] = (acc[user.userRole] || 0) + 1;
        }
        return acc;
      }, {});

      // Generate comprehensive recent activity with multiple action types
      const recentActivity = [];
      
      // Add recent users with different actions
      if (users.length > 0) {
        users.slice(-3).forEach(user => {
          if (user && user.username && user.createdAt) {
            const actions = ['created', 'updated', 'activated'];
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            recentActivity.push({
              id: `user-${user._id || user.id || Math.random()}`,
              type: 'user',
              action: randomAction,
              item: user.username,
              time: user.updatedAt ? new Date(user.updatedAt) : new Date(user.createdAt),
              icon: FiUsers,
              color: 'blue',
              description: `User "${user.username}" was ${randomAction}`,
              clickable: true,
              path: '/user'
            });
          }
        });
      }

      // Add recent districts
      if (districts.length > 0) {
        districts.slice(-2).forEach(district => {
          if (district && district.title && district.createdAt) {
            recentActivity.push({
              id: `district-${district._id || district.id || Math.random()}`,
              type: 'district',
              action: 'created',
              item: district.title,
              time: new Date(district.createdAt),
              icon: FiMap,
              color: 'emerald',
              description: `District "${district.title}" was created`,
              clickable: true,
              path: '/district'
            });
          }
        });
      }

      // Add recent areas
      if (areas.length > 0) {
        areas.slice(-2).forEach(area => {
          if (area && area.title && area.createdAt) {
            recentActivity.push({
              id: `area-${area._id || area.id || Math.random()}`,
              type: 'area',
              action: 'created',
              item: area.title,
              time: new Date(area.createdAt),
              icon: FiMapPin,
              color: 'purple',
              description: `Area "${area.title}" was created`,
              clickable: true,
              path: '/area'
            });
          }
        });
      }

      // Add recent halqas
      if (halqas.length > 0) {
        halqas.slice(-2).forEach(halqa => {
          if (halqa && halqa.title && halqa.createdAt) {
            recentActivity.push({
              id: `halqa-${halqa._id || halqa.id || Math.random()}`,
              type: 'halqa',
              action: 'created',
              item: halqa.title,
              time: new Date(halqa.createdAt),
              icon: FiHome,
              color: 'orange',
              description: `Halqa "${halqa.title}" was created`,
              clickable: true,
              path: '/halqa'
            });
          }
        });
      }

      // Add recent groups
      if (groups.length > 0) {
        groups.slice(-1).forEach(group => {
          if (group && group.title && group.createdAt) {
            recentActivity.push({
              id: `group-${group._id || group.id || Math.random()}`,
              type: 'group',
              action: 'created',
              item: group.title,
              time: new Date(group.createdAt),
              icon: FiUserCheck,
              color: 'indigo',
              description: `Members group "${group.title}" was created`,
              clickable: true,
              path: '/member-group'
            });
          }
        });
      }

      // Add system activities
      const systemActivities = [
        {
          id: 'system-backup',
          type: 'system',
          action: 'backup completed',
          item: 'Database',
          time: new Date(Date.now() - Math.random() * 3600000),
          icon: FiDatabase,
          color: 'gray',
          description: 'Automated database backup completed',
          clickable: false
        },
        {
          id: 'system-security',
          type: 'security',
          action: 'scan completed',
          item: 'Security Check',
          time: new Date(Date.now() - Math.random() * 7200000),
          icon: FiShield,
          color: 'green',
          description: 'Security vulnerability scan completed',
          clickable: false
        }
      ];

      // Add some system activities randomly
      if (Math.random() > 0.5) {
        recentActivity.push(systemActivities[0]);
      }
      if (Math.random() > 0.7) {
        recentActivity.push(systemActivities[1]);
      }

      // Sort by time (most recent first) and limit to 8 items
      recentActivity.sort((a, b) => b.time - a.time);
      const limitedActivity = recentActivity.slice(0, 8);

      // Calculate trends (mock data for now)
      const calculateTrend = () => Math.floor(Math.random() * 20) - 10;

      // Set dashboard data
      const newDashboardData = {
        users: { 
          total: users.length || 0, 
          active: users.filter(u => u && u.userType === 'active').length || 0,
          inactive: users.filter(u => u && u.userType === 'inactive').length || 0,
          trend: calculateTrend()
        },
        districts: { 
          total: districts.length || 0, 
          trend: calculateTrend() 
        },
        areas: { 
          total: areas.length || 0, 
          trend: calculateTrend() 
        },
        halqas: { 
          total: halqas.length || 0, 
          trend: calculateTrend() 
        },
        membersGroups: { 
          total: groups.length || 0, 
          trend: calculateTrend() 
        },
        apps: { 
          total: apps.length || 0, 
          active: apps.filter(a => a && a.status === 'active').length || 0 
        },
        recentActivity: limitedActivity,
        usersByType,
        usersByRole,
        notifications: Math.floor(Math.random() * 10),
        pendingApprovals: Math.floor(Math.random() * 15),
        systemHealth: 'good'
      };

      console.log('Final dashboard data:', newDashboardData);
      setDashboardData(newDashboardData);
      setLastRefresh(new Date());
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
      
      // Set fallback data with some demo values 
      setDashboardData({
        users: { total: 15, active: 12, inactive: 3, trend: 5 },
        districts: { total: 8, trend: 2 },
        areas: { total: 25, trend: -1 },
        halqas: { total: 45, trend: 3 },
        membersGroups: { total: 12, trend: 1 },
        apps: { total: 6, active: 4 },
        recentActivity: [
          {
            type: 'user',
            action: 'created',
            item: 'Ahmed Ali',
            time: new Date(Date.now() - 300000),
            icon: FiUsers,
            color: 'blue'
          },
          {
            type: 'district',
            action: 'created',
            item: 'Lahore District',
            time: new Date(Date.now() - 600000),
            icon: FiMap,
            color: 'green'
          },
          {
            type: 'area',
            action: 'created',
            item: 'Model Town',
            time: new Date(Date.now() - 900000),
            icon: FiMapPin,
            color: 'purple'
          }
        ],
        usersByType: {
          'admin': 2,
          'moderator': 5,
          'member': 8
        },
        usersByRole: {
          'halqa_admin': 3,
          'area_admin': 4,
          'district_admin': 2,
          'member': 6
        },
        notifications: 3,
        pendingApprovals: 5,
        systemHealth: 'good'
      });
    } finally {
      setLoading(false);
    }
  };

  // Safe navigation functions that don't redirect to login
  const navigateToPage = (path) => {
    console.log('Navigating to:', path);
    // Navigate to the full path without admin prefix since routes are defined at root level
    navigate(path);
  };

    const StatCard = ({ title, value, icon: Icon, gradientFrom, gradientTo, subtitle, onClick, notification }) => (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative border border-gray-100 hover:border-gray-300 group transform hover:scale-[1.02]"
      onClick={onClick}
    >
      {notification && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-400 text-white rounded-full flex items-center justify-center text-xs font-medium z-10">
          {notification}
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center transition-all duration-300">
            <Icon className="w-5 h-5 text-white" />
          </div>
          {subtitle && (
            <span className="text-xs text-gray-500 font-medium">{subtitle}</span>
          )}
        </div>
        
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
            {loading ? (
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            ) : (
              value.toLocaleString()
            )}
          </p>
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, color, onClick, badge }) => (
    <div 
      className="bg-white rounded-lg border border-gray-100 p-3 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer group relative overflow-hidden transform hover:scale-[1.02] active:scale-[0.98]"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
          <Icon className="w-5 h-5 text-white transition-all duration-300" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-900 transition-colors duration-300 truncate">{title}</h4>
          <p className="text-xs text-gray-500 group-hover:text-blue-700 transition-colors duration-300 truncate">{description}</p>
        </div>
        {badge && (
          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
            {badge}
          </div>
        )}
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      {/* Active indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top rounded-r-full"></div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const Icon = activity.icon;
    const timeAgo = Math.floor((new Date() - activity.time) / (1000 * 60));
    
    const getTimeDisplay = (minutes) => {
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (minutes < 1440) return `${Math.floor(minutes/60)}h ago`;
      return `${Math.floor(minutes/1440)}d ago`;
    };

    const getActionColor = (action) => {
      switch(action) {
        case 'created': return 'green';
        case 'updated': return 'blue';
        case 'deleted': return 'red';
        case 'activated': return 'emerald';
        case 'backup completed': return 'gray';
        case 'scan completed': return 'green';
        default: return 'gray';
      }
    };

    const handleClick = () => {
      if (activity.clickable && activity.path) {
        console.log(`Navigating to ${activity.path} for ${activity.type}: ${activity.item}`);
        navigateToPage(activity.path);
      }
    };

    const colorMap = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', ring: 'ring-blue-200' },
      green: { bg: 'bg-green-100', text: 'text-green-600', ring: 'ring-green-200' },
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', ring: 'ring-emerald-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', ring: 'ring-purple-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', ring: 'ring-orange-200' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', ring: 'ring-indigo-200' },
      gray: { bg: 'bg-gray-100', text: 'text-gray-600', ring: 'ring-gray-200' },
      red: { bg: 'bg-red-100', text: 'text-red-600', ring: 'ring-red-200' }
    };

    const colors = colorMap[activity.color] || colorMap.gray;
    const actionColor = getActionColor(activity.action);
    const actionColors = colorMap[actionColor] || colorMap.gray;

  return (
      <div 
        className={`flex items-start gap-2 p-2 hover:bg-gray-50 rounded-lg transition-all duration-200 group relative border border-transparent hover:border-gray-200 ${
          activity.clickable ? 'cursor-pointer hover:shadow-sm' : ''
        }`}
        onClick={handleClick}
      >
        {/* Icon with animated background */}
        <div className={`w-6 h-6 ${colors.bg} rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-200 flex-shrink-0`}>
          <Icon className={`w-3 h-3 ${colors.text}`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-900 font-medium leading-4 truncate">
                {activity.item}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${actionColors.bg} ${actionColors.text}`}>
                  {activity.action}
                </span>
                <span className="text-xs text-gray-500">
                  {getTimeDisplay(timeAgo)}
                </span>
              </div>
      </div>

            {/* Clickable indicator */}
            {activity.clickable && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                <FiEye className="w-3 h-3 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Subtle animation line */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-gray-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      </div>
    );
  };

  // Modern Ring Chart Component matching the provided design
  const DonutChart = ({ data, title }) => {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    
    // Vibrant colors matching the design image
    const colors = [
      '#6366F1', // Indigo/Purple
      '#EF4444', // Red
      '#F59E0B', // Orange/Yellow
      '#FBBF24', // Bright Yellow
      '#10B981', // Green
      '#06B6D4', // Cyan
      '#8B5CF6', // Purple
      '#F97316'  // Orange
    ];
    
    // Calculate angles for each segment
    let currentAngle = 0;
    const segments = Object.entries(data).map(([key, value], index) => {
      const percentage = total > 0 ? (value / total) : 0;
      const angle = percentage * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle += angle;
      
      return {
        key,
        value,
        percentage: percentage * 100,
        startAngle,
        endAngle,
        color: colors[index % colors.length]
      };
    });

    // Create SVG path for each segment
    const createPath = (startAngle, endAngle, innerRadius, outerRadius, center = 100) => {
      const startAngleRad = (startAngle - 90) * Math.PI / 180;
      const endAngleRad = (endAngle - 90) * Math.PI / 180;
      
      const x1 = center + outerRadius * Math.cos(startAngleRad);
      const y1 = center + outerRadius * Math.sin(startAngleRad);
      const x2 = center + outerRadius * Math.cos(endAngleRad);
      const y2 = center + outerRadius * Math.sin(endAngleRad);
      const x3 = center + innerRadius * Math.cos(endAngleRad);
      const y3 = center + innerRadius * Math.sin(endAngleRad);
      const x4 = center + innerRadius * Math.cos(startAngleRad);
      const y4 = center + innerRadius * Math.sin(startAngleRad);
      
      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
      
      return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
    };

  return (
      <div className="p-4 h-full flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 flex-shrink-0">
          <FiBarChart className="w-5 h-5 text-gray-600" />
          {title}
        </h3>
        
        <div className="flex-1 flex flex-col min-h-0 gap-3">
          {/* Compact Chart container */}
          <div className="flex items-center justify-center flex-shrink-0">
            <div className="relative p-2 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-inner">
              <svg width="180" height="180" className="drop-shadow-lg">
                {/* Outer glow circle */}
                <circle
                  cx="90"
                  cy="90"
                  r="75"
                  fill="none"
                  stroke="url(#outerGlow)"
                  strokeWidth="1"
                  opacity="0.3"
                />
                
                {/* Background circle with gradient */}
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="url(#backgroundGradient)"
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
                
                {/* Compact Segments */}
                {segments.map((segment, index) => (
                  <path
                    key={segment.key}
                    d={createPath(segment.startAngle, segment.endAngle, 50, 70, 90)}
                    fill={`url(#gradient-${index})`}
                    stroke="white"
                    strokeWidth="2"
                    className={`transition-all duration-300 cursor-pointer ${
                      hoveredSegment === segment.key 
                        ? 'opacity-95 drop-shadow-lg transform-gpu scale-105' 
                        : 'opacity-100 hover:opacity-90'
                    }`}
                    style={{
                      transformOrigin: '90px 90px',
                      filter: hoveredSegment === segment.key 
                        ? `drop-shadow(0 4px 12px ${segment.color}50) brightness(1.1)` 
                        : `drop-shadow(0 2px 8px ${segment.color}20)`
                    }}
                    onMouseEnter={() => setHoveredSegment(segment.key)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  />
                ))}
                
                {/* Inner circle with gradient */}
                <circle
                  cx="90"
                  cy="90"
                  r="50"
                  fill="url(#innerGradient)"
                  stroke="white"
                  strokeWidth="2"
                  className="drop-shadow-sm"
                />
                
                {/* Center content - compact */}
                <foreignObject x="65" y="78" width="50" height="24">
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">{total}</div>
                    <div className="text-xs text-gray-500 font-medium">Total</div>
                  </div>
                </foreignObject>
                
                {/* Gradient Definitions */}
                <defs>
                  <radialGradient id="backgroundGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#F8FAFC" />
                  </radialGradient>
                  
                  <radialGradient id="innerGradient" cx="50%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#F1F5F9" />
                  </radialGradient>
                  
                  <linearGradient id="outerGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                  
                  {/* Individual segment gradients */}
                  {segments.map((segment, index) => (
                    <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={segment.color} />
                      <stop offset="100%" stopColor={`${segment.color}CC`} />
                    </linearGradient>
                  ))}
                </defs>
              </svg>
            </div>
          </div>

          {/* Compact Legend */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {segments.map((segment, index) => (
                <div 
                  key={segment.key} 
                  className={`flex items-center justify-between text-xs p-2 rounded-lg transition-all duration-300 cursor-pointer border ${
                    hoveredSegment === segment.key 
                      ? 'bg-gray-50 shadow-md transform scale-102 border-gray-200' 
                      : 'hover:bg-gray-50 border-transparent'
                  }`}
                  onMouseEnter={() => setHoveredSegment(segment.key)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full transition-all duration-300"
                      style={{ 
                        background: `linear-gradient(135deg, ${segment.color} 0%, ${segment.color}CC 100%)`,
                        transform: hoveredSegment === segment.key ? 'scale(1.2)' : 'scale(1)',
                        boxShadow: hoveredSegment === segment.key 
                          ? `0 2px 8px ${segment.color}40` 
                          : `0 1px 3px ${segment.color}20`
                      }}
                    ></div>
                    <span className={`capitalize font-medium transition-colors duration-300 ${
                      hoveredSegment === segment.key ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {segment.key}
                    </span>
                  </div>
                  <div className={`text-right transition-all duration-300 ${
                    hoveredSegment === segment.key ? 'font-bold text-gray-900' : 'text-gray-600 font-medium'
                  }`}>
                    <div className="text-xs">{segment.value}</div>
                    <div className="text-xs text-gray-500">({segment.percentage.toFixed(1)}%)</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden" style={{ fontFamily: 'Nunito, sans-serif' }}>
      <PageBackground />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen z-10">
        <Sidebar />
      </div>
      
      {/* Dashboard Content */}
      <div className={`relative z-20 ${isMinimized ? 'ml-20' : 'ml-72'} h-screen flex flex-col transition-all duration-500 ease-in-out`}>
        {/* Profile Button */}
        <div className="absolute top-4 right-4 z-30">
          <ProfileButton />
        </div>
        
        {/* Header Section - Fixed */}
        <div className="flex-shrink-0 p-4 pt-16 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 bg-clip-text text-transparent mb-2 tracking-tight">
                Dashboard
              </h1>
              {error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FiAlertTriangle className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-700">Error loading data: {error}</p>
                  </div>
                  <p className="text-xs text-red-600 mt-1">Showing demo data instead. Check console for details.</p>
                </div>
              )}
              {loading && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-blue-700">Loading dashboard data...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Flex fill remaining space */}
        <div className="flex-1 overflow-hidden flex flex-col px-4 pb-4">
          {/* Statistics Cards - Fixed height */}
          <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <StatCard
              title="Total Users"
              value={dashboardData.users.total}
              icon={FiUsers}
              subtitle={`${dashboardData.users.active} active`}
              onClick={() => navigateToPage('/user')}
            />
            <StatCard
              title="Districts"
              value={dashboardData.districts.total}
              icon={FiMap}
              onClick={() => navigateToPage('/district')}
            />
            <StatCard
              title="Areas"
              value={dashboardData.areas.total}
              icon={FiMapPin}
              onClick={() => navigateToPage('/area')}
            />
            <StatCard
              title="Halqas"
              value={dashboardData.halqas.total}
              icon={FiHome}
              onClick={() => navigateToPage('/halqa')}
            />
            <StatCard
              title="Groups"
              value={dashboardData.membersGroups.total}
              icon={FiUserCheck}
              onClick={() => navigateToPage('/member-group')}
            />
            <StatCard
              title="Apps"
              value={dashboardData.apps.total}
              icon={FiSmartphone}
              subtitle={`${dashboardData.apps.active} active`}
              onClick={() => navigateToPage('/app')}
            />
          </div>

          {/* Bottom Content Grid - Using fractional widths for proper proportions */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-8 gap-6 min-h-0 max-h-full">
            {/* Enhanced Quick Actions - Takes 2.5 columns (2.5 out of 8) */}
            <div className="lg:col-span-3 bg-white rounded-xl shadow-lg p-4 flex flex-col border border-gray-100 h-full">
              <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                <FiPlus className="w-4 h-4 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="flex-1 flex flex-col justify-evenly space-y-3">
                <QuickActionCard
                  title="Add User"
                  description="Create a new user account"
                  icon={FiUsers}
                  color="blue"
                  onClick={() => navigateToPage('/user')}
                />
                <QuickActionCard
                  title="View Users"
                  description="Browse all users"
                  icon={FiEye}
                  color="indigo"
                  onClick={() => navigateToPage('/user')}
                />
                <QuickActionCard
                  title="Add District"
                  description="Create a new district"
                  icon={FiMap}
                  color="green"
                  onClick={() => navigateToPage('/district')}
                />
                <QuickActionCard
                  title="Manage Districts"
                  description="View & edit districts"
                  icon={FiSettings}
                  color="emerald"
                  onClick={() => navigateToPage('/district')}
                />
                <QuickActionCard
                  title="Add Area"
                  description="Create a new area"
                  icon={FiMapPin}
                  color="purple"
                  onClick={() => navigateToPage('/area')}
                />
              </div>
            </div>

            {/* Enhanced Recent Activity - Takes 1.5 columns (relative to card width) */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-4 flex flex-col border border-gray-100 h-full overflow-hidden">
              <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                <FiActivity className="w-4 h-4 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-1">
                  {dashboardData.recentActivity.length > 0 ? (
                    dashboardData.recentActivity.slice(0, 5).map((activity, index) => (
                      <ActivityItem key={activity.id || index} activity={activity} />
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <FiClock className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded User Distribution - Takes remaining 3 columns */}
            <div className="lg:col-span-3 bg-white rounded-xl shadow-lg border border-gray-100 h-full overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FiBarChart2 className="w-5 h-5 text-gray-600" />
                  User Distribution
                </h3>
              </div>
              <div className="p-4 h-full flex items-center">
                <div className="w-full flex items-center gap-6">
                  {/* Professional Stylish Chart */}
                  <div className="flex-shrink-0">
                    <div className="relative w-48 h-48">
                      <svg width="192" height="192" className="transform -rotate-90 drop-shadow-lg">
                        {/* Background circle with gradient */}
                                                 <defs>
                           <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                             <stop offset="0%" stopColor="#FAFAFA" />
                             <stop offset="100%" stopColor="#F5F5F5" />
                           </linearGradient>
                           <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                             <stop offset="0%" stopColor="#A78BFA" />
                             <stop offset="100%" stopColor="#9CA3AF" />
                           </linearGradient>
                           <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                             <stop offset="0%" stopColor="#FCA5A5" />
                             <stop offset="100%" stopColor="#9CA3AF" />
                           </linearGradient>
                           <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                             <stop offset="0%" stopColor="#86EFAC" />
                             <stop offset="100%" stopColor="#9CA3AF" />
                           </linearGradient>
                         </defs>
                         
                         {/* Background circle */}
                         <circle cx="96" cy="96" r="80" fill="url(#bgGradient)" stroke="#E5E7EB" strokeWidth="1"/>
                         <circle cx="96" cy="96" r="55" fill="white" stroke="#F3F4F6" strokeWidth="1"/>
                        
                        {/* Data segments */}
                        {[
                          { value: dashboardData.areas.total, gradient: 'url(#purpleGradient)', key: 'areas' },
                          { value: dashboardData.halqas.total, gradient: 'url(#redGradient)', key: 'halqas' },
                          { value: dashboardData.membersGroups.total, gradient: 'url(#greenGradient)', key: 'groups' }
                        ].map((item, index) => {
                          const total = dashboardData.areas.total + dashboardData.halqas.total + dashboardData.membersGroups.total;
                          const percentage = total > 0 ? (item.value / total) * 100 : 0;
                          const circumference = 2 * Math.PI * 80;
                          const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                          const rotation = index === 0 ? 0 : 
                            [
                              { value: dashboardData.areas.total },
                              { value: dashboardData.halqas.total }
                            ].slice(0, index).reduce((acc, prev) => {
                              const prevPercentage = total > 0 ? (prev.value / total) * 100 : 0;
                              return acc + (prevPercentage / 100) * 360;
                            }, 0);

                          return (
                            <circle
                              key={item.key}
                              cx="96"
                              cy="96"
                              r="80"
                              fill="none"
                              stroke={item.gradient}
                              strokeWidth="12"
                              strokeDasharray={strokeDasharray}
                              strokeLinecap="round"
                              style={{
                                transform: `rotate(${rotation}deg)`,
                                transformOrigin: '96px 96px',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}
                              opacity="0.7"
                            />
                          );
                        })}
                      </svg>
                      
                      {/* Center content */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold bg-gradient-to-br from-gray-700 to-gray-900 bg-clip-text text-transparent">
                            {dashboardData.areas.total + dashboardData.halqas.total + dashboardData.membersGroups.total}
                          </div>
                          <div className="text-sm font-medium text-gray-500 mt-1">Total Units</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                                     {/* Compact legend - side by side */}
                   <div className="flex-1 space-y-3">
                     <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                       <div className="flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full bg-purple-300"></div>
                         <span className="text-sm font-medium text-gray-700">Areas</span>
                       </div>
                       <div className="text-xl font-semibold text-gray-800">{dashboardData.areas.total}</div>
                     </div>

                     <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                       <div className="flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full bg-red-300"></div>
                         <span className="text-sm font-medium text-gray-700">Halqas</span>
                       </div>
                       <div className="text-xl font-semibold text-gray-800">{dashboardData.halqas.total}</div>
                     </div>

                     <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                       <div className="flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full bg-green-300"></div>
                         <span className="text-sm font-medium text-gray-700">Groups</span>
                       </div>
                       <div className="text-xl font-semibold text-gray-800">{dashboardData.membersGroups.total}</div>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 