
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Wallet, TrendingUp, User as UserIcon, LogOut, Menu, X, ShieldCheck, Bell, Briefcase, Network, PieChart
} from 'lucide-react';
import { User, Notification } from '../types';
import { store } from '../services/store';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
      if (user) {
          store.getNotifications(user.id).then(setNotifications);
      }
  }, [user, location.pathname]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotifClick = (n: Notification) => {
      store.markRead(n.id);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
  };

  const MobileNavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
      <Link to={to} className={`flex flex-col items-center justify-center w-full py-2 ${isActive(to) ? 'text-emerald-600' : 'text-slate-400'}`}>
          <Icon className={`h-6 w-6 ${isActive(to) ? 'fill-current' : ''}`} strokeWidth={isActive(to) ? 2.5 : 2}/>
          <span className="text-[10px] mt-1 font-medium">{label}</span>
      </Link>
  );

  const DesktopNavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-1 ${
        isActive(to) 
          ? 'bg-emerald-50 text-emerald-700' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon className={`mr-3 h-5 w-5 ${isActive(to) ? 'text-emerald-600' : 'text-slate-400'}`} />
      {label}
    </Link>
  );

  if (!user) {
    return <div className="min-h-[100dvh] bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">{children}</div>;
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 bg-white z-20">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center mr-3">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">GrowCorp</span>
          </div>
          <nav className="mt-5 flex-1 px-3">
            {user.role === 'admin' ? (
              <DesktopNavItem to="/admin" icon={ShieldCheck} label="Admin Console" />
            ) : (
              <>
                <DesktopNavItem to="/dashboard" icon={Home} label="Portfolio" />
                <DesktopNavItem to="/plans" icon={TrendingUp} label="Invest" />
                <DesktopNavItem to="/wallet" icon={Wallet} label="Add Funds" />
                <DesktopNavItem to="/referrals" icon={Network} label="Refer & Earn" />
                <DesktopNavItem to="/profile" icon={UserIcon} label="Account" />
              </>
            )}
          </nav>
          <div className="p-4 border-t border-slate-100">
             <div className="flex items-center mb-4">
                 <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                     {user.name.charAt(0)}
                 </div>
                 <div className="ml-3 overflow-hidden">
                     <p className="text-sm font-medium text-slate-700 truncate">{user.name}</p>
                     <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                 </div>
             </div>
             <button 
                onClick={onLogout}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
             >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 pt-[env(safe-area-inset-top)] transition-all">
          <div className="flex items-center">
             <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs mr-3">
                 {user.name.charAt(0)}
             </div>
             <span className="font-bold text-slate-800">GrowCorp</span>
          </div>
          <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 text-slate-600">
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border border-white"></span>}
          </button>
      </div>

      {/* Notification Dropdown */}
      {showNotif && (
          <div className="fixed top-16 right-2 z-50 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden max-h-[60vh] overflow-y-auto animate-fade-in">
              <div className="p-3 border-b border-slate-100 font-semibold text-slate-700 flex justify-between bg-slate-50">
                  <span>Notifications</span>
                  <button onClick={() => setShowNotif(false)}><X className="h-4 w-4"/></button>
              </div>
              {notifications.length === 0 ? (
                  <div className="p-8 text-sm text-slate-500 text-center">No new updates</div>
              ) : (
                  notifications.map(n => (
                      <div key={n.id} onClick={() => handleNotifClick(n)} className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${!n.read ? 'bg-emerald-50/40' : ''}`}>
                          <div className="flex justify-between items-start mb-1">
                              <p className={`text-sm ${!n.read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{n.title}</p>
                              <span className="text-[10px] text-slate-400">{new Date(n.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-slate-500 leading-snug">{n.message}</p>
                      </div>
                  ))
              )}
          </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-[100dvh]">
         {/* Desktop Header spacer/tools */}
         <div className="hidden md:flex justify-end p-4 bg-white border-b border-slate-200">
             <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                 <Bell className="h-5 w-5" />
                 {unreadCount > 0 && <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border border-white"></span>}
             </button>
         </div>

        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 max-w-5xl mx-auto w-full pb-24 md:pb-8">
            {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar - Genuine App Feel */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-[calc(60px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
         {user.role === 'admin' ? (
             <MobileNavItem to="/admin" icon={ShieldCheck} label="Admin" />
         ) : (
             <>
                <MobileNavItem to="/dashboard" icon={Home} label="Portfolio" />
                <MobileNavItem to="/plans" icon={TrendingUp} label="Invest" />
                <MobileNavItem to="/wallet" icon={Wallet} label="Add Funds" />
                <MobileNavItem to="/referrals" icon={Network} label="Network" />
                <MobileNavItem to="/profile" icon={UserIcon} label="Account" />
             </>
         )}
      </div>
    </div>
  );
};
