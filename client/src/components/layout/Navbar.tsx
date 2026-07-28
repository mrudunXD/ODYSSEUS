import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotifStore } from '../../store/notifStore';
import { Bell, Search, ChevronDown, Check, User, ShieldCheck } from 'lucide-react';
import { Role } from '../../utils/rolePermissions';

export const Navbar: React.FC = () => {
  const { user, setRole } = useAuthStore();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] px-6 lg:px-10 py-3.5 transition-all shadow-xs">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-6">
        {/* Left: Brand Logo matching rounded square shape */}
        <NavLink to="/dashboard" className="flex items-center gap-3 cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-[#E85D04] text-white flex items-center justify-center font-black text-base shadow-xs">
            <span>S</span>
          </div>
          <span className="text-lg font-extrabold tracking-tight text-[#1A1A1A]">
            SchoolFin
          </span>
        </NavLink>

        {/* Center: Clean Nav Links with active orange underline */}
        <nav className="hidden lg:flex items-center gap-8">
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

        {/* Right Actions: Search, Notification Bell, User Avatar Dropdown */}
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:text-[#1A1A1A] hover:border-[#E85D04] transition-colors">
            <Search className="w-4 h-4" />
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:text-[#1A1A1A] hover:border-[#E85D04] transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E85D04] rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-4 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                  <span className="font-extrabold text-sm text-[#1A1A1A]">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-[11px] font-bold text-[#E85D04] hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-[#E5E7EB] text-xs max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`py-3 transition-colors cursor-pointer ${!n.isRead ? 'bg-[#FFF0E6]/50 -mx-4 px-4' : 'opacity-80'}`}
                    >
                      <div className="flex items-center justify-between font-bold text-[#1A1A1A]">
                        <span>{n.title}</span>
                      </div>
                      <p className="text-[#6B7280] text-[11px] mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-2 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-xs overflow-hidden border border-[#E5E7EB] shadow-xs">
                <img src={user?.avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in">
                <div className="px-3 py-2 border-b border-[#E5E7EB] mb-1">
                  <span className="font-bold text-xs text-[#1A1A1A] block">{user?.name}</span>
                  <span className="text-[10px] text-[#6B7280]">{user?.email}</span>
                </div>

                <span className="text-[10px] font-bold text-[#6B7280] uppercase px-3 py-1 block">
                  Switch Active Role
                </span>
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setShowProfileMenu(false);
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
        </div>
      </div>
    </header>
  );
};
