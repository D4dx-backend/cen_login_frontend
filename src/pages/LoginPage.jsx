import React, { useState } from 'react'

function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Login attempt:', formData)
    // Here you would typically make an API call to authenticate the user
  }

  return (
    <div className="min-h-screen w-full flex bg-[#e3e6eb]" style={{ fontFamily: 'Aileron, sans-serif' }}>
      {/* Left Sidebar - #5041BC, full height, subtle curve */}
      <div className="flex flex-col items-center justify-center w-[30vw] h-screen rounded-r-xl shadow-2xl" style={{background:'#5041BC'}}>
        <div className="flex flex-col items-center">
          <div className="mb-8">
            <svg width="80" height="80" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="30" r="20" fill="#fff" />
              <circle cx="30" cy="80" r="20" fill="#fff" />
              <circle cx="90" cy="80" r="20" fill="#fff" />
              <polygon points="60,50 40,80 80,80" fill="#5041BC" />
            </svg>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">Hira Community</h1>
        </div>
      </div>
      {/* Divider */}
      <div className="w-0.5 h-[60%] bg-gradient-to-b from-gray-300 via-gray-200 to-gray-300 self-center mx-2 rounded-full shadow-sm" />
      {/* Right Side with Creative Wavy Lines Pattern */}
      <div className="flex flex-1 items-center justify-center relative overflow-hidden">
        {/* SVG Wavy Lines Pattern Background (use #5041BC with low opacity) */}
        <svg className="absolute inset-0 w-full h-full z-0" style={{opacity:0.06}} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="wavy" patternUnits="userSpaceOnUse" width="120" height="60">
              <path d="M0 30 Q 30 0, 60 30 T 120 30" stroke="#5041BC" strokeWidth="2" fill="none" />
              <path d="M0 50 Q 30 20, 60 50 T 120 50" stroke="#5041BC" strokeWidth="2" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wavy)" />
        </svg>
        <div className="w-full max-w-sm rounded-2xl border border-gray-100 shadow-2xl p-8 flex flex-col items-center relative z-10" style={{background: 'linear-gradient(135deg, #5041BC 0%, #A26AEA 100%)'}}>
          <h2 className="text-2xl font-bold text-white mb-1 text-center tracking-tight relative z-10">Admin Login</h2>
          <p className="text-gray-100 text-center mb-6 text-sm relative z-10">Please enter your credentials to continue</p>
          <form className="w-full space-y-4 relative z-10" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-xs text-white mb-1 font-semibold tracking-wide">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-3 py-2 rounded-lg bg-white bg-opacity-80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A26AEA] text-[#0D0D0D] placeholder-gray-400 text-sm shadow-sm transition-all hover:border-[#A26AEA]"
                placeholder="Please enter your username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs text-white mb-1 font-semibold tracking-wide">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 rounded-lg bg-white bg-opacity-80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A26AEA] text-[#0D0D0D] placeholder-gray-400 text-sm shadow-sm transition-all hover:border-[#A26AEA]"
                placeholder="Please enter your password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-[#5041BC] text-white font-semibold text-base shadow-md hover:bg-[#A26AEA] transition-colors mt-2"
            >
              Login
            </button>
            <div className="flex justify-end mt-2">
              <a href="#" className="text-xs text-white hover:underline transition-colors">Forgot password?</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage 