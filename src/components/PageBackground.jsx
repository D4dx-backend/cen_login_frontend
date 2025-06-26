import React, { useState, useEffect } from 'react';

export default function PageBackground() {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

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

    const handleMouseMove = (e) => {
      setMouseX(e.clientX / window.innerWidth);
      setMouseY(e.clientY / window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Dynamic Gradient Mesh Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(circle at ${20 + mouseX * 20}% ${30 + mouseY * 20}%, rgba(80, 65, 188, 0.15) 0%, transparent 50%),
            radial-gradient(circle at ${80 - mouseX * 15}% ${70 - mouseY * 15}%, rgba(108, 99, 255, 0.12) 0%, transparent 60%),
            radial-gradient(circle at ${50 + mouseX * 10}% ${50 + mouseY * 10}%, rgba(162, 106, 234, 0.08) 0%, transparent 70%)
          `,
          transform: `translateY(${scrollY * 0.1}px)`
        }}
      />

      {/* Static Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(rgba(80, 65, 188, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(80, 65, 188, 0.12) 1px, transparent 1px),
            linear-gradient(rgba(108, 99, 255, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(108, 99, 255, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px, 60px 60px, 20px 20px, 20px 20px'
        }}
      />

      {/* Floating Geometric Shapes */}
      <div 
        className={`absolute inset-0 transition-all duration-2000 ease-out`}
        style={{
          transform: `translateX(${mouseX * 20}px) translateY(${mouseY * 20}px)`
        }}
      >
        {/* Large floating hexagon */}
        <div 
          className={`absolute top-1/6 left-1/4 w-24 h-24 border-2 border-[#5041BC]/20 transition-all duration-1000 ease-out ${
            isScrolling ? 'border-[#5041BC]/40 scale-110' : 'border-[#5041BC]/20 scale-100'
          }`}
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            transform: `translateY(${scrollY * 0.01}px) rotate(${scrollY * 0.05}deg)`,
            animation: 'float 6s ease-in-out infinite'
          }}
        />

        {/* Animated triangles */}
        <div 
          className={`absolute top-2/3 right-1/4 w-16 h-16 border-2 border-[#6C63FF]/25 transition-all duration-800 ease-out ${
            isScrolling ? 'border-[#6C63FF]/45 scale-125' : 'border-[#6C63FF]/25 scale-100'
          }`}
          style={{
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            transform: `translateY(${scrollY * -0.012}px) rotate(${scrollY * -0.03}deg)`,
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        />

        {/* Rotating pentagon */}
        <div 
          className={`absolute bottom-1/4 left-1/6 w-20 h-20 border-2 border-[#A26AEA]/20 transition-all duration-1200 ease-out ${
            isScrolling ? 'border-[#A26AEA]/40 scale-115' : 'border-[#A26AEA]/20 scale-100'
          }`}
          style={{
            clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
            transform: `translateY(${scrollY * 0.008}px) rotate(${scrollY * 0.04}deg)`,
            animation: 'float 10s ease-in-out infinite'
          }}
        />
      </div>

      {/* Responsive Corner Gradients */}
      <div 
        className={`absolute top-0 left-0 w-72 h-72 transition-all duration-1000 ease-out ${
          isScrolling ? 'opacity-60' : 'opacity-40'
        }`}
        style={{
          background: `radial-gradient(circle at 0% 0%, rgba(80, 65, 188, 0.15) 0%, transparent 70%)`,
          transform: `translateY(${scrollY * 0.015}px) scale(${1 + mouseX * 0.1})`
        }}
      />
      
      <div 
        className={`absolute bottom-0 right-0 w-80 h-80 transition-all duration-1000 ease-out ${
          isScrolling ? 'opacity-60' : 'opacity-40'
        }`}
        style={{
          background: `radial-gradient(circle at 100% 100%, rgba(108, 99, 255, 0.12) 0%, transparent 70%)`,
          transform: `translateY(${scrollY * -0.015}px) scale(${1 + mouseY * 0.1})`
        }}
      />



      {/* Flowing Lines with Mouse Interaction */}
      <div 
        className={`absolute inset-0 transition-all duration-800 ease-out ${
          isScrolling ? 'opacity-70' : 'opacity-40'
        }`}
        style={{
          transform: `translateX(${mouseX * 30}px) translateY(${mouseY * 20}px)`
        }}
      >
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(80, 65, 188, 0.4)" />
              <stop offset="50%" stopColor="rgba(108, 99, 255, 0.3)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="lineGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(162, 106, 234, 0.4)" />
              <stop offset="50%" stopColor="rgba(108, 99, 255, 0.2)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          
          <path
            d={`M 0,${100 + mouseY * 50} Q ${300 + mouseX * 100},${50 + mouseY * 30} ${600 + mouseX * 80},${120 + mouseY * 40}`}
            stroke="url(#lineGradient1)"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          />
          
          <path
            d={`M ${window.innerWidth || 1200},${200 + mouseY * 60} Q ${800 - mouseX * 120},${100 + mouseY * 40} ${400 - mouseX * 60},${180 + mouseY * 50}`}
            stroke="url(#lineGradient2)"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* Professional Corner Borders with Animation */}
      <div 
        className={`absolute top-0 left-0 w-64 h-64 border-l-2 border-t-2 transition-all duration-1000 ease-out ${
          isScrolling ? 'border-[#5041BC]/50' : 'border-[#5041BC]/25'
        }`}
        style={{
          transform: `translateY(${scrollY * 0.02}px) scale(${1 + mouseX * 0.05})`,
          borderImage: `linear-gradient(135deg, rgba(80, 65, 188, 0.4), transparent) 1`
        }}
      />
      
      <div 
        className={`absolute bottom-0 right-0 w-48 h-48 border-r-2 border-b-2 transition-all duration-1000 ease-out ${
          isScrolling ? 'border-[#6C63FF]/50' : 'border-[#6C63FF]/25'
        }`}
        style={{
          transform: `translateY(${scrollY * -0.02}px) scale(${1 + mouseY * 0.05})`,
          borderImage: `linear-gradient(-45deg, rgba(108, 99, 255, 0.4), transparent) 1`
        }}
      />



      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(2deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }
        
        @media (max-width: 768px) {
          .absolute {
            transform: scale(0.8) !important;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}