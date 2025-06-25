import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { SidebarProvider } from './contexts/SidebarContext'
import LoginPage from './pages/LoginPage'
import HalqaPage from './pages/HalqaPage'
import UserPage from './pages/UserPage'
import AppPage from './pages/AppPage'
import DistrictPage from './pages/DistrictPage'
import AreaPage from './pages/AreaPage'
import MemberGroupPage from './pages/MemberGroupPage'

function App() {
  return (
    <SidebarProvider>
      <div>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/halqa" element={<HalqaPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/app" element={<AppPage />} />
          <Route path="/district" element={<DistrictPage />} />
          <Route path="/area" element={<AreaPage />} />
          <Route path="/member-group" element={<MemberGroupPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </SidebarProvider>
  )
}

export default App
