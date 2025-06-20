import React, { useState, useEffect, useRef } from 'react';
import { FiCalendar, FiClock, FiDollarSign, FiAlertCircle } from 'react-icons/fi';

const ScrollingBoxes = () => {
  const [currentIndex, setCurrentIndex] = useState(1); // Start at 1 (first real slide)
  const [dragStartX, setDragStartX] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const containerRef = useRef(null);

  const boxes = [
    {
      id: 1,
      title: 'Calendar',
      icon: <FiCalendar className="text-lg" />,
      content: (
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#5041BC]">{new Date().getDate()}</div>
            <div className="text-xs text-gray-600">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-500 mb-1">Today</div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Team Meeting</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Alerts',
      icon: <FiClock className="text-lg" />,
      content: (
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <div className="flex items-center gap-1 text-red-700 mb-1">
              <FiAlertCircle className="text-xs" />
              <span className="font-semibold text-xs">Payment Due</span>
            </div>
            <div className="text-xs text-red-600">INV-002 in 3 days</div>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-gray-500">Upcoming</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Q2 Reports</span>
                <span className="text-gray-500">Tomorrow</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Analytics',
      icon: <FiDollarSign className="text-lg" />,
      content: (
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-xl font-bold text-[#5041BC]">$12.4k</div>
            <div className="text-xs text-gray-600">Revenue</div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Users</span>
              <span className="font-semibold">1,234</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Growth</span>
              <span className="font-semibold text-green-600">+45</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Prepare slides (each slide contains 2 boxes)
  const slides = [];
  for (let i = 0; i < boxes.length; i++) {
    slides.push([boxes[i], boxes[(i + 1) % boxes.length]]);
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
      className="w-full max-w-2xl ml-auto relative select-none"
      ref={containerRef}
      onMouseDown={onMouseDown}
      style={{ cursor: dragging ? 'grabbing' : 'grab', userSelect: dragging ? 'none' : 'auto' }}
    >
      <div className="overflow-hidden">
        <div
          className={`flex ${isAnimating ? 'transition-transform duration-700 ease-in-out' : ''}`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {cyclicSlides.map((slide, idx) => (
            <div key={idx} className="flex min-w-full gap-4">
              {slide.map((box, i) => (
                <div key={box.id} className="w-1/2 bg-white rounded-lg shadow-sm border border-gray-100 min-h-[200px] flex-1">
                  <div className="flex items-center gap-2 mb-3 p-3 pb-0">
                    <div className="text-[#5041BC]">{box.icon}</div>
                    <h3 className="text-sm font-semibold text-[#5041BC]">{box.title}</h3>
                  </div>
                  <div className="text-gray-700 px-3 pb-3">{box.content}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ScrollingBoxes; 