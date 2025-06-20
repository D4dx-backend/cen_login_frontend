import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatCards from '../components/StatCards';
import RecentUsersTable from '../components/RecentUsersTable';
import SearchHeader from '../components/SearchHeader';
import ScrollingBoxes from '../components/ScrollingBoxes';
import PageBackground from '../components/PageBackground';

function DashboardHome() {
  return (
    <>
      <SearchHeader />
      <div className="flex flex-row gap-8 w-full max-w-6xl mx-auto mt-4 mb-8 items-stretch">
        <div className="flex-1 h-[200px] flex flex-col justify-stretch"><StatCards /></div>
        <div className="flex-1 h-[200px] flex flex-col justify-stretch"><ScrollingBoxes /></div>
      </div>
      <RecentUsersTable />
    </>
  );
}
function UsersPage() {
  const users = [
    { name: 'Jane Doe', email: 'jane@example.com', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { name: 'John Smith', email: 'john@example.com', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'Alice Lee', email: 'alice@example.com', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
  ];
  return (
    <>
      <SearchHeader />
      <div className="text-2xl text-[#5041BC] font-bold mb-4">Users List</div>
      <ul className="bg-[#f6f4fd] p-6 rounded-xl text-[#5041BC] space-y-4">
        {users.map(user => (
          <li key={user.email} className="flex items-center gap-4 bg-white rounded-lg p-4 shadow hover:shadow-md transition-all">
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm text-[#888]">{user.email}</div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
function ReportsPage() {
  const reports = [
    { title: 'Monthly Sales Report', date: '2024-06-01' },
    { title: 'User Activity Report', date: '2024-05-28' },
    { title: 'System Health Report', date: '2024-05-20' },
  ];
  return (
    <>
      <SearchHeader />
      <div className="text-2xl text-[#5041BC] font-bold mb-4">Reports</div>
      <ul className="bg-[#f6f4fd] p-6 rounded-xl text-[#5041BC] space-y-4">
        {reports.map(report => (
          <li key={report.title} className="flex items-center justify-between bg-white rounded-lg p-4 shadow hover:shadow-md transition-all">
            <span className="font-semibold">{report.title}</span>
            <span className="text-sm text-[#888]">{report.date}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
function SettingsPage() {
  const settings = [
    { name: 'Profile Settings', desc: 'Update your profile information' },
    { name: 'Account Security', desc: 'Change your password and secure your account' },
    { name: 'Notification Preferences', desc: 'Manage your notification settings' },
  ];
  return (
    <>
      <SearchHeader />
      <div className="text-2xl text-[#5041BC] font-bold mb-4">Settings</div>
      <ul className="bg-[#f6f4fd] p-6 rounded-xl text-[#5041BC] space-y-4">
        {settings.map(setting => (
          <li key={setting.name} className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-all">
            <div className="font-semibold">{setting.name}</div>
            <div className="text-sm text-[#888]">{setting.desc}</div>
          </li>
        ))}
      </ul>
    </>
  );
}
function NotificationsPage() {
  const notifications = [
    { message: 'New user registered', time: '2 min ago' },
    { message: 'Monthly report is ready', time: '1 hour ago' },
    { message: 'Password changed successfully', time: 'Yesterday' },
  ];
  return (
    <>
      <SearchHeader />
      <div className="text-2xl text-[#5041BC] font-bold mb-4">Notifications</div>
      <ul className="bg-[#f6f4fd] p-6 rounded-xl text-[#5041BC] space-y-4">
        {notifications.map((n, i) => (
          <li key={i} className="flex items-center justify-between bg-white rounded-lg p-4 shadow hover:shadow-md transition-all">
            <span className="font-semibold">{n.message}</span>
            <span className="text-xs text-[#888]">{n.time}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
function BillingPage() {
  const bills = [
    { id: 'INV-001', amount: '$120.00', status: 'Paid' },
    { id: 'INV-002', amount: '$80.00', status: 'Pending' },
    { id: 'INV-003', amount: '$200.00', status: 'Paid' },
  ];
  return (
    <>
      <SearchHeader />
      <div className="text-2xl text-[#5041BC] font-bold mb-4">Billing</div>
      <ul className="bg-[#f6f4fd] p-6 rounded-xl text-[#5041BC] space-y-4">
        {bills.map(bill => (
          <li key={bill.id} className="flex items-center justify-between bg-white rounded-lg p-4 shadow hover:shadow-md transition-all">
            <span className="font-semibold">{bill.id}</span>
            <span className="text-sm">{bill.amount}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${bill.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{bill.status}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
function SupportPage() {
  const tickets = [
    { subject: 'Login issue', status: 'Open' },
    { subject: 'Feature request: Dark mode', status: 'Closed' },
    { subject: 'Bug: Table not loading', status: 'Open' },
  ];
  return (
    <>
      <SearchHeader />
      <div className="text-2xl text-[#5041BC] font-bold mb-4">Support</div>
      <ul className="bg-[#f6f4fd] p-6 rounded-xl text-[#5041BC] space-y-4">
        {tickets.map((t, i) => (
          <li key={i} className="flex items-center justify-between bg-white rounded-lg p-4 shadow hover:shadow-md transition-all">
            <span className="font-semibold">{t.subject}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${t.status === 'Open' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{t.status}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen relative bg-[#e3e6eb] overflow-hidden" style={{ fontFamily: 'Nunito, sans-serif' }}>
      <PageBackground />

      {/* Sidebar fixed - full window height */}
      <div className="fixed left-0 top-0 h-screen z-10">
        <Sidebar />
      </div>
      
      {/* Dashboard content positioned to the right of sidebar */}
      <div className="relative z-20 ml-72 flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col p-8">
          <main className="flex-1 min-w-0">
            <Routes>
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/support" element={<SupportPage />} />
              {/* Default route */}
              <Route path="*" element={<DashboardHome />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
} 