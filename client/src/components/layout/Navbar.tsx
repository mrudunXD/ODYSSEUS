import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotifStore } from '../../store/notifStore';
import { apiClient } from '../../api/client';
import { Bell, ChevronDown, User, LogOut, Settings, ShieldCheck, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, refreshToken } = useAuthStore();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch (_) {}
    logout();
    navigate('/login');
  };

  // Nav items are role-filtered server-side by RBAC; here we just show appropriate links
  const adminNavItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/students', label: 'Students' },
    { path: '/fees', label: 'Fee Engine' },
    { path: '/invoices', label: 'Invoices' },
    { path: '/payments', label: 'Payments' },
    { path: '/defaulters', label: 'Defaulters' },
    { path: '/reports', label: 'Reports' },
    ...(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'
      ? [{ path: '/users', label: 'Users' }, { path: '/settings', label: 'Settings' }]
      : []),
  ];

  const parentNavItems = [
    { path: '/parent-portal', label: 'Fee Portal' },
    { path: '/profile', label: 'My Account' },
  ];

  const navItems = user?.role === 'PARENT' ? parentNavItems : adminNavItems;

  const roleBadgeColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-700',
    ADMIN: 'bg-blue-100 text-blue-700',
    ACCOUNTANT: 'bg-emerald-100 text-emerald-700',
    TEACHER: 'bg-amber-100 text-amber-700',
    PARENT: 'bg-[#FFF0E6] text-[#E85D04]',
  };
  const roleBadgeColor = roleBadgeColors[user?.role || ''] || 'bg-[#F5F5F0] text-[#6B7280]';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] px-6 lg:px-10 py-3.5 shadow-xs">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-6">
        {/* Brand */}
        <NavLink to={user?.role === 'PARENT' ? '/parent-portal' : '/dashboard'} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E85D04] text-white flex items-center justify-center font-black text-base shadow-xs">
            S
          </div>
          <span className="text-lg font-extrabold tracking-tight text-[#1A1A1A]">SchoolFin</span>
        </NavLink>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative py-2 text-xs font-semibold transition-colors ${
                  isActive ? 'text-[#1A1A1A] font-bold' : 'text-[#6B7280] hover:text-[#1A1A1A]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E85D04] rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
              className="w-9 h-9 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:border-[#E85D04] hover:text-[#E85D04] transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E85D04] rounded-full ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                  <span className="font-extrabold text-sm text-[#1A1A1A]">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-[11px] font-bold text-[#E85D04] hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="divide-y divide-[#E5E7EB] text-xs max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="py-6 text-center text-[#6B7280] text-xs">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`py-3 cursor-pointer transition-colors ${!n.isRead ? 'bg-[#FFF0E6]/50 -mx-4 px-4' : 'opacity-70'}`}
                      >
                        <span className="font-bold text-[#1A1A1A] block">{n.title}</span>
                        <p className="text-[#6B7280] text-[11px] mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
              className="flex items-center gap-2 pl-1 cursor-pointer"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-[#E5E7EB] shadow-xs"
                  onError={(e: any) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-xs border border-[#E5E7EB] shadow-xs">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl p-2 z-50">
                {/* User info */}
                <div className="px-3 py-2.5 border-b border-[#E5E7EB] mb-1">
                  <span className="font-bold text-xs text-[#1A1A1A] block truncate">{user?.name}</span>
                  <span className="text-[10px] text-[#6B7280] block truncate">{user?.email}</span>
                  <span className={`mt-1.5 inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold ${roleBadgeColor}`}>
                    {user?.role?.replace('_', ' ')}
                  </span>
                </div>

                <NavLink
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#1A1A1A] hover:bg-[#F5F5F0] flex items-center gap-2 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#6B7280]" />
                  My Profile
                </NavLink>

                {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
                  <NavLink
                    to="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#1A1A1A] hover:bg-[#F5F5F0] flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#6B7280]" />
                    Settings
                  </NavLink>
                )}

                <div className="border-t border-[#E5E7EB] mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#DC2626] hover:bg-rose-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden w-9 h-9 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#6B7280]"
          >
            {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-[#E5E7EB] mt-3 pt-3 pb-2 px-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setShowMobileMenu(false)}
              className={({ isActive }) =>
                `block px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                  isActive ? 'bg-[#FFF0E6] text-[#E85D04] font-bold' : 'text-[#6B7280] hover:bg-[#F5F5F0] hover:text-[#1A1A1A]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};
