import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PageBackground from '../components/PageBackground';
import AppList from '../components/AppList';
import ProfileButton from '../components/ProfileButton';
import CreateModal from '../components/CreateModal';

import { FiPlus, FiSmartphone, FiX } from 'react-icons/fi';

const API_BASE_URL = 'http://localhost:3000/api';

export default function AppPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [creating, setCreating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateApp = async (e) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    try {
      setCreating(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(`${API_BASE_URL}/apps`, 
        { title: newAppName },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        resetForm();
        setRefreshTrigger(prev => prev + 1); // Trigger refresh in AppList
      }
    } catch (error) {
      console.error('Error creating app:', error);
      alert('Failed to create app');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setNewAppName('');
    setShowCreateForm(false);
  };
  
  return (
    <div className="min-h-screen relative bg-[#e3e6eb] overflow-hidden" style={{ fontFamily: 'Nunito, sans-serif' }}>
      <PageBackground />
      <div className="fixed left-0 top-0 h-screen z-10">
        <Sidebar />
      </div>
      <div className="relative z-20 flex flex-col min-h-screen transition-all duration-300 ease-in-out" style={{ marginLeft: 'var(--sidebar-width, 224px)' }}>
        <div className="absolute top-4 right-4 z-30">
          <ProfileButton />
        </div>
        
        <div className="flex-1 flex flex-col p-4 pt-16">
          <main className="flex-1 min-w-0 mt-4">
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-[#5041BC] via-[#6C63FF] to-[#8B7EFF] bg-clip-text text-transparent mb-4">Application Management</h2>
            
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 text-sm font-medium text-white bg-gradient-to-r from-[#5041BC] to-[#6C63FF] hover:from-[#6C63FF] hover:to-[#5041BC] rounded-lg px-3 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <FiPlus className="w-4 h-4" />
                <span>Create App</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4">
              <AppList refreshTrigger={refreshTrigger} />
            </div>
          </main>
        </div>
      </div>

      {/* Create App Modal */}
      <CreateModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Create Application"
        icon={FiSmartphone}
        apiEndpoint="/apps"
        fields={[
          {
            name: 'title',
            label: 'Application Name',
            type: 'text',
            required: true,
            placeholder: 'Enter application name',
            fullWidth: true
          }
        ]}
        onSuccess={() => setRefreshTrigger(prev => prev + 1)}
        successMessage="Application created successfully!"
      />
    </div>
  );
} 