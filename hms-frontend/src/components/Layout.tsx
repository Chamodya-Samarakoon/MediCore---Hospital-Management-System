import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Role } from '../types';

export const Layout: React.FC = () => {
  const username = localStorage.getItem('username') || 'Staff';
  const role = (localStorage.getItem('role') || 'DOCTOR') as Role;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar userRole={role} />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">Hospital Central Management</h2>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm border border-sky-300">
              {username.substring(0, 2).toUpperCase()}
            </div>
            <div className="text-left text-xs">
              <p className="font-semibold text-gray-900">{username}</p>
              <span className="bg-sky-50 text-sky-700 border border-sky-200 font-medium px-2 py-0.5 rounded-full text-[10px]">
                {role}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};