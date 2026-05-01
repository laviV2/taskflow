import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useStore } from '../store/useStore';

const Layout = () => {
  return (
    <div className="flex h-screen bg-primary overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 relative">
          {/* Subtle radial gradient background */}
          <div className="absolute inset-0 pointer-events-none z-0"></div>
          <div className="relative z-10 h-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
