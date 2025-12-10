
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types';
import { Layout } from './components/Layout';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Wallet } from './pages/Wallet';
import { Plans } from './pages/Plans';
import { Referrals } from './pages/Referrals';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking session securely
    setTimeout(() => {
        setLoading(false);
    }, 1500); // 1.5s delay to show the splash screen branding
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50">
        <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl mb-8 animate-bounce">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
        </div>
        <div className="flex flex-col items-center space-y-3">
             <h1 className="text-3xl font-bold text-slate-900 tracking-tight">GrowCorp Global</h1>
             <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-slate-400 text-sm font-medium tracking-wide">Initializing Secure Capital Link...</p>
             </div>
        </div>
    </div>
  );

  return (
    <HashRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          {!user ? (
             <>
               <Route path="/login" element={<Auth onLogin={handleLogin} />} />
               <Route path="*" element={<Navigate to="/login" replace />} />
             </>
          ) : user.role === 'admin' ? (
             <>
                <Route path="/admin" element={<AdminDashboard user={user} />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
             </>
          ) : (
             <>
                <Route path="/dashboard" element={<Dashboard user={user} />} />
                <Route path="/wallet" element={<Wallet user={user} />} />
                <Route path="/plans" element={<Plans user={user} />} />
                <Route path="/referrals" element={<Referrals user={user} />} />
                <Route path="/profile" element={<Profile user={user} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
             </>
          )}
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
