import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotifStore } from '../../store/notifStore';
import { Bell, Search, ShieldCheck, ChevronDown, Check, User } from 'lucide-react';
import { Role } from '../../utils/rolePermissions';

export const Navbar: React.FC = () => {
  const { user, setRole } = useAuthStore();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const roles: Role[] = ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'TEACHER', 'PARENT'];

  const navItems = [
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
    ...(user?.role === 'PARENT' ? [{ path: '/parent-portal', label: 'My Child Portal' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E5E7EB] px-4 lg:px-8 py-3.5 transition-all card-shadow">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <NavLink to="/dashboard" className="flex items-center gap-3 cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-[#E85D04] flex items-center justify-center text-white font-black text-lg shadow-sm">
            <span className="tracking-wider">S</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#1A1A1A]">
            SchoolFin <span className="text-[#6B7280] text-xs font-semibold">v2.0</span>
          </span>
        </NavLink>

        {/* Center: Navigation Links matching exact image active underline style */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#F5F5F0] p-1 rounded-full border border-[#E5E7EB]">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative px-4 py-1.5 text-xs font-semibold transition-all rounded-full ${
                  isActive
                    ? 'text-[#1A1A1A] bg-white shadow-xs font-bold'
                    : 'text-[#6B7280] hover:text-[#1A1A1A] hover:bg-white/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2.5px] bg-[#E85D04] rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right: Actions, RBAC Role Tester & Profile */}
        <div className="flex items-center gap-3">
          {/* RBAC Role Switcher */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowRoleSelector(!showRoleSelector)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF0E6] border border-[#E85D04]/30 rounded-full text-[11px] font-bold text-[#E85D04] hover:bg-[#E85D04] hover:text-white transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Role: {user?.role}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showRoleSelector && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase px-3 py-1 block">
                  Switch Active Role (RBAC)
                </span>
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setShowRoleSelector(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      user?.role === r ? 'bg-[#FFF0E6] text-[#E85D04] font-bold' : 'text-[#1A1A1A] hover:bg-[#F5F5F0]'
                    }`}
                  >
                    <span>{r}</span>
                    {user?.role === r && <Check className="w-3.5 h-3.5 text-[#E85D04]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#1A1A1A] hover:border-[#E85D04] transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E85D04] rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] p-4 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                  <span className="font-extrabold text-sm text-[#1A1A1A]">System Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] font-bold text-[#E85D04] hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-[#E5E7EB] text-xs max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`py-3 transition-colors cursor-pointer ${
                        !n.isRead ? 'bg-[#FFF0E6]/40 -mx-4 px-4' : 'opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1A1A1A]">{n.title}</span>
                        {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-[#E85D04]" />}
                      </div>
                      <p className="text-[#6B7280] mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile matching image */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E5E7EB]">
            <div className="w-9 h-9 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-xs overflow-hidden border border-white shadow-xs">
              <img src={user?.avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-bold text-[#1A1A1A] hidden sm:inline-block">{user?.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
