import React, { useState, useEffect, useRef } from 'react';
import { FiUsers } from 'react-icons/fi';

// Minimal app data (copied from AppList.jsx)
const apps = [
  {
    id: 1,
    name: 'Project Phoenix',
    category: 'Productivity',
    status: 'Live',
    icon: '🚀',
    version: '2.5.0',
    users: 12500,
    lastUpdate: '2024-05-18',
  },
  {
    id: 2,
    name: 'QuantumLeap CRM',
    category: 'Business',
    status: 'In Development',
    icon: '💼',
    version: '0.8.0-beta',
    users: 50,
    lastUpdate: '2024-06-15',
  },
  {
    id: 3,
    name: 'DataWeaver',
    category: 'Analytics',
    status: 'Live',
    icon: '📊',
    version: '1.9.2',
    users: 8200,
    lastUpdate: '2024-04-22',
  },
  {
    id: 4,
    name: 'ConnectSphere',
    category: 'Social',
    status: 'Maintenance',
    icon: '💬',
    version: '3.1.5',
    users: 25000,
    lastUpdate: '2024-06-20',
  },
  {
    id: 5,
    name: 'SecureVault',
    category: 'Security',
    status: 'Live',
    icon: '🔒',
    version: '4.0.1',
    users: 50000,
    lastUpdate: '2024-03-30',
  },
  {
    id: 6,
    name: 'Legacy System',
    category: 'Internal',
    status: 'Deprecated',
    icon: '🏛️',
    version: '1.0.0',
    users: 200,
    lastUpdate: '2022-01-01',
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Live': return 'bg-green-100 text-green-700';
    case 'In Development': return 'bg-blue-100 text-blue-700';
    case 'Maintenance': return 'bg-yellow-100 text-yellow-700';
    case 'Deprecated': return 'bg-gray-100 text-gray-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const ScrollingBoxes = () => {
  const [currentIndex, setCurrentIndex] = useState(1); // Start at 1 (first real slide)
  const [dragStartX, setDragStartX] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const containerRef = useRef(null);

  // Prepare slides (each slide contains 2 app boxes)
  const slides = [];
  for (let i = 0; i < apps.length; i += 2) {
    slides.push([apps[i], apps[i + 1] || apps[0]]);
  }
  // Cyclic: duplicate last and first slides
  const cyclicSlides = [slides[slides.length - 1], ...slides, slides[0]];

  // Auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [cyclicSlides.length]);

  // Mouse drag/swipe navigation
  useEffect(() => {
    if (!dragging) return;
    const handleMouseMove = (e) => {
      if (dragStartX === null) return;
      const diff = e.clientX - dragStartX;
      if (Math.abs(diff) > 60) {
        setIsAnimating(true);
        if (diff > 0) {
          setCurrentIndex(prev => prev - 1);
        } else {
          setCurrentIndex(prev => prev + 1);
        }
        setDragging(false);
        setDragStartX(null);
      }
    };
    const handleMouseUp = () => {
      setDragging(false);
      setDragStartX(null);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragStartX]);

  // Handle cyclic jump (no animation)
  useEffect(() => {
    if (currentIndex === 0) {
      setTimeout(() => {
        setIsAnimating(false);
        setCurrentIndex(cyclicSlides.length - 2);
      }, 700);
    } else if (currentIndex === cyclicSlides.length - 1) {
      setTimeout(() => {
        setIsAnimating(false);
        setCurrentIndex(1);
      }, 700);
    } else {
      setIsAnimating(true);
    }
  }, [currentIndex, cyclicSlides.length]);

  const onMouseDown = (e) => {
    e.preventDefault();
    setDragStartX(e.clientX);
    setDragging(true);
  };

  return (
    <div
      className="w-full max-w-2xl ml-auto relative select-none h-[200px]"
      ref={containerRef}
      onMouseDown={onMouseDown}
      style={{ cursor: dragging ? 'grabbing' : 'grab', userSelect: dragging ? 'none' : 'auto' }}
    >
      <div className="overflow-hidden h-full">
        <div
          className={`flex ${isAnimating ? 'transition-transform duration-700 ease-in-out' : ''} h-full`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {cyclicSlides.map((slide, idx) => (
            <div key={idx} className="flex min-w-full gap-4 h-full">
              {slide.map((app, i) => (
                <div key={app.id} className="w-1/2 bg-white rounded-lg shadow-sm border border-gray-100 flex-1 flex flex-col justify-between p-3 h-full">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-2xl text-[#5041BC]">{app.icon}</div>
                      <div className="font-semibold text-[#5041BC] text-base truncate">{app.name}</div>
                    </div>
                    <div className="text-xs text-gray-400 mb-2">{app.category}</div>
                    <div className="flex items-center gap-2 text-xs mb-1">
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${getStatusColor(app.status)}`}>{app.status}</span>
                      <span className="text-gray-400">v{app.version}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <FiUsers className="w-3 h-3" />
                      {app.users.toLocaleString()} users
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-2">Last updated: {new Date(app.lastUpdate).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollingBoxes; 