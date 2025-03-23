"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../DashComponents/Sidebar';
import { User2, Mail, Calendar, Clock, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    joinDate: '2024-03-01',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Full screen gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-100 via-white to-sky-100 animate-gradient z-0">
        <div className="absolute inset-0 bg-[length:200%_200%] bg-gradient-to-r from-violet-200/40 via-sky-100/40 to-violet-200/40 animate-gradient-background"></div>
        <div className="absolute inset-0 bg-[length:200%_200%] bg-gradient-to-br from-white/0 via-violet-200/40 to-white/40 animate-gradient-slow"></div>
      </div>
      
      {/* Sidebar */}
      <div className="fixed top-0 left-0 bottom-0 w-[240px] z-20">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-[240px] relative z-10 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fadeIn">
            <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
          </div>

          {/* Settings Content */}
          <div className="space-y-6 animate-fadeIn" style={{animationDelay: "0.1s"}}>
            {/* Profile Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-violet-50 rounded-xl">
                  <User2 className="w-5 h-5 text-violet-600" />
                  <div>
                    <div className="text-sm text-gray-500">Name</div>
                    <div className="text-gray-900 font-medium">{user.name}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-violet-50 rounded-xl">
                  <Mail className="w-5 h-5 text-violet-600" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="text-gray-900 font-medium">{user.email}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-violet-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-violet-600" />
                  <div>
                    <div className="text-sm text-gray-500">Member Since</div>
                    <div className="text-gray-900 font-medium">
                      {new Date(user.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-violet-50 rounded-xl">
                  <Clock className="w-5 h-5 text-violet-600" />
                  <div>
                    <div className="text-sm text-gray-500">Timezone</div>
                    <div className="text-gray-900 font-medium">{user.timezone}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Actions</h2>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300"
              >
                <LogOut className="w-5 h-5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 