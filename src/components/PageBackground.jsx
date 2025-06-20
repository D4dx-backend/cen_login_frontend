import React, { useState, useEffect } from 'react';

export default function PageBackground() {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let scrollTimeout;
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setIsScrolling(true);
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Subtle Grid Pattern */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ease-out ${
          isScrolling ? 'opacity-40' : 'opacity-25'
        }`}
        style={{
          backgroundImage: `
            linear-gradient(rgba(80, 65, 188, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(80, 65, 188, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: `translateY(${scrollY * 0.005}px)`
        }}
      ></div>

      {/* Professional Corner Elements */}
      <div 
        className={`absolute top-0 left-0 w-48 h-48 border-l-2 border-t-2 border-[#5041BC]/20 transition-all duration-800 ease-out ${
          isScrolling ? 'border-[#5041BC]/35' : 'border-[#5041BC]/20'
        }`}
        style={{
          transform: `translateY(${scrollY * 0.01}px)`
        }}
      ></div>
      
      <div 
        className={`absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#6C63FF]/20 transition-all duration-800 ease-out ${
          isScrolling ? 'border-[#6C63FF]/35' : 'border-[#6C63FF]/20'
        }`}
        style={{
          transform: `translateY(${scrollY * -0.01}px)`
        }}
      ></div>

      {/* Subtle Center Accent */}
      <div 
        className={`absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-[#5041BC]/8 via-[#6C63FF]/5 to-[#A26AEA]/8 rounded-full blur-3xl transition-all duration-1000 ease-out ${
          isScrolling ? 'scale-125 opacity-60' : 'scale-100 opacity-40'
        }`}
        style={{
          transform: `translate(-50%, -50%) translateY(${scrollY * 0.002}px)`
        }}
      ></div>

      {/* Professional Lines */}
      <div 
        className={`absolute top-1/4 right-1/4 w-24 h-px bg-gradient-to-r from-transparent via-[#5041BC]/40 to-transparent transition-all duration-700 ease-out ${
          isScrolling ? 'scale-125 opacity-70' : 'scale-100 opacity-40'
        }`}
        style={{
          transform: `translateY(${scrollY * 0.008}px)`
        }}
      ></div>
      
      <div 
        className={`absolute bottom-1/4 left-1/4 w-32 h-px bg-gradient-to-r from-transparent via-[#6C63FF]/40 to-transparent transition-all duration-700 ease-out ${
          isScrolling ? 'scale-125 opacity-70' : 'scale-100 opacity-40'
        }`}
        style={{
          transform: `translateY(${scrollY * -0.008}px)`
        }}
      ></div>

      {/* Minimal Dots */}
      <div 
        className={`absolute top-1/3 left-1/6 w-2 h-2 bg-[#5041BC]/50 rounded-full transition-all duration-600 ease-out ${
          isScrolling ? 'scale-200 opacity-80' : 'scale-100 opacity-50'
        }`}
        style={{
          transform: `translateY(${scrollY * 0.005}px)`
        }}
      ></div>
      
      <div 
        className={`absolute bottom-1/3 right-1/6 w-2 h-2 bg-[#6C63FF]/50 rounded-full transition-all duration-600 ease-out ${
          isScrolling ? 'scale-200 opacity-80' : 'scale-100 opacity-50'
        }`}
        style={{
          transform: `translateY(${scrollY * -0.005}px)`
        }}
      ></div>

      <div 
        className={`absolute top-2/3 right-1/3 w-2 h-2 bg-[#A26AEA]/50 rounded-full transition-all duration-600 ease-out ${
          isScrolling ? 'scale-200 opacity-80' : 'scale-100 opacity-50'
        }`}
        style={{
          transform: `translateY(${scrollY * 0.003}px)`
        }}
      ></div>

      {/* Subtle Border Accents */}
      <div 
        className={`absolute top-0 right-1/4 w-16 h-px bg-gradient-to-r from-transparent via-[#5041BC]/30 to-transparent transition-all duration-500 ease-out ${
          isScrolling ? 'opacity-50' : 'opacity-30'
        }`}
        style={{
          transform: `translateY(${scrollY * 0.003}px)`
        }}
      ></div>
      
      <div 
        className={`absolute bottom-0 left-1/3 w-20 h-px bg-gradient-to-r from-transparent via-[#6C63FF]/30 to-transparent transition-all duration-500 ease-out ${
          isScrolling ? 'opacity-50' : 'opacity-30'
        }`}
        style={{
          transform: `translateY(${scrollY * -0.003}px)`
        }}
      ></div>

      {/* Professional Geometric Shapes */}
      <div 
        className={`absolute top-1/6 right-1/6 w-8 h-8 border-2 border-[#5041BC]/25 transform rotate-45 transition-all duration-800 ease-out ${
          isScrolling ? 'scale-110 border-[#5041BC]/45 rotate-90' : 'scale-100 rotate-45'
        }`}
        style={{
          transform: `translateY(${scrollY * 0.004}px) rotate(${45 + scrollY * 0.002}deg)`
        }}
      ></div>
      
      <div 
        className={`absolute bottom-1/6 left-1/6 w-6 h-6 border-2 border-[#6C63FF]/25 transform rotate-12 transition-all duration-800 ease-out ${
          isScrolling ? 'scale-110 border-[#6C63FF]/45 -rotate-12' : 'scale-100 rotate-12'
        }`}
        style={{
          transform: `translateY(${scrollY * -0.004}px) rotate(${12 - scrollY * 0.002}deg)`
        }}
      ></div>

      {/* Additional Visible Elements */}
      <div 
        className={`absolute top-1/2 left-1/4 w-12 h-12 border border-[#A26AEA]/30 rounded-full transition-all duration-700 ease-out ${
          isScrolling ? 'scale-125 border-[#A26AEA]/50' : 'scale-100'
        }`}
        style={{
          transform: `translateY(${scrollY * 0.006}px)`
        }}
      ></div>
      
      <div 
        className={`absolute bottom-1/2 right-1/4 w-10 h-10 border border-[#5041BC]/30 rounded-full transition-all duration-700 ease-out ${
          isScrolling ? 'scale-125 border-[#5041BC]/50' : 'scale-100'
        }`}
        style={{
          transform: `translateY(${scrollY * -0.006}px)`
        }}
      ></div>
    </div>
  );
} 